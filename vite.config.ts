import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 开发期代理：
// 1) /zhipu-api  -> 智谱开放平台（解决浏览器跨域 + 隐藏 API Key 的调用入口）
// 2) /api/fetch-image -> 服务端转发图片，用于「下载图片」绕过跨域限制
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'image-download-proxy',
      configureServer(server) {
        server.middlewares.use('/api/fetch-image', async (req, res) => {
          const target = new URL(req.url ?? '', 'http://localhost').searchParams.get('url');
          if (!target) {
            res.statusCode = 400;
            res.end('missing url');
            return;
          }
          try {
            const upstream = await fetch(target);
            if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
            res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'image/png');
            res.setHeader('Cache-Control', 'no-store');
            res.end(Buffer.from(await upstream.arrayBuffer()));
          } catch {
            res.statusCode = 502;
            res.end('image proxy failed');
          }
        });
      },
    },
  ],
  server: {
    proxy: {
      '/zhipu-api': {
        target: 'https://open.bigmodel.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zhipu-api/, ''),
      },
    },
  },
});
