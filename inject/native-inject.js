// =========================================================================
// Antigravity Native UI Quota Capsule Injection (方案 B: 反重力桌面端魔改注入)
// 专为 Google 反重力桌面端 (Antigravity Desktop) 打造的原生顶栏常驻胶囊 HUD
// =========================================================================

(function initAntigravityQuotaInjection() {
  if (window.__ANTIGRAVITY_QUOTA_INJECTED__) return;
  window.__ANTIGRAVITY_QUOTA_INJECTED__ = true;

  console.log('[Antigravity Quota HUD] Native Injection initialized.');

  // 1. 注入内联 CSS 样式
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #agy-quota-capsule-root {
      position: fixed;
      top: 3px;
      right: 142px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      line-height: 1;
      user-select: none;
      -webkit-user-select: none;
      pointer-events: auto;
      -webkit-app-region: no-drag;
    }

    .agy-pill-bar {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 24px;
      padding: 0 9px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 9999px;
      color: #f8fafc;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .agy-pill-bar:hover {
      background: rgba(30, 41, 59, 0.95);
      border-color: rgba(99, 102, 241, 0.6);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
      transform: translateY(-0.5px);
    }

    .agy-dot {
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      background-color: #10b981;
      box-shadow: 0 0 6px #10b981;
      animation: agy-pulse 2s infinite;
    }

    @keyframes agy-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .agy-popup-card {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      width: 330px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
      padding: 12px;
      color: #f8fafc;
      display: none;
      flex-direction: column;
      gap: 10px;
      animation: agy-slideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes agy-slideIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .agy-popup-card.show {
      display: flex;
    }

    .agy-card-sec {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 8px 10px;
    }
  `;
  document.head ? document.head.appendChild(styleEl) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(styleEl));

  // 2. 挂载胶囊 DOM
  function mountCapsule() {
    if (document.getElementById('agy-quota-capsule-root')) return;

    const root = document.createElement('div');
    root.id = 'agy-quota-capsule-root';
    root.innerHTML = `
      <div id="agy-pill-bar" class="agy-pill-bar" title="反重力实时配额监控 (点击展开详情)">
        <div id="agy-dot" class="agy-dot"></div>
        <span style="opacity: 0.75; font-size: 10px">5h:</span>
        <b id="agy-pill-5h" style="color: #34d399; font-family: monospace; font-size: 11px">--%</b>
        <span style="opacity: 0.35">·</span>
        <span id="agy-pill-tokens" style="color: #a5b4fc; font-family: monospace; font-size: 11px">~--</span>
        <span style="opacity: 0.35">·</span>
        <span id="agy-pill-countdown" style="opacity: 0.85; font-size: 10px">⏳ --</span>
      </div>

      <div id="agy-popup-card" class="agy-popup-card">
        <!-- 头部 -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1)">
          <div style="display: flex; align-items: center; gap: 6px">
            <span style="font-size: 13px">🛰️</span>
            <div>
              <div style="font-weight: bold; font-size: 11px; display: flex; align-items: center; gap: 4px">
                <span>反重力额度监控</span>
                <span style="font-size: 9px; padding: 1px 4px; border-radius: 4px; background: rgba(99,102,241,0.25); color: #c7d2fe; font-family: monospace">Pro</span>
              </div>
              <div style="font-size: 9px; opacity: 0.6">LS 端口: <span id="agy-ls-port" style="color: #34d399; font-family: monospace">--</span></div>
            </div>
          </div>
          <div style="display: flex; gap: 4px">
            <button id="agy-btn-dash" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 3px 7px; border-radius: 4px; font-size: 10px; cursor: pointer" title="在浏览器打开 6 标签页全量大屏">大屏 ↗</button>
            <button id="agy-btn-refresh" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 3px 6px; border-radius: 4px; font-size: 10px; cursor: pointer" title="立即刷新">↻</button>
          </div>
        </div>

        <!-- 5h 限额 -->
        <div class="agy-card-sec" style="display: flex; flex-direction: column; gap: 5px">
          <div style="display: flex; justify-content: space-between; font-size: 10px">
            <span style="opacity: 0.8">✨ Five Hour Limit (5h 滚动)</span>
            <b id="agy-card-5h-val" style="color: #34d399; font-family: monospace; font-size: 12px">--%</b>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(0,0,0,0.4); border-radius: 9999px; overflow: hidden">
            <div id="agy-card-5h-bar" style="height: 100%; width: 0%; background: #10b981; border-radius: 9999px; transition: width 0.3s"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.75">
            <span id="agy-card-5h-rem">剩余约: -- Token</span>
            <span id="agy-card-5h-reset">重置: --</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.6; font-family: monospace">
            <span id="agy-card-5h-calls">还能调用 ≈ -- 次</span>
            <span id="agy-card-5h-cap">容量 ≈ --</span>
          </div>
        </div>

        <!-- 周限额 -->
        <div class="agy-card-sec" style="display: flex; flex-direction: column; gap: 5px">
          <div style="display: flex; justify-content: space-between; font-size: 10px">
            <span style="opacity: 0.8">📅 Weekly Limit (周限额)</span>
            <b id="agy-card-weekly-val" style="color: #818cf8; font-family: monospace; font-size: 12px">--%</b>
          </div>
          <div style="width: 100%; height: 5px; background: rgba(0,0,0,0.4); border-radius: 9999px; overflow: hidden">
            <div id="agy-card-weekly-bar" style="height: 100%; width: 0%; background: #6366f1; border-radius: 9999px; transition: width 0.3s"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.75">
            <span id="agy-card-weekly-rem">剩余约: -- Token</span>
            <span id="agy-card-weekly-reset">重置: --</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.6; font-family: monospace">
            <span id="agy-card-weekly-calls">还能调用 ≈ -- 次</span>
            <span id="agy-card-weekly-cap">周总预算 ≈ --</span>
          </div>
        </div>

        <!-- 核心模型即时状态 -->
        <div class="agy-card-sec" style="display: flex; flex-direction: column; gap: 4px; font-size: 9px">
          <div style="opacity: 0.7; font-weight: 500">🧩 核心模型状态 (5h反推)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px">
            <div style="background: rgba(0,0,0,0.25); padding: 4px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Gemini 3.8 Flash</span>
              <b id="agy-m38" style="color: #34d399; font-family: monospace">--%</b>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 4px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Gemini 3.7 Flash</span>
              <b id="agy-m37" style="color: #34d399; font-family: monospace">--%</b>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 4px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Gemini 3.1 Pro</span>
              <b id="agy-m31" style="color: #34d399; font-family: monospace">--%</b>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 4px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Claude 3.5 Sonnet</span>
              <b style="color: #818cf8; font-family: monospace">100%</b>
            </div>
          </div>
        </div>

        <!-- 底栏 -->
        <div style="display: flex; justify-content: space-between; font-size: 9px; opacity: 0.5; padding-top: 2px">
          <span id="agy-sync-status">⚡ 3秒自动同步</span>
          <span style="cursor: pointer" id="agy-close-card">关闭 ✕</span>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    // 事件监听
    const pill = document.getElementById('agy-pill-bar');
    const popup = document.getElementById('agy-popup-card');
    const btnDash = document.getElementById('agy-btn-dash');
    const btnRefresh = document.getElementById('agy-btn-refresh');
    const btnClose = document.getElementById('agy-close-card');

    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.toggle('show');
    });

    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.remove('show');
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) {
        popup.classList.remove('show');
      }
    });

    btnDash.addEventListener('click', () => {
      window.open('http://127.0.0.1:19388/', '_blank');
    });

    btnRefresh.addEventListener('click', () => {
      btnRefresh.textContent = '…';
      fetchData().finally(() => {
        setTimeout(() => { btnRefresh.textContent = '↻'; }, 300);
      });
    });

    fetchData();
  }

  // 格式化与计算辅助
  function fmtNum(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(Math.round(n));
  }

  function formatResetTime(isoStr) {
    if (!isoStr) return '--';
    const diff = new Date(isoStr).getTime() - Date.now();
    if (diff <= 0) return '即将重置';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remH = hours % 24;
      return `${days}天${remH}h`;
    }
    return `${hours}h${mins}m`;
  }

  let RAW_DAILY = [];

  function calcQuotaProjection(frac, windowType) {
    const remaining = Math.max(0, Math.min(1, frac));
    const used = 1 - remaining;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayItem = RAW_DAILY.find(d => d.date === todayStr);

    let todayTok = 0, todayGens = 0;
    if (todayItem) {
      const t = todayItem.tokens || {};
      todayTok = (t.input || 0) + (t.output || 0) + (t.cacheRead || 0);
      todayGens = todayItem.genCalls || 0;
    }

    let cap = windowType === '5h' ? 104e6 : 623e6;
    let calls = 0;

    if (used >= 0.005 && todayTok > 0) {
      cap = todayTok / used;
      if (todayGens > 0) calls = Math.round(todayGens * (remaining / used));
    } else {
      calls = Math.round((cap * remaining) / 110000);
    }

    return {
      remPct: (remaining * 100).toFixed(1) + '%',
      remTokStr: fmtNum(cap * remaining),
      capStr: fmtNum(cap),
      remCalls: calls
    };
  }

  function updateDOM(allData) {
    const quota = allData.quota || allData;
    if (!quota || !quota.groups) return;

    if (quota.port) {
      const p = document.getElementById('agy-ls-port');
      if (p) p.textContent = quota.port;
    }

    if (allData.conversations?.byDay) {
      RAW_DAILY = Object.values(allData.conversations.byDay);
    }

    for (const group of quota.groups) {
      if (group.displayName?.includes('Gemini')) {
        for (const b of group.buckets || []) {
          const frac = b.remainingFraction ?? 1;
          const resetStr = formatResetTime(b.resetTime);
          const proj = calcQuotaProjection(frac, b.window);

          if (b.bucketId === 'gemini-5h') {
            const elPill5h = document.getElementById('agy-pill-5h');
            const elPillTok = document.getElementById('agy-pill-tokens');
            const elPillCd = document.getElementById('agy-pill-countdown');
            if (elPill5h) elPill5h.textContent = proj.remPct;
            if (elPillTok) elPillTok.textContent = `~${proj.remTokStr}`;
            if (elPillCd) elPillCd.textContent = `⏳ ${resetStr}`;

            const elCard5h = document.getElementById('agy-card-5h-val');
            const elBar5h = document.getElementById('agy-card-5h-bar');
            const elRem5h = document.getElementById('agy-card-5h-rem');
            const elReset5h = document.getElementById('agy-card-5h-reset');
            const elCalls5h = document.getElementById('agy-card-5h-calls');
            const elCap5h = document.getElementById('agy-card-5h-cap');

            if (elCard5h) elCard5h.textContent = proj.remPct;
            if (elBar5h) elBar5h.style.width = proj.remPct;
            if (elRem5h) elRem5h.textContent = `剩余约: ${proj.remTokStr} Token`;
            if (elReset5h) elReset5h.textContent = `重置: ${resetStr}`;
            if (elCalls5h) elCalls5h.textContent = `还能调用 ≈ ${proj.remCalls.toLocaleString()} 次`;
            if (elCap5h) elCap5h.textContent = `容量 ≈ ${proj.capStr}`;

            const m38 = document.getElementById('agy-m38');
            const m37 = document.getElementById('agy-m37');
            const m31 = document.getElementById('agy-m31');
            if (m38) m38.textContent = proj.remPct;
            if (m37) m37.textContent = proj.remPct;
            if (m31) m31.textContent = proj.remPct;

          } else if (b.bucketId === 'gemini-weekly') {
            const elCardW = document.getElementById('agy-card-weekly-val');
            const elBarW = document.getElementById('agy-card-weekly-bar');
            const elRemW = document.getElementById('agy-card-weekly-rem');
            const elResetW = document.getElementById('agy-card-weekly-reset');
            const elCallsW = document.getElementById('agy-card-weekly-calls');
            const elCapW = document.getElementById('agy-card-weekly-cap');

            if (elCardW) elCardW.textContent = proj.remPct;
            if (elBarW) elBarW.style.width = proj.remPct;
            if (elRemW) elRemW.textContent = `剩余约: ${proj.remTokStr} Token`;
            if (elResetW) elResetW.textContent = `重置: ${resetStr}`;
            if (elCallsW) elCallsW.textContent = `还能调用 ≈ ${proj.remCalls.toLocaleString()} 次`;
            if (elCapW) elCapW.textContent = `周总预算 ≈ ${proj.capStr}`;
          }
        }
      }
    }

    const dot = document.getElementById('agy-dot');
    if (dot) {
      dot.style.backgroundColor = '#10b981';
      dot.style.boxShadow = '0 0 6px #10b981';
    }
  }

  async function fetchData() {
    try {
      const res = await fetch('http://127.0.0.1:19388/api/all');
      if (res.ok) {
        const data = await res.json();
        updateDOM(data);
      }
    } catch (e) {
      const dot = document.getElementById('agy-dot');
      if (dot) {
        dot.style.backgroundColor = '#f59e0b';
        dot.style.boxShadow = '0 0 6px #f59e0b';
      }
    }
  }

  // 确保在 DOM 加载完成后挂载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCapsule);
  } else {
    mountCapsule();
  }

  // 单页路由切换兜底检测
  setInterval(() => {
    if (!document.getElementById('agy-quota-capsule-root')) {
      mountCapsule();
    }
  }, 1000);

  setInterval(fetchData, 3000);
})();
