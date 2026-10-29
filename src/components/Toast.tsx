import { useEffect } from 'react';
import { cx } from '../lib/utils';

export interface ToastState {
  id: number;
  msg: string;
  type: 'info' | 'error';
}

interface Props {
  toast: ToastState | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: Props) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 2600);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div
      className={cx(
        'pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm shadow-2xl backdrop-blur transition-all duration-300',
        toast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        toast?.type === 'error'
          ? 'border-rose-400/40 bg-rose-500/15 text-rose-100'
          : 'border-white/15 bg-[#111731]/95 text-slate-100',
      )}
    >
      {toast?.msg ?? ''}
    </div>
  );
}
