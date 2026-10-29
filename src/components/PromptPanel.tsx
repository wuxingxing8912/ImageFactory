import { MAX_PROMPT, SAMPLES } from '../constants';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSample: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function PromptPanel({ value, onChange, onSample, onSubmit, disabled }: Props) {
  return (
    <div className="glass animate-fade-up rounded-3xl border border-white/10 p-5 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <label htmlFor="prompt" className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <svg className="h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
          </svg>
          图片描述
        </label>
        <span className="text-xs tabular-nums text-slate-500">
          {value.length} / {MAX_PROMPT}
        </span>
      </div>

      <textarea
        id="prompt"
        rows={5}
        maxLength={MAX_PROMPT}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onSubmit();
        }}
        placeholder="例如：一只戴着飞行护目镜的橘猫，驾驶复古双翼飞机穿越云海，黄昏暖光，电影感构图"
        className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-400/70 focus:ring-4 focus:ring-brand-500/15 disabled:opacity-60"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="py-1 text-[11px] text-slate-500">灵感：</span>
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            disabled={disabled}
            onClick={() => onSample(sample)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300 transition hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-white disabled:opacity-50"
          >
            {sample.slice(0, 4)}
          </button>
        ))}
      </div>
    </div>
  );
}
