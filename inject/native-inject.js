// Antigravity Usage Panel
(function initAntigravityQuotaInjection() {
  if (!document.documentElement) {
    document.addEventListener('DOMContentLoaded', initAntigravityQuotaInjection, { once: true });
    return;
  }
  // 1. 清理旧实例 (支持无缝热重载与重新注入)
  try {
    document.querySelectorAll('#agy-popup-card, #agy-quota-capsule-root, #agy-inpage-modal-overlay, #agy-usage-style').forEach(el => el.remove());
  } catch (e) {}

  const styleEl = document.createElement('style');
  styleEl.id = 'agy-usage-style';
  styleEl.textContent = `
    #agy-quota-capsule-root, #agy-inpage-modal-overlay {
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
      --au-cyan: #06b6d4;
      --au-pill-bg: #ffffff;
      --au-pill-border: #e2e8f0;
      --au-pill-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    @media (prefers-color-scheme: dark) {
      #agy-quota-capsule-root, #agy-inpage-modal-overlay {
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
        --au-cyan: #22d3ee;
        --au-pill-bg: rgba(30, 41, 59, 0.95);
        --au-pill-border: rgba(255, 255, 255, 0.15);
        --au-pill-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }
    }

    #agy-quota-capsule-root {
      position: fixed; top: 4px; right: var(--agy-right, 152px); z-index: 2147483647;
      font-family: var(--au-font); -webkit-app-region: no-drag;
    }
    .agy-pill-bar {
      display: flex; align-items: center; gap: 9px; min-height: 26px; padding: 0 9px;
      border-radius: 8px; border: 1px solid var(--au-border-l1); background: var(--au-bg);
      color: var(--au-text-main); cursor: pointer; font: 11px var(--au-font); white-space: nowrap;
      -webkit-app-region: no-drag; font-variant-numeric: tabular-nums;
    }
    .agy-pill-bar:hover { background: var(--au-bg-layer-2); border-color: var(--au-border-l2); }
    .agy-pill-item { display: flex; align-items: center; gap: 4px; color: var(--au-text-muted); }
    .agy-pill-item + .agy-pill-item { padding-left: 8px; border-left: 1px solid var(--au-border-l1); }
    .agy-pill-item[hidden] { display: none; }
    .agy-pill-item b { color: var(--au-text-main); font-weight: 650; }
    .agy-pill-icon { width: 13px; height: 13px; flex: none; color: var(--au-brand); }
    @media (max-width: 680px) { .agy-pill-item { display: none; } }

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

    .au-modal-window { width: min(960px, calc(100vw - 32px)) !important; height: min(730px, calc(100vh - 64px)) !important; border-radius: 18px !important; }
    #agy-inpage-modal-overlay { background: rgba(15, 23, 42, .46) !important; backdrop-filter: blur(3px) !important; }
    .au-head { padding: 18px 24px; background: var(--au-bg); gap: 14px; }
    .au-title { font-size: 21px; letter-spacing: -.025em; }
    .au-eyebrow { color: var(--au-text-muted); font-size: 10px; font-weight: 700; letter-spacing: .13em; margin-bottom: 3px; }
    .au-status { border-radius: 999px; border: 1px solid var(--au-border-l1); padding: 3px 8px; font-size: 11px; white-space: nowrap; color: var(--au-text-muted); }
    .au-status[data-state="online"] { color: var(--au-emerald); }
    .au-status::before { content: ""; display: inline-block; width: 6px; height: 6px; margin-right: 5px; border-radius: 50%; background: currentColor; vertical-align: 1px; }
    .au-tabs { padding: 0 24px; background: var(--au-bg); gap: 12px; overflow-x: auto; }
    .au-tab { padding: 10px 3px; white-space: nowrap; }
    .au-body { background: var(--au-bg-layer-1); padding: 24px; overscroll-behavior: contain; }
    .au-card { background: var(--au-bg); border-radius: 12px; padding: 15px; overflow-x: auto; }
    .au-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
    .au-section-head h3 { margin: 0; font-size: 17px; letter-spacing: -.02em; }
    .au-section-head p { margin: 4px 0 0; color: var(--au-text-muted); font-size: 12px; }
    .au-caption { color: var(--au-text-muted); font-size: 11px; }
    .au-quota-groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 285px), 1fr)); gap: 14px; }
    .au-quota-group { background: var(--au-bg); border: 1px solid var(--au-border-l1); border-radius: 14px; padding: 17px 18px; min-width: 0; }
    .au-quota-group h4 { display: flex; align-items: center; gap: 9px; font-size: 14px; margin: 0 0 12px; }
    .au-group-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; color: var(--au-brand); background: color-mix(in srgb, var(--au-brand) 12%, transparent); }
    .au-group-icon[data-group="1"] { color: var(--au-purple); background: color-mix(in srgb, var(--au-purple) 12%, transparent); }
    .au-group-icon[data-group="2"] { color: var(--au-cyan); background: color-mix(in srgb, var(--au-cyan) 12%, transparent); }
    .au-quota-window + .au-quota-window { margin-top: 13px; padding-top: 12px; border-top: 1px solid var(--au-border-l1); }
    .au-quota-window .au-bucket-label { font-weight: 600; color: var(--au-text-main); }
    .au-quota-window .au-bucket-pct { font-size: 25px; letter-spacing: -.03em; font-weight: 700; }
    .au-quota-meta { display: flex; gap: 8px; justify-content: space-between; font-size: 11px; color: var(--au-text-muted); }
    .au-estimate { display: flex; align-items: center; flex-wrap: wrap; min-height: 40px; gap: 8px 24px; margin-top: 10px; padding: 8px 10px; border-radius: 8px; background: var(--au-bg-layer-1); }
    .au-estimate span, .au-estimate b { display: block; }
    .au-estimate span, .au-estimate small, .au-estimate-empty { color: var(--au-text-muted); font-size: 11px; }
    .au-estimate b { font-size: 14px; font-weight: 650; font-variant-numeric: tabular-nums; }
    .au-day-detail { min-height: 24px; padding: 9px 11px; border-radius: 8px; background: var(--au-bg-layer-1); color: var(--au-text-muted); font-variant-numeric: tabular-nums; }
    .au-heat-month-label, #au-heat-months > span { position: absolute; font-size: 10.5px; color: var(--au-text-muted); white-space: nowrap; }
    .au-heat button.au-cell { padding: 0; border: 0; cursor: pointer; }
    .au-quota-note { margin: 12px 0 22px; }
    .au-account { border-top: 1px solid var(--au-border-l1); color: var(--au-text-muted); padding: 10px 0; }
    .au-account summary { cursor: pointer; width: fit-content; }
    .au-account .au-kv { margin: 10px 0; }
    .au-range-bar { display: flex; align-items: center; gap: 12px; justify-content: space-between; padding: 9px 24px; background: var(--au-bg); border-bottom: 1px solid var(--au-border-l1); flex-wrap: wrap; }
    .au-range-bar[hidden] { display: none; }
    #kpi-range-hint { color: var(--au-text-muted); font-size: 11px; }
    .au-date-wrap { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--au-text-muted); }
    .au-date-input {
      background: var(--au-bg-layer-1);
      border: 1px solid var(--au-border-l1);
      border-radius: 6px;
      color: var(--au-text-main);
      padding: 3px 6px;
      font-size: 11px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .au-date-input:focus { border-color: var(--au-brand); }
    .au-period-card { margin-bottom: 16px; border: 1px solid var(--au-border-l1); }
    .au-period-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-top: 10px; }
    .au-period-kpi { background: var(--au-bg-layer-1); padding: 8px 12px; border-radius: 8px; }
    .au-period-kpi-label { color: var(--au-text-muted); font-size: 11px; }
    .au-period-kpi-val { font-size: 16px; font-weight: 700; margin: 2px 0; display: block; font-variant-numeric: tabular-nums; }
    .au-period-kpi-sub { color: var(--au-text-muted); font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
    .au-group-period-usage { font-size: 11px; color: var(--au-text-muted); margin: -4px 0 10px; display: flex; justify-content: space-between; align-items: center; }
    .au-acct-switcher { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .au-acct-pill {
      display: inline-flex; align-items: center; gap: 7px; padding: 6px 11px; border-radius: 10px;
      border: 1px solid var(--au-border-l1); background: var(--au-bg); color: var(--au-text-main);
      font-size: 12px; cursor: pointer; transition: all 0.15s ease; font-family: inherit;
    }
    .au-acct-pill:hover { border-color: var(--au-brand); background: var(--au-bg-layer-1); }
    .au-acct-pill.on { border-color: var(--au-brand); background: color-mix(in srgb, var(--au-brand) 10%, var(--au-bg)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--au-brand) 30%, transparent); }
    .au-acct-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: var(--au-text-muted); }
    .au-acct-dot.online { background: var(--au-emerald); box-shadow: 0 0 0 2px color-mix(in srgb, var(--au-emerald) 25%, transparent); }
    .au-acct-badge { font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--au-bg-layer-2); color: var(--au-text-muted); font-weight: 600; }
    .au-acct-badge.reset { background: color-mix(in srgb, var(--au-emerald) 15%, transparent); color: var(--au-emerald); }
    .au-acct-banner {
      display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
      padding: 9px 12px; margin-bottom: 14px; border-radius: 10px; font-size: 11.5px;
      background: color-mix(in srgb, var(--au-orange) 10%, var(--au-bg));
      border: 1px solid color-mix(in srgb, var(--au-orange) 35%, transparent); color: var(--au-text-main);
    }
    .au-acct-banner[hidden] { display: none; }
    .au-kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 14px; }
    #kpi-card-total { grid-column: span 4; }
    #kpi-card-total .au-kpi-value { font-size: 30px; }
    .au-kpi { padding: 12px 14px; border-radius: 12px; }
    .au-kpi-sub { font-size: 11px; }
    .au-empty { padding: 14px 0; color: var(--au-text-muted); }
    .au-table :is(th, td).au-num { text-align: right; }
    #agy-inpage-modal-overlay :is(button, input, summary):focus-visible,
    .agy-pill-bar:focus-visible { outline: 2px solid var(--au-brand); outline-offset: 2px; }
    @media (max-width: 620px) {
      .au-head, .au-body { padding: 14px; }
      .au-tabs, .au-range-bar { padding-inline: 14px; }
      .au-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      #kpi-card-total { grid-column: span 2; }
      #kpi-range-hint, #modal-btn-fullscreen { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .au-modal-window { animation: none !important; transition: none !important; }
      .au-bar-fill { transition: none; }
    }
  `;
  (document.head || document.documentElement).appendChild(styleEl);

  const capsuleRoot = document.createElement('div');
  capsuleRoot.id = 'agy-quota-capsule-root';
  capsuleRoot.innerHTML = `
    <button type="button" id="agy-pill-bar" class="agy-pill-bar" aria-haspopup="dialog" aria-expanded="false" title="打开额度和用量（Alt+Q）">
      <svg class="agy-pill-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 12V8m5 4V4m5 8V6" stroke-linecap="round"/></svg>
      <span class="agy-pill-item" id="agy-pill-gemini" hidden><span>Gemini</span><b>—</b></span>
      <span class="agy-pill-item" id="agy-pill-third" hidden><span>Claude / GPT</span><b>—</b></span>
      <span class="agy-pill-item" id="agy-pill-argon" hidden><span>Argon</span><b>—</b></span>
      <span class="agy-pill-item" id="agy-pill-status">额度</span>
    </button>
  `;

  // 4. 构建大模态 DOM 根节点 (对齐 DSH 六标签页)
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'agy-inpage-modal-overlay';
  modalOverlay.innerHTML = `
    <div class="au-modal-window" id="agy-modal-win" role="dialog" aria-modal="true" aria-labelledby="au-title" tabindex="-1">
      <!-- 头部 -->
      <div class="au-head">
        <div><div class="au-eyebrow">ANTIGRAVITY</div><h2 class="au-title" id="au-title">额度与用量</h2></div>
        <span id="ls-status-pill" class="au-status" role="status">连接中</span>
        <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
          <button id="modal-btn-fullscreen" class="au-btn" title="切换全屏/窗口">⛶ 展开</button>
          <button id="modal-btn-refresh" class="au-btn" title="强制刷新全部数据">↻ 刷新</button>
          <button id="modal-btn-close" class="au-btn" style="font-weight: 700" title="关闭窗口 (Esc)">✕</button>
        </div>
      </div>

      <!-- 顶栏时间范围与自定义日期 Filter (全局置顶) -->
      <div class="au-range-bar" id="au-top-range-bar">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="au-btn-group" id="kpi-range-group">
            <button class="au-btn on" data-days="1">今天</button>
            <button class="au-btn" data-days="7">7 天</button>
            <button class="au-btn" data-days="14">14 天</button>
            <button class="au-btn" data-days="30">近 30 天</button>
            <button class="au-btn" data-days="90">近 90 天</button>
            <button class="au-btn" data-days="0">全部</button>
          </div>
          <div class="au-date-wrap" id="custom-range-wrap">
            <span>开始:</span>
            <input type="date" id="range-start-date" class="au-date-input" title="开始日期" />
            <span>截止:</span>
            <input type="date" id="range-end-date" class="au-date-input" title="截止日期" />
            <button id="range-apply-btn" class="au-btn" style="padding: 2px 8px; font-size: 11px;">筛选</button>
            <button id="range-clear-btn" class="au-btn" style="padding: 2px 8px; font-size: 11px;" title="重置为预设范围">重置</button>
          </div>
        </div>
        <span id="kpi-range-hint">按本地日期统计</span>
      </div>

      <!-- 标签页导航 -->
      <div class="au-tabs" id="au-nav-tabs">
        <button class="au-tab on" data-tab="tab-quota">额度</button>
        <button class="au-tab" data-tab="tab-summary">用量</button>
        <button class="au-tab" data-tab="tab-trend">额度趋势</button>
        <button class="au-tab" data-tab="tab-heatmap">活动日历</button>
        <button class="au-tab" data-tab="tab-conv">会话</button>
      </div>

      <!-- 主体内容 -->
      <div class="au-body">
        <!-- 1. 额度 Tab -->
        <div id="tab-quota" class="au-tab-pane on">
          <div class="au-section-head">
            <div><h3>剩余额度与用量</h3><p>按模型组查看 5 小时和每周额度，以及所选天数内的本地消耗</p></div>
            <span id="acct-time" class="au-caption"></span>
          </div>

          <!-- 所选天数用量统计卡片 (带日期筛选) -->
          <div class="au-card au-period-card" id="quota-period-card">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <div>
                <div class="au-card-title" id="quota-period-title" style="font-size: 13px; font-weight: 700;">所选天数用量</div>
                <div class="au-card-desc" id="quota-period-desc" style="font-size: 11px;">根据开始与截止日期统计的本地 Token 消耗与调用</div>
              </div>
              <div class="au-date-wrap" id="quota-filter-wrap">
                <span>开始:</span>
                <input type="date" id="quota-start-date" class="au-date-input" title="开始日期" />
                <span>截止:</span>
                <input type="date" id="quota-end-date" class="au-date-input" title="截止日期" />
                <button id="quota-date-apply" class="au-btn" style="padding: 2px 8px; font-size: 11px;">筛选</button>
                <button id="quota-date-reset" class="au-btn" style="padding: 2px 8px; font-size: 11px;">重置</button>
              </div>
            </div>
            <div class="au-period-kpis">
              <div class="au-period-kpi">
                <span class="au-period-kpi-label">消耗总 Token</span>
                <b class="au-period-kpi-val" id="q-kpi-total">--</b>
                <span class="au-period-kpi-sub" id="q-kpi-total-sub">--</span>
              </div>
              <div class="au-period-kpi">
                <span class="au-period-kpi-label">缓存命中率</span>
                <b class="au-period-kpi-val" id="q-kpi-hit" style="color: var(--au-emerald)">--%</b>
                <span class="au-period-kpi-sub" id="q-kpi-hit-sub">缓存读取占比</span>
              </div>
              <div class="au-period-kpi">
                <span class="au-period-kpi-label">模型调用次数</span>
                <b class="au-period-kpi-val" id="q-kpi-calls">--</b>
                <span class="au-period-kpi-sub" id="q-kpi-calls-sub">-- 天有活动</span>
              </div>
              <div class="au-period-kpi">
                <span class="au-period-kpi-label">活跃会话数</span>
                <b class="au-period-kpi-val" id="q-kpi-convs">--</b>
                <span class="au-period-kpi-sub" id="q-kpi-convs-sub">共 -- 步</span>
              </div>
            </div>
          </div>
          <!-- 多账户切换与状态对比栏 -->
          <div id="quota-accounts-bar" class="au-acct-switcher" hidden></div>
          <div id="quota-offline-banner" class="au-acct-banner" hidden>
            <span id="quota-offline-text">正在查看离线账户快照</span>
            <div style="display: flex; gap: 6px;">
              <button id="quota-back-active-btn" class="au-btn" style="padding: 2px 8px; font-size: 11px;">切回当前登录账户</button>
              <button id="quota-remove-acct-btn" class="au-btn" style="padding: 2px 8px; font-size: 11px; color: var(--au-red);">移除记录</button>
            </div>
          </div>

          <div id="quota-groups-container" class="au-quota-groups"><p class="au-empty">正在读取额度…</p></div>
          <p class="au-caption au-quota-note">Token 参考按本地调用折算，包含缓存读取。同样的模型和缓存比例下更有参考价值。</p>
          <details class="au-account">
            <summary>账号与服务</summary>
            <div class="au-kv">
              <span class="au-k">账号</span><span class="au-v" id="acct-email">—</span>
              <span class="au-k">方案</span><span class="au-v" id="acct-name">—</span>
              <span class="au-k">Prompt Credits</span><span class="au-v" id="acct-credits">—</span>
              <span class="au-k">本地服务</span><span class="au-v" id="ls-port-badge">—</span>
            </div>
          </details>
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
            <select id="trend-account-select" class="au-date-input" title="按账户筛选趋势">
              <option value="">全部账户</option>
            </select>
            <span class="au-spacer"></span>
            <span style="font-size: 11px; color: var(--au-text-muted)" id="trend-summary-info">正在读取历史采样...</span>
          </div>
          <div class="au-card">
            <div class="au-card-title">剩余额度趋势</div>
            <div class="au-card-desc">每个点是一次额度采样。上升表示额度恢复，下降表示额度减少。</div>
            <div id="trend-chart-container" style="min-height: 230px; position: relative;">
              <!-- 动态 SVG 曲线渲染区 -->
            </div>
          </div>
          <div class="au-card" id="trend-buckets-card" style="display: none;">
            <div class="au-card-title">额度变化摘要</div>
            <div class="au-grid" id="trend-buckets-summary-grid"></div>
          </div>
        </div>

        <!-- 3. 热力图 Tab -->
        <div id="tab-heatmap" class="au-tab-pane">
          <div class="au-card">
            <div class="au-card-title">近 182 天活动</div>
            <div class="au-card-desc" id="heat-metric-desc">色深表示当日总 Token。悬停格子查看全部指标。</div>
            
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
            <div id="heat-day-detail" class="au-day-detail">正在读取本地用量…</div>
          </div>
        </div>

        <!-- 4. 汇总 Tab -->
        <div id="tab-summary" class="au-tab-pane">
          <div class="au-section-head"><div><h3>本地 Token 用量</h3><p>总量 = 未命中输入 + 缓存读取 + 输出。输出包含思考和回复。</p></div></div>
        <div class="au-kpis">
          <div class="au-kpi" id="kpi-card-total">
            <div class="au-kpi-label" id="kpi-tokens-label">总 Token</div>
            <div class="au-kpi-value" id="kpi-tokens" style="color: var(--au-text-main)">--</div>
            <div class="au-kpi-sub" id="kpi-tokens-sub">未命中 -- · 缓存 -- · 输出 --</div>
            <div class="au-stack" style="margin-top: 6px;">
              <i id="kpi-bar-in" style="background: #16a34a; width: 0%" title="未命中输入"></i>
              <i id="kpi-bar-cache" style="background: #3b82f6; width: 0%" title="缓存命中"></i>
              <i id="kpi-bar-out" style="background: #8b5cf6; width: 0%" title="输出"></i>
            </div>
          </div>

          <div class="au-kpi" id="kpi-card-hit">
            <div class="au-kpi-label">缓存命中率</div>
            <div class="au-kpi-value" id="kpi-hit" style="color: var(--au-emerald)">--%</div>
            <div class="au-kpi-sub" id="kpi-hit-sub">命中 -- / 未命中 --</div>
          </div>

          <div class="au-kpi" id="kpi-card-calls">
            <div class="au-kpi-label">模型调用次数</div>
            <div class="au-kpi-value" id="kpi-calls">--</div>
            <div class="au-kpi-sub" id="kpi-calls-sub">-- 天内 -- 天有活动</div>
          </div>

          <div class="au-kpi" id="kpi-card-out">
            <div class="au-kpi-label">输出 Token</div>
            <div class="au-kpi-value" id="kpi-out" style="color: var(--au-purple)">--</div>
            <div class="au-kpi-sub" id="kpi-out-sub">思考 -- · 回复 --</div>
          </div>

          <div class="au-kpi" id="kpi-card-sessions">
            <div class="au-kpi-label">活跃会话</div>
            <div class="au-kpi-value" id="kpi-convs">--</div>
            <div class="au-kpi-sub" id="kpi-convs-sub">共 -- 步</div>
          </div>
        </div>

          <div class="au-card">
            <div class="au-card-title">逐日用量</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th class="au-num">会话</th>
                  <th class="au-num">步数</th>
                  <th class="au-num">调用</th>
                  <th class="au-num">总 Token</th>
                  <th class="au-num">未命中输入</th>
                  <th class="au-num">输出</th>
                  <th class="au-num">缓存读取</th>
                  <th class="au-num">缓存命中率</th>
                </tr>
              </thead>
              <tbody id="summary-table-body">
                <tr><td colspan="9" style="text-align: center; padding: 20px; color: var(--au-text-muted)">正在扫描逐日用量...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. 会话 Tab -->
        <div id="tab-conv" class="au-tab-pane">
          <div class="au-toolbar">
            <input type="text" id="conv-search-input" class="au-input" placeholder="搜索会话、模型或工作区">
            <span id="conv-ws-badge" class="au-btn on" style="display: none; font-size: 11px; cursor: pointer;"></span>
            <span class="au-spacer"></span>
            <span style="font-size: 11px; color: var(--au-text-muted)" id="conv-count-info">共 -- 个会话</span>
          </div>

          <div class="au-card">
            <div class="au-card-title">工作区</div>
            <div id="conv-workspaces-pills" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;"></div>
          </div>

          <div class="au-card">
            <div class="au-card-title">模型用量</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>模型</th>
                  <th class="au-num">调用次数</th>
                  <th class="au-num">未命中输入</th>
                  <th class="au-num">输出</th>
                  <th class="au-num">缓存读取</th>
                  <th class="au-num">命中率</th>
                </tr>
              </thead>
              <tbody id="conv-models-tbody"></tbody>
            </table>
          </div>

          <div class="au-card">
            <div class="au-card-title">会话明细</div>
            <table class="au-table">
              <thead>
                <tr>
                  <th>会话标题 / 摘要</th>
                  <th>工作区</th>
                  <th>使用模型</th>
                  <th class="au-num">步数</th>
                  <th class="au-num">调用</th>
                  <th class="au-num">未命中输入</th>
                  <th class="au-num">输出</th>
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
  let RAW_ESTIMATES = {};
  let RAW_ACCOUNTS = [];
  let ACTIVE_ACCOUNT_EMAIL = '';
  let VIEW_ACCOUNT_EMAIL = '';
  let estimatesLoading = true;
  let RAW_CONVERSATIONS = [];
  let RAW_DAILY = [];
  let RAW_TOTALS = null;

  let SELECTED_DAYS = 1;  // 默认对齐 DSH 选中「今天」
  let CUSTOM_START_DATE = '';
  let CUSTOM_END_DATE = '';
  let SELECTED_WS_FILTER = '';
  let SEARCH_QUERY = '';
  let SELECTED_TREND_RANGE = '24h';
  let TREND_ACCOUNT_EMAIL = '';

  // 6. 辅助计算工具 (完全对齐 DSH 官方规范)
  const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const fmtNum = (v) => {
    const n = num(v);
    if (n >= 1e8) return (n / 1e8).toLocaleString('zh-CN', { maximumFractionDigits: 2 }) + ' 亿';
    if (n >= 1e4) return (n / 1e4).toLocaleString('zh-CN', { maximumFractionDigits: 2 }) + ' 万';
    return n.toLocaleString('zh-CN');
  };
  const fmtFull = (v) => num(v).toLocaleString('en-US');
  const pct = (v, digits = 1) => (num(v) * 100).toFixed(digits) + '%';
  const shortWs = (ws) => {
    if (!ws) return '全局';
    const s = String(ws).replace(/\\/g, '/');
    const parts = s.split('/').filter(Boolean);
    return parts.slice(-2).join('/') || s;
  };

  const dayKeyOf = (d) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };

  const fmtCountdown = (ms) => {
    if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—';
    if (ms <= 0) return '已到期';
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return d + '天' + h + '小时';
    if (h > 0) return h + '小时' + m + '分';
    if (m > 0) return m + '分' + (s % 60) + '秒';
    return (s % 60) + '秒';
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

  const quotaFraction = (bucket) => {
    const value = bucket.remainingFraction;
    return typeof value === 'number' && value >= 0 && value <= 1 ? value : null;
  };
  const tokenTotal = (tokens) => num(tokens?.input) + num(tokens?.cacheRead) + num(tokens?.output);
  const cacheHit = (tokens) => {
    const input = num(tokens?.input) + num(tokens?.cacheRead);
    return input > 0 ? pct(num(tokens.cacheRead) / input) : '—';
  };
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  function quotaWindow(bucket) {
    if (bucket.window === '5h') return '5 小时';
    if (bucket.window === 'weekly') return '每周';
    return bucket.displayName || bucket.bucketId || '额度';
  }

  function quotaGroupName(group) {
    if (/argon/i.test(group.displayName) || (group.buckets || []).some(b => /argon/i.test(b.bucketId))) {
      return 'Gemini 4 Argon';
    }
    if (/gemini/i.test(group.displayName)) return 'Gemini';
    if (/claude|gpt/i.test(group.displayName)) return 'Claude / GPT';
    return group.displayName || '其他模型';
  }

  function resetLabel(bucket) {
    const fraction = quotaFraction(bucket);
    if (fraction === 1) return '额度充足';
    const at = Date.parse(bucket.resetTime);
    if (!Number.isFinite(at)) return '暂无刷新时间';
    const left = at - Date.now();
    return left > 0 ? `${fmtCountdown(left)}后刷新 · ${fmtTime(at)}` : '等待额度更新';
  }

  let quotaLoading = true;
  let quotaFailed = false;
  let usageLoaded = false;
  let usageFailed = false;

  function isBucketResetExpired(bucket) {
    const at = Date.parse(bucket?.resetTime);
    return Number.isFinite(at) && Date.now() >= at;
  }

  function estimateMarkup(bucket, estimatesMap = RAW_ESTIMATES) {
    const estimate = (estimatesMap || {})[bucket.bucketId];
    if (!estimate) {
      return `<div class="au-estimate au-estimate-empty">${estimatesLoading ? '正在计算 Token 参考…' : 'Token 参考 · 样本不足'}</div>`;
    }
    const title = estimate.source === 'recent'
      ? `最近有效样本 · ${fmtTime(estimate.at)}`
      : `本周期本地样本 · ${fmtFull(estimate.calls)} 次调用 · ${fmtTime(estimate.at)}`;
    return `
      <div class="au-estimate" title="${title}">
        <div><span>估算总量 · Token</span><b title="${fmtFull(estimate.capacity)} Token">≈ ${fmtNum(estimate.capacity)}</b></div>
        <div><span>估算剩余 · Token</span><b title="${fmtFull(estimate.remaining)} Token">≈ ${fmtNum(estimate.remaining)}</b></div>
        ${estimate.source === 'recent' ? '<small>近期样本</small>' : ''}
      </div>`;
  }

  function rangeCutoff(days) {
    if (days === 0) return '';
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1));
    return dayKeyOf(d);
  }

  function getDateRangeFilter() {
    if (CUSTOM_START_DATE || CUSTOM_END_DATE) {
      let start = CUSTOM_START_DATE || '';
      let end = CUSTOM_END_DATE || '';
      if (start && end && start > end) {
        [start, end] = [end, start];
      }
      return { start, end, isCustom: true };
    }
    if (SELECTED_DAYS > 0) {
      return {
        start: rangeCutoff(SELECTED_DAYS),
        end: dayKeyOf(new Date()),
        isCustom: false
      };
    }
    return { start: '', end: '', isCustom: false };
  }

  function isDateInRange(dateStr, range) {
    if (!dateStr) return false;
    if (range.start && dateStr < range.start) return false;
    if (range.end && dateStr > range.end) return false;
    return true;
  }

  function getRangeHintText(range) {
    if (range.isCustom) {
      if (range.start && range.end) return `${range.start} 至 ${range.end}`;
      if (range.start) return `自 ${range.start} 起`;
      if (range.end) return `截至 ${range.end}`;
    }
    if (SELECTED_DAYS === 1) return `今天 (${dayKeyOf(new Date())})`;
    if (SELECTED_DAYS > 0) return `近 ${SELECTED_DAYS} 天 (${range.start} 至 ${range.end})`;
    return '全部历史数据';
  }

  function syncDateInputs() {
    const range = getDateRangeFilter();
    const startVal = range.start || '';
    const endVal = range.end || '';
    for (const id of ['range-start-date', 'quota-start-date']) {
      const el = modalOverlay.querySelector('#' + id);
      if (el && el.value !== startVal) el.value = startVal;
    }
    for (const id of ['range-end-date', 'quota-end-date']) {
      const el = modalOverlay.querySelector('#' + id);
      if (el && el.value !== endVal) el.value = endVal;
    }
    const hint = getRangeHintText(range);
    const hintEl = modalOverlay.querySelector('#kpi-range-hint');
    if (hintEl) hintEl.textContent = hint;
  }

  function getPeriodSummary(range) {
    const hasFilter = Boolean(range.start || range.end);
    const filtered = hasFilter ? RAW_DAILY.filter(d => isDateInRange(d.date, range)) : RAW_DAILY;
    const totals = !hasFilter ? RAW_TOTALS : null;
    const tokens = { input: 0, output: 0, cacheRead: 0, thinking: 0, response: 0 };
    let steps = 0, calls = 0, activeDays = 0;
    for (const d of filtered) {
      steps += num(d.steps);
      calls += num(d.genCalls);
      if (d.sessions > 0 || d.genCalls > 0) activeDays += 1;
      for (const key of Object.keys(tokens)) tokens[key] += num(d.tokens?.[key]);
    }
    const t = totals?.tokens || tokens;
    const total = tokenTotal(t);
    const rangeConvs = getRangeFilteredConversations();
    const sessions = totals?.sessions ?? rangeConvs.length;

    let geminiTokens = 0, geminiCalls = 0;
    let argonTokens = 0, argonCalls = 0;
    let thirdTokens = 0, thirdCalls = 0;
    for (const c of rangeConvs) {
      for (const [model, count] of Object.entries(c.modelCounts || {})) {
        const mt = c.modelTokens?.[model] || {};
        const mTotal = tokenTotal(mt);
        if (/argon/i.test(model)) {
          argonTokens += mTotal;
          argonCalls += count;
        } else if (/gemini/i.test(model)) {
          geminiTokens += mTotal;
          geminiCalls += count;
        } else if (/claude|gpt/i.test(model)) {
          thirdTokens += mTotal;
          thirdCalls += count;
        }
      }
    }

    return {
      tokens: t,
      total,
      hit: cacheHit(t),
      calls: totals?.genCalls ?? calls,
      steps: totals?.steps ?? steps,
      activeDays,
      sessions,
      geminiTokens,
      geminiCalls,
      argonTokens,
      argonCalls,
      thirdTokens,
      thirdCalls
    };
  }

  function getEffectiveAccounts() {
    const activeEmail = ACTIVE_ACCOUNT_EMAIL || RAW_QUOTA?.account?.email || '';
    const list = Array.isArray(RAW_ACCOUNTS) ? [...RAW_ACCOUNTS] : [];
    if (activeEmail && !list.some(a => a.email === activeEmail)) {
      list.unshift({
        email: activeEmail,
        name: RAW_QUOTA?.account?.name || '',
        tier: RAW_QUOTA?.account?.tier || '',
        planName: RAW_QUOTA?.account?.planName || '',
        credits: RAW_QUOTA?.credits || null,
        groups: RAW_QUOTA?.groups || [],
        estimates: RAW_ESTIMATES || {},
        lastSeenAt: RAW_QUOTA?.timestamp || Date.now(),
        port: RAW_QUOTA?.port || null,
        isActive: true
      });
    }
    return list.map(a => ({ ...a, isActive: Boolean(activeEmail && a.email === activeEmail) }));
  }

  function accountStatusBadge(acct) {
    if (acct.isActive) return '<span class="au-acct-badge">当前在线</span>';
    const buckets = (acct.groups || []).flatMap(g => g.buckets || []);
    const fractions = buckets.map(b => quotaFraction(b)).filter(v => v !== null);
    const allReset = buckets.length > 0 && buckets.every(b => quotaFraction(b) === 1 || isBucketResetExpired(b));
    if (allReset) return '<span class="au-acct-badge reset">预计已重置</span>';
    if (fractions.length > 0) {
      const minV = Math.min(...fractions);
      return `<span class="au-acct-badge">上次 ${pct(minV, 0)}</span>`;
    }
    return '<span class="au-acct-badge">离线缓存</span>';
  }

  function renderQuotaTab() {
    const q = RAW_QUOTA;
    const accounts = getEffectiveAccounts();
    const activeEmail = ACTIVE_ACCOUNT_EMAIL || q?.account?.email || '';
    let selectedEmail = VIEW_ACCOUNT_EMAIL;
    if (!selectedEmail || !accounts.some(a => a.email === selectedEmail)) {
      selectedEmail = activeEmail || accounts[0]?.email || '';
    }
    const viewedAccount = accounts.find(a => a.email === selectedEmail) || null;
    const isViewingActive = Boolean(
      (activeEmail && selectedEmail === activeEmail) ||
      (viewedAccount?.isActive) ||
      (!selectedEmail && activeEmail) ||
      (!activeEmail && !viewedAccount)
    );

    const acctBar = modalOverlay.querySelector('#quota-accounts-bar');
    if (acctBar) {
      acctBar.hidden = accounts.length === 0;
      acctBar.innerHTML = accounts.map(acct => `
        <button type="button" class="au-acct-pill${acct.email === selectedEmail ? ' on' : ''}" data-email="${escapeHTML(acct.email)}" title="${acct.isActive ? '当前客户端登录账号' : '点击查看该账号离线额度快照'}">
          <span class="au-acct-dot${acct.isActive ? ' online' : ''}"></span>
          <span>${escapeHTML(acct.email)}</span>
          ${accountStatusBadge(acct)}
        </button>
      `).join('');
      acctBar.querySelectorAll('.au-acct-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          VIEW_ACCOUNT_EMAIL = btn.getAttribute('data-email') || '';
          renderQuotaTab();
        });
      });
    }

    const offlineBanner = modalOverlay.querySelector('#quota-offline-banner');
    if (offlineBanner) {
      const showOffline = Boolean(viewedAccount && !isViewingActive);
      offlineBanner.hidden = !showOffline;
      if (showOffline) {
        const textEl = modalOverlay.querySelector('#quota-offline-text');
        if (textEl) {
          textEl.textContent = `正在查看 ${viewedAccount.email} 的离线快照（最后同步于 ${fmtTime(viewedAccount.lastSeenAt)}）· 如需在客户端登录此账号，请点左下角头像 → Account → Sign Out`;
        }
        const removeBtn = modalOverlay.querySelector('#quota-remove-acct-btn');
        if (removeBtn) removeBtn.dataset.email = viewedAccount.email;
      }
    }

    const activeGroups = (q?.groups || []).filter(group => group.buckets?.length);
    const groups = isViewingActive
      ? activeGroups
      : ((viewedAccount?.groups || []).filter(group => group.buckets?.length));
    const estimatesMap = isViewingActive ? RAW_ESTIMATES : (viewedAccount?.estimates || {});

    const cached = quotaFailed || (q && Date.now() - q.timestamp > 30_000);
    const status = modalOverlay.querySelector('#ls-status-pill');
    status.textContent = isViewingActive
      ? (activeGroups.length ? (cached ? '缓存数据' : '已连接') : (quotaLoading ? '连接中' : '额度不可用'))
      : '离线快照';
    status.dataset.state = isViewingActive
      ? (activeGroups.length && !cached ? 'online' : 'idle')
      : 'idle';

    const displayTime = isViewingActive ? q?.timestamp : viewedAccount?.lastSeenAt;
    const displayPort = isViewingActive ? q?.port : viewedAccount?.port;
    const displayEmail = isViewingActive ? (q?.account?.email || viewedAccount?.email) : viewedAccount?.email;
    const displayPlan = isViewingActive ? (q?.account?.planName || q?.account?.tier) : (viewedAccount?.planName || viewedAccount?.tier);
    const credits = isViewingActive ? q?.credits : viewedAccount?.credits;

    modalOverlay.querySelector('#acct-time').textContent = displayTime
      ? `${isViewingActive ? '更新于' : '快照于'} ${fmtTime(displayTime)}`
      : '';
    modalOverlay.querySelector('#ls-port-badge').textContent = displayPort ? `127.0.0.1:${displayPort}` : '—';
    modalOverlay.querySelector('#acct-email').textContent = displayEmail || '—';
    modalOverlay.querySelector('#acct-name').textContent = displayPlan || '—';
    modalOverlay.querySelector('#acct-credits').textContent = credits?.promptAvailable == null ? '—' :
      `${credits.promptAvailable}${credits.promptMonthly == null ? '' : ' / ' + credits.promptMonthly}`;

    const range = getDateRangeFilter();
    const period = getPeriodSummary(range);
    const hint = getRangeHintText(range);
    const set = (id, text) => {
      const el = modalOverlay.querySelector('#' + id);
      if (el) el.textContent = text;
    };
    set('quota-period-title', `所选天数用量 (${hint})`);
    set('q-kpi-total', fmtNum(period.total));
    const qTotalEl = modalOverlay.querySelector('#q-kpi-total');
    if (qTotalEl) qTotalEl.title = fmtFull(period.total) + ' Token';
    set('q-kpi-total-sub', `未命中 ${fmtNum(period.tokens.input)} · 缓存 ${fmtNum(period.tokens.cacheRead)} · 输出 ${fmtNum(period.tokens.output)}`);
    set('q-kpi-hit', period.hit);
    set('q-kpi-calls', fmtNum(period.calls));
    set('q-kpi-calls-sub', `${period.activeDays} 天有活动`);
    set('q-kpi-convs', fmtFull(period.sessions));
    set('q-kpi-convs-sub', `共 ${fmtFull(period.steps)} 步`);
    syncDateInputs();

    const grid = modalOverlay.querySelector('#quota-groups-container');
    if (!groups.length) {
      grid.innerHTML = `<p class="au-empty">${quotaLoading ? '正在读取额度…' : '暂时无法读取额度。打开反重力并登录后，点「刷新」重试。'}</p>`;
      return;
    }
    grid.innerHTML = groups.map((group, index) => {
      const windows = [...group.buckets].sort((a, b) => Number(b.window === '5h') - Number(a.window === '5h'));
      const groupName = quotaGroupName(group);
      const title = escapeHTML(groupName);
      const isArgon = /argon/i.test(groupName);
      const isGemini = !isArgon && /gemini/i.test(groupName);
      const isThird = /claude|gpt/i.test(groupName);
      const gTokens = isArgon ? period.argonTokens : isGemini ? period.geminiTokens : isThird ? period.thirdTokens : 0;
      const gCalls = isArgon ? period.argonCalls : isGemini ? period.geminiCalls : isThird ? period.thirdCalls : 0;
      const groupBadgeIndex = isArgon ? 2 : isThird ? 1 : 0;
      const groupBadgeIcon = isArgon ? '⚡' : isThird ? '◈' : '✦';
      return `
        <section class="au-quota-group">
          <h4><span class="au-group-icon" data-group="${groupBadgeIndex}" aria-hidden="true">${groupBadgeIcon}</span>${title}</h4>
          <div class="au-group-period-usage">
            <span>所选天数消耗: <b style="color:var(--au-text-main)">${fmtNum(gTokens)}</b> Token</span>
            <span>${fmtFull(gCalls)} 次调用</span>
          </div>
          ${windows.map(bucket => {
            const rawV = quotaFraction(bucket);
            const expiredOffline = !isViewingActive && rawV !== null && rawV < 1 && isBucketResetExpired(bucket);
            const displayV = expiredOffline ? 1 : rawV;
            const label = escapeHTML(quotaWindow(bucket));
            const color = displayV === null ? 'var(--au-text-muted)' : remainingColor(displayV);
            const leftStatus = displayV === null
              ? '暂无比例'
              : (expiredOffline ? `预计已重置 (上次 ${pct(rawV)})` : (isViewingActive ? '剩余' : '上次剩余'));
            const rightStatus = expiredOffline ? `已过 ${fmtTime(Date.parse(bucket.resetTime))}` : resetLabel(bucket);
            return `
              <div class="au-quota-window">
                <div class="au-bucket-head">
                  <span class="au-bucket-label">${label}</span>
                  <span class="au-bucket-pct" style="color:${color}">${displayV === null ? '—' : pct(displayV)}</span>
                </div>
                <div class="au-bar" ${displayV === null ? 'aria-hidden="true"' : `role="meter" aria-label="${title} ${label}剩余" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${displayV * 100}"`}>
                  <div class="au-bar-fill" style="width:${(displayV ?? 0) * 100}%;background:${color}"></div>
                </div>
                <div class="au-quota-meta"><span>${leftStatus}</span><span>${rightStatus}</span></div>
                ${estimateMarkup(bucket, estimatesMap)}
              </div>`;
          }).join('')}
        </section>`;
    }).join('');
  }

  function updateCapsuleDisplay() {
    const groups = RAW_QUOTA?.groups || [];
    const descriptions = [];
    for (const [id, name, shortLabel] of [
      ['gemini', 'Gemini', 'Gemini'],
      ['third', 'Claude / GPT', '3P'],
      ['argon', 'Gemini 4 Argon', 'Argon']
    ]) {
      const item = capsuleRoot.querySelector('#agy-pill-' + id);
      if (!item) continue;
      const buckets = groups.filter(g => quotaGroupName(g) === name).flatMap(g => g.buckets || []);
      const bucket = buckets.filter(b => quotaFraction(b) !== null)
        .sort((a, b) => quotaFraction(a) - quotaFraction(b))[0];
      item.hidden = !bucket;
      if (bucket) {
        const value = quotaFraction(bucket);
        const count = item.querySelector('b');
        const windowLabel = bucket.window === '5h' ? '5h' : bucket.window === 'weekly' ? '周' : '';
        item.firstElementChild.textContent = windowLabel ? `${shortLabel} ${windowLabel}` : shortLabel;
        count.textContent = pct(value, value > 0 && value < 0.01 ? 1 : 0);
        count.style.color = remainingColor(value);
        descriptions.push(`${name} · ${quotaWindow(bucket)}剩余 ${pct(value)}`);
      }
    }
    const stale = quotaFailed || (RAW_QUOTA && Date.now() - RAW_QUOTA.timestamp > 30_000);
    const status = capsuleRoot.querySelector('#agy-pill-status');
    status.hidden = descriptions.length > 0 && !stale;
    status.textContent = stale ? (descriptions.length ? '缓存' : '离线') : '额度';
    const acctEmail = RAW_QUOTA?.account?.email ? `账号: ${RAW_QUOTA.account.email}\n` : '';
    const label = descriptions.length ? descriptions.join('\n') : '打开额度与用量';
    pillBar.title = `${acctEmail}${label}${stale ? '\n额度暂未更新' : ''}\nAlt+Q`;
    pillBar.setAttribute('aria-label', pillBar.title);
  }

  // 7. 渲染函数集合 — KPI 口径完全对齐 DSH (antigravity-usage) 的 sumByDay

  function updateKPIs() {
    if (!usageLoaded) return;
    const range = getDateRangeFilter();
    const hasFilter = Boolean(range.start || range.end);
    const filtered = hasFilter ? RAW_DAILY.filter(d => isDateInRange(d.date, range)) : RAW_DAILY;
    const totals = !hasFilter ? RAW_TOTALS : null;
    const tokens = { input: 0, output: 0, cacheRead: 0, thinking: 0, response: 0 };
    let steps = 0, calls = 0, activeDays = 0;
    for (const d of filtered) {
      steps += num(d.steps);
      calls += num(d.genCalls);
      if (d.sessions > 0 || d.genCalls > 0) activeDays += 1;
      for (const key of Object.keys(tokens)) tokens[key] += num(d.tokens?.[key]);
    }
    const t = totals?.tokens || tokens;
    const total = tokenTotal(t);
    const sessions = totals?.sessions ?? getRangeFilteredConversations().length;
    const limited = Boolean(hasFilter && RAW_TOTALS?.sessions > RAW_CONVERSATIONS.length);
    const set = (id, text) => { modalOverlay.querySelector('#' + id).textContent = text; };
    set('kpi-tokens', fmtNum(total));
    modalOverlay.querySelector('#kpi-tokens').title = fmtFull(total) + ' Token';
    set('kpi-tokens-sub', `未命中输入 ${fmtNum(t.input)} · 缓存读取 ${fmtNum(t.cacheRead)} · 输出 ${fmtNum(t.output)}`);
    for (const [id, value] of [['in', t.input], ['cache', t.cacheRead], ['out', t.output]]) {
      modalOverlay.querySelector('#kpi-bar-' + id).style.width = pct(num(value) / Math.max(1, total));
    }
    set('kpi-hit', cacheHit(t));
    set('kpi-hit-sub', '缓存读取占全部输入的比例');
    set('kpi-calls', fmtNum(totals?.genCalls ?? calls));
    set('kpi-calls-sub', `${activeDays} 天有活动`);
    set('kpi-out', fmtNum(t.output));
    const other = Math.max(0, num(t.output) - num(t.thinking) - num(t.response));
    set('kpi-out-sub', `思考 ${fmtNum(t.thinking)} · 回复 ${fmtNum(t.response)}${other > 0 ? ' · 其他 ' + fmtNum(other) : ''}`);
    set('kpi-convs', `${limited ? '≥ ' : ''}${fmtFull(sessions)}`);
    set('kpi-convs-sub', `共 ${fmtFull(totals?.steps ?? steps)} 步`);
    syncDateInputs();
  }

  // 趋势时序折线图渲染器 (TabTrend)
  const SERIES_COLOR_MAP = {
    'gemini-weekly': '#3b82f6',
    'gemini-5h': '#8b5cf6',
    '3p-weekly': '#f59e0b',
    '3p-5h': '#10b981',
    'gemini-argon-wtu-weekly': '#06b6d4',
    'default': '#94a3b8'
  };

  const SERIES_LABEL_MAP = {
    'gemini-weekly': 'Gemini 周期配额 (周)',
    'gemini-5h': 'Gemini 速率限制 (5h)',
    '3p-weekly': '第三方模型配额 (周)',
    '3p-5h': '第三方速率限制 (5h)',
    'gemini-argon-wtu-weekly': 'Gemini 4 Argon 独立配额 (周)'
  };

  function syncTrendAccountOptions(historyAccounts = []) {
    const sel = modalOverlay.querySelector('#trend-account-select');
    if (!sel) return;
    const emails = new Set();
    for (const a of getEffectiveAccounts()) if (a.email) emails.add(a.email);
    for (const email of (historyAccounts || [])) if (email) emails.add(email);
    const currentVal = TREND_ACCOUNT_EMAIL;
    const opts = ['<option value="">全部账户</option>'];
    for (const email of emails) {
      const label = email === (ACTIVE_ACCOUNT_EMAIL || RAW_QUOTA?.account?.email) ? `${email} (当前)` : email;
      opts.push(`<option value="${escapeHTML(email)}">${escapeHTML(label)}</option>`);
    }
    sel.innerHTML = opts.join('');
    sel.value = emails.has(currentVal) ? currentVal : '';
  }

  async function fetchTrendData(range) {
    if (range) SELECTED_TREND_RANGE = range;
    const requestedRange = SELECTED_TREND_RANGE;
    const requestedAcct = TREND_ACCOUNT_EMAIL;
    const summaryInfo = modalOverlay.querySelector('#trend-summary-info');
    if (summaryInfo) summaryInfo.textContent = '正在获取历史采样点...';

    try {
      const qs = new URLSearchParams({ range: requestedRange });
      if (requestedAcct) qs.set('account', requestedAcct);
      const res = await fetch(`http://127.0.0.1:19388/api/history?${qs.toString()}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      syncTrendAccountOptions(data.accounts);
      if (requestedRange === SELECTED_TREND_RANGE && requestedAcct === TREND_ACCOUNT_EMAIL) renderTrendTab(data);
    } catch (e) {
      if (requestedRange !== SELECTED_TREND_RANGE || requestedAcct !== TREND_ACCOUNT_EMAIL) return;
      const container = modalOverlay.querySelector('#trend-chart-container');
      if (container) {
        container.innerHTML = '<p class="au-empty">暂时无法读取额度历史。</p>';
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
          <div style="margin-top: 8px; font-size: 11px; opacity: 0.7">额度成功更新后会保存采样。</div>
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
      label: escapeHTML(SERIES_LABEL_MAP[k] || k),
      color: SERIES_COLOR_MAP[k] || fallbackPalette[i % fallbackPalette.length],
      values: points.map(p => quotaFraction({ remainingFraction: p.values?.[k] }))
    }));

    // SVG 绘图尺寸
    const W = 900;
    const H = 220;
    const P = { l: 45, r: 25, t: 16, b: 28 };
    const iw = W - P.l - P.r;
    const ih = H - P.t - P.b;

    const first = points[0].t;
    const duration = Math.max(1, points[n - 1].t - first);
    const x = (i) => P.l + ((points[i].t - first) / duration) * iw;
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
      const d = s.values.map((v, i) => v === null ? '' :
        `${i === 0 || s.values[i - 1] === null ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
      const lastVal = s.values[n - 1];
      const lastX = x(n - 1);
      const lastY = y(lastVal);

      pathsSvg += `
        <path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" />
        ${lastVal === null ? '' : `<circle cx="${lastX}" cy="${lastY}" r="3.5" fill="${s.color}" stroke="var(--au-bg)" stroke-width="1.5" />`}
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
              <span style="color: ${s.color}; font-weight: 700; font-variant-numeric: tabular-nums">${latest === null ? '—' : pct(latest)}</span>
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
        const name = escapeHTML(SERIES_LABEL_MAP[b.id] || b.id);
        const color = SERIES_COLOR_MAP[b.id] || 'var(--au-brand)';
        return `
          <div class="au-bucket">
            <div class="au-bucket-head">
              <span class="au-bucket-label" style="font-weight:600">${name}</span>
              <span class="au-bucket-pct" style="color: ${color}; font-size:16px">${(num(b.consumed24h) * 100).toFixed(1)} <span style="font-size:10px; font-weight:normal; opacity:0.7">百分点 / 24h 下降</span></span>
            </div>
            <div class="au-kv" style="margin-top:6px;">
              <span class="au-k">今日累计下降</span>
              <span class="au-v">${(num(b.consumedToday) * 100).toFixed(1)} 个百分点</span>
              <span class="au-k">近 7 天累计下降</span>
              <span class="au-v">${(num(b.consumed7d) * 100).toFixed(1)} 个百分点</span>
              <span class="au-k">观察到的明显回升</span>
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
    const months = modalOverlay.querySelector('#au-heat-months');
    const detail = modalOverlay.querySelector('#heat-day-detail');
    grid.replaceChildren();
    months.replaceChildren();
    if (!usageLoaded) {
      detail.textContent = usageFailed ? '无法读取本地用量' : '正在读取本地用量…';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const first = new Date(today);
    first.setDate(first.getDate() - 181);
    const start = new Date(first);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    const records = new Map(RAW_DAILY.map(day => [day.date, day]));
    const max = Math.max(1, ...RAW_DAILY.filter(d => d.date >= dayKeyOf(first)).map(d => tokenTotal(d.tokens)));
    const colors = [0.28, 0.52, 0.76, 1];
    let lastMonth = -1;
    let lastLabelColumn = -3;
    let lastLabel = '';
    for (let day = new Date(start), i = 0; day <= today; day.setDate(day.getDate() + 1), i++) {
      const cell = document.createElement(day < first ? 'span' : 'button');
      cell.className = 'au-cell';
      if (day < first) {
        cell.style.visibility = 'hidden';
        grid.appendChild(cell);
        continue;
      }

      const column = Math.floor(i / 7);
      if (lastMonth !== day.getMonth() && column - lastLabelColumn >= 2) {
        const month = document.createElement('span');
        month.textContent = `${day.getMonth() + 1}月`;
        month.style.left = column * 14 + 'px';
        months.appendChild(month);
        lastMonth = day.getMonth();
        lastLabelColumn = column;
      }

      const key = dayKeyOf(day);
      const record = records.get(key);
      const total = tokenTotal(record?.tokens);
      const label = `${key} · ${fmtFull(record?.sessions)} 个会话 · ${fmtFull(record?.steps)} 步 · 总 Token ${fmtFull(total)} · 缓存读取 ${fmtFull(record?.tokens?.cacheRead)}`;
      cell.type = 'button';
      cell.setAttribute('aria-label', label);
      cell.title = label.replaceAll(' · ', '\n');
      if (total > 0) {
        const level = Math.min(3, Math.floor(total / max * 4));
        cell.style.background = `color-mix(in srgb, var(--au-emerald) ${colors[level] * 100}%, transparent)`;
      }
      const show = () => { detail.textContent = label; };
      cell.addEventListener('mouseenter', show);
      cell.addEventListener('focus', show);
      cell.addEventListener('click', show);
      cell.tabIndex = day.getTime() === today.getTime() ? 0 : -1;
      if (cell.tabIndex === 0) {
        cell.classList.add('today');
        lastLabel = label;
      }
      grid.appendChild(cell);
    }
    grid.onkeydown = e => {
      const offset = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[e.key];
      if (!offset) return;
      const cells = Array.from(grid.querySelectorAll('button'));
      const next = cells[cells.indexOf(e.target) + offset];
      if (!next) return;
      e.preventDefault();
      e.target.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
    };
    detail.textContent = lastLabel;
  }

  // 逐日汇总表格渲染器 (TabSummary - 响应 SELECTED_DAYS / 自定义日期 过滤)
  function renderSummaryTab() {
    const tbody = modalOverlay.querySelector('#summary-table-body');
    if (!tbody) return;
    if (!usageLoaded) {
      tbody.innerHTML = '<tr><td colspan="9" class="au-empty">' + (usageFailed ? '无法读取本地用量' : '正在读取本地用量…') + '</td></tr>';
      return;
    }
    if (RAW_DAILY.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--au-text-muted)">暂无日历记录</td></tr>';
      return;
    }

    const range = getDateRangeFilter();
    const hasFilter = Boolean(range.start || range.end);
    let filteredDaily = hasFilter ? RAW_DAILY.filter(d => isDateInRange(d.date, range)) : RAW_DAILY;

    if (filteredDaily.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--au-text-muted)">当前时间范围内无日历记录</td></tr>';
      return;
    }

    tbody.innerHTML = filteredDaily.slice().reverse().map(d => {
      const t = d.tokens || {};
      const hit = cacheHit(t);
      return `
        <tr>
          <td><b>${d.date}</b></td>
          <td class="au-num">${d.sessions || 0}</td>
          <td class="au-num">${d.steps || 0}</td>
          <td class="au-num">${d.genCalls || 0}</td>
          <td class="au-num" title="${fmtFull(tokenTotal(t))}"><b>${fmtNum(tokenTotal(t))}</b></td>
          <td class="au-num" title="${fmtFull(t.input)}">${fmtNum(t.input)}</td>
          <td class="au-num" style="color:var(--au-purple)" title="${fmtFull(t.output)}">${fmtNum(t.output)}</td>
          <td class="au-num" style="color:var(--au-brand)" title="${fmtFull(t.cacheRead)}">${fmtNum(t.cacheRead)}</td>
          <td class="au-num" style="color:var(--au-emerald); font-weight:700">${hit}</td>
        </tr>
      `;
    }).join('');
  }

  function getRangeFilteredConversations() {
    const range = getDateRangeFilter();
    const hasFilter = Boolean(range.start || range.end);
    if (!hasFilter) return RAW_CONVERSATIONS;
    return RAW_CONVERSATIONS.flatMap(c => {
      const days = Object.entries(c.dailyTokens || {});
      const selected = days.filter(([day]) => isDateInRange(day, range));
      if (!selected.length) return [];

      const tokens = { input: 0, output: 0, cacheRead: 0, thinking: 0, response: 0 };
      const modelCounts = {};
      const modelTokens = {};
      let steps = 0;
      let genCalls = 0;
      for (const [day, t] of selected) {
        for (const key of Object.keys(tokens)) tokens[key] += num(t[key]);
        steps += num(t.steps);
        genCalls += num(t.genCalls);
        for (const [model, mt] of Object.entries(c.dailyModelTokens?.[day] || {})) {
          modelCounts[model] = (modelCounts[model] || 0) + num(mt.genCalls);
          modelTokens[model] ||= { input: 0, output: 0, cacheRead: 0, thinking: 0, response: 0 };
          for (const key of Object.keys(tokens)) modelTokens[model][key] += num(mt[key]);
        }
      }
      return [{ ...c, tokens, steps, genCalls, models: Object.keys(modelCounts), modelCounts, modelTokens }];
    });
  }

  // 会话 Tab 与模型列表渲染器 (TabConversations - 全局响应 SELECTED_DAYS)
  function renderConversationsTab() {
    const rangeConvs = getRangeFilteredConversations();

    // 1. 动态按时间范围重新汇总各模型用量
    const modelStatsMap = new Map();
    for (const c of rangeConvs) {
      const counts = c.modelCounts || {};
      const mt = c.modelTokens || {};
      for (const m of Object.keys(counts)) {
        let x = modelStatsMap.get(m);
        if (!x) {
          x = { model: m, genCalls: 0, tokens: { input: 0, output: 0, cacheRead: 0, thinking: 0, response: 0 } };
          modelStatsMap.set(m, x);
        }
        x.genCalls += counts[m] || 0;
        const t = mt[m];
        if (t) {
          x.tokens.input += num(t.input);
          x.tokens.output += num(t.output);
          x.tokens.cacheRead += num(t.cacheRead);
          x.tokens.thinking += num(t.thinking);
          x.tokens.response += num(t.response);
        }
      }
    }
    const filteredModels = Array.from(modelStatsMap.values()).sort((a, b) => b.genCalls - a.genCalls);

    const modelsTbody = modalOverlay.querySelector('#conv-models-tbody');
    if (modelsTbody) {
      if (filteredModels.length === 0) {
        modelsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--au-text-muted)">当前时间范围内无模型调用记录</td></tr>';
      } else {
        modelsTbody.innerHTML = filteredModels.map(m => {
          const t = m.tokens || {};
          const hit = cacheHit(t);
          return `
            <tr>
              <td style="font-weight: 600">${escapeHTML(m.model)}</td>
              <td class="au-num">${m.genCalls || 0}</td>
              <td class="au-num" title="${fmtFull(t.input)}">${fmtNum(t.input)}</td>
              <td class="au-num" style="color:var(--au-purple)" title="${fmtFull(t.output)}">${fmtNum(t.output)}</td>
              <td class="au-num" style="color:var(--au-brand)" title="${fmtFull(t.cacheRead)}">${fmtNum(t.cacheRead)}</td>
              <td class="au-num" style="color:var(--au-emerald); font-weight:700">${hit}</td>
            </tr>
          `;
        }).join('');
      }
    }

    // 2. 动态按时间范围计算活跃工作区筛选胶囊
    const wsMap = new Map();
    for (const c of rangeConvs) {
      const list = (c.workspaces && c.workspaces.length > 0) ? c.workspaces : ['(未知)'];
      for (const w of list) {
        wsMap.set(w, (wsMap.get(w) || 0) + 1);
      }
    }
    const filteredWorkspaces = Array.from(wsMap.entries()).map(([workspace, sessions]) => ({ workspace, sessions }));

    const wsContainer = modalOverlay.querySelector('#conv-workspaces-pills');
    if (wsContainer) {
      wsContainer.innerHTML = '';
      filteredWorkspaces.forEach(w => {
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

    updateConversationsList(rangeConvs);
  }

  function updateConversationsList(rangeConvs = getRangeFilteredConversations()) {
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

    const filtered = rangeConvs.filter(c => {
      if (ws && !(c.workspaces || []).includes(ws)) return false;
      if (!q) return true;
      const hay = `${c.title || ''} ${c.preview || ''} ${(c.workspaces || []).join(' ')} ${(c.models || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });

    modalOverlay.querySelector('#conv-count-info').textContent = `${filtered.length} / ${rangeConvs.length} 个会话`;

    const listTbody = modalOverlay.querySelector('#conv-list-tbody');
    if (!listTbody) return;

    if (filtered.length === 0) {
      listTbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:20px; color:var(--au-text-muted)">没有匹配的会话</td></tr>';
      return;
    }

    listTbody.innerHTML = filtered.slice(0, 150).map(c => {
      const t = c.tokens || {};
      const hit = cacheHit(t);
      return `
        <tr>
          <td class="au-trunc" title="${escapeHTML(c.title || c.preview || '')}"><b>${escapeHTML(c.title || c.preview || '未命名会话')}</b></td>
          <td class="au-trunc" title="${escapeHTML((c.workspaces || []).join('\n'))}">${escapeHTML(shortWs((c.workspaces || [])[0]))}</td>
          <td class="au-trunc" title="${escapeHTML((c.models || []).join(', '))}">${escapeHTML((c.models || []).slice(0, 2).join(', '))}</td>
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

  let quotaRequest;
  let usageRequest;
  let accountsRequest;

  async function fetchAccounts() {
    if (accountsRequest) return accountsRequest;
    accountsRequest = (async () => {
      try {
        const res = await fetch('http://127.0.0.1:19388/api/accounts', { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok) {
          RAW_ACCOUNTS = data.accounts || [];
          ACTIVE_ACCOUNT_EMAIL = data.activeEmail || '';
          syncTrendAccountOptions();
          if (activeTab === 'tab-quota') renderQuotaTab();
        }
      } catch {}
    })();
    try { await accountsRequest; } finally { accountsRequest = null; }
  }

  async function fetchQuota() {
    if (quotaRequest) return quotaRequest;
    quotaRequest = (async () => {
      try {
        const res = await fetch('http://127.0.0.1:19388/api/quota', { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error('Quota unavailable');
        const nextQuota = await res.json();
        const prevActive = ACTIVE_ACCOUNT_EMAIL;
        const nextActive = nextQuota?.account?.email || '';
        RAW_QUOTA = nextQuota;
        if (nextActive) {
          const changed = prevActive && prevActive !== nextActive;
          ACTIVE_ACCOUNT_EMAIL = nextActive;
          if (changed || !VIEW_ACCOUNT_EMAIL || VIEW_ACCOUNT_EMAIL === prevActive) {
            VIEW_ACCOUNT_EMAIL = nextActive;
            fetchAccounts();
          }
        }
        quotaFailed = false;
      } catch {
        quotaFailed = true;
      } finally {
        quotaLoading = false;
        renderQuotaTab();
        updateCapsuleDisplay();
      }
    })();
    try { await quotaRequest; } finally { quotaRequest = null; }
  }

  let estimatesRequest;
  function fetchEstimates() {
    if (estimatesRequest) return estimatesRequest;
    estimatesRequest = (async () => {
      try {
        const res = await fetch('http://127.0.0.1:19388/api/quota-estimates', { signal: AbortSignal.timeout(12_000) });
        if (!res.ok) throw new Error('Estimates unavailable');
        RAW_ESTIMATES = (await res.json()).estimates || {};
      } catch {
        RAW_ESTIMATES = {};
      } finally {
        estimatesLoading = false;
        estimatesRequest = null;
        renderQuotaTab();
      }
    })();
    return estimatesRequest;
  }

  async function fetchUsage() {
    if (usageRequest) return usageRequest;
    usageRequest = (async () => {
      try {
        const res = await fetch('http://127.0.0.1:19388/api/conversations', { signal: AbortSignal.timeout(12_000) });
        if (!res.ok) throw new Error('Usage unavailable');
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);
        RAW_CONVERSATIONS = data.conversations || [];
        RAW_DAILY = data.byDay || [];
        RAW_TOTALS = data.totals || null;
        usageLoaded = true;
        usageFailed = false;
      } catch {
        usageFailed = true;
      } finally {
        if (activeTab === 'tab-quota') renderQuotaTab();
        else renderUsageTab(activeTab);
      }
    })();
    try { await usageRequest; } finally { usageRequest = null; }
  }

  const usageTabs = ['tab-summary', 'tab-heatmap', 'tab-conv'];
  let activeTab = 'tab-quota';

  function renderUsageTab(tab) {
    const hint = modalOverlay.querySelector('#kpi-range-hint');
    const undated = Math.max(0, num(RAW_TOTALS?.genCalls) - RAW_DAILY.reduce((sum, d) => sum + num(d.genCalls), 0));
    hint.textContent = usageFailed ? (usageLoaded ? '使用缓存统计' : '本地用量暂不可用') :
      (undated ? `${fmtFull(undated)} 条调用缺少日期，仅计入全部` : '按本地日期统计');
    if (tab === 'tab-summary') {
      updateKPIs();
      renderSummaryTab();
    } else if (tab === 'tab-heatmap') {
      renderHeatmap();
    } else if (tab === 'tab-conv') {
      renderConversationsTab();
    }
  }

  function refreshTab(tab) {
    if (tab === 'tab-quota') {
      renderQuotaTab();
      return Promise.all([fetchQuota(), fetchAccounts(), fetchEstimates(), fetchUsage()]);
    }
    if (usageTabs.includes(tab)) {
      renderUsageTab(tab);
      return fetchUsage();
    }
    return tab === 'tab-trend' ? fetchTrendData() : Promise.all([fetchQuota(), fetchAccounts(), fetchEstimates()]);
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
    pillBar.setAttribute('aria-expanded', 'true');
    btnClose.focus();
    syncDateInputs();
    refreshTab(activeTab);
  }
  function closeModal() {
    overlay.classList.remove('open');
    pillBar.setAttribute('aria-expanded', 'false');
    pillBar.focus();
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
    btnRefresh.disabled = true;
    btnRefresh.textContent = '刷新中…';
    Promise.allSettled([fetchQuota(), fetchAccounts(), refreshTab(activeTab)]).finally(() => {
      btnRefresh.disabled = false;
      btnRefresh.textContent = '↻ 刷新';
    });
  });

  function applyDateRange(start, end) {
    let s = (start || '').trim();
    let e = (end || '').trim();
    if (s && e && s > e) [s, e] = [e, s];
    CUSTOM_START_DATE = s;
    CUSTOM_END_DATE = e;
    SELECTED_DAYS = -1;
    modalOverlay.querySelectorAll('#kpi-range-group .au-btn').forEach(b => b.classList.remove('on'));
    syncDateInputs();
    if (activeTab === 'tab-quota') renderQuotaTab();
    else renderUsageTab(activeTab);
  }

  function applyPresetDays(days) {
    SELECTED_DAYS = days;
    CUSTOM_START_DATE = '';
    CUSTOM_END_DATE = '';
    modalOverlay.querySelectorAll('#kpi-range-group .au-btn').forEach(b => {
      b.classList.toggle('on', Number(b.getAttribute('data-days')) === days);
    });
    syncDateInputs();
    if (activeTab === 'tab-quota') renderQuotaTab();
    else renderUsageTab(activeTab);
  }

  function resetDateFilter() {
    applyPresetDays(1);
  }

  // KPI 时间范围切换 (预设天数)
  modalOverlay.querySelectorAll('#kpi-range-group .au-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPresetDays(Number(btn.getAttribute('data-days')));
    });
  });

  // 顶栏自定义日期范围
  modalOverlay.querySelector('#range-apply-btn')?.addEventListener('click', () => {
    const s = modalOverlay.querySelector('#range-start-date')?.value;
    const e = modalOverlay.querySelector('#range-end-date')?.value;
    applyDateRange(s, e);
  });
  modalOverlay.querySelector('#range-clear-btn')?.addEventListener('click', resetDateFilter);

  // 额度页内自定义日期范围
  modalOverlay.querySelector('#quota-date-apply')?.addEventListener('click', () => {
    const s = modalOverlay.querySelector('#quota-start-date')?.value;
    const e = modalOverlay.querySelector('#quota-end-date')?.value;
    applyDateRange(s, e);
  });
  modalOverlay.querySelector('#quota-date-reset')?.addEventListener('click', resetDateFilter);

  // 输入框回车快速筛选
  for (const id of ['range-start-date', 'range-end-date', 'quota-start-date', 'quota-end-date']) {
    modalOverlay.querySelector('#' + id)?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const isQuota = id.startsWith('quota-');
        const s = modalOverlay.querySelector(isQuota ? '#quota-start-date' : '#range-start-date')?.value;
        const eVal = modalOverlay.querySelector(isQuota ? '#quota-end-date' : '#range-end-date')?.value;
        applyDateRange(s, eVal);
      }
    });
  }

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

      activeTab = targetId;
      modalOverlay.querySelector('.au-body').scrollTop = 0;
      refreshTab(targetId);
    });
  });

  // 离线账户快照切回 / 移除
  modalOverlay.querySelector('#quota-back-active-btn')?.addEventListener('click', () => {
    VIEW_ACCOUNT_EMAIL = ACTIVE_ACCOUNT_EMAIL || RAW_QUOTA?.account?.email || '';
    renderQuotaTab();
  });
  modalOverlay.querySelector('#quota-remove-acct-btn')?.addEventListener('click', async (e) => {
    const email = e.currentTarget?.dataset?.email;
    if (!email) return;
    try {
      const res = await fetch(`http://127.0.0.1:19388/api/accounts?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        RAW_ACCOUNTS = data.accounts || [];
        VIEW_ACCOUNT_EMAIL = ACTIVE_ACCOUNT_EMAIL || RAW_QUOTA?.account?.email || '';
        syncTrendAccountOptions();
        renderQuotaTab();
      }
    } catch {}
  });

  // 趋势图范围与账户切换
  modalOverlay.querySelectorAll('#trend-range-group .au-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalOverlay.querySelectorAll('#trend-range-group .au-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const range = btn.getAttribute('data-range');
      fetchTrendData(range);
    });
  });
  modalOverlay.querySelector('#trend-account-select')?.addEventListener('change', (e) => {
    TREND_ACCOUNT_EMAIL = e.target.value || '';
    fetchTrendData();
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
    cRoot.style.setProperty('--agy-right', (rightOffset + 12) + 'px');
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
  syncDateInputs();
  fetchQuota();
  fetchAccounts();
  fetchUsage();
  fetchEstimates();
  setInterval(ensureMounted, 2500);
  setInterval(fetchQuota, 8000);
  setInterval(() => {
    if (!overlay.classList.contains('open')) return;
    if (activeTab === 'tab-quota') {
      fetchAccounts();
      fetchEstimates();
      fetchUsage();
    } else if (usageTabs.includes(activeTab)) fetchUsage();
  }, 30000);
  window.addEventListener('resize', updateCapsulePosition);

})();
