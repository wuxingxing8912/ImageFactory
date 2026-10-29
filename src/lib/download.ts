/** 通过开发代理绕过跨域，把远端图片下载为本地文件 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  if (url.startsWith('data:')) {
    triggerDownload(url, filename);
    return;
  }
  try {
    const res = await fetch(`/api/fetch-image?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('proxy failed');
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    triggerDownload(href, filename);
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
