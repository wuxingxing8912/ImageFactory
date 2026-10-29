import type { SizeKey, StyleKey } from './types';

export const SIZES: { value: SizeKey; title: string; desc: string; preview: string }[] = [
  { value: '1024x1024', title: '1:1', desc: '1024 × 1024', preview: 'h-8 w-8' },
  { value: '1440x720', title: '16:9', desc: '1440 × 720', preview: 'h-5 w-9' },
  { value: '720x1440', title: '9:16', desc: '720 × 1440', preview: 'h-9 w-5' },
];

export const STYLES: { value: StyleKey; title: string; desc: string }[] = [
  { value: 'realistic', title: '写实摄影', desc: '真实光影 · 细节丰富' },
  { value: 'anime', title: '动漫插画', desc: '明快色彩 · 二次元' },
];

/** 拼接到用户描述后的风格限定词，用于提升出图稳定性 */
export const STYLE_HINT: Record<StyleKey, string> = {
  realistic: '写实摄影风格，自然光影，丰富细节，8K 高分辨率',
  anime: '动漫插画风格，精美线条，明快色彩，细腻背景',
};

export const STYLE_LABEL: Record<StyleKey, string> = {
  realistic: '写实摄影',
  anime: '动漫插画',
};

export const TIPS = [
  '正在解析你的描述…',
  '正在构建画面构图…',
  '正在调配光影与色彩…',
  '正在细化材质细节…',
  '正在进行最后的渲染…',
];

export const SAMPLES = [
  '赛博朋克城市夜景，霓虹倒影，雨后的街道，电影级光效',
  '宁静的日式庭院，樱花飘落，锦鲤池，柔和晨光，水彩质感',
  '宇航员漂浮在星云中，行星环背景，超现实，超高细节',
];

export const MAX_PROMPT = 500;
export const HISTORY_MAX = 12;
