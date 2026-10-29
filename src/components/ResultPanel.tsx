import { STYLE_LABEL, TIPS } from '../constants';
import type { GeneratedImage, Status } from '../types';
import { IconDownload, IconImage, IconRefresh, IconSpinner } from './Icons';

interface Props {
  status: Status;
  progress: number;
  result: GeneratedImage | null;
  onRegenerate: () => void;
  onDownload: () => void;
  busy: boolean;
}

export default function ResultPanel({ status, progress, result, onRegenerate, onDownload, busy }: Props) {
  const tip = TIPS[Math.min(TIPS.length - 1, Math.floor((progress / 100) * TIPS.length))];

  return (
    <div className="glass animate-fade-up flex h-full min-h-[26rem] flex-col rounded-3xl border border-white/10 p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-200">生成结果</h3>
        {result && (
          <span className="rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-[11px] text-brand-300">
            {result.size.split('x').join('×')} · {STYLE_LABEL[result.style]}
          </span>
        )}
      </div>

      {status === 'loading' && (
        <div className="flex flex-1 flex-col justify-center gap-6 py-6">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/[.04]">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="animate-pulse-ring grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500">
                <IconSpinner className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-slate-300">{tip}</span>
              <span className="tabular-nums text-brand-300">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {status !== 'loading' && !result && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="animate-float grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-accent-500/10">
            <IconImage className="h-9 w-9 text-brand-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">等待你的创意</p>
            <p className="mt-1 text-xs text-slate-500">输入描述并点击「生成图片」，作品将出现在这里</p>
          </div>
        </div>
      )}

      {status !== 'loading' && result && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
            <img src={result.url} alt={result.prompt} className="max-h-[58vh] w-auto rounded-xl object-contain shadow-2xl" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-xs text-slate-400">{result.prompt}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRegenerate}
                disabled={busy}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:text-white active:scale-[.97] disabled:opacity-50"
              >
                <IconRefresh className="h-3.5 w-3.5" />
                重新生成
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:brightness-110 active:scale-[.97]"
              >
                <IconDownload className="h-3.5 w-3.5" />
                下载图片
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
