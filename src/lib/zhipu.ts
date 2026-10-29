import { STYLE_HINT } from '../constants';
import type { SizeKey, StyleKey } from '../types';
import { mockImage, mockOptimizePrompt } from './mock';

/** 智谱开放平台 API Key，从配置文档获取后写入 .env.local */
const API_KEY = (import.meta.env.VITE_ZHIPU_API_KEY ?? '').trim();

/** 未配置 Key 时进入演示模式：不调用真实模型，使用本地合成的占位图 */
export const isDemoMode = API_KEY.length === 0;

const BASE = '/zhipu-api/api/paas/v4';
const IMAGE_MODEL = 'cogview-4';
const TEXT_MODEL = 'glm-4-flash';
const TIMEOUT = 120_000;

const OPTIMIZE_SYSTEM = [
  '你是文生图提示词优化专家。',
  '请把用户简短的描述扩写为画面感强、可直接用于 AI 绘图模型的中文提示词：',
  '补充主体细节、环境氛围、构图视角、光影与画质描述，保留用户原意，不要改变主体。',
  '只输出优化后的提示词本身，不要任何解释、前缀或引号。',
].join('');

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

async function readError(res: Response): Promise<string> {
  try {
    const json = (await res.json()) as { error?: { message?: string; code?: string } };
    return json.error?.message ? `请求失败：${json.error.message}` : `请求失败（${res.status}）`;
  } catch {
    return `请求失败（${res.status}）`;
  }
}

/** 调用智谱文生图接口，返回图片地址 */
export async function generateImage(prompt: string, size: SizeKey, style: StyleKey): Promise<string> {
  if (isDemoMode) return mockImage(prompt, size, style);

  const data = await post<{ data?: { url?: string }[] }>('/images/generations', {
    model: IMAGE_MODEL,
    prompt: `${prompt}，${STYLE_HINT[style]}`,
    size,
  });

  const url = data.data?.[0]?.url;
  if (!url) throw new Error('接口未返回图片地址');
  return url;
}

/** 调用智谱对话模型优化提示词，返回优化后的文本 */
export async function optimizePrompt(prompt: string, style: StyleKey): Promise<string> {
  if (isDemoMode) return mockOptimizePrompt(prompt, style);

  const data = await post<{ choices?: { message?: { content?: string } }[] }>('/chat/completions', {
    model: TEXT_MODEL,
    temperature: 0.8,
    messages: [
      { role: 'system', content: `${OPTIMIZE_SYSTEM}当前画面风格：${STYLE_HINT[style]}。` },
      { role: 'user', content: prompt },
    ],
  });

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('未能获取优化结果');
  return text;
}
