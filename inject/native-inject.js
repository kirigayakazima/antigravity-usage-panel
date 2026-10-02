// =========================================================================
// Antigravity Native UI Quota Capsule & In-Page Modal (v4.3 Professional)
// 对齐 DSH (antigravity-usage) 官方设计语言，100% 动态数据绑定，丰富交互筛选与热力图
// =========================================================================

(function initAntigravityQuotaInjection() {
  console.log('[Antigravity Quota HUD v4.3] Initializing Professional Web Engine in Main World...');

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
      border-radius: 9999px !important;
      background-color: var(--au-emerald) !important;
      box-shadow: 0 0 6px var(--au-emerald) !important;
      animation: agy-pulse 2s infinite !important;
    }

    @keyframes agy-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* 沉浸式全屏模态大屏 */
    #agy-inpage-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.45) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      z-index: 2147483646 !important;
      display: none;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0;
      transition: opacity 0.2s ease !important;
      font-family: var(--au-font) !important;
    }

    #agy-inpage-modal-overlay.open {
      display: flex !important;
      opacity: 1 !important;
    }

    .au-modal-window {
      width: 92% !important;
      max-width: 980px !important;
      height: 88% !important;
      max-height: 780px !important;
      background: var(--au-bg) !important;
      border: 1px solid var(--au-border-l1) !important;
      border-radius: 14px !important;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      color: var(--au-text-main) !important;
      transition: all 0.2s ease !important;
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

    /* 热力图网格 */
    .au-heat-wrap { overflow-x: auto; padding-bottom: 6px; }
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
      transition: transform 0.1s ease;
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
      margin-top: 8px;
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

  // 3. 构建微晶胶囊 DOM 根节点
  const capsuleRoot = document.createElement('div');
  capsuleRoot.id = 'agy-quota-capsule-root';
  capsuleRoot.innerHTML = `
    <div id="agy-pill-bar" class="agy-pill-bar" title="点击在当前页面直接展开全屏配额与用量大屏">
      <div id="agy-dot" class="agy-dot"></div>
      <span style="color: var(--au-text-muted); font-size: 11px">5h余:</span>
      <b id="agy-pill-5h" style="color: var(--au-emerald); font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 700">--%</b>
      <span style="opacity: 0.3">·</span>
      <span id="agy-pill-tokens" style="color: var(--au-brand); font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 600">~--</span>
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
        <div class="au-title">
          <span>🛰️ 反重力额度 / 用量监控面板</span>
          <span id="modal-acct-tier" class="au-ico-pct" style="background: #64748b; display:none">PRO</span>
          <span id="modal-acct-plan" class="au-ico-pct" style="background: #3b82f6; display:none">Plan</span>
          <span id="modal-live-status" style="font-size: 11.5px; font-weight: 600; color: var(--au-emerald)">● 实时</span>
        </div>
        <div class="au-spacer"></div>
        <div style="display: flex; align-items: center; gap: 6px">
          <button id="modal-btn-refresh" class="au-btn" title="立即刷新数据">↻ 刷新</button>
          <button id="modal-btn-fullscreen" class="au-btn" title="全屏切换">⛶ 展开</button>
          <button id="modal-btn-close" class="au-btn" style="font-weight: bold" title="关闭 (Esc)">✕</button>
        </div>
      </div>

      <!-- KPI 概览卡片行 + 时间范围筛选 -->
      <div class="au-kpi-bar">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div style="font-size: 11px; font-weight: 600; color: var(--au-text-muted)">📊 用量宏观指标概览</div>
          <div class="au-btn-group" id="kpi-range-group">
            <button class="au-btn" data-days="1">今天</button>
            <button class="au-btn" data-days="7">7天</button>
            <button class="au-btn" data-days="14">14天</button>
            <button class="au-btn" data-days="30">近30天</button>
            <button class="au-btn" data-days="90">近90天</button>
            <button class="au-btn on" data-days="0">全部</button>
          </div>
        </div>

        <div class="au-kpis">
          <div class="au-kpi">
            <div class="au-kpi-label">总 Token</div>
            <div class="au-kpi-value" id="kpi-tok-total">--</div>
            <div class="au-kpi-sub" id="kpi-tok-sub">未命中 -- · 缓存命中 -- · 输出 --</div>
            <div class="au-stack" id="kpi-tok-stack">
              <i style="width: 20%; background: #16a34a"></i>
              <i style="width: 65%; background: #3b82f6"></i>
              <i style="width: 15%; background: #8b5cf6"></i>
            </div>
          </div>
          <div class="au-kpi">
            <div class="au-kpi-label">缓存命中率</div>
            <div class="au-kpi-value" style="color: var(--au-emerald)" id="kpi-hit-rate">--%</div>
            <div class="au-kpi-sub" id="kpi-hit-sub">命中 -- / 未命中 --</div>
          </div>
          <div class="au-kpi">
            <div class="au-kpi-label">模型调用次数</div>
            <div class="au-kpi-value" style="color: var(--au-brand)" id="kpi-gens">--</div>
            <div class="au-kpi-sub" id="kpi-gens-sub">统计范围内有活动的会话</div>
          </div>
          <div class="au-kpi">
            <div class="au-kpi-label">输出 Token</div>
            <div class="au-kpi-value" style="color: var(--au-purple)" id="kpi-output">--</div>
            <div class="au-kpi-sub" id="kpi-out-sub">思考 -- · 回复 --</div>
          </div>
          <div class="au-kpi">
            <div class="au-kpi-label">会话总数</div>
            <div class="au-kpi-value" id="kpi-convs">--</div>
            <div class="au-kpi-sub" id="kpi-convs-sub">共 -- 步生成动作</div>
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
          </div>
          <div class="au-card">
            <div class="au-card-title">📈 剩余额度随时间变化走势</div>
            <div class="au-card-desc">反重力官方接口只给「剩余额度百分比」，下降即消耗，上升即窗口滚动恢复或周期重置。</div>
            <div id="trend-chart-container" style="min-height: 220px; display: flex; align-items: center; justify-content: center">
              <div style="color: var(--au-text-muted); font-size: 12px; text-align: center; padding: 30px">
                ⏳ 正在持续累积采样数据点（后台守护常驻运行将自动绘制时序曲线）
              </div>
            </div>
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
            <div class="au-heat-wrap">
              <div id="au-heat-grid" class="au-heat"></div>
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
                  <th class="au-num">会话数</th>
                  <th class="au-num">步数</th>
                  <th class="au-num">生成次数</th>
                  <th class="au-num">输入 Token</th>
                  <th class="au-num">输出 Token</th>
                  <th class="au-num">缓存读取</th>
                  <th class="au-num">命中率</th>
                </tr>
              </thead>
              <tbody id="summary-table-body">
                <tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--au-text-muted)">正在读取数据...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. 重置 Tab -->
        <div id="tab-resets" class="au-tab-pane">
          <div class="au-card">
            <div class="au-card-title">🔄 各额度桶规格与重置周期</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>额度桶</th>
                  <th class="au-num">当前剩余</th>
                  <th class="au-num">已消耗</th>
                  <th class="au-num">重置时间</th>
                  <th class="au-num">状态</th>
                </tr>
              </thead>
              <tbody id="resets-table-body">
                <tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--au-text-muted)">正在读取额度桶...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. 会话 Tab -->
        <div id="tab-conv" class="au-tab-pane">
          <div class="au-card" id="conv-model-card">
            <div class="au-card-title">🧠 各模型使用统计</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>模型</th>
                  <th class="au-num">生成</th>
                  <th class="au-num">输入</th>
                  <th class="au-num">输出</th>
                  <th class="au-num">缓存读取</th>
                  <th class="au-num">命中率</th>
                </tr>
              </thead>
              <tbody id="conv-models-tbody"></tbody>
            </table>
          </div>

          <div class="au-card" id="conv-ws-card">
            <div class="au-card-title">📁 按工作区（点击一行可快捷筛选）</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>工作区</th>
                  <th class="au-num">会话</th>
                  <th class="au-num">步数</th>
                  <th class="au-num">输入</th>
                  <th class="au-num">输出</th>
                </tr>
              </thead>
              <tbody id="conv-ws-tbody"></tbody>
            </table>
          </div>

          <div class="au-card">
            <div class="au-toolbar">
              <input id="conv-search-input" class="au-input" placeholder="搜索会话标题 / 工作区 / 模型…" />
              <button id="conv-ws-badge" class="au-btn on" style="display:none"></button>
              <span class="au-spacer"></span>
              <span style="font-size: 11px; color: var(--au-text-muted)" id="conv-count-info">0 个会话</span>
            </div>
            <div style="overflow-x: auto; max-height: 480px; overflow-y: auto">
              <table class="au-table">
                <thead>
                  <tr>
                    <th>会话标题</th>
                    <th>工作区</th>
                    <th>模型</th>
                    <th class="au-num">步数</th>
                    <th class="au-num">生成</th>
                    <th class="au-num">输入</th>
                    <th class="au-num">输出</th>
                    <th class="au-num">缓存读取</th>
                    <th class="au-num">命中率</th>
                    <th>最后活动</th>
                  </tr>
                </thead>
                <tbody id="conv-list-tbody">
                  <tr><td colspan="10" style="text-align:center; padding: 20px; color: var(--au-text-muted)">正在加载会话列表...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // 5. 状态存储与全局变量
  let RAW_QUOTA = null;
  let RAW_CONVERSATIONS = [];
  let RAW_DAILY = [];
  let RAW_MODELS = [];
  let RAW_WORKSPACES = [];
  let SELECTED_DAYS = 0;
  let SELECTED_HEAT_METRIC = 'sessions';
  let SELECTED_WS_FILTER = '';
  let SEARCH_QUERY = '';

  // 辅助函数
  function num(v) { return (typeof v === 'number' && Number.isFinite(v)) ? v : 0; }
  function fmtNum(v) {
    const n = num(v);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(Math.round(n));
  }
  function fmtFull(v) { return num(v).toLocaleString('en-US'); }
  function pct(v, digits = 1) {
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
    return (v * 100).toFixed(digits) + '%';
  }
  function remainingColor(v) {
    if (v <= 0.15) return '#dc2626';
    if (v <= 0.4) return '#ea580c';
    if (v <= 0.7) return '#ca8a04';
    return '#16a34a';
  }
  function fmtTime(ms) {
    if (!ms) return '—';
    const d = typeof ms === 'number' ? new Date(ms) : new Date(Date.parse(ms));
    if (isNaN(d.getTime())) return String(ms);
    return d.toLocaleString('zh-CN', { hour12: false });
  }
  function fmtCountdown(isoStr) {
    if (!isoStr) return '—';
    const diff = new Date(isoStr).getTime() - Date.now();
    if (diff <= 0) return '即将重置';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 24) return Math.floor(h / 24) + '天' + (h % 24) + '小时';
    if (h > 0) return h + '小时' + m + '分';
    return m + '分' + s + '秒';
  }
  function shortWs(w) {
    if (!w) return '—';
    const parts = w.replace(/\\\\/g, '/').split('/').filter(x => x);
    return parts.length <= 2 ? w : '…/' + parts.slice(-2).join('/');
  }

  // 6. 数据渲染核心逻辑
  function updateKPIs() {
    let cutoff = '';
    if (SELECTED_DAYS > 0) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (SELECTED_DAYS - 1));
      cutoff = d.toISOString().slice(0, 10);
    }

    let tokIn = 0, tokOut = 0, tokCache = 0, tokThinking = 0, tokResp = 0;
    let sessions = 0, steps = 0, genCalls = 0;

    for (const d of RAW_DAILY) {
      if (cutoff && d.date < cutoff) continue;
      sessions += num(d.sessions);
      steps += num(d.steps);
      genCalls += num(d.genCalls);
      const t = d.tokens || {};
      tokIn += num(t.input);
      tokOut += num(t.output);
      tokCache += num(t.cacheRead);
      tokThinking += num(t.thinking);
      tokResp += num(t.response);
    }

    const totalPrompt = tokIn + tokCache;
    const totalAll = totalPrompt + tokOut;
    const hitRateVal = totalPrompt > 0 ? (tokCache / totalPrompt) : 0;

    modalOverlay.querySelector('#kpi-tok-total').textContent = fmtNum(totalAll);
    modalOverlay.querySelector('#kpi-tok-sub').textContent = `未命中 ${fmtNum(tokIn)} · 缓存命中 ${fmtNum(tokCache)} · 输出 ${fmtNum(tokOut)}`;

    const pIn = totalAll > 0 ? ((tokIn / totalAll) * 100).toFixed(1) : 0;
    const pCache = totalAll > 0 ? ((tokCache / totalAll) * 100).toFixed(1) : 0;
    const pOut = totalAll > 0 ? ((tokOut / totalAll) * 100).toFixed(1) : 0;
    const stack = modalOverlay.querySelector('#kpi-tok-stack');
    if (stack) {
      stack.innerHTML = `
        <i style="width: ${pIn}%; background: #16a34a" title="未命中输入 ${pIn}%"></i>
        <i style="width: ${pCache}%; background: #3b82f6" title="缓存命中 ${pCache}%"></i>
        <i style="width: ${pOut}%; background: #8b5cf6" title="输出 ${pOut}%"></i>
      `;
    }

    modalOverlay.querySelector('#kpi-hit-rate').textContent = (hitRateVal * 100).toFixed(1) + '%';
    modalOverlay.querySelector('#kpi-hit-sub').textContent = `命中 ${fmtNum(tokCache)} / 未命中 ${fmtNum(tokIn)}`;
    modalOverlay.querySelector('#kpi-gens').textContent = fmtNum(genCalls);
    modalOverlay.querySelector('#kpi-gens-sub').textContent = SELECTED_DAYS === 0 ? '全部历史总调用' : `近 ${SELECTED_DAYS} 天累计生成`;
    modalOverlay.querySelector('#kpi-output').textContent = fmtNum(tokOut);
    modalOverlay.querySelector('#kpi-out-sub').textContent = `思考 ${fmtNum(tokThinking)} · 回复 ${fmtNum(tokResp)}`;
    modalOverlay.querySelector('#kpi-convs').textContent = String(sessions);
    modalOverlay.querySelector('#kpi-convs-sub').textContent = `共 ${fmtFull(steps)} 步动作`;
  }

  function renderQuotaTab() {
    if (!RAW_QUOTA) return;
    const q = RAW_QUOTA;
    const acct = q.account || {};
    modalOverlay.querySelector('#acct-email').textContent = acct.email || '本地语言服务器';
    modalOverlay.querySelector('#acct-name').textContent = acct.name || '反重力用户';
    modalOverlay.querySelector('#acct-time').textContent = fmtTime(q.timestamp || Date.now());
    modalOverlay.querySelector('#ls-port-badge').textContent = `LS: 127.0.0.1:${q.port || '--'}`;

    if (acct.tier) {
      const bTier = modalOverlay.querySelector('#modal-acct-tier');
      bTier.style.display = 'inline-block';
      bTier.textContent = acct.tier;
    }
    if (acct.planName) {
      const bPlan = modalOverlay.querySelector('#modal-acct-plan');
      bPlan.style.display = 'inline-block';
      bPlan.textContent = acct.planName;
    }

    if (q.credits) {
      modalOverlay.querySelector('#acct-credits').textContent =
        `Prompt: ${q.credits.promptAvailable ?? '--'} / ${q.credits.promptMonthly ?? '--'} · Flow: ${q.credits.flowAvailable ?? '--'} / ${q.credits.flowMonthly ?? '--'}`;
    } else {
      modalOverlay.querySelector('#acct-credits').textContent = '无限量配额计划';
    }

    const groupsCont = modalOverlay.querySelector('#quota-groups-container');
    groupsCont.innerHTML = '';
    const resetsTable = modalOverlay.querySelector('#resets-table-body');
    resetsTable.innerHTML = '';

    const modelsList = modalOverlay.querySelector('#quota-models-list');
    modelsList.innerHTML = '';

    for (const group of q.groups || []) {
      const card = document.createElement('div');
      card.className = 'au-card';
      const gName = group.displayName || '配额组';
      card.innerHTML = `
        <div class="au-card-title">📊 ${gName}</div>
        ${group.description ? `<div class="au-card-desc">${group.description}</div>` : ''}
        <div class="au-grid" id="group-buckets-${gName.replace(/\\s+/g, '-')}"></div>
      `;
      const grid = card.querySelector('.au-grid');

      for (const b of group.buckets || []) {
        const frac = b.remainingFraction ?? 1;
        const color = remainingColor(frac);
        const cd = fmtCountdown(b.resetTime);
        const usedPct = ((1 - frac) * 100).toFixed(1);

        // 更新右上角胶囊 (精准匹配 Gemini 5h)
        if (b.bucketId === 'gemini-5h') {
          capsuleRoot.querySelector('#agy-pill-5h').textContent = pct(frac);
          capsuleRoot.querySelector('#agy-pill-tokens').textContent = `~${(frac * 115).toFixed(1)}M`;
          capsuleRoot.querySelector('#agy-pill-countdown').textContent = `⏳ ${cd}`;
        }

        const bucketEl = document.createElement('div');
        bucketEl.className = 'au-bucket';
        bucketEl.innerHTML = `
          <div class="au-bucket-head">
            <span class="au-bucket-label">${b.displayName || b.bucketId}</span>
            <span class="au-bucket-pct" style="color: ${color}">${pct(frac)}</span>
          </div>
          <div class="au-bar">
            <div class="au-bar-fill" style="width: ${pct(frac)}; background: ${color}"></div>
          </div>
          <div class="au-kv">
            <span class="au-k">重置时间</span>
            <span class="au-v">${cd} (${fmtTime(b.resetTime)})</span>
            <span class="au-k">已消耗</span>
            <span class="au-v">${usedPct}%</span>
          </div>
        `;
        grid.appendChild(bucketEl);

        // 同步追加到重置 Tab
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${b.displayName || b.bucketId}</b> <span style="opacity:0.5; font-size:10px">(${gName})</span></td>
          <td class="au-num" style="color:${color}; font-weight:700">${pct(frac)}</td>
          <td class="au-num">${usedPct}%</td>
          <td class="au-num">${fmtTime(b.resetTime)} (${cd})</td>
          <td class="au-num"><span style="color:${color}">● 正常</span></td>
        `;
        resetsTable.appendChild(tr);

        // 同步模型小卡片
        const mEl = document.createElement('div');
        mEl.className = 'au-model';
        mEl.innerHTML = `
          <span class="au-dot" style="background: ${color}"></span>
          <span class="au-model-name" title="${b.displayName}">${b.displayName}</span>
          <span class="au-v" style="color: ${color}; margin-left:auto">${pct(frac, 0)}</span>
        `;
        modelsList.appendChild(mEl);
      }
      groupsCont.appendChild(card);
    }
  }

  function renderHeatmap() {
    const grid = modalOverlay.querySelector('#au-heat-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const days = 182;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - (days - 1) * 86400000);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const dayMap = new Map();
    for (const d of RAW_DAILY) dayMap.set(d.date, d);

    const cells = [];
    for (let d = new Date(start.getTime()); d.getTime() <= today.getTime(); d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, item: dayMap.get(key) });
    }

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
      cell.title = `${c.date} · ${fmtNum(c.val)} ${unit}`;
      grid.appendChild(cell);
    });

    modalOverlay.querySelector('#heat-summary-info').textContent =
      `近 ${days} 天 · 峰值: ${fmtNum(max)} ${metric === 'sessions' ? '个会话' : (metric === 'steps' ? '步' : 'Token')}`;
  }

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

  function renderConversationsTab() {
    const modelsTbody = modalOverlay.querySelector('#conv-models-tbody');
    if (modelsTbody) {
      modelsTbody.innerHTML = RAW_MODELS.map(m => {
        const t = m.tokens || {};
        const totalIn = num(t.input) + num(t.cacheRead);
        const hit = totalIn > 0 ? ((num(t.cacheRead) / totalIn) * 100).toFixed(1) + '%' : '—';
        return `
          <tr>
            <td><b>${m.model}</b></td>
            <td class="au-num">${m.genCalls || 0}</td>
            <td class="au-num" title="${fmtFull(t.input)}">${fmtNum(t.input)}</td>
            <td class="au-num" style="color:var(--au-purple)" title="${fmtFull(t.output)}">${fmtNum(t.output)}</td>
            <td class="au-num" style="color:var(--au-brand)" title="${fmtFull(t.cacheRead)}">${fmtNum(t.cacheRead)}</td>
            <td class="au-num" style="color:var(--au-emerald); font-weight:700">${hit}</td>
          </tr>
        `;
      }).join('');
    }

    const wsTbody = modalOverlay.querySelector('#conv-ws-tbody');
    if (wsTbody) {
      wsTbody.innerHTML = RAW_WORKSPACES.map(w => `
        <tr class="ws-filter-row" data-ws="${w.workspace}" style="cursor: pointer" title="点击筛选此工作区">
          <td class="au-trunc"><b>${shortWs(w.workspace)}</b></td>
          <td class="au-num">${w.sessions || 0}</td>
          <td class="au-num">${w.steps || 0}</td>
          <td class="au-num" title="${fmtFull(w.tokens?.input)}">${fmtNum(w.tokens?.input)}</td>
          <td class="au-num" style="color:var(--au-purple)" title="${fmtFull(w.tokens?.output)}">${fmtNum(w.tokens?.output)}</td>
        </tr>
      `).join('');

      wsTbody.querySelectorAll('.ws-filter-row').forEach(row => {
        row.addEventListener('click', () => {
          const ws = row.getAttribute('data-ws');
          SELECTED_WS_FILTER = SELECTED_WS_FILTER === ws ? '' : ws;
          updateConversationsList();
        });
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
        badge.onclick = () => { SELECTED_WS_FILTER = ''; updateConversationsList(); };
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
          <td class="au-trunc" title="${c.title || c.preview || ''}"><b>${c.title || c.preview || '(无标题会话)'}</b></td>
          <td class="au-trunc" title="${(c.workspaces || []).join('\\n')}">${shortWs((c.workspaces || [])[0])}</td>
          <td class="au-trunc" title="${(c.models || []).join(', ')}">${(c.models || []).slice(0, 2).join(', ') || '—'}</td>
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

  // 7. 取数逻辑
  async function fetchAllData() {
    try {
      const qRes = await fetch('http://127.0.0.1:19388/api/quota', { signal: AbortSignal.timeout(2000) });
      if (qRes.ok) {
        RAW_QUOTA = await qRes.json();
        renderQuotaTab();
      }
    } catch (e) {}

    try {
      const cRes = await fetch('http://127.0.0.1:19388/api/conversations', { signal: AbortSignal.timeout(2000) });
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

  // 8. 交互事件绑定
  const pillBar = capsuleRoot.querySelector('#agy-pill-bar');
  const overlay = modalOverlay;
  const modalWin = modalOverlay.querySelector('#agy-modal-win');
  const btnClose = modalOverlay.querySelector('#modal-btn-close');
  const btnFullscreen = modalOverlay.querySelector('#modal-btn-fullscreen');
  const btnRefresh = modalOverlay.querySelector('#modal-btn-refresh');

  function openModal() {
    overlay.classList.add('open');
    fetchAllData();
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
    fetchAllData().finally(() => {
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

  // 9. 智能测距自适应吸附
  function updateCapsulePosition() {
    const cRoot = document.getElementById('agy-quota-capsule-root');
    if (!cRoot) return;

    let rightOffset = 150;
    const buttons = document.querySelectorAll('button, [role="button"], a');
    for (const btn of buttons) {
      if (btn.closest && btn.closest('#agy-quota-capsule-root, #agy-inpage-modal-overlay')) continue;
      const rect = btn.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < 45 && rect.left > window.innerWidth / 2 && rect.width > 0) {
        const fromRight = window.innerWidth - rect.left;
        if (fromRight > rightOffset && fromRight < 450) {
          rightOffset = fromRight;
        }
      }
    }
    cRoot.style.right = (rightOffset + 12) + 'px';
    cRoot.style.top = '5px';
  }

  // 10. 永久挂载与守护
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
  setInterval(ensureMounted, 400);
  setInterval(fetchAllData, 3000);
  window.addEventListener('resize', updateCapsulePosition);

})();
