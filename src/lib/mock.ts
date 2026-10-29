import type { SizeKey, StyleKey } from '../types';

const TAGS: Record<StyleKey, string[]> = {
  realistic: ['超写实摄影', '8K 超高分辨率', '自然光影', '丰富细节', '电影级质感'],
  anime: ['动漫插画风格', '精美线条', '明快色彩', '赛璐璐上色', '细腻背景'],
};

const COMPOSITION = ['中心构图，主体突出', '黄金分割构图', '浅景深，背景虚化', '广角视野，纵深感强', '柔和边缘光'];

function hashCode(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 演示模式：按提示词哈希本地合成一张图片（dataURL） */
export async function mockImage(prompt: string, size: SizeKey, style: StyleKey): Promise<string> {
  const [width, height] = size.split('x').map(Number);
  await new Promise((r) => setTimeout(r, 1200));

  const rand = mulberry32(hashCode(prompt + style + size));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器不支持 Canvas');

  const h1 = Math.floor(rand() * 360);
  const h2 = (h1 + 40 + rand() * 140) % 360;
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, `hsl(${h1}, ${style === 'anime' ? 88 : 70}%, ${style === 'anime' ? 68 : 52}%)`);
  bg.addColorStop(1, `hsl(${h2}, ${style === 'anime' ? 78 : 62}%, ${style === 'anime' ? 45 : 22}%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const blobs = style === 'anime' ? 18 : 12;
  for (let i = 0; i < blobs; i++) {
    const r = (0.06 + rand() * 0.28) * Math.min(width, height);
    const x = rand() * width;
    const y = rand() * height;
    const hue = (h1 + rand() * 180) % 360;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `hsla(${hue}, 95%, 72%, ${0.18 + rand() * 0.28})`);
    g.addColorStop(1, `hsla(${hue}, 95%, 60%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const fontSize = Math.round(Math.min(width, height) * 0.035);
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,.6)';
  ctx.shadowBlur = fontSize;
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  const text = prompt.length > 40 ? `${prompt.slice(0, 40)}…` : prompt;
  ctx.fillText(text, width / 2, height - fontSize * 1.6);
  ctx.font = `400 ${Math.round(fontSize * 0.7)}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.fillText(`${size.split('x').join('×')} · 演示占位图`, width / 2, height - fontSize * 0.6);

  return canvas.toDataURL('image/png');
}

/** 演示模式：基于规则的提示词增强 */
export function mockOptimizePrompt(prompt: string, style: StyleKey): string {
  const cleaned = prompt.replace(/[，,。.!！;；\s]+$/, '');
  const composition = COMPOSITION[Math.floor(Math.random() * COMPOSITION.length)];
  return `${cleaned}，${composition}，${TAGS[style].slice(0, 3).join('，')}`.slice(0, 500);
}
