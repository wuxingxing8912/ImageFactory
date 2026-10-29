import { useCallback, useEffect, useState } from 'react';
import HistoryPanel from './components/HistoryPanel';
import ParamPanel from './components/ParamPanel';
import PromptPanel from './components/PromptPanel';
import ResultPanel from './components/ResultPanel';
import Toast, { type ToastState } from './components/Toast';
import { IconHistory, IconImage, IconSparkles, IconSpinner } from './components/Icons';
import { HISTORY_MAX, MAX_PROMPT } from './constants';
import { downloadImage } from './lib/download';
import { loadHistory, saveHistory } from './lib/storage';
import { uid } from './lib/utils';
import { generateImage, isDemoMode, optimizePrompt } from './lib/zhipu';
import type { HistoryItem, SizeKey, Status, StyleKey } from './types';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<SizeKey>('1024x1024');
  const [style, setStyle] = useState<StyleKey>('realistic');
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<HistoryItem | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [optimizing, setOptimizing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const busy = status === 'loading' || optimizing;
  const showToast = useCallback((msg: string, type: ToastState['type'] = 'info') => {
    setToast({ id: Date.now(), msg, type });
  }, []);

  // 生成过程中的进度动画（真实接口耗时不可知，渐进逼近 96%）
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setInterval(() => {
      setProgress((p) => (p >= 96 ? 96 : p + Math.max(0.4, (96 - p) * 0.05)));
    }, 300);
    return () => clearInterval(timer);
  }, [status]);

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim();
    if (!text) {
      showToast('请先输入图片描述', 'error');
      return;
    }
    if (busy) return;

    setStatus('loading');
    setProgress(0);
    setResult(null);

    try {
      const url = await generateImage(text, size, style);
      const item: HistoryItem = { id: uid(), url, prompt: text, size, style, createdAt: Date.now() };
      setResult(item);
      setProgress(100);
      setStatus('done');
      setHistory((prev) => {
        const next = [item, ...prev].slice(0, HISTORY_MAX);
        saveHistory(next);
        return next;
      });
      showToast('生成完成');
    } catch (err) {
      setStatus('idle');
      showToast(err instanceof Error ? err.message : '生成失败，请重试', 'error');
    }
  }, [prompt, size, style, busy, showToast]);

  const handleOptimize = useCallback(async () => {
    const text = prompt.trim();
    if (!text) {
      showToast('请先输入图片描述', 'error');
      return;
    }
    if (busy) return;

    setOptimizing(true);
    try {
      const optimized = await optimizePrompt(text, style);
      setPrompt(optimized.slice(0, MAX_PROMPT));
      showToast('提示词已优化');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '优化失败，请重试', 'error');
    } finally {
      setOptimizing(false);
    }
  }, [prompt, style, busy, showToast]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    void downloadImage(result.url, `ai-image-${result.createdAt}.png`);
  }, [result]);

  const handlePickHistory = useCallback(
    (item: HistoryItem) => {
      setPrompt(item.prompt);
      setSize(item.size);
      setStyle(item.style);
      setSidebarOpen(false);
      showToast('已载入历史记录');
    },
    [showToast],
  );

  const handleClearHistory = useCallback(() => {
    if (!history.length) return;
    setHistory([]);
    saveHistory([]);
    showToast('历史记录已清空');
  }, [history.length, showToast]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 py-5 lg:px-8 lg:py-8">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <HistoryPanel
          items={history}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onPick={handlePickHistory}
          onClear={handleClearHistory}
        />

        <main className="min-w-0 flex-1">
          {/* 顶部标题 */}
          <header className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-[11px] font-medium text-brand-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                AI 创意工作台
              </div>
              <h1 className="bg-gradient-to-r from-white via-brand-100 to-accent-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                AI 图片生成器
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                用一句话描述你想象中的画面，我来把它变成图像。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="历史记录"
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:border-white/20 hover:text-white lg:hidden"
            >
              <IconHistory />
            </button>
          </header>

          {isDemoMode && (
            <div className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-200">
              演示模式：未检测到 <code className="rounded bg-black/30 px-1.5 py-0.5">VITE_ZHIPU_API_KEY</code>
              ，当前使用本地占位图。复制 <code className="rounded bg-black/30 px-1.5 py-0.5">.env.example</code> 为{' '}
              <code className="rounded bg-black/30 px-1.5 py-0.5">.env.local</code> 并填入智谱 API Key 后重启即可调用真实模型。
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
            {/* 左：输入 + 参数 + 按钮 */}
            <section className="space-y-5 xl:col-span-2">
              <PromptPanel
                value={prompt}
                onChange={setPrompt}
                onSample={setPrompt}
                onSubmit={handleGenerate}
                disabled={busy}
              />

              <ParamPanel
                size={size}
                style={style}
                onSizeChange={setSize}
                onStyleChange={setStyle}
                disabled={busy}
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={busy}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-medium text-slate-200 transition hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-white active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {optimizing ? (
                    <IconSpinner />
                  ) : (
                    <IconSparkles className="h-4 w-4 text-accent-400 transition group-hover:rotate-12" />
                  )}
                  {optimizing ? '优化中…' : '优化提示词'}
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={busy}
                  className="group relative flex flex-[1.4] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-enabled:group-hover:translate-x-full" />
                  {status === 'loading' ? <IconSpinner /> : <IconImage className="h-4 w-4" />}
                  {status === 'loading' ? '生成中…' : '生成图片'}
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-500">按 Ctrl / ⌘ + Enter 快速生成 · 通常需要 10-30 秒</p>
            </section>

            {/* 右：展示区 */}
            <section className="xl:col-span-3">
              <ResultPanel
                status={status}
                progress={Math.round(progress)}
                result={result}
                onRegenerate={handleGenerate}
                onDownload={handleDownload}
                busy={busy}
              />
            </section>
          </div>
        </main>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
