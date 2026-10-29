/**
 * AI 图片生成器 · 前端交互逻辑
 * 说明：当前未接入真实模型 API，图片由 Canvas 本地合成演示（保证可下载、可预览）。
 * 接入真实模型时，只需替换 generateImageAsset() 的实现。
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const el = {
    prompt: $('promptInput'),
    charCount: $('charCount'),
    sizeOptions: $('sizeOptions'),
    styleOptions: $('styleOptions'),
    optimizeBtn: $('optimizeBtn'),
    generateBtn: $('generateBtn'),
    generateText: $('generateText'),
    generateIcon: $('generateIcon'),
    spinner: $('spinner'),
    regenerateBtn: $('regenerateBtn'),
    emptyState: $('emptyState'),
    loadingState: $('loadingState'),
    imageState: $('imageState'),
    resultImage: $('resultImage'),
    resultPrompt: $('resultPrompt'),
    resultBadge: $('resultBadge'),
    progressBar: $('progressBar'),
    progressText: $('progressText'),
    tipText: $('tipText'),
    downloadBtn: $('downloadBtn'),
    historyList: $('historyList'),
    historyCount: $('historyCount'),
    clearHistory: $('clearHistory'),
    sidebar: $('sidebar'),
    openSidebar: $('openSidebar'),
    closeSidebar: $('closeSidebar'),
    overlay: $('overlay'),
    toast: $('toast'),
  };

  const ACTIVE_CLS = ['border-brand-400/70', 'bg-brand-500/10', 'text-white', 'shadow-glow'];
  const IDLE_CLS = ['border-white/10', 'bg-white/5', 'text-slate-300', 'hover:border-white/25', 'hover:text-white'];

  const SIZE_MAP = { '1024x1024': [1024, 1024], '1280x720': [1280, 720], '720x1280': [720, 1280] };
  const STYLE_LABEL = { realistic: '写实摄影', anime: '动漫插画' };

  const STYLE_TAGS = {
    realistic: ['超写实摄影', '8K 超高分辨率', '自然光影', '丰富细节', '电影级质感'],
    anime: ['动漫插画风格', '精美线条', '明快色彩', '赛璐璐上色', '细腻背景'],
  };
  const COMPOSITION = ['中心构图，主体突出', '黄金分割构图', '浅景深，背景虚化', '广角视野，纵深感强', '柔和边缘光'];

  const TIPS = [
    '正在解析你的描述…',
    '正在构建画面构图…',
    '正在调配光影与色彩…',
    '正在细化材质细节…',
    '正在进行最后的渲染…',
  ];

  const state = {
    size: '1024x1024',
    style: 'realistic',
    loading: false,
    history: loadHistory(),
  };

  /* ---------------- 选项交互 ---------------- */

  function bindOptions(container, onPick) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.opt');
      if (!btn || state.loading) return;
      [...container.querySelectorAll('.opt')].forEach((b) => {
        const active = b === btn;
        b.classList.remove(...ACTIVE_CLS, ...IDLE_CLS);
        b.classList.add(...(active ? ACTIVE_CLS : IDLE_CLS));
        b.setAttribute('aria-pressed', String(active));
      });
      onPick(btn.dataset.value);
    });
  }

  function initOptions() {
    bindOptions(el.sizeOptions, (v) => (state.size = v));
    bindOptions(el.styleOptions, (v) => (state.style = v));
    ['sizeOptions', 'styleOptions'].forEach((key) => {
      const first = el[key].querySelector('.opt');
      first.classList.remove(...IDLE_CLS);
      first.classList.add(...ACTIVE_CLS);
      first.setAttribute('aria-pressed', 'true');
    });
  }

  /* ---------------- 提示词 ---------------- */

  function updateCharCount() {
    el.charCount.textContent = `${el.prompt.value.length} / 500`;
  }

  function optimizePrompt() {
    const raw = el.prompt.value.trim();
    if (!raw) return toast('请先输入图片描述', true);

    const tags = STYLE_TAGS[state.style];
    const composition = COMPOSITION[Math.floor(Math.random() * COMPOSITION.length)];
    const cleaned = raw.replace(/[，,。.!！;；\s]+$/, '');
    const optimized = `${cleaned}，${composition}，${tags.slice(0, 3).join('，')}`;

    el.prompt.value = optimized.slice(0, 500);
    updateCharCount();
    toast('提示词已优化，可直接生成');
  }

  /* ---------------- 图片合成（演示用） ---------------- */

  function hashCode(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** 根据提示词与风格合成一张图片，返回 dataURL */
  function generateImageAsset({ prompt, width, height, style }) {
    const rand = mulberry32(hashCode(prompt + style + width + height));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const h1 = Math.floor(rand() * 360);
    const h2 = (h1 + 40 + rand() * 140) % 360;

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, `hsl(${h1}, ${style === 'anime' ? 88 : 70}%, ${style === 'anime' ? 68 : 52}%)`);
    bg.addColorStop(1, `hsl(${h2}, ${style === 'anime' ? 78 : 62}%, ${style === 'anime' ? 45 : 22}%)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 光斑 / 装饰元素
    const blobs = style === 'anime' ? 18 : 12;
    for (let i = 0; i < blobs; i++) {
      const r = (0.06 + rand() * 0.28) * Math.min(width, height);
      const x = rand() * width;
      const y = rand() * height;
      const hue = (h1 + rand() * 180) % 360;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${hue}, 95%, 72%, ${0.18 + rand() * 0.28})`);
      g.addColorStop(1, `hsla(${hue}, 95%, 60%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (style === 'realistic') {
      // 写实风格：细腻噪点
      const grain = ctx.createImageData(width, height);
      for (let i = 0; i < grain.data.length; i += 4) {
        const v = (rand() * 255) | 0;
        grain.data[i] = grain.data[i + 1] = grain.data[i + 2] = v;
        grain.data[i + 3] = 12;
      }
      ctx.putImageData(grain, 0, 0);
    } else {
      // 动漫风格：斜向高光条
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#fff';
      for (let i = -height; i < width; i += Math.max(60, width / 12)) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 40, 0);
        ctx.lineTo(i + 40 + height, height);
        ctx.lineTo(i + height, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 暗角
    const vig = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.max(width, height) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    // 描述文字
    const fontSize = Math.round(Math.min(width, height) * 0.035);
    ctx.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.shadowColor = 'rgba(0,0,0,.6)';
    ctx.shadowBlur = fontSize;
    const text = prompt.length > 40 ? prompt.slice(0, 40) + '…' : prompt;
    ctx.fillText(text, width / 2, height - fontSize * 1.6);
    ctx.font = `400 ${Math.round(fontSize * 0.7)}px "PingFang SC", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillText(`${STYLE_LABEL[style]} · ${width}×${height}`, width / 2, height - fontSize * 0.6);

    return canvas.toDataURL('image/png');
  }

  /** 生成缩略图，用于历史记录（避免占用过多本地存储） */
  function makeThumbnail(dataUrl, size = 200) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = size / Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  /* ---------------- 生成流程 ---------------- */

  function setLoading(loading) {
    state.loading = loading;
    el.generateBtn.disabled = loading;
    el.optimizeBtn.disabled = loading;
    el.generateIcon.classList.toggle('hidden', loading);
    el.spinner.classList.toggle('hidden', !loading);
    el.generateText.textContent = loading ? '生成中…' : '生成图片';
  }

  function showState(name) {
    el.emptyState.classList.toggle('hidden', name !== 'empty');
    el.loadingState.classList.toggle('hidden', name !== 'loading');
    el.loadingState.classList.toggle('flex', name === 'loading');
    el.imageState.classList.toggle('hidden', name !== 'image');
    el.imageState.classList.toggle('flex', name === 'image');
  }

  async function generate() {
    if (state.loading) return;
    const prompt = el.prompt.value.trim();
    if (!prompt) {
      toast('请先输入图片描述', true);
      el.prompt.focus();
      return;
    }

    const [width, height] = SIZE_MAP[state.size];
    const duration = 10000 + Math.random() * 12000; // 演示：10-22 秒

    setLoading(true);
    showState('loading');
    el.resultBadge.classList.add('hidden');

    const start = performance.now();
    let tipIndex = 0;
    el.tipText.textContent = TIPS[0];

    await new Promise((resolve) => {
      const tick = (now) => {
        const p = Math.min(0.99, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 2); // 进度前快后慢
        const percent = Math.round(eased * 99);
        el.progressBar.style.width = percent + '%';
        el.progressText.textContent = percent + '%';

        const nextTip = Math.min(TIPS.length - 1, Math.floor((p * TIPS.length) / 0.9));
        if (nextTip !== tipIndex) {
          tipIndex = nextTip;
          el.tipText.textContent = TIPS[tipIndex];
        }
        p < 0.99 ? requestAnimationFrame(tick) : resolve();
      };
      requestAnimationFrame(tick);
    });

    const dataUrl = generateImageAsset({ prompt, width, height, style: state.style });

    el.resultImage.src = dataUrl;
    el.resultPrompt.textContent = prompt;
    el.resultBadge.textContent = `${state.size.split('x').join('×')} · ${STYLE_LABEL[state.style]}`;
    el.resultBadge.classList.remove('hidden');
    el.downloadBtn.href = dataUrl;
    el.downloadBtn.download = `ai-image-${Date.now()}.png`;

    el.progressBar.style.width = '100%';
    el.progressText.textContent = '100%';
    showState('image');
    setLoading(false);

    const thumb = await makeThumbnail(dataUrl);
    addHistory({ prompt, thumb, size: state.size, style: state.style, time: Date.now() });
  }

  /* ---------------- 历史记录 ---------------- */

  const HISTORY_KEY = 'imagefactory.history';
  const HISTORY_MAX = 12;

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch {
      /* 超出配额时忽略，不影响使用 */
    }
  }

  function addHistory(item) {
    state.history.unshift(item);
    state.history = state.history.slice(0, HISTORY_MAX);
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    el.historyCount.textContent = String(state.history.length);
    el.historyList.innerHTML = '';

    if (!state.history.length) {
      el.historyList.innerHTML = `
        <div class="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 py-10 text-center">
          <svg class="h-7 w-7 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/>
            <path d="M4 17l5-5 3.5 3.5L16 12l4 4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="text-xs text-slate-500">还没有生成记录</p>
        </div>`;
      return;
    }

    state.history.forEach((item) => {
      const card = document.createElement('button');
      card.className =
        'group flex w-full gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-2 text-left transition hover:border-brand-400/40 hover:bg-brand-500/10';
      card.innerHTML = `
        <img src="${item.thumb}" alt="" class="h-14 w-14 shrink-0 rounded-xl object-cover" />
        <span class="min-w-0 flex-1">
          <span class="line-clamp-2 text-[11px] leading-snug text-slate-300 group-hover:text-white">${escapeHtml(item.prompt)}</span>
          <span class="mt-1 block text-[10px] text-slate-500">${item.size.split('x').join('×')} · ${STYLE_LABEL[item.style] || ''} · ${formatTime(item.time)}</span>
        </span>`;
      card.addEventListener('click', () => {
        el.prompt.value = item.prompt;
        updateCharCount();
        closeDrawer();
        el.prompt.focus();
        toast('已载入历史提示词');
      });
      el.historyList.appendChild(card);
    });
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------------- 侧边栏 / Toast ---------------- */

  function openDrawer() {
    el.sidebar.classList.remove('-translate-x-full');
    el.overlay.classList.remove('hidden');
  }
  function closeDrawer() {
    if (window.innerWidth < 1024) {
      el.sidebar.classList.add('-translate-x-full');
    }
    el.overlay.classList.add('hidden');
  }

  let toastTimer;
  function toast(msg, isError = false) {
    el.toast.textContent = msg;
    el.toast.className =
      'pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm shadow-2xl backdrop-blur transition-all duration-300 ' +
      (isError
        ? 'border-rose-400/40 bg-rose-500/15 text-rose-100 opacity-100 translate-y-0'
        : 'border-white/15 bg-[#111731]/95 text-slate-100 opacity-100 translate-y-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.add('translate-y-4', 'opacity-0');
    }, 2400);
  }

  /* ---------------- 事件绑定 ---------------- */

  initOptions();
  renderHistory();
  updateCharCount();

  el.prompt.addEventListener('input', updateCharCount);
  el.prompt.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate();
  });

  document.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.addEventListener('click', () => {
      el.prompt.value = btn.dataset.sample;
      updateCharCount();
      el.prompt.focus();
    });
  });

  el.optimizeBtn.addEventListener('click', optimizePrompt);
  el.generateBtn.addEventListener('click', generate);
  el.regenerateBtn.addEventListener('click', generate);
  el.clearHistory.addEventListener('click', () => {
    if (!state.history.length) return;
    state.history = [];
    saveHistory();
    renderHistory();
    toast('历史记录已清空');
  });

  el.openSidebar.addEventListener('click', openDrawer);
  el.closeSidebar.addEventListener('click', closeDrawer);
  el.overlay.addEventListener('click', closeDrawer);
})();
