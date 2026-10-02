// =========================================================================
// Antigravity Native UI Quota Capsule & In-Page Modal (v4.4 High-End Edition)
// 对齐 DSH (antigravity-usage) 官方设计语言，100% 动态数据绑定，具备完整时序走势与月份热力图
// =========================================================================

(function initAntigravityQuotaInjection() {
  console.log('[Antigravity Quota HUD v4.4] Initializing High-End Monitor in Main World...');

  // 1. 清理旧实例
  try {
    document.querySelectorAll('#agy-popup-card, #agy-quota-capsule-root, #agy-inpage-modal-overlay').forEach(el => el.remove());
  } catch (e) {}

  // 2. 注入高雅 DSH 规范 CSS 样式
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :root {
      --au-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --au-bg: #ffffff;
      --au-bg-layer-1: #f8fafc;
      --au-bg-layer-2: #f1f5f9;
      --au-border-l1: #e2e8f0;
      --au-border-l2: #cbd5e1;
      --au-text-main: #0f172a;
      --au-text-muted: #64748b;
      --au-brand: #3b82f6;
      --au-emerald: #16a34a;
      --au-orange: #ea580c;
      --au-red: #dc2626;
      --au-purple: #8b5cf6;
      --au-pill-bg: #ffffff;
      --au-pill-border: #e2e8f0;
      --au-pill-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --au-bg: #14161b;
        --au-bg-layer-1: #1c1f26;
        --au-bg-layer-2: #242832;
        --au-border-l1: #272b35;
        --au-border-l2: #383e4d;
        --au-text-main: #f8fafc;
        --au-text-muted: #94a3b8;
        --au-brand: #60a5fa;
        --au-emerald: #10b981;
        --au-orange: #f97316;
        --au-red: #ef4444;
        --au-purple: #a78bfa;
        --au-pill-bg: rgba(30, 41, 59, 0.95);
        --au-pill-border: rgba(255, 255, 255, 0.15);
        --au-pill-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }
    }

    /* 顶栏常驻微晶胶囊 */
    #agy-quota-capsule-root {
      position: fixed !important;
      top: 5px !important;
      right: 250px !important;
      z-index: 2147483647 !important;
      -webkit-app-region: no-drag !important;
      pointer-events: auto !important;
      display: inline-flex !important;
      align-items: center !important;
      font-family: var(--au-font) !important;
    }

    .agy-pill-bar {
      display: inline-flex !important;
      align-items: center !important;
      gap: 7px !important;
      height: 28px !important;
      padding: 0 12px !important;
      background: var(--au-pill-bg) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid var(--au-pill-border) !important;
      border-radius: 9999px !important;
      color: var(--au-text-main) !important;
      box-shadow: var(--au-pill-shadow) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      white-space: nowrap !important;
      min-width: max-content !important;
      font-size: 12px !important;
      line-height: 1 !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -webkit-app-region: no-drag !important;
    }

    .agy-pill-bar:hover {
      background: var(--au-bg-layer-1) !important;
      border-color: var(--au-brand) !important;
      transform: translateY(-0.5px) !important;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08) !important;
    }

    .agy-dot {
      width: 7px !important;
      height: 7px !important;
      border-radius: 50% !important;
      background: #10b981 !important;
      box-shadow: 0 0 6px #10b981 !important;
      flex-shrink: 0 !important;
      animation: agy-pulse 2s infinite !important;
    }

    @keyframes agy-pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }

    /* 全屏内嵌模态遮罩与居中卡片 */
    #agy-inpage-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.6) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      z-index: 2147483646 !important;
      display: none !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0 !important;
      transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      pointer-events: auto !important;
      font-family: var(--au-font) !important;
    }

    #agy-inpage-modal-overlay.open {
      display: flex !important;
      opacity: 1 !important;
    }

    .au-modal-window {
      width: 90vw !important;
      max-width: 1040px !important;
      height: 85vh !important;
      max-height: 860px !important;
      background: var(--au-bg) !important;
      border: 1px solid var(--au-border-l1) !important;
      border-radius: 14px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      color: var(--au-text-main) !important;
      animation: au-modal-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      transition: width 0.2s ease, height 0.2s ease, border-radius 0.2s ease !important;
    }

    @keyframes au-modal-pop {
      from { transform: scale(0.97) translateY(8px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    .au-modal-window.fullscreen {
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh !important;
      max-height: 100vh !important;
      border-radius: 0 !important;
      border: none !important;
    }

    /* 顶部标题与元数据 */
    .au-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border-bottom: 1px solid var(--au-border-l1);
      background: var(--au-bg-layer-1);
      flex: 0 0 auto;
    }
    .au-title {
      margin: 0;
      font-size: 14.5px;
      font-weight: 700;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .au-ico-pct {
      font-size: 10.5px;
      font-weight: 700;
      line-height: 1.5;
      padding: 1px 6px;
      border-radius: 9999px;
      color: #fff;
      font-variant-numeric: tabular-nums;
    }

    /* KPI 卡片行 */
    .au-kpi-bar {
      padding: 12px 18px 8px 18px;
      background: var(--au-bg-layer-1);
      border-bottom: 1px solid var(--au-border-l1);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .au-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 10px;
    }
    .au-kpi {
      border: 1px solid var(--au-border-l1);
      border-radius: 10px;
      padding: 10px 12px;
      background: var(--au-bg);
      min-width: 0;
    }
    .au-kpi-label { font-size: 11px; color: var(--au-text-muted); }
    .au-kpi-value {
      font-size: 22px;
      font-weight: 800;
      line-height: 1.2;
      margin: 2px 0;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.01em;
    }
    .au-kpi-sub { font-size: 10.5px; color: var(--au-text-muted); line-height: 1.4; }
    .au-stack {
      display: flex;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      margin: 6px 0 4px;
      background: rgba(128, 128, 128, 0.16);
    }
    .au-stack > i { display: block; height: 100%; }

    /* 标签导航栏 */
    .au-tabs {
      display: flex;
      gap: 4px;
      padding: 6px 18px 0;
      border-bottom: 1px solid var(--au-border-l1);
      background: var(--au-bg-layer-1);
      flex: 0 0 auto;
    }
    .au-tab {
      padding: 8px 14px;
      border: none;
      background: transparent;
      color: var(--au-text-muted);
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 500;
      border-radius: 8px 8px 0 0;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      font-family: var(--au-font);
    }
    .au-tab:hover { color: var(--au-text-main); background: rgba(128, 128, 128, 0.06); }
    .au-tab.on {
      color: var(--au-brand);
      border-bottom-color: var(--au-brand);
      font-weight: 700;
      background: var(--au-bg);
    }

    /* 页面主体内容 */
    .au-body {
      padding: 16px 18px 24px;
      overflow-y: auto;
      font-size: 12.5px;
      line-height: 1.6;
      flex: 1 1 auto;
      background: var(--au-bg);
    }
    .au-tab-pane { display: none; }
    .au-tab-pane.on { display: block; }

    /* 卡片与网格 */
    .au-card {
      border: 1px solid var(--au-border-l1);
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 12px;
      background: var(--au-bg-layer-1);
    }
    .au-card-title {
      font-weight: 700;
      font-size: 13px;
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .au-card-desc {
      font-size: 11px;
      color: var(--au-text-muted);
      margin: -4px 0 10px;
      line-height: 1.5;
    }
    .au-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
    }
    .au-bucket {
      border: 1px solid var(--au-border-l1);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--au-bg);
    }
    .au-bucket-head { display: flex; align-items: baseline; gap: 6px; }
    .au-bucket-label { font-size: 12px; color: var(--au-text-muted); flex: 1; }
    .au-bucket-pct { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; }
    .au-bar {
      height: 6px;
      border-radius: 3px;
      background: rgba(128, 128, 128, 0.2);
      overflow: hidden;
      margin: 8px 0 6px;
    }
    .au-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
    .au-kv {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 3px 12px;
      font-size: 11.5px;
    }
    .au-k { color: var(--au-text-muted); white-space: nowrap; }
    .au-v { font-weight: 600; font-variant-numeric: tabular-nums; }

    /* 按钮组与输入框 */
    .au-toolbar {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .au-spacer { flex: 1 1 auto; }
    .au-btn-group { display: flex; gap: 0; }
    .au-btn-group .au-btn { border-radius: 0; margin-left: -1px; }
    .au-btn-group .au-btn:first-child { border-radius: 6px 0 0 6px; margin-left: 0; }
    .au-btn-group .au-btn:last-child { border-radius: 0 6px 6px 0; }
    .au-btn {
      padding: 5px 12px;
      cursor: pointer;
      border-radius: 6px;
      border: 1px solid var(--au-border-l2);
      background: var(--au-bg);
      color: var(--au-text-main);
      font-size: 11.5px;
      font-family: var(--au-font);
      transition: all 0.15s ease;
    }
    .au-btn:hover { background: var(--au-bg-layer-2); }
    .au-btn.on {
      background: var(--au-brand);
      border-color: transparent;
      color: #ffffff;
      font-weight: 600;
    }
    .au-input {
      min-width: 220px;
      text-align: left;
      cursor: text;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--au-border-l2);
      background: var(--au-bg);
      color: var(--au-text-main);
      font-size: 11.5px;
      font-family: var(--au-font);
    }

    /* 表格 */
    .au-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    .au-table th {
      text-align: center;
      font-weight: 600;
      color: var(--au-text-muted);
      padding: 6px 10px;
      border-bottom: 1px solid var(--au-border-l1);
      white-space: nowrap;
    }
    .au-table td {
      text-align: center;
      padding: 6px 10px;
      border-bottom: 1px solid var(--au-border-l1);
      font-variant-numeric: tabular-nums;
    }
    .au-table tbody tr:nth-child(even) td { background: rgba(128, 128, 128, 0.03); }
    .au-table tbody tr:hover td { background: rgba(59, 130, 246, 0.08); }
    .au-table th:first-child, .au-table td:first-child { text-align: left; }
    .au-num { text-align: center; }
    .au-trunc { max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* 热力图网格与标尺 */
    .au-heat-wrap { overflow-x: auto; padding: 4px 0 10px; }
    .au-heat {
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(7, 11px);
      gap: 3px;
      width: max-content;
    }
    .au-cell {
      width: 11px;
      height: 11px;
      border-radius: 2px;
      background: rgba(128, 128, 128, 0.16);
      transition: transform 0.12s ease;
      cursor: pointer;
    }
    .au-cell:hover {
      transform: scale(1.35);
      z-index: 10;
      outline: 1.5px solid var(--au-emerald);
    }
    .au-cell.today { outline: 1.5px solid var(--au-brand); outline-offset: 1px; }

    .au-legend {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 11px;
      margin-top: 10px;
      color: var(--au-text-muted);
      align-items: center;
    }
    .au-legend-i { display: inline-flex; align-items: center; gap: 5px; }
    .au-legend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
    .au-models { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 4px 14px; font-size: 11.5px; }
    .au-model { display: flex; align-items: center; gap: 8px; }
    .au-model-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .au-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  `;
  document.head ? document.head.appendChild(styleEl) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(styleEl));

  // 3. 构建微晶胶囊 DOM 根节点 (支持 2.5s 平滑垂直翻滚轮播: 5h余量 vs 今日用量)
  const capsuleRoot = document.createElement('div');
  capsuleRoot.id = 'agy-quota-capsule-root';
  capsuleRoot.innerHTML = `
    <div id="agy-pill-bar" class="agy-pill-bar" title="点击在当前页面直接展开全屏配额与用量大屏 (每2.5s动态轮播5h余量与今日总用量)">
      <div id="agy-dot" class="agy-dot"></div>
      
      <!-- 动态滚动视窗 -->
      <div class="agy-ticker-viewport" style="position: relative; height: 18px; overflow: hidden; display: inline-flex; align-items: center;">
        <div id="agy-ticker-track" style="display: flex; flex-direction: column; transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);">
          <!-- 视窗 1: 5H 剩余量 (精确显示 6.6% 对应的剩余约 7.3M，绝非总量) -->
          <div class="agy-ticker-item" style="height: 18px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="color: var(--au-text-muted); font-size: 11px">5h余:</span>
            <b id="agy-pill-5h" style="color: var(--au-emerald); font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 700">--%</b>
            <span style="opacity: 0.3">·</span>
            <b id="agy-pill-5h-tokens" style="color: var(--au-brand); font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 700">~--</b>
          </div>
          <!-- 视窗 2: 今日总消耗量 (显示今日累计 Token + 命中率) -->
          <div class="agy-ticker-item" style="height: 18px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="color: var(--au-text-muted); font-size: 11px">今日用量:</span>
            <b id="agy-pill-today-tokens" style="color: var(--au-purple); font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 700">--</b>
            <span style="opacity: 0.3">·</span>
            <span id="agy-pill-today-hit" style="color: var(--au-emerald); font-size: 11px; font-weight: 600">--命中</span>
          </div>
        </div>
      </div>

      <span style="opacity: 0.3">·</span>
      <span id="agy-pill-countdown" style="color: var(--au-text-muted); font-size: 11px">⏳ --</span>
    </div>
  `;

  // 4. 构建大模态 DOM 根节点 (对齐 DSH 六标签页)
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'agy-inpage-modal-overlay';
  modalOverlay.innerHTML = `
    <div class="au-modal-window" id="agy-modal-win">
      <!-- 头部 -->
      <div class="au-head">
        <h2 class="au-title">
          <span>⚡</span>
          <span>Google 反重力配额与用量监控</span>
        </h2>
        <span id="ls-status-pill" class="au-ico-pct" style="background: #10b981; margin-left: 8px">● 实时在线</span>
        <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
          <button id="modal-btn-fullscreen" class="au-btn" title="切换全屏/窗口">⛶ 展开</button>
          <button id="modal-btn-refresh" class="au-btn" title="强制刷新全部数据">↻ 刷新</button>
          <button id="modal-btn-close" class="au-btn" style="font-weight: 700" title="关闭窗口 (Esc)">✕</button>
        </div>
      </div>

      <!-- 顶部 KPI 宏观指标卡片 -->
      <div class="au-kpi-bar">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div class="au-btn-group" id="kpi-range-group">
            <button class="au-btn" data-days="1">今天</button>
            <button class="au-btn" data-days="7">7 天</button>
            <button class="au-btn" data-days="14">14 天</button>
            <button class="au-btn" data-days="30">近 30 天</button>
            <button class="au-btn" data-days="90">近 90 天</button>
            <button class="au-btn on" data-days="0">全部</button>
          </div>
          <span style="font-size: 11px; color: var(--au-text-muted)" id="kpi-range-hint">统计自反重力离线会话库</span>
        </div>

        <div class="au-kpis">
          <div class="au-kpi">
            <div class="au-kpi-label">总消耗 Token</div>
            <div class="au-kpi-value" id="kpi-tokens" style="color: var(--au-brand)">--</div>
            <div class="au-stack">
              <i id="kpi-bar-in" style="background: var(--au-brand); width: 0%" title="未命中输入"></i>
              <i id="kpi-bar-cache" style="background: var(--au-emerald); width: 0%" title="缓存读取"></i>
              <i id="kpi-bar-out" style="background: var(--au-purple); width: 0%" title="模型输出"></i>
            </div>
            <div class="au-kpi-sub" id="kpi-tokens-sub">命中率: --</div>
          </div>

          <div class="au-kpi">
            <div class="au-kpi-label">离线会话数</div>
            <div class="au-kpi-value" id="kpi-convs">--</div>
            <div class="au-kpi-sub" id="kpi-convs-sub">共 -- 步生成动作</div>
          </div>

          <div class="au-kpi">
            <div class="au-kpi-label">模型调用次数</div>
            <div class="au-kpi-value" id="kpi-calls">--</div>
            <div class="au-kpi-sub" id="kpi-calls-sub">平均每会话 -- 步</div>
          </div>

          <div class="au-kpi">
            <div class="au-kpi-label">活跃天数统计</div>
            <div class="au-kpi-value" id="kpi-days">--</div>
            <div class="au-kpi-sub" id="kpi-days-sub">最近活跃: --</div>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="au-tabs" id="au-nav-tabs">
        <button class="au-tab on" data-tab="tab-quota">额度</button>
        <button class="au-tab" data-tab="tab-trend">趋势</button>
        <button class="au-tab" data-tab="tab-heatmap">热力图</button>
        <button class="au-tab" data-tab="tab-summary">汇总</button>
        <button class="au-tab" data-tab="tab-resets">重置</button>
        <button class="au-tab" data-tab="tab-conv">会话</button>
      </div>

      <!-- 主体内容 -->
      <div class="au-body">
        <!-- 1. 额度 Tab -->
        <div id="tab-quota" class="au-tab-pane on">
          <div class="au-card" id="quota-account-card">
            <div class="au-card-title">
              <span>👤 账号与服务状态</span>
              <span id="ls-port-badge" class="au-ico-pct" style="background:#10b981; margin-left:auto">LS: 127.0.0.1:--</span>
            </div>
            <div class="au-kv">
              <span class="au-k">账号邮箱</span>
              <span class="au-v" id="acct-email">--</span>
              <span class="au-k">用户名称</span>
              <span class="au-v" id="acct-name">--</span>
              <span class="au-k">Prompt 额度</span>
              <span class="au-v" id="acct-credits">--</span>
              <span class="au-k">最后刷新</span>
              <span class="au-v" id="acct-time">--</span>
            </div>
          </div>

          <div id="quota-groups-container">
            <!-- 动态生成各分组卡片 -->
          </div>

          <div class="au-card">
            <div class="au-card-title">🧩 语言服务器支持模型状态</div>
            <div class="au-models" id="quota-models-list">
              <!-- 动态模型列表 -->
            </div>
          </div>
        </div>

        <!-- 2. 趋势 Tab -->
        <div id="tab-trend" class="au-tab-pane">
          <div class="au-toolbar">
            <div class="au-btn-group" id="trend-range-group">
              <button class="au-btn on" data-range="24h">24 小时</button>
              <button class="au-btn" data-range="7d">7 天</button>
              <button class="au-btn" data-range="30d">30 天</button>
              <button class="au-btn" data-range="all">全部</button>
            </div>
            <span class="au-spacer"></span>
            <span style="font-size: 11px; color: var(--au-text-muted)" id="trend-summary-info">正在读取历史采样...</span>
          </div>
          <div class="au-card">
            <div class="au-card-title">📈 剩余额度随时间变化走势 (动态时序图)</div>
            <div class="au-card-desc">反重力官方接口只给「剩余额度百分比」，下降即模型生成消耗，上升即周期重置或滚动窗口恢复。</div>
            <div id="trend-chart-container" style="min-height: 230px; position: relative;">
              <!-- 动态 SVG 曲线渲染区 -->
            </div>
          </div>
          <div class="au-card" id="trend-buckets-card" style="display: none;">
            <div class="au-card-title">📊 额度桶窗口消耗与恢复汇总</div>
            <div class="au-grid" id="trend-buckets-summary-grid"></div>
          </div>
        </div>

        <!-- 3. 热力图 Tab -->
        <div id="tab-heatmap" class="au-tab-pane">
          <div class="au-toolbar">
            <div class="au-btn-group" id="heat-metric-group">
              <button class="au-btn on" data-metric="sessions">会话数</button>
              <button class="au-btn" data-metric="steps">步数</button>
              <button class="au-btn" data-metric="tokens">Token</button>
              <button class="au-btn" data-metric="cache">缓存读取</button>
            </div>
            <span class="au-spacer"></span>
            <span style="font-size: 11px; color: var(--au-text-muted)" id="heat-summary-info">近 182 天用量统计</span>
          </div>
          <div class="au-card">
            <div class="au-card-title">🗓️ 182 天日历热力图 (GitHub / DSH 翠绿调色)</div>
            <div class="au-card-desc" id="heat-metric-desc">来自反重力本地会话库（离线可读），反重力关着也照常有数据。</div>
            
            <!-- GitHub 风格：左侧星期 + 顶部月份 + 7行格子矩阵 -->
            <div class="au-heat-wrap">
              <div style="display: flex; gap: 8px; align-items: flex-start; width: max-content;">
                <!-- 星期标签列（一、三、五） -->
                <div class="au-heat-weekdays" style="position: relative; width: 16px; height: 95px; margin-top: 18px; flex-shrink: 0; user-select: none;">
                  <span style="position: absolute; top: 0px; font-size: 10px; color: var(--au-text-muted); line-height: 11px;">一</span>
                  <span style="position: absolute; top: 28px; font-size: 10px; color: var(--au-text-muted); line-height: 11px;">三</span>
                  <span style="position: absolute; top: 56px; font-size: 10px; color: var(--au-text-muted); line-height: 11px;">五</span>
                </div>
                <!-- 右侧：月份标尺 + 网格 -->
                <div style="display: flex; flex-direction: column;">
                  <div id="au-heat-months" style="position: relative; height: 18px; width: 100%; user-select: none;"></div>
                  <div id="au-heat-grid" class="au-heat"></div>
                </div>
              </div>
            </div>

            <div class="au-legend">
              <span>少</span>
              <span class="au-cell" style="background: rgba(128,128,128,.16); display:inline-block"></span>
              <span class="au-cell" style="background: color-mix(in srgb, #16a34a 28%, transparent); display:inline-block"></span>
              <span class="au-cell" style="background: color-mix(in srgb, #16a34a 52%, transparent); display:inline-block"></span>
              <span class="au-cell" style="background: color-mix(in srgb, #16a34a 76%, transparent); display:inline-block"></span>
              <span class="au-cell" style="background: #16a34a; display:inline-block"></span>
              <span>多</span>
            </div>
          </div>
        </div>

        <!-- 4. 汇总 Tab -->
        <div id="tab-summary" class="au-tab-pane">
          <div class="au-card">
            <div class="au-card-title">📅 逐日活跃与用量统计</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th class="au-num">会话</th>
                  <th class="au-num">步数</th>
                  <th class="au-num">调用</th>
                  <th class="au-num">未命中输入</th>
                  <th class="au-num">输出 Token</th>
                  <th class="au-num">缓存读取</th>
                  <th class="au-num">缓存命中率</th>
                </tr>
              </thead>
              <tbody id="summary-table-body">
                <tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--au-text-muted)">正在扫描逐日用量...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. 重置 Tab -->
        <div id="tab-resets" class="au-tab-pane">
          <div class="au-card">
            <div class="au-card-title">⏳ 额度桶重置监控</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>配额桶</th>
                  <th class="au-num">当前剩余</th>
                  <th class="au-num">预估剩余 Token</th>
                  <th class="au-num">已用比例</th>
                  <th class="au-num">重置倒计时</th>
                  <th class="au-num">预计重置时间</th>
                  <th class="au-num">窗口类型</th>
                </tr>
              </thead>
              <tbody id="resets-table-body">
                <tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--au-text-muted)">正在读取配额桶状态...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. 会话 Tab -->
        <div id="tab-conv" class="au-tab-pane">
          <div class="au-toolbar">
            <input type="text" id="conv-search-input" class="au-input" placeholder="🔍 搜索会话标题、摘要或工作区...">
            <span id="conv-ws-badge" class="au-btn on" style="display: none; font-size: 11px; cursor: pointer;"></span>
            <span class="au-spacer"></span>
            <span style="font-size: 11px; color: var(--au-text-muted)" id="conv-count-info">共 -- 个会话</span>
          </div>

          <div class="au-card">
            <div class="au-card-title">📁 活跃工作区筛选</div>
            <div id="conv-workspaces-pills" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;"></div>
          </div>

          <div class="au-card">
            <div class="au-card-title">🤖 各模型用量汇总</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>模型</th>
                  <th class="au-num">调用次数</th>
                  <th class="au-num">输入 Token</th>
                  <th class="au-num">输出 Token</th>
                  <th class="au-num">缓存读取</th>
                  <th class="au-num">命中率</th>
                </tr>
              </thead>
              <tbody id="conv-models-tbody"></tbody>
            </table>
          </div>

          <div class="au-card">
            <div class="au-card-title">💬 会话明细列表</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>会话标题 / 摘要</th>
                  <th>工作区</th>
                  <th>使用模型</th>
                  <th class="au-num">步数</th>
                  <th class="au-num">调用</th>
                  <th class="au-num">输入 Token</th>
                  <th class="au-num">输出 Token</th>
                  <th class="au-num">缓存读取</th>
                  <th class="au-num">命中率</th>
                  <th>最后修改</th>
                </tr>
              </thead>
              <tbody id="conv-list-tbody">
                <tr><td colspan="10" style="text-align: center; padding: 20px; color: var(--au-text-muted)">正在读取本地 SQLite 数据库...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // 5. 数据状态中心
  let RAW_QUOTA = null;
  let RAW_CONVERSATIONS = [];
  let RAW_DAILY = [];
  let RAW_MODELS = [];
  let RAW_WORKSPACES = [];
  let RAW_HISTORY = null;

  let SELECTED_DAYS = 0;
  let SELECTED_HEAT_METRIC = 'sessions';
  let SELECTED_WS_FILTER = '';
  let SEARCH_QUERY = '';
  let SELECTED_TREND_RANGE = '24h';

  // 6. 辅助计算工具
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const fmtNum = (v) => {
    const n = num(v);
    if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4) return (n / 1e4).toFixed(1) + 'W';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(Math.round(n));
  };
  const fmtFull = (v) => num(v).toLocaleString('zh-CN');
  const pct = (v, digits = 1) => (num(v) * 100).toFixed(digits) + '%';
  const shortWs = (ws) => {
    if (!ws) return '全局';
    const s = String(ws).replace(/\\/g, '/');
    const parts = s.split('/').filter(Boolean);
    return parts.slice(-2).join('/') || s;
  };

  const fmtCountdown = (ms) => {
    if (typeof ms !== 'number' || ms <= 0) return '已到期';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const fmtTime = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  const remainingColor = (v) => {
    if (v >= 0.6) return 'var(--au-emerald)';
    if (v >= 0.25) return 'var(--au-orange)';
    return 'var(--au-red)';
  };

  // 根据当前真实用量动态反推配额桶大致剩余 Token 与满额容量
  function calcQuotaProjection(remainingFraction, bucketId) {
    const remaining = Math.max(0, Math.min(1, num(remainingFraction)));
    const used = 1 - remaining;
    const bId = String(bucketId || '').toLowerCase();
    const isWeekly = bId.includes('weekly');

    // 统计今天的真实总 Token 消耗
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayItem = RAW_DAILY.find(d => d.date === todayStr);

    let todayTok = 0, todayCalls = 0;
    if (todayItem) {
      const t = todayItem.tokens || {};
      todayTok = num(t.input) + num(t.output) + num(t.cacheRead);
      todayCalls = num(todayItem.genCalls);
    }

    // 统计近 7 天的总 Token 消耗
    let tokens7d = 0, calls7d = 0;
    const cutoff7d = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    for (const d of RAW_DAILY) {
      if (d.date >= cutoff7d) {
        if (d.tokens) tokens7d += num(d.tokens.input) + num(d.tokens.output) + num(d.tokens.cacheRead);
        calls7d += num(d.genCalls);
      }
    }

    // 默认基准容量 (5h 基准约 115M，周基准约 650M)
    let cap = isWeekly ? 623e6 : 104e6;
    let calls = 0;

    if (isWeekly) {
      if (used >= 0.005 && tokens7d > 0) {
        cap = tokens7d / used;
        if (calls7d > 0) calls = Math.round(calls7d * (remaining / used));
      } else {
        calls = Math.round((cap * remaining) / 120000);
      }
    } else {
      if (used >= 0.005 && todayTok > 0) {
        cap = todayTok / used;
        if (todayCalls > 0) calls = Math.round(todayCalls * (remaining / used));
      } else {
        calls = Math.round((cap * remaining) / 120000);
      }
    }

    const remainingTokens = cap * remaining;

    return {
      remPct: pct(remaining),
      remTokens: remainingTokens,
      remTokStr: fmtNum(remainingTokens),
      capTokens: cap,
      capStr: fmtNum(cap),
      remCalls: calls,
      remCallsText: calls > 0 ? `还能调用 ≈ ${calls.toLocaleString()} 次` : '额度充裕'
    };
  }

  // 7. 渲染函数集合
  function updateKPIs() {
    const cutoffMs = SELECTED_DAYS === 0 ? 0 : Date.now() - SELECTED_DAYS * 86400000;
    const cutoffDate = SELECTED_DAYS === 0 ? '' : new Date(cutoffMs).toISOString().slice(0, 10);

    let filtered = RAW_DAILY;
    if (cutoffDate) {
      filtered = RAW_DAILY.filter(d => d.date >= cutoffDate);
    }

    let input = 0, output = 0, cacheRead = 0;
    let sessions = 0, steps = 0, calls = 0;

    for (const d of filtered) {
      sessions += num(d.sessions);
      steps += num(d.steps);
      calls += num(d.genCalls);
      if (d.tokens) {
        input += num(d.tokens.input);
        output += num(d.tokens.output);
        cacheRead += num(d.tokens.cacheRead);
      }
    }

    const totalIn = input + cacheRead;
    const totalAll = totalIn + output;
    const hitRate = totalIn > 0 ? (cacheRead / totalIn) : 0;

    modalOverlay.querySelector('#kpi-tokens').textContent = fmtNum(totalAll);
    modalOverlay.querySelector('#kpi-tokens-sub').textContent =
      `命中率: ${(hitRate * 100).toFixed(1)}% (读取 ${fmtNum(cacheRead)} / 输入 ${fmtNum(input)})`;

    const totalBar = Math.max(1, input + cacheRead + output);
    modalOverlay.querySelector('#kpi-bar-in').style.width = ((input / totalBar) * 100).toFixed(1) + '%';
    modalOverlay.querySelector('#kpi-bar-cache').style.width = ((cacheRead / totalBar) * 100).toFixed(1) + '%';
    modalOverlay.querySelector('#kpi-bar-out').style.width = ((output / totalBar) * 100).toFixed(1) + '%';

    modalOverlay.querySelector('#kpi-convs').textContent = fmtNum(sessions);
    modalOverlay.querySelector('#kpi-convs-sub').textContent = `共 ${fmtNum(steps)} 步动作`;

    modalOverlay.querySelector('#kpi-calls').textContent = fmtNum(calls);
    const avgSteps = sessions > 0 ? (steps / sessions).toFixed(1) : '0';
    modalOverlay.querySelector('#kpi-calls-sub').textContent = `平均每会话 ${avgSteps} 步`;

    const activeDays = filtered.filter(d => num(d.sessions) > 0 || num(d.steps) > 0).length;
    modalOverlay.querySelector('#kpi-days').textContent = activeDays + ' 天';
    const lastActive = RAW_DAILY.length > 0 ? RAW_DAILY[RAW_DAILY.length - 1].date : '—';
    modalOverlay.querySelector('#kpi-days-sub').textContent = `最近活跃: ${lastActive}`;

    updateCapsuleDisplay();
  }

  function renderQuotaTab() {
    if (!RAW_QUOTA) return;
    const q = RAW_QUOTA;
    const acct = q.account || {};
    const creds = q.credits || {};

    modalOverlay.querySelector('#ls-port-badge').textContent = `LS: 127.0.0.1:${q.port || '--'}`;
    modalOverlay.querySelector('#acct-email').textContent = acct.email || '—';
    modalOverlay.querySelector('#acct-name').textContent = acct.name ? `${acct.name} (${acct.planName || acct.tier || 'Free'})` : '—';
    modalOverlay.querySelector('#acct-credits').textContent =
      creds.promptAvailable !== undefined ? `可用: ${creds.promptAvailable} / 每月: ${creds.promptMonthly}` : '—';
    modalOverlay.querySelector('#acct-time').textContent = fmtTime(q.timestamp);

    const groups = q.groups || [];
    const groupsCont = modalOverlay.querySelector('#quota-groups-container');
    groupsCont.innerHTML = '';

    const modelsList = modalOverlay.querySelector('#quota-models-list');
    modelsList.innerHTML = '';

    let minRemaining = 1;
    let minCountdown = null;

    for (const g of groups) {
      const card = document.createElement('div');
      card.className = 'au-card';
      card.innerHTML = `
        <div class="au-card-title">📊 ${g.displayName || '额度配额分组'}</div>
        <div class="au-grid" id="group-buckets-grid"></div>
      `;
      const grid = card.querySelector('#group-buckets-grid');

      for (const b of (g.buckets || [])) {
        const v = num(b.remainingFraction);
        if (v < minRemaining) {
          minRemaining = v;
        }

        const proj = calcQuotaProjection(v, b.bucketId || b.displayName);
        const bEl = document.createElement('div');
        bEl.className = 'au-bucket';
        const color = remainingColor(v);

        let resetTimeStr = '—';
        if (b.resetTime) {
          const rDate = new Date(b.resetTime);
          const diffMs = rDate.getTime() - Date.now();
          if (diffMs > 0) {
            resetTimeStr = fmtCountdown(diffMs);
            if (minCountdown === null || diffMs < minCountdown) minCountdown = diffMs;
          } else {
            resetTimeStr = fmtTime(rDate.getTime());
          }
        }

        const isWeekly = (b.bucketId || '').includes('weekly');
        bEl.innerHTML = `
          <div class="au-bucket-head">
            <span class="au-bucket-label">${b.displayName || b.bucketId}</span>
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span class="au-bucket-pct" style="color: ${color}">${pct(v)}</span>
              <span style="font-size: 13px; font-weight: 700; color: var(--au-brand); font-variant-numeric: tabular-nums;">~${proj.remTokStr}</span>
            </div>
          </div>
          <div class="au-bar">
            <div class="au-bar-fill" style="width: ${(v * 100).toFixed(1)}%; background: ${color}"></div>
          </div>
          <div class="au-kv">
            <span class="au-k">剩余预估</span>
            <span class="au-v" style="color: var(--au-brand); font-weight: 700">约 ${proj.remTokStr} Token <span style="font-size: 10.5px; font-weight: normal; color: var(--au-text-muted)">(${proj.remCallsText})</span></span>
            <span class="au-k">窗口总额</span>
            <span class="au-v">约 ${proj.capStr} Token</span>
            <span class="au-k">已用比例</span>
            <span class="au-v">${pct(1 - v)}</span>
            <span class="au-k">重置倒计时</span>
            <span class="au-v">${resetTimeStr}</span>
            <span class="au-k">窗口类型</span>
            <span class="au-v">${b.windowType || (isWeekly ? '周配额周期 (Weekly)' : '5小时滑动窗口 (5-Hour)')}</span>
          </div>
        `;
        grid.appendChild(bEl);

        const mEl = document.createElement('div');
        mEl.className = 'au-model';
        mEl.innerHTML = `
          <span class="au-dot" style="background: ${color}"></span>
          <span class="au-model-name" title="${b.displayName || b.bucketId}">${b.displayName || b.bucketId}</span>
          <span class="au-v" style="color: ${color}">${pct(v, 0)} (~${proj.remTokStr})</span>
        `;
        modelsList.appendChild(mEl);
      }
      groupsCont.appendChild(card);
    }

    updateCapsuleDisplay();
    renderResetsTab();
  }

  // 胶囊动态垂直翻滚轮播 (2.5 秒交替平滑滚动: 5h余量 vs 今日用量)
  let tickerIndex = 0;
  let tickerPaused = false;
  let tickerInterval = null;

  function initTicker() {
    if (tickerInterval) return;
    const bar = capsuleRoot.querySelector('#agy-pill-bar');
    if (bar) {
      bar.addEventListener('mouseenter', () => { tickerPaused = true; });
      bar.addEventListener('mouseleave', () => { tickerPaused = false; });
    }

    tickerInterval = setInterval(() => {
      if (tickerPaused) return;
      const track = capsuleRoot.querySelector('#agy-ticker-track');
      if (!track) return;
      tickerIndex = (tickerIndex + 1) % 2;
      track.style.transform = tickerIndex === 0 ? 'translateY(0px)' : 'translateY(-18px)';
    }, 2500);
  }

  function updateCapsuleDisplay() {
    let min5hRemaining = 1;
    let minCountdown = null;

    if (RAW_QUOTA && RAW_QUOTA.groups) {
      for (const g of RAW_QUOTA.groups) {
        for (const b of (g.buckets || [])) {
          const v = num(b.remainingFraction);
          if (b.bucketId === 'gemini-5h' || b.displayName?.includes('Five Hour')) {
            min5hRemaining = v;
          }
          if (b.resetTime) {
            const rDate = new Date(b.resetTime);
            const diffMs = rDate.getTime() - Date.now();
            if (diffMs > 0 && (minCountdown === null || diffMs < minCountdown)) {
              minCountdown = diffMs;
            }
          }
        }
      }
    }

    // 1. 视图一：5h 剩余比例与对应真实剩余 Token (例如 6.6% -> ~7.3M)
    const proj5h = calcQuotaProjection(min5hRemaining, 'gemini-5h');
    const el5hPct = capsuleRoot.querySelector('#agy-pill-5h');
    if (el5hPct) {
      el5hPct.textContent = pct(min5hRemaining);
      el5hPct.style.color = remainingColor(min5hRemaining);
    }
    const el5hTok = capsuleRoot.querySelector('#agy-pill-5h-tokens');
    if (el5hTok) {
      el5hTok.textContent = `~${proj5h.remTokStr}`;
    }

    // 2. 视图二：今日总用量与缓存命中率 (例如 今日: 1.04亿 · 85.4%命中)
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayItem = RAW_DAILY.find(d => d.date === todayStr);
    let todayTotalTok = 0;
    let todayHitRate = 0;
    if (todayItem && todayItem.tokens) {
      const t = todayItem.tokens;
      const tIn = num(t.input);
      const tCache = num(t.cacheRead);
      const tOut = num(t.output);
      todayTotalTok = tIn + tCache + tOut;
      if (tIn + tCache > 0) {
        todayHitRate = (tCache / (tIn + tCache)) * 100;
      }
    }
    const elTodayTok = capsuleRoot.querySelector('#agy-pill-today-tokens');
    if (elTodayTok) {
      elTodayTok.textContent = fmtNum(todayTotalTok);
    }
    const elTodayHit = capsuleRoot.querySelector('#agy-pill-today-hit');
    if (elTodayHit) {
      elTodayHit.textContent = `${todayHitRate.toFixed(1)}%命中`;
    }

    // 3. 倒计时
    const elCountdown = capsuleRoot.querySelector('#agy-pill-countdown');
    if (elCountdown) {
      elCountdown.textContent = minCountdown !== null ? `⏳ ${fmtCountdown(minCountdown)}` : '⏳ 活跃';
    }
  }

  // 趋势时序折线图渲染器 (TabTrend)
  const SERIES_COLOR_MAP = {
    'gemini-weekly': '#3b82f6',
    'gemini-5h': '#8b5cf6',
    '3p-weekly': '#f59e0b',
    '3p-5h': '#10b981',
    'default': '#06b6d4'
  };

  const SERIES_LABEL_MAP = {
    'gemini-weekly': 'Gemini 周期配额 (周)',
    'gemini-5h': 'Gemini 速率限制 (5h)',
    '3p-weekly': '第三方模型配额 (周)',
    '3p-5h': '第三方速率限制 (5h)'
  };

  async function fetchTrendData(range) {
    if (range) SELECTED_TREND_RANGE = range;
    const summaryInfo = modalOverlay.querySelector('#trend-summary-info');
    if (summaryInfo) summaryInfo.textContent = '正在获取历史采样点...';

    try {
      const res = await fetch(`http://127.0.0.1:19388/api/history?range=${SELECTED_TREND_RANGE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      RAW_HISTORY = data;
      renderTrendTab(data);
    } catch (e) {
      const container = modalOverlay.querySelector('#trend-chart-container');
      if (container) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--au-text-muted)">获取时序数据失败: ${e.message}</div>`;
      }
    }
  }

  function renderTrendTab(data) {
    const container = modalOverlay.querySelector('#trend-chart-container');
    const summaryInfo = modalOverlay.querySelector('#trend-summary-info');
    if (!container) return;

    if (!data || !Array.isArray(data.points) || data.points.length < 2) {
      container.innerHTML = `
        <div style="color: var(--au-text-muted); font-size: 12px; text-align: center; padding: 40px">
          ⏳ 当前时间范围（${SELECTED_TREND_RANGE}）历史采样点不足（至少需 2 个点）。
          <div style="margin-top: 8px; font-size: 11px; opacity: 0.7">后台守护每 120 秒自动采样一次，反重力桌面端运行时将持续积累。</div>
        </div>
      `;
      if (summaryInfo) summaryInfo.textContent = '采样积累中...';
      return;
    }

    const points = data.points;
    const n = points.length;

    if (summaryInfo) {
      summaryInfo.textContent = `${fmtTime(points[0].t)} → ${fmtTime(points[n - 1].t)} · ${n} 个绘图点 / ${data.sampleCount || n} 次采样`;
    }

    // 收集所有 series key
    const keys = [];
    for (const p of points) {
      for (const k of Object.keys(p.values || {})) {
        if (!keys.includes(k)) keys.push(k);
      }
    }

    // 备用颜色表
    const fallbackPalette = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
    const seriesList = keys.map((k, i) => ({
      key: k,
      label: SERIES_LABEL_MAP[k] || k,
      color: SERIES_COLOR_MAP[k] || fallbackPalette[i % fallbackPalette.length],
      values: points.map(p => (p.values && p.values[k] !== undefined) ? num(p.values[k]) : 1)
    }));

    // SVG 绘图尺寸
    const W = 900;
    const H = 220;
    const P = { l: 45, r: 25, t: 16, b: 28 };
    const iw = W - P.l - P.r;
    const ih = H - P.t - P.b;

    const x = (i) => P.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = (v) => P.t + ih - Math.min(1, Math.max(0, v)) * ih;

    // 1. 网格线与 Y 轴刻度 (0%, 25%, 50%, 75%, 100%)
    let gridSvg = '';
    [0, 0.25, 0.5, 0.75, 1].forEach(g => {
      const lineY = y(g);
      gridSvg += `
        <line x1="${P.l}" y1="${lineY}" x2="${W - P.r}" y2="${lineY}"
              stroke="var(--au-border-l1)" stroke-width="1" stroke-dasharray="${g === 0 ? 'none' : '3 4'}" />
        <text x="${P.l - 6}" y="${lineY + 3.5}" text-anchor="end" font-size="10" fill="var(--au-text-muted)" font-family="var(--au-font)">
          ${Math.round(g * 100)}%
        </text>
      `;
    });

    // 2. X 轴时间刻度 (3~5 个点)
    const tickIndices = [0, Math.floor((n - 1) / 3), Math.floor((n - 1) * 2 / 3), n - 1]
      .filter((v, i, a) => a.indexOf(v) === i && v >= 0);

    let xLabelsSvg = '';
    tickIndices.forEach(idx => {
      const p = points[idx];
      const anchor = idx === 0 ? 'start' : (idx === n - 1 ? 'end' : 'middle');
      const timeStr = new Date(p.t).toLocaleString('zh-CN', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
      });
      xLabelsSvg += `
        <text x="${x(idx)}" y="${H - 8}" text-anchor="${anchor}" font-size="10" fill="var(--au-text-muted)" font-family="var(--au-font)">
          ${timeStr}
        </text>
      `;
    });

    // 3. 各 series 的折线与末端圆点、当前值
    let pathsSvg = '';
    seriesList.forEach(s => {
      if (s.values.length !== n) return;
      const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
      const lastVal = s.values[n - 1];
      const lastX = x(n - 1);
      const lastY = y(lastVal);

      pathsSvg += `
        <path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" />
        <circle cx="${lastX}" cy="${lastY}" r="3.5" fill="${s.color}" stroke="var(--au-bg)" stroke-width="1.5" />
      `;
    });

    // 4. 组装整体 SVG
    container.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" style="width: 100%; height: auto; max-height: ${H}px; display: block;" preserveAspectRatio="none">
        ${gridSvg}
        ${pathsSvg}
        ${xLabelsSvg}
      </svg>
      <div class="au-legend" style="justify-content: flex-start; padding: 4px 6px 0;">
        ${seriesList.map(s => {
          const latest = s.values[n - 1];
          return `
            <span class="au-legend-i">
              <span class="au-legend-dot" style="background: ${s.color}"></span>
              <span style="font-weight: 600">${s.label}:</span>
              <span style="color: ${s.color}; font-weight: 700; font-variant-numeric: tabular-nums">${pct(latest)}</span>
            </span>
          `;
        }).join('')}
      </div>
    `;

    // 5. 渲染各桶消耗与恢复统计卡片 (如果有 buckets 聚合)
    const bucketsCard = modalOverlay.querySelector('#trend-buckets-card');
    const bucketsGrid = modalOverlay.querySelector('#trend-buckets-summary-grid');
    if (bucketsCard && bucketsGrid && Array.isArray(data.buckets) && data.buckets.length > 0) {
      bucketsCard.style.display = 'block';
      bucketsGrid.innerHTML = data.buckets.map(b => {
        const name = SERIES_LABEL_MAP[b.id] || b.id;
        const color = SERIES_COLOR_MAP[b.id] || 'var(--au-brand)';
        return `
          <div class="au-bucket">
            <div class="au-bucket-head">
              <span class="au-bucket-label" style="font-weight:600">${name}</span>
              <span class="au-bucket-pct" style="color: ${color}; font-size:16px">${pct(b.consumed24h, 1)} <span style="font-size:10px; font-weight:normal; opacity:0.7">/ 24h消耗</span></span>
            </div>
            <div class="au-kv" style="margin-top:6px;">
              <span class="au-k">今日已消耗</span>
              <span class="au-v">${pct(b.consumedToday, 1)}</span>
              <span class="au-k">近 7 天累计消耗</span>
              <span class="au-v">${pct(b.consumed7d, 1)}</span>
              <span class="au-k">周期重置次数</span>
              <span class="au-v" style="color: var(--au-emerald)">${b.resets || 0} 次</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 182 天日历热力图渲染器 (TabHeatmap)
  function renderHeatmap() {
    const grid = modalOverlay.querySelector('#au-heat-grid');
    const monthsContainer = modalOverlay.querySelector('#au-heat-months');
    if (!grid || !monthsContainer) return;

    grid.innerHTML = '';
    monthsContainer.innerHTML = '';

    const days = 182;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - (days - 1) * 86400000);
    // 对齐到周一
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const dayMap = new Map();
    for (const d of RAW_DAILY) dayMap.set(d.date, d);

    const cells = [];
    for (let d = new Date(start.getTime()); d.getTime() <= today.getTime(); d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      cells.push({
        date: key,
        ms: d.getTime(),
        month: d.getMonth() + 1,
        dayOfWeek: (d.getDay() + 6) % 7,
        item: dayMap.get(key)
      });
    }

    const numWeeks = Math.ceil(cells.length / 7);

    // 1. 动态生成顶部月份标尺 (Month Labels)
    let lastMonth = -1;
    let lastMonthCol = -999;
    for (let col = 0; col < numWeeks; col++) {
      const idx = col * 7;
      if (idx < cells.length) {
        const m = cells[idx].month;
        if (m !== lastMonth && (col - lastMonthCol >= 2)) {
          const label = document.createElement('span');
          label.className = 'au-heat-month-label';
          label.style.position = 'absolute';
          label.style.left = (col * 14) + 'px';
          label.style.fontSize = '10.5px';
          label.style.color = 'var(--au-text-muted)';
          label.style.fontWeight = '600';
          label.style.whiteSpace = 'nowrap';
          label.textContent = `${m}月`;
          monthsContainer.appendChild(label);
          lastMonth = m;
          lastMonthCol = col;
        }
      }
    }

    // 2. 计算各单元格数值与峰值
    const metric = SELECTED_HEAT_METRIC;
    let max = 0;
    cells.forEach(c => {
      let val = 0;
      if (c.item) {
        if (metric === 'sessions') val = num(c.item.sessions);
        else if (metric === 'steps') val = num(c.item.steps);
        else if (metric === 'tokens') val = num(c.item.tokens?.input) + num(c.item.tokens?.output);
        else if (metric === 'cache') val = num(c.item.tokens?.cacheRead);
      }
      c.val = val;
      if (val > max) max = val;
    });

    const todayStr = today.toISOString().slice(0, 10);
    const weekdaysZh = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    // 3. 填充格子
    cells.forEach(c => {
      const cell = document.createElement('div');
      cell.className = 'au-cell' + (c.date === todayStr ? ' today' : '');
      let color = 'rgba(128,128,128,0.16)';
      if (c.val > 0) {
        const r = max > 0 ? (c.val / max) : 1;
        if (r > 0.75) color = '#16a34a';
        else if (r > 0.5) color = 'color-mix(in srgb, #16a34a 76%, transparent)';
        else if (r > 0.25) color = 'color-mix(in srgb, #16a34a 52%, transparent)';
        else color = 'color-mix(in srgb, #16a34a 28%, transparent)';
      }
      cell.style.background = color;
      const unit = metric === 'sessions' ? '个会话' : (metric === 'steps' ? '步' : 'Token');
      cell.title = `${c.date} (${weekdaysZh[c.dayOfWeek]}) · ${fmtNum(c.val)} ${unit}`;
      grid.appendChild(cell);
    });

    modalOverlay.querySelector('#heat-summary-info').textContent =
      `近 ${days} 天 · 峰值: ${fmtNum(max)} ${metric === 'sessions' ? '个会话' : (metric === 'steps' ? '步' : 'Token')}`;
  }

  // 逐日汇总表格渲染器 (TabSummary)
  function renderSummaryTab() {
    const tbody = modalOverlay.querySelector('#summary-table-body');
    if (!tbody) return;
    if (RAW_DAILY.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--au-text-muted)">暂无日历记录</td></tr>';
      return;
    }

    tbody.innerHTML = RAW_DAILY.slice().reverse().map(d => {
      const t = d.tokens || {};
      const totalIn = num(t.input) + num(t.cacheRead);
      const hit = totalIn > 0 ? ((num(t.cacheRead) / totalIn) * 100).toFixed(1) + '%' : '—';
      return `
        <tr>
          <td><b>${d.date}</b></td>
          <td class="au-num">${d.sessions || 0}</td>
          <td class="au-num">${d.steps || 0}</td>
          <td class="au-num">${d.genCalls || 0}</td>
          <td class="au-num" title="${fmtFull(t.input)}">${fmtNum(t.input)}</td>
          <td class="au-num" style="color:var(--au-purple)" title="${fmtFull(t.output)}">${fmtNum(t.output)}</td>
          <td class="au-num" style="color:var(--au-brand)" title="${fmtFull(t.cacheRead)}">${fmtNum(t.cacheRead)}</td>
          <td class="au-num" style="color:var(--au-emerald); font-weight:700">${hit}</td>
        </tr>
      `;
    }).join('');
  }

  // 配额桶重置监控渲染器 (TabResets)
  function renderResetsTab() {
    const tbody = modalOverlay.querySelector('#resets-table-body');
    if (!tbody) return;

    const buckets = [];
    if (RAW_QUOTA && Array.isArray(RAW_QUOTA.groups)) {
      for (const g of RAW_QUOTA.groups) {
        for (const b of (g.buckets || [])) {
          buckets.push(b);
        }
      }
    }

    if (buckets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--au-text-muted)">未检测到活跃的额度桶</td></tr>';
      return;
    }

    tbody.innerHTML = buckets.map(b => {
      const v = num(b.remainingFraction);
      const used = (1 - v);
      const color = remainingColor(v);
      let countdown = '—';
      let rTimeStr = '—';

      if (b.resetTime) {
        const rDate = new Date(b.resetTime);
        const diffMs = rDate.getTime() - Date.now();
        if (diffMs > 0) {
          countdown = fmtCountdown(diffMs);
        } else {
          countdown = '已到期恢复';
        }
        rTimeStr = fmtTime(rDate.getTime());
      }

      const windowType = b.windowType || (b.bucketId?.includes('weekly') ? '周周期重置' : '5小时滑动窗口');
      const proj = calcQuotaProjection(v, b.bucketId || b.displayName);

      return `
        <tr>
          <td style="text-align: left; font-weight: 600;">${b.displayName || b.bucketId}</td>
          <td class="au-num" style="color: ${color}; font-weight: 700">${pct(v)}</td>
          <td class="au-num" style="color: var(--au-brand); font-weight: 700">~${proj.remTokStr}</td>
          <td class="au-num">${pct(used)}</td>
          <td class="au-num" style="color: var(--au-brand); font-weight: 600">${countdown}</td>
          <td class="au-num" style="color: var(--au-text-muted)">${rTimeStr}</td>
          <td class="au-num">${windowType}</td>
        </tr>
      `;
    }).join('');
  }

  // 会话 Tab 与模型列表渲染器 (TabConversations)
  function renderConversationsTab() {
    const modelsTbody = modalOverlay.querySelector('#conv-models-tbody');
    if (modelsTbody) {
      modelsTbody.innerHTML = RAW_MODELS.map(m => {
        const t = m.tokens || {};
        const totalIn = num(t.input) + num(t.cacheRead);
        const hit = totalIn > 0 ? ((num(t.cacheRead) / totalIn) * 100).toFixed(1) + '%' : '—';
        return `
          <tr>
            <td style="font-weight: 600">${m.model}</td>
            <td class="au-num">${m.genCalls || 0}</td>
            <td class="au-num" title="${fmtFull(t.input)}">${fmtNum(t.input)}</td>
            <td class="au-num" style="color:var(--au-purple)" title="${fmtFull(t.output)}">${fmtNum(t.output)}</td>
            <td class="au-num" style="color:var(--au-brand)" title="${fmtFull(t.cacheRead)}">${fmtNum(t.cacheRead)}</td>
            <td class="au-num" style="color:var(--au-emerald); font-weight:700">${hit}</td>
          </tr>
        `;
      }).join('');
    }

    const wsContainer = modalOverlay.querySelector('#conv-workspaces-pills');
    if (wsContainer) {
      wsContainer.innerHTML = '';
      RAW_WORKSPACES.forEach(w => {
        const btn = document.createElement('button');
        btn.className = 'au-btn' + (SELECTED_WS_FILTER === w.workspace ? ' on' : '');
        btn.textContent = `${shortWs(w.workspace)} (${w.sessions})`;
        btn.onclick = () => {
          SELECTED_WS_FILTER = SELECTED_WS_FILTER === w.workspace ? '' : w.workspace;
          renderConversationsTab();
        };
        wsContainer.appendChild(btn);
      });
    }

    updateConversationsList();
  }

  function updateConversationsList() {
    const q = SEARCH_QUERY.toLowerCase();
    const ws = SELECTED_WS_FILTER;

    const badge = modalOverlay.querySelector('#conv-ws-badge');
    if (badge) {
      if (ws) {
        badge.style.display = 'inline-block';
        badge.textContent = `工作区: ${shortWs(ws)} ✕`;
        badge.onclick = () => { SELECTED_WS_FILTER = ''; renderConversationsTab(); };
      } else {
        badge.style.display = 'none';
      }
    }

    const filtered = RAW_CONVERSATIONS.filter(c => {
      if (ws && !(c.workspaces || []).includes(ws)) return false;
      if (!q) return true;
      const hay = `${c.title || ''} ${c.preview || ''} ${(c.workspaces || []).join(' ')} ${(c.models || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });

    modalOverlay.querySelector('#conv-count-info').textContent = `${filtered.length} / ${RAW_CONVERSATIONS.length} 个会话`;

    const listTbody = modalOverlay.querySelector('#conv-list-tbody');
    if (!listTbody) return;

    if (filtered.length === 0) {
      listTbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:var(--au-text-muted)">没有匹配的会话</td></tr>';
      return;
    }

    listTbody.innerHTML = filtered.slice(0, 150).map(c => {
      const t = c.tokens || {};
      const totalIn = num(t.input) + num(t.cacheRead);
      const hit = totalIn > 0 ? ((num(t.cacheRead) / totalIn) * 100).toFixed(1) + '%' : '—';
      return `
        <tr>
          <td class="au-trunc" title="${c.title || c.preview || ''}"><b>${c.title || c.preview || '未命名会话'}</b></td>
          <td class="au-trunc" title="${(c.workspaces || []).join('\\n')}">${shortWs((c.workspaces || [])[0])}</td>
          <td class="au-trunc" title="${(c.models || []).join(', ')}">${(c.models || []).slice(0, 2).join(', ')}</td>
          <td class="au-num">${c.steps || 0}</td>
          <td class="au-num">${c.genCalls || 0}</td>
          <td class="au-num" title="${fmtFull(t.input)}">${fmtNum(t.input)}</td>
          <td class="au-num" style="color:var(--au-purple)" title="${fmtFull(t.output)}">${fmtNum(t.output)}</td>
          <td class="au-num" style="color:var(--au-brand)" title="${fmtFull(t.cacheRead)}">${fmtNum(t.cacheRead)}</td>
          <td class="au-num" style="color:var(--au-emerald); font-weight:700">${hit}</td>
          <td style="white-space:nowrap">${fmtTime(c.lastModified)}</td>
        </tr>
      `;
    }).join('');
  }

  // 8. 统一取数逻辑
  async function fetchAllData() {
    try {
      const qRes = await fetch('http://127.0.0.1:19388/api/quota', { signal: AbortSignal.timeout(2000) });
      if (qRes.ok) {
        RAW_QUOTA = await qRes.json();
        renderQuotaTab();
      }
    } catch (e) {}

    try {
      const cRes = await fetch('http://127.0.0.1:19388/api/conversations', { signal: AbortSignal.timeout(3500) });
      if (cRes.ok) {
        const cData = await cRes.json();
        RAW_CONVERSATIONS = cData.conversations || [];
        RAW_DAILY = cData.byDay || [];
        RAW_MODELS = cData.byModel || [];
        RAW_WORKSPACES = cData.byWorkspace || [];

        updateKPIs();
        renderHeatmap();
        renderSummaryTab();
        renderConversationsTab();
      }
    } catch (e) {}
  }

  // 9. 交互事件绑定
  const pillBar = capsuleRoot.querySelector('#agy-pill-bar');
  const overlay = modalOverlay;
  const modalWin = modalOverlay.querySelector('#agy-modal-win');
  const btnClose = modalOverlay.querySelector('#modal-btn-close');
  const btnFullscreen = modalOverlay.querySelector('#modal-btn-fullscreen');
  const btnRefresh = modalOverlay.querySelector('#modal-btn-refresh');

  function openModal() {
    overlay.classList.add('open');
    fetchAllData();
    fetchTrendData();
  }
  function closeModal() {
    overlay.classList.remove('open');
  }

  pillBar.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal();
  });
  btnClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  let isFullscreen = false;
  btnFullscreen.addEventListener('click', () => {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      modalWin.classList.add('fullscreen');
      btnFullscreen.textContent = '❐ 还原';
    } else {
      modalWin.classList.remove('fullscreen');
      btnFullscreen.textContent = '⛶ 展开';
    }
  });

  btnRefresh.addEventListener('click', () => {
    btnRefresh.textContent = '↻ 刷新中...';
    Promise.allSettled([fetchAllData(), fetchTrendData()]).finally(() => {
      setTimeout(() => { btnRefresh.textContent = '↻ 刷新'; }, 300);
    });
  });

  // KPI 时间范围切换
  modalOverlay.querySelectorAll('#kpi-range-group .au-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlay.querySelectorAll('#kpi-range-group .au-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      SELECTED_DAYS = Number(btn.getAttribute('data-days'));
      updateKPIs();
    });
  });

  // 标签页切换
  const tabs = modalOverlay.querySelectorAll('.au-tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('on'));
      modalOverlay.querySelectorAll('.au-tab-pane').forEach(p => p.classList.remove('on'));
      btn.classList.add('on');
      const targetId = btn.getAttribute('data-tab');
      const pane = modalOverlay.querySelector('#' + targetId);
      if (pane) pane.classList.add('on');

      if (targetId === 'tab-trend') {
        fetchTrendData();
      } else if (targetId === 'tab-heatmap') {
        renderHeatmap();
      }
    });
  });

  // 趋势图范围切换
  modalOverlay.querySelectorAll('#trend-range-group .au-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlay.querySelectorAll('#trend-range-group .au-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const range = btn.getAttribute('data-range');
      fetchTrendData(range);
    });
  });

  // 热力图指标切换
  modalOverlay.querySelectorAll('#heat-metric-group .au-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlay.querySelectorAll('#heat-metric-group .au-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      SELECTED_HEAT_METRIC = btn.getAttribute('data-metric');
      renderHeatmap();
    });
  });

  // 搜索框输入事件
  modalOverlay.querySelector('#conv-search-input')?.addEventListener('input', (e) => {
    SEARCH_QUERY = e.target.value;
    updateConversationsList();
  });

  // 全局键盘监听
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
    if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
      if (overlay.classList.contains('open')) closeModal();
      else openModal();
    }
  });

  // 10. 智能测距自适应吸附
  function updateCapsulePosition() {
    const cRoot = document.getElementById('agy-quota-capsule-root');
    if (!cRoot) return;

    let rightOffset = 150;
    const buttons = document.querySelectorAll('button, [role="button"], a');
    for (const btn of buttons) {
      if (btn.closest && btn.closest('#agy-quota-capsule-root, #agy-inpage-modal-overlay')) continue;
      const rect = btn.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < 45 && rect.left > window.innerWidth / 2 && rect.width > 0 && rect.height > 0) {
        const fromRight = window.innerWidth - rect.left;
        if (fromRight > rightOffset && fromRight < 450) {
          rightOffset = fromRight;
        }
      }
    }
    cRoot.style.right = (rightOffset + 12) + 'px';
    cRoot.style.top = '5px';
  }

  // 11. 永久挂载与守护
  function ensureMounted() {
    if (!document.body) return;
    const cRoot = document.getElementById('agy-quota-capsule-root');
    if (!cRoot) {
      document.body.appendChild(capsuleRoot);
    } else if (cRoot.parentElement !== document.body) {
      document.body.appendChild(cRoot);
    }

    const mOverlay = document.getElementById('agy-inpage-modal-overlay');
    if (!mOverlay) {
      document.body.appendChild(modalOverlay);
    } else if (mOverlay.parentElement !== document.body) {
      document.body.appendChild(mOverlay);
    }

    updateCapsulePosition();
  }

  ensureMounted();
  fetchAllData();
  fetchTrendData();
  initTicker();
  setInterval(ensureMounted, 400);
  setInterval(fetchAllData, 3000);
  window.addEventListener('resize', updateCapsulePosition);

})();
