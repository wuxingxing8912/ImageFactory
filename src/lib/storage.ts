import { HISTORY_MAX } from '../constants';
import type { HistoryItem } from '../types';

const STORAGE_KEY = 'imagefactory.history';

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, HISTORY_MAX)));
  } catch {
    // 存储配额超限时忽略，不影响当前会话使用
  }
}
