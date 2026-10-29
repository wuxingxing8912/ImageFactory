export type SizeKey = '1024x1024' | '1440x720' | '720x1440';
export type StyleKey = 'realistic' | 'anime';
export type Status = 'idle' | 'loading' | 'done';

export interface GeneratedImage {
  url: string;
  prompt: string;
  size: SizeKey;
  style: StyleKey;
  createdAt: number;
}

export interface HistoryItem extends GeneratedImage {
  id: string;
}
