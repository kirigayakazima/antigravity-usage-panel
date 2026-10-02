// =========================================================================
// Antigravity Native UI Quota Capsule Injection (v2.0)
// 专为反重力客户端内部打造：直连官方 Language Server + 智能嵌入主工具栏
// =========================================================================

(function initAntigravityQuotaInjection() {
  if (window.__ANTIGRAVITY_QUOTA_INJECTED__) return;
  window.__ANTIGRAVITY_QUOTA_INJECTED__ = true;

  console.log('[Antigravity Quota HUD v2.0] Initializing with direct Language Server integration...');

  // 1. 样式定义：舒适尺寸 (高度 28px，字号 12px，抗挤压，黑金深空质感)
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* 胶囊主条样式 */
    .agy-pill-bar {
      display: inline-flex !important;
      align-items: center !important;
      gap: 7px !important;
      height: 28px !important;
      padding: 0 12px !important;
      background: rgba(15, 23, 42, 0.88) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      border-radius: 9999px !important;
      color: #f8fafc !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      white-space: nowrap !important;
      min-width: max-content !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 12px !important;
      line-height: 1 !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      pointer-events: auto !important;
    }

    .agy-pill-bar:hover {
      background: rgba(30, 41, 59, 0.98) !important;
      border-color: rgba(99, 102, 241, 0.6) !important;
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35) !important;
      transform: translateY(-0.5px) !important;
    }

    /* 当作为独立浮动层时的外层容器 */
    #agy-quota-capsule-root.floating-mode {
      position: fixed !important;
      top: 6px !important;
      right: 145px !important;
      z-index: 2147483647 !important;
    }

    /* 当嵌入在主工具栏 (图3区域) 时的外层容器 */
    #agy-quota-capsule-root.embedded-mode {
      position: relative !important;
      display: inline-flex !important;
      align-items: center !important;
      margin: 0 8px !important;
      z-index: 1000 !important;
    }

    .agy-dot {
      width: 7px !important;
      height: 7px !important;
      border-radius: 9999px !important;
      background-color: #10b981 !important;
      box-shadow: 0 0 8px #10b981 !important;
      animation: agy-pulse 2s infinite !important;
    }

    @keyframes agy-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* 下拉大卡片 */
    .agy-popup-card {
      position: absolute !important;
      top: calc(100% + 8px) !important;
      right: 0 !important;
      width: 340px !important;
      background: rgba(15, 23, 42, 0.96) !important;
      backdrop-filter: blur(28px) !important;
      -webkit-backdrop-filter: blur(28px) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-radius: 12px !important;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7) !important;
      padding: 12px !important;
      color: #f8fafc !important;
      display: none !important;
      flex-direction: column !important;
      gap: 10px !important;
      animation: agy-slideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      z-index: 2147483647 !important;
    }

    @keyframes agy-slideIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .agy-popup-card.show {
      display: flex !important;
    }

    .agy-card-sec {
      background: rgba(30, 41, 59, 0.7) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 8px !important;
      padding: 8px 10px !important;
    }
  `;
  document.head ? document.head.appendChild(styleEl) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(styleEl));

  // 2. 构建胶囊 DOM 根节点
  let root = document.getElementById('agy-quota-capsule-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'agy-quota-capsule-root';
    root.className = 'floating-mode';
    root.innerHTML = `
      <div id="agy-pill-bar" class="agy-pill-bar" title="反重力实时权威配额监控 (点击展开详情)">
        <div id="agy-dot" class="agy-dot"></div>
        <span style="opacity: 0.75; font-size: 11px">5h:</span>
        <b id="agy-pill-5h" style="color: #34d399; font-family: monospace; font-size: 12px">--%</b>
        <span style="opacity: 0.35">·</span>
        <span id="agy-pill-tokens" style="color: #a5b4fc; font-family: monospace; font-size: 12px">~--</span>
        <span style="opacity: 0.35">·</span>
        <span id="agy-pill-countdown" style="opacity: 0.85; font-size: 11px">⏳ --</span>
      </div>

      <div id="agy-popup-card" class="agy-popup-card">
        <!-- 头部 -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1)">
          <div style="display: flex; align-items: center; gap: 6px">
            <span style="font-size: 14px">🛰️</span>
            <div>
              <div style="font-weight: bold; font-size: 12px; display: flex; align-items: center; gap: 5px">
                <span>反重力额度监控</span>
                <span style="font-size: 9px; padding: 1px 5px; border-radius: 4px; background: rgba(99,102,241,0.25); color: #c7d2fe; font-family: monospace">官方直连</span>
              </div>
              <div style="font-size: 9px; opacity: 0.6">LS 权威端口: <span id="agy-ls-port" style="color: #34d399; font-family: monospace">直连中</span></div>
            </div>
          </div>
          <div style="display: flex; gap: 4px">
            <button id="agy-btn-dash" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 10px; cursor: pointer" title="在浏览器打开 6 标签页全量大屏">大屏 ↗</button>
            <button id="agy-btn-refresh" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 3px 6px; border-radius: 4px; font-size: 10px; cursor: pointer" title="立即刷新">↻</button>
          </div>
        </div>

        <!-- 5h 限额 -->
        <div class="agy-card-sec" style="display: flex; flex-direction: column; gap: 5px">
          <div style="display: flex; justify-content: space-between; font-size: 11px">
            <span style="opacity: 0.85">✨ Five Hour Limit (5h 滚动)</span>
            <b id="agy-card-5h-val" style="color: #34d399; font-family: monospace; font-size: 13px">--%</b>
          </div>
          <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.4); border-radius: 9999px; overflow: hidden">
            <div id="agy-card-5h-bar" style="height: 100%; width: 0%; background: #10b981; border-radius: 9999px; transition: width 0.3s"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; opacity: 0.8">
            <span id="agy-card-5h-rem">剩余约: -- Token</span>
            <span id="agy-card-5h-reset">重置: --</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; opacity: 0.6; font-family: monospace">
            <span id="agy-card-5h-calls">还能调用 ≈ -- 次</span>
            <span id="agy-card-5h-cap">容量 ≈ --</span>
          </div>
        </div>

        <!-- 周限额 -->
        <div class="agy-card-sec" style="display: flex; flex-direction: column; gap: 5px">
          <div style="display: flex; justify-content: space-between; font-size: 11px">
            <span style="opacity: 0.85">📅 Weekly Limit (周限额)</span>
            <b id="agy-card-weekly-val" style="color: #818cf8; font-family: monospace; font-size: 13px">--%</b>
          </div>
          <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.4); border-radius: 9999px; overflow: hidden">
            <div id="agy-card-weekly-bar" style="height: 100%; width: 0%; background: #6366f1; border-radius: 9999px; transition: width 0.3s"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; opacity: 0.8">
            <span id="agy-card-weekly-rem">剩余约: -- Token</span>
            <span id="agy-card-weekly-reset">重置: --</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; opacity: 0.6; font-family: monospace">
            <span id="agy-card-weekly-calls">还能调用 ≈ -- 次</span>
            <span id="agy-card-weekly-cap">周总预算 ≈ --</span>
          </div>
        </div>

        <!-- 核心模型即时状态 -->
        <div class="agy-card-sec" style="display: flex; flex-direction: column; gap: 5px; font-size: 10px">
          <div style="opacity: 0.7; font-weight: 500">🧩 核心模型状态 (5h 动态反推)</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px">
            <div style="background: rgba(0,0,0,0.25); padding: 5px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Gemini 3.8 Flash</span>
              <b id="agy-m38" style="color: #34d399; font-family: monospace">--%</b>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 5px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Gemini 3.7 Flash</span>
              <b id="agy-m37" style="color: #34d399; font-family: monospace">--%</b>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 5px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Gemini 3.1 Pro</span>
              <b id="agy-m31" style="color: #34d399; font-family: monospace">--%</b>
            </div>
            <div style="background: rgba(0,0,0,0.25); padding: 5px; border-radius: 4px; display: flex; justify-content: space-between">
              <span style="opacity: 0.8">Claude 3.5 Sonnet</span>
              <b style="color: #818cf8; font-family: monospace">100%</b>
            </div>
          </div>
        </div>

        <!-- 底栏 -->
        <div style="display: flex; justify-content: space-between; font-size: 10px; opacity: 0.55; padding-top: 2px">
          <span id="agy-sync-status">⚡ 官方 LS 直连 (3s 极速同步)</span>
          <span style="cursor: pointer" id="agy-close-card">关闭 ✕</span>
        </div>
      </div>
    `;

    // 默认先附加到 body，后续由智能探测器挂载到图 3 位置
    document.body.appendChild(root);
  }

  // 3. 智能定位并嵌入到图 3 所示的 Tab Header 区域
  function tryEmbedIntoToolbar() {
    // 寻找包含右侧控制按钮（如 +、全屏、侧边栏开关）的 Header 栏
    const candidateBars = document.querySelectorAll('div, header');
    let targetContainer = null;
    let insertBeforeEl = null;

    for (const el of candidateBars) {
      // 检查其子元素是否包含带有 svg 且类似 '+' 或侧边栏图标的按钮组
      const buttons = el.querySelectorAll('button');
      if (buttons.length >= 2 && el.clientHeight >= 24 && el.clientHeight <= 48) {
        // 查找其中的 '+' 按钮或者全屏按钮
        for (const btn of buttons) {
          const title = (btn.getAttribute('title') || btn.getAttribute('aria-label') || '').toLowerCase();
          const text = btn.textContent.trim();
          if (text === '+' || title.includes('new') || title.includes('add') || title.includes('split') || title.includes('tab')) {
            targetContainer = el;
            insertBeforeEl = btn;
            break;
          }
        }
        if (targetContainer) break;
      }
    }

    const capsuleRoot = document.getElementById('agy-quota-capsule-root');
    if (!capsuleRoot) return;

    if (targetContainer && insertBeforeEl && targetContainer.contains(insertBeforeEl)) {
      if (capsuleRoot.parentElement !== targetContainer) {
        capsuleRoot.className = 'embedded-mode';
        targetContainer.insertBefore(capsuleRoot, insertBeforeEl);
        console.log('[Antigravity Quota HUD] Successfully embedded into Tab Toolbar!');
      }
    } else {
      // 保底：若尚未找到对应栏，保持在顶部右侧优雅浮动
      if (capsuleRoot.parentElement !== document.body) {
        document.body.appendChild(capsuleRoot);
      }
      capsuleRoot.className = 'floating-mode';
    }
  }

  // 4. 事件监听
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
    fetchAuthorityData().finally(() => {
      setTimeout(() => { btnRefresh.textContent = '↻'; }, 300);
    });
  });

  // 快捷键 F12 打开开发者工具
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      try {
        window.electronNative?.toggleDevTools?.();
      } catch (err) {}
    }
  });

  // 5. 格式化与计算辅助
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

  function calcQuotaProjection(frac, windowType) {
    const remaining = Math.max(0, Math.min(1, frac));
    const used = 1 - remaining;
    const cap = windowType === '5h' ? 104e6 : 623e6;
    const remTok = cap * remaining;
    const calls = Math.round((cap * remaining) / 110000);

    return {
      remPct: (remaining * 100).toFixed(1) + '%',
      remTokStr: fmtNum(remTok),
      capStr: fmtNum(cap),
      remCalls: calls
    };
  }

  // 6. UI 渲染逻辑
  function updateDOM(quota) {
    if (!quota || !quota.groups) return;

    const p = document.getElementById('agy-ls-port');
    if (p && quota.port) p.textContent = quota.port;

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
      dot.style.boxShadow = '0 0 8px #10b981';
    }
  }

  // 7. 🌟 权威官方直连请求核心 (零依赖任何外部 daemon，100% 官方永不掉线)
  async function fetchAuthorityData() {
    let success = false;

    // A. 尝试直接与当前窗口所属的 Language Server 通信 (权威直连)
    try {
      const port = window.location.port || '11952';
      const csrf = window.__APP_CONFIG__?.csrfToken;
      if (csrf) {
        const res = await fetch(`http://127.0.0.1:${port}/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-codeium-csrf-token': csrf
          },
          body: '{}',
          signal: AbortSignal.timeout(2000)
        });
        if (res.ok) {
          const data = await res.json();
          updateDOM({
            port,
            groups: data.groups || data.response?.groups || []
          });
          success = true;
        }
      }
    } catch (e) {
      // 继续尝试方案 B
    }

    // B. 若官方直连未就绪，回退尝试 19388 守护服务
    if (!success) {
      try {
        const res = await fetch('http://127.0.0.1:19388/api/quota', { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          const data = await res.json();
          updateDOM(data);
          success = true;
        }
      } catch (err) {}
    }

    const dot = document.getElementById('agy-dot');
    if (dot) {
      if (success) {
        dot.style.backgroundColor = '#10b981';
        dot.style.boxShadow = '0 0 8px #10b981';
      } else {
        dot.style.backgroundColor = '#f59e0b';
        dot.style.boxShadow = '0 0 8px #f59e0b';
      }
    }
  }

  // 8. 启动与持续自愈
  fetchAuthorityData();
  setInterval(fetchAuthorityData, 3000);

  // 定时执行嵌入探查，确保 SPA 动态路由切换时依然精准附着
  setInterval(tryEmbedIntoToolbar, 1000);
})();
