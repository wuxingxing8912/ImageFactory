import type { ReactNode } from 'react';
import { cx } from '../lib/utils';

interface Props {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export default function OptionCard({ active, onClick, disabled, className, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cx(
        'rounded-2xl border p-3 transition duration-200 disabled:cursor-not-allowed',
        active
          ? 'border-brand-400/70 bg-brand-500/10 text-white shadow-glow'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-white',
        className,
      )}
    >
      {children}
    </button>
  );
}
