import { STYLE_LABEL } from '../constants';
import type { HistoryItem } from '../types';
import { formatTime } from '../lib/utils';
import { IconClose, IconImage, IconTrash } from './Icons';

interface Props {
  items: HistoryItem[];
  open: boolean;
  onClose: () => void;
  onPick: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function HistoryPanel({ items, open, onClose, onPick, onClear }: Props) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col border-r border-white/10 bg-[#0a0e1d]/95 p-5 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-72 lg:translate-x-0 lg:rounded-3xl lg:border lg:bg-white/[.04] ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 8v4l3 2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <h2 className="text-sm font-semibold tracking-wide text-slate-200">生成历史</h2>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">{items.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClear}
            title="清空历史"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-rose-300"
          >
            <IconTrash />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="收起"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <IconClose />
          </button>
        </div>
      </div>

      <div className="no-scrollbar -mr-2 flex-1 space-y-3 overflow-y-auto pr-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 py-10 text-center">
            <IconImage className="h-7 w-7 text-slate-600" />
            <p className="text-xs text-slate-500">还没有生成记录</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item)}
              className="group flex w-full gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-2 text-left transition hover:border-brand-400/40 hover:bg-brand-500/10"
            >
              <img src={item.url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[11px] leading-snug text-slate-300 group-hover:text-white">{item.prompt}</span>
                <span className="mt-1 block text-[10px] text-slate-500">
                  {item.size.split('x').join('×')} · {STYLE_LABEL[item.style]} · {formatTime(item.createdAt)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-slate-500">
        历史记录保存在浏览器 LocalStorage，最多保留 12 条。
      </p>
    </aside>
  );
}
