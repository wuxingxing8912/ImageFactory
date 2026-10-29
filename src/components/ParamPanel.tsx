import { SIZES, STYLES } from '../constants';
import type { SizeKey, StyleKey } from '../types';
import { IconAnime, IconCamera } from './Icons';
import OptionCard from './OptionCard';

interface Props {
  size: SizeKey;
  style: StyleKey;
  onSizeChange: (value: SizeKey) => void;
  onStyleChange: (value: StyleKey) => void;
  disabled?: boolean;
}

export default function ParamPanel({ size, style, onSizeChange, onStyleChange, disabled }: Props) {
  return (
    <div className="glass animate-fade-up rounded-3xl border border-white/10 p-5 shadow-xl">
      <h3 className="mb-4 text-sm font-medium text-slate-200">生成参数</h3>

      <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">图片尺寸</p>
      <div className="mb-5 grid grid-cols-3 gap-2.5">
        {SIZES.map((item) => (
          <OptionCard
            key={item.value}
            active={size === item.value}
            disabled={disabled}
            onClick={() => onSizeChange(item.value)}
            className="flex flex-col items-center gap-2"
          >
            <span className="flex h-9 items-center justify-center">
              <span className={`block rounded-md border-2 border-current opacity-70 ${item.preview}`} />
            </span>
            <span className="text-xs font-medium">{item.title}</span>
            <span className="text-[10px] text-slate-500">{item.desc}</span>
          </OptionCard>
        ))}
      </div>

      <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-slate-500">画面风格</p>
      <div className="grid grid-cols-2 gap-2.5">
        {STYLES.map((item) => (
          <OptionCard
            key={item.value}
            active={style === item.value}
            disabled={disabled}
            onClick={() => onStyleChange(item.value)}
            className="flex items-center gap-3 text-left"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
              {item.value === 'realistic' ? <IconCamera className="h-[18px] w-[18px]" /> : <IconAnime className="h-[18px] w-[18px]" />}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium">{item.title}</span>
              <span className="block truncate text-[10px] text-slate-500">{item.desc}</span>
            </span>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
