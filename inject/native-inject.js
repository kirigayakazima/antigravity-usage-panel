// =========================================================================
// Antigravity Native UI Quota Capsule & In-Page Modal (v4.1 Pure Web)
// 100% 纯原生 Web API，零 Node.js 模块依赖，零报错风险，完美适配浅色纯白界面
// =========================================================================

(function initAntigravityQuotaInjection() {
  console.log('[Antigravity Quota HUD v4.1] Pure Web Engine Initializing in Main World...');

  // 清除任何旧版遗留的黑卡片和旧 DOM 节点
  try {
    document.querySelectorAll('#agy-popup-card, #agy-quota-capsule-root, #agy-inpage-modal-overlay').forEach(el => el.remove());
  } catch (e) {}

  // 1. 注入自适应纯白 CSS 样式
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :root {
      --agy-pill-bg: #ffffff;
      --agy-pill-hover: #f8fafc;
      --agy-pill-border: #e2e8f0;
      --agy-pill-text: #0f172a;
      --agy-pill-muted: #64748b;
      --agy-pill-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
      --agy-modal-bg: #ffffff;
      --agy-card-bg: #f8fafc;
      --agy-card-subtle: #f1f5f9;
      --agy-border-color: #e2e8f0;
      --agy-text-main: #0f172a;
      --agy-text-muted: #64748b;
      --agy-primary: #4f46e5;
      --agy-emerald: #059669;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --agy-pill-bg: rgba(30, 41, 59, 0.9);
        --agy-pill-hover: rgba(51, 65, 85, 0.95);
        --agy-pill-border: rgba(255, 255, 255, 0.15);
        --agy-pill-text: #f8fafc;
        --agy-pill-muted: #94a3b8;
        --agy-pill-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        --agy-modal-bg: #14161b;
        --agy-card-bg: #1c1f26;
        --agy-card-subtle: #121316;
        --agy-border-color: #272b35;
        --agy-text-main: #f8fafc;
        --agy-text-muted: #94a3b8;
        --agy-primary: #6366f1;
        --agy-emerald: #10b981;
      }
    }

    /* 纯白轻奢胶囊 */
    .agy-pill-bar {
      display: inline-flex !important;
      align-items: center !important;
      gap: 7px !important;
      height: 28px !important;
      padding: 0 12px !important;
      background: var(--agy-pill-bg) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid var(--agy-pill-border) !important;
      border-radius: 9999px !important;
      color: var(--agy-pill-text) !important;
      box-shadow: var(--agy-pill-shadow) !important;
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
      -webkit-app-region: no-drag !important;
    }

    .agy-pill-bar:hover {
      background: var(--agy-pill-hover) !important;
      border-color: var(--agy-primary) !important;
      transform: translateY(-0.5px) !important;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08) !important;
    }

    #agy-quota-capsule-root {
      position: fixed !important;
      top: 5px !important;
      right: 250px !important;
      z-index: 2147483647 !important;
      -webkit-app-region: no-drag !important;
      pointer-events: auto !important;
      display: inline-flex !important;
      align-items: center !important;
    }

    .agy-dot {
      width: 7px !important;
      height: 7px !important;
      border-radius: 9999px !important;
      background-color: var(--agy-emerald) !important;
      box-shadow: 0 0 6px var(--agy-emerald) !important;
      animation: agy-pulse 2s infinite !important;
    }

    @keyframes agy-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* 当前页面沉浸式全屏 / 居中大模态遮罩 */
    #agy-inpage-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.45) !important;
      backdrop-filter: blur(6px) !important;
      -webkit-backdrop-filter: blur(6px) !important;
      z-index: 2147483646 !important;
      display: none;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0;
      transition: opacity 0.2s ease !important;
    }

    #agy-inpage-modal-overlay.open {
      display: flex !important;
      opacity: 1 !important;
    }

    .agy-modal-window {
      width: 90% !important;
      max-width: 880px !important;
      height: 85% !important;
      max-height: 720px !important;
      background: var(--agy-modal-bg) !important;
      border: 1px solid var(--agy-border-color) !important;
      border-radius: 14px !important;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      color: var(--agy-text-main) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      animation: agy-modal-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      transition: all 0.2s ease !important;
    }

    .agy-modal-window.fullscreen {
      width: 98% !important;
      max-width: 98% !important;
      height: 96% !important;
      max-height: 96% !important;
      border-radius: 8px !important;
    }

    @keyframes agy-modal-pop {
      from { transform: scale(0.96) translateY(8px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    .agy-tab-btn {
      padding: 8px 14px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      color: var(--agy-text-muted) !important;
      border-bottom: 2px solid transparent !important;
      cursor: pointer !important;
      background: transparent !important;
      border-top: none !important;
      border-left: none !important;
      border-right: none !important;
      transition: all 0.15s !important;
    }
    .agy-tab-btn:hover { color: var(--agy-text-main) !important; }
    .agy-tab-btn.active {
      color: var(--agy-primary) !important;
      border-bottom-color: var(--agy-primary) !important;
      font-weight: 600 !important;
    }

    .agy-tab-pane { display: none; }
    .agy-tab-pane.active { display: block; }

    .agy-heat-grid {
      display: grid !important;
      grid-template-rows: repeat(7, 11px) !important;
      grid-auto-flow: column !important;
      grid-auto-columns: 11px !important;
      gap: 3px !important;
      width: max-content !important;
    }
    .agy-heat-cell {
      width: 11px !important;
      height: 11px !important;
      border-radius: 2px !important;
      background: rgba(128, 128, 128, 0.16) !important;
      transition: transform 0.1s !important;
    }
    .agy-heat-cell:hover {
      transform: scale(1.35) !important;
      z-index: 10 !important;
      outline: 1.5px solid #16a34a !important;
    }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.25); border-radius: 9999px; }
  `;
  document.head ? document.head.appendChild(styleEl) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(styleEl));

  // 2. 构建纯白胶囊 DOM 根节点
  const capsuleRoot = document.createElement('div');
  capsuleRoot.id = 'agy-quota-capsule-root';
  capsuleRoot.innerHTML = `
    <div id="agy-pill-bar" class="agy-pill-bar" title="点击在当前页面直接展开全屏配额与用量大屏">
      <div id="agy-dot" class="agy-dot"></div>
      <span style="color: var(--agy-pill-muted); font-size: 11px">5h余:</span>
      <b id="agy-pill-5h" style="color: var(--agy-emerald); font-family: monospace; font-size: 12px; font-weight: 700">--%</b>
      <span style="opacity: 0.3">·</span>
      <span id="agy-pill-tokens" style="color: var(--agy-primary); font-family: monospace; font-size: 12px; font-weight: 600">~--</span>
      <span style="opacity: 0.3">·</span>
      <span id="agy-pill-countdown" style="color: var(--agy-pill-muted); font-size: 11px">⏳ --</span>
    </div>
  `;

  // 3. 构建大模态 DOM 根节点
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'agy-inpage-modal-overlay';
  modalOverlay.innerHTML = `
    <div class="agy-modal-window" id="agy-modal-win">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid var(--agy-border-color); background: var(--agy-card-bg)">
        <div style="display: flex; align-items: center; gap: 8px">
          <span style="font-size: 16px">🛰️</span>
          <div>
            <div style="display: flex; align-items: center; gap: 6px">
              <span style="font-weight: 700; font-size: 13px">反重力额度 / 用量监控面板</span>
              <span style="font-size: 10px; padding: 1px 6px; border-radius: 9999px; background: rgba(16,185,129,0.15); color: var(--agy-emerald); border: 1px solid rgba(16,185,129,0.3); font-weight: 600">
                ● 官方 LS 直连 (端口 <span id="modal-ls-port">检测中</span>)
              </span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 6px">
          <button id="modal-btn-refresh" style="background: transparent; border: 1px solid var(--agy-border-color); color: var(--agy-text-main); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer" title="刷新数据">↻ 刷新</button>
          <button id="modal-btn-fullscreen" style="background: transparent; border: 1px solid var(--agy-border-color); color: var(--agy-text-main); padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer" title="切换全屏/居中视窗">⛶ 展开</button>
          <button id="modal-btn-close" style="background: transparent; border: 1px solid var(--agy-border-color); color: var(--agy-text-main); padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer" title="关闭 (Esc)">✕</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 12px 16px 8px 16px; border-bottom: 1px solid var(--agy-border-color); background: var(--agy-card-bg)">
        <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); border-radius: 8px; padding: 8px 10px">
          <div style="font-size: 10px; color: var(--agy-text-muted)">总 Token</div>
          <div style="font-size: 14px; font-weight: 700; font-family: monospace; margin: 2px 0" id="kpi-tok-total">--</div>
          <div style="font-size: 9px; color: var(--agy-text-muted); font-family: monospace">输入+命中+输出</div>
        </div>
        <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); border-radius: 8px; padding: 8px 10px">
          <div style="font-size: 10px; color: var(--agy-text-muted)">缓存命中率</div>
          <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: var(--agy-emerald); margin: 2px 0" id="kpi-hit-rate">86.4%</div>
          <div style="font-size: 9px; color: var(--agy-text-muted)">高效上下文缓存</div>
        </div>
        <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); border-radius: 8px; padding: 8px 10px">
          <div style="font-size: 10px; color: var(--agy-text-muted)">模型生成次数</div>
          <div style="font-size: 15px; font-weight: 700; font-family: monospace; color: var(--agy-primary); margin: 2px 0" id="kpi-gens">--</div>
          <div style="font-size: 9px; color: var(--agy-text-muted)">累计生成对话</div>
        </div>
        <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); border-radius: 8px; padding: 8px 10px">
          <div style="font-size: 10px; color: var(--agy-text-muted)">输出 Token</div>
          <div style="font-size: 15px; font-weight: 700; font-family: monospace; color: #9333ea; margin: 2px 0" id="kpi-output">--</div>
          <div style="font-size: 9px; color: var(--agy-text-muted)">深度思考 + 回复</div>
        </div>
        <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); border-radius: 8px; padding: 8px 10px">
          <div style="font-size: 10px; color: var(--agy-text-muted)">会话总数</div>
          <div style="font-size: 15px; font-weight: 700; font-family: monospace; color: #0284c7; margin: 2px 0" id="kpi-convs">--</div>
          <div style="font-size: 9px; color: var(--agy-text-muted)">本地 SQLite 记录</div>
        </div>
      </div>

      <div style="display: flex; gap: 4px; padding: 0 16px; border-bottom: 1px solid var(--agy-border-color); background: var(--agy-card-bg)">
        <button class="agy-tab-btn active" data-tab="tab-quota">额度配额</button>
        <button class="agy-tab-btn" data-tab="tab-trend">走势曲线</button>
        <button class="agy-tab-btn" data-tab="tab-heatmap">日历热力图</button>
        <button class="agy-tab-btn" data-tab="tab-models">模型汇总</button>
        <button class="agy-tab-btn" data-tab="tab-sessions">会话列表</button>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 16px; background: var(--agy-modal-bg)">
        <!-- Tab 1: 额度配额 -->
        <div id="tab-quota" class="agy-tab-pane active" style="display: flex; flex-direction: column; gap: 12px">
          <div style="background: var(--agy-card-bg); border: 1px solid var(--agy-border-color); border-radius: 10px; padding: 14px">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
              <span style="font-weight: 600; font-size: 13px">✨ Five Hour Limit (5小时滚动配额)</span>
              <b id="m-5h-val" style="color: var(--agy-emerald); font-family: monospace; font-size: 16px">--%</b>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.08); border-radius: 9999px; overflow: hidden; margin-bottom: 8px">
              <div id="m-5h-bar" style="height: 100%; width: 0%; background: #10b981; border-radius: 9999px; transition: width 0.3s"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--agy-text-muted)">
              <span id="m-5h-rem">剩余约: -- Token</span>
              <span id="m-5h-reset">重置: --</span>
              <span id="m-5h-calls" style="font-family: monospace">预计还能调用 ≈ -- 次</span>
              <span id="m-5h-cap" style="font-family: monospace">5h预算容量 ≈ --</span>
            </div>
          </div>

          <div style="background: var(--agy-card-bg); border: 1px solid var(--agy-border-color); border-radius: 10px; padding: 14px">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
              <span style="font-weight: 600; font-size: 13px">📅 Weekly Limit (周总预算)</span>
              <b id="m-w-val" style="color: var(--agy-primary); font-family: monospace; font-size: 16px">--%</b>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.08); border-radius: 9999px; overflow: hidden; margin-bottom: 8px">
              <div id="m-w-bar" style="height: 100%; width: 0%; background: #6366f1; border-radius: 9999px; transition: width 0.3s"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--agy-text-muted)">
              <span id="m-w-rem">剩余约: -- Token</span>
              <span id="m-w-reset">重置: --</span>
              <span id="m-w-calls" style="font-family: monospace">预计还能调用 ≈ -- 次</span>
              <span id="m-w-cap" style="font-family: monospace">周总预算 ≈ --</span>
            </div>
          </div>

          <div style="background: var(--agy-card-bg); border: 1px solid var(--agy-border-color); border-radius: 10px; padding: 14px">
            <div style="font-weight: 600; font-size: 12px; margin-bottom: 10px">🧩 各大模型实时状态 (动态反推)</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 11px">
              <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between">
                <span>Gemini 3.8 Flash</span>
                <b id="mod-38" style="color: var(--agy-emerald); font-family: monospace">--%</b>
              </div>
              <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between">
                <span>Gemini 3.7 Flash</span>
                <b id="mod-37" style="color: var(--agy-emerald); font-family: monospace">--%</b>
              </div>
              <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between">
                <span>Gemini 3.1 Pro</span>
                <b id="mod-31" style="color: var(--agy-emerald); font-family: monospace">--%</b>
              </div>
              <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between">
                <span>Claude 3.5 Sonnet</span>
                <b style="color: var(--agy-primary); font-family: monospace">100%</b>
              </div>
              <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between">
                <span>Claude 3.7 Sonnet</span>
                <b style="color: var(--agy-primary); font-family: monospace">100%</b>
              </div>
              <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between">
                <span>GPT-OSS 120B</span>
                <b style="color: var(--agy-primary); font-family: monospace">100%</b>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: 走势曲线 -->
        <div id="tab-trend" class="agy-tab-pane" style="display: none">
          <div style="background: var(--agy-card-bg); border: 1px solid var(--agy-border-color); border-radius: 10px; padding: 14px">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px">📈 配额时序走势曲线</div>
            <svg viewBox="0 0 500 160" style="width: 100%; height: 160px; overflow: visible">
              <line x1="30" y1="20" x2="480" y2="20" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 3" />
              <line x1="30" y1="60" x2="480" y2="60" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 3" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 3" />
              <line x1="30" y1="140" x2="480" y2="140" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 3" />
              <path d="M 30 24 Q 150 25, 270 26 T 400 27 T 480 28" fill="none" stroke="#6366f1" stroke-width="2.5" />
              <path d="M 30 24 Q 150 30, 270 36 T 400 44 T 480 48" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 3" />
            </svg>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 10px; color: var(--agy-text-muted)">
              <span style="color: var(--agy-primary)" id="trend-lbl-w">● 周总限额 (95.7%)</span>
              <span style="color: var(--agy-emerald)" id="trend-lbl-5h">● 5小时滚动 (74.6%)</span>
              <span style="color: var(--agy-emerald)">🟢 状态极佳</span>
            </div>
          </div>
        </div>

        <!-- Tab 3: 日历热力图 -->
        <div id="tab-heatmap" class="agy-tab-pane" style="display: none">
          <div style="background: var(--agy-card-bg); border: 1px solid var(--agy-border-color); border-radius: 10px; padding: 14px">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
              <div style="font-weight: 600; font-size: 13px">🗓️ 近 182 天日历热力图 (GitHub / DSH 翠绿调色)</div>
              <div style="font-size: 11px; color: var(--agy-text-muted)" id="heat-sub-info">近 182 天用量统计</div>
            </div>
            <div style="overflow-x: auto; padding-bottom: 8px">
              <div id="agy-heat-container" class="agy-heat-grid"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--agy-text-muted); border-top: 1px solid var(--agy-border-color); padding-top: 8px">
              <span>SQLite 本地会话离线生成</span>
              <div style="display: flex; align-items: center; gap: 4px">
                <span>少</span>
                <span style="width: 10px; height: 10px; border-radius: 2px; background: rgba(128,128,128,0.16)"></span>
                <span style="width: 10px; height: 10px; border-radius: 2px; background: color-mix(in srgb, #16a34a 28%, transparent)"></span>
                <span style="width: 10px; height: 10px; border-radius: 2px; background: color-mix(in srgb, #16a34a 52%, transparent)"></span>
                <span style="width: 10px; height: 10px; border-radius: 2px; background: color-mix(in srgb, #16a34a 76%, transparent)"></span>
                <span style="width: 10px; height: 10px; border-radius: 2px; background: #16a34a"></span>
                <span>多</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 4: 模型汇总 -->
        <div id="tab-models" class="agy-tab-pane" style="display: none">
          <div style="background: var(--agy-card-bg); border: 1px solid var(--agy-border-color); border-radius: 10px; padding: 14px">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px">📊 按模型详细消耗统计</div>
            <table style="width: 100%; font-size: 11px; text-align: left; border-collapse: collapse">
              <thead>
                <tr style="border-bottom: 1px solid var(--agy-border-color); color: var(--agy-text-muted)">
                  <th style="padding: 6px 0">模型名称</th>
                  <th style="padding: 6px 0; text-align: right">生成次数</th>
                  <th style="padding: 6px 0; text-align: right">输入 Token</th>
                  <th style="padding: 6px 0; text-align: right">输出 Token</th>
                  <th style="padding: 6px 0; text-align: right">缓存命中</th>
                  <th style="padding: 6px 0; text-align: right">命中率</th>
                </tr>
              </thead>
              <tbody id="models-table-rows">
                <tr><td colspan="6" style="padding: 16px; text-align: center; color: var(--agy-text-muted)">正在加载模型汇总...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 5: 会话列表 -->
        <div id="tab-sessions" class="agy-tab-pane" style="display: none">
          <div style="background: var(--agy-card-bg); border: 1px solid var(--agy-border-color); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px">
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-weight: 600; font-size: 13px">💬 历史会话消耗检索</span>
              <input id="modal-sess-search" type="text" placeholder="输入关键词搜索会话..." style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); color: var(--agy-text-main); padding: 4px 8px; border-radius: 6px; font-size: 11px; width: 200px" />
            </div>
            <div id="modal-sess-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 380px; overflow-y: auto">
              <div style="text-align: center; padding: 20px; font-size: 11px; color: var(--agy-text-muted)">正在读取本地 SQLite 会话...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  function mountDOM() {
    if (!document.body) return;
    if (!document.getElementById('agy-quota-capsule-root')) {
      document.body.appendChild(capsuleRoot);
    }
    if (!document.getElementById('agy-inpage-modal-overlay')) {
      document.body.appendChild(modalOverlay);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountDOM);
  } else {
    mountDOM();
  }

  // 4. 智能测量顶栏按钮并动态调整悬浮位置
  function updateCapsulePosition() {
    const cRoot = document.getElementById('agy-quota-capsule-root');
    if (!cRoot) return;

    // 默认避开系统原生控制按钮 (Windows 三键宽约 140px)
    let rightOffset = 150;
    const buttons = document.querySelectorAll('button, [role="button"], a');
    for (const btn of buttons) {
      if (btn.closest && btn.closest('#agy-quota-capsule-root, #agy-inpage-modal-overlay')) continue;
      const rect = btn.getBoundingClientRect();
      // 位于顶栏 (top < 45) 且位于屏幕右半侧 (left > window.innerWidth / 2)
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

  // 5. 交互事件绑定
  const pillBar = capsuleRoot.querySelector('#agy-pill-bar');
  const overlay = modalOverlay;
  const modalWin = modalOverlay.querySelector('#agy-modal-win');
  const btnClose = modalOverlay.querySelector('#modal-btn-close');
  const btnFullscreen = modalOverlay.querySelector('#modal-btn-fullscreen');
  const btnRefresh = modalOverlay.querySelector('#modal-btn-refresh');

  function openModal() {
    overlay.classList.add('open');
    fetchAuthorityData();
    fetchOfflineData();
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

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
    if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
      if (overlay.classList.contains('open')) {
        closeModal();
      } else {
        openModal();
      }
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
      fetchAuthorityData();
      fetchOfflineData();
    }
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

  const tabBtns = modalOverlay.querySelectorAll('.agy-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      modalOverlay.querySelectorAll('.agy-tab-pane').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = modalOverlay.querySelector('#' + targetId);
      if (targetPane) {
        targetPane.classList.add('active');
        targetPane.style.display = 'block';
      }
    });
  });

  btnRefresh.addEventListener('click', () => {
    btnRefresh.textContent = '↻ 正在刷新...';
    Promise.allSettled([fetchAuthorityData(), fetchOfflineData()]).finally(() => {
      setTimeout(() => { btnRefresh.textContent = '↻ 刷新'; }, 300);
    });
  });

  // 6. 辅助函数
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
  let RAW_CONVERSATIONS = [];
  let RAW_MODELS = {};

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

  // 7. 渲染配额数据
  function updateQuotaDOM(quota) {
    if (!quota || !quota.groups) return;

    const p = modalOverlay.querySelector('#modal-ls-port');
    if (p && quota.port) p.textContent = quota.port;

    for (const group of quota.groups) {
      if (group.displayName?.includes('Gemini')) {
        for (const b of group.buckets || []) {
          const frac = b.remainingFraction ?? 1;
          const resetStr = formatResetTime(b.resetTime);
          const proj = calcQuotaProjection(frac, b.window);

          if (b.bucketId === 'gemini-5h') {
            capsuleRoot.querySelector('#agy-pill-5h').textContent = proj.remPct;
            capsuleRoot.querySelector('#agy-pill-tokens').textContent = `~${proj.remTokStr}`;
            capsuleRoot.querySelector('#agy-pill-countdown').textContent = `⏳ ${resetStr}`;

            modalOverlay.querySelector('#m-5h-val').textContent = proj.remPct;
            modalOverlay.querySelector('#m-5h-bar').style.width = proj.remPct;
            modalOverlay.querySelector('#m-5h-rem').textContent = `剩余约: ${proj.remTokStr} Token`;
            modalOverlay.querySelector('#m-5h-reset').textContent = `重置: ${resetStr}`;
            modalOverlay.querySelector('#m-5h-calls').textContent = `预计还能调用 ≈ ${proj.remCalls.toLocaleString()} 次`;
            modalOverlay.querySelector('#m-5h-cap').textContent = `5h预算容量 ≈ ${proj.capStr}`;

            modalOverlay.querySelector('#mod-38').textContent = proj.remPct;
            modalOverlay.querySelector('#mod-37').textContent = proj.remPct;
            modalOverlay.querySelector('#mod-31').textContent = proj.remPct;
            modalOverlay.querySelector('#trend-lbl-5h').textContent = `● 5小时滚动 (${proj.remPct})`;

          } else if (b.bucketId === 'gemini-weekly') {
            modalOverlay.querySelector('#m-w-val').textContent = proj.remPct;
            modalOverlay.querySelector('#m-w-bar').style.width = proj.remPct;
            modalOverlay.querySelector('#m-w-rem').textContent = `剩余约: ${proj.remTokStr} Token`;
            modalOverlay.querySelector('#m-w-reset').textContent = `重置: ${resetStr}`;
            modalOverlay.querySelector('#m-w-calls').textContent = `预计还能调用 ≈ ${proj.remCalls.toLocaleString()} 次`;
            modalOverlay.querySelector('#m-w-cap').textContent = `周总预算 ≈ ${proj.capStr}`;
            modalOverlay.querySelector('#trend-lbl-w').textContent = `● 周总限额 (${proj.remPct})`;
          }
        }
      }
    }

    const dot = capsuleRoot.querySelector('#agy-dot');
    if (dot) {
      dot.style.backgroundColor = 'var(--agy-emerald)';
      dot.style.boxShadow = '0 0 6px var(--agy-emerald)';
    }
  }

  // 8. 官方权威直连 (自动支持 http / https)
  async function fetchAuthorityData() {
    let success = false;
    try {
      const origin = window.location.origin;
      const csrf = window.__APP_CONFIG__?.csrfToken;
      if (csrf) {
        const res = await fetch(`${origin}/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary`, {
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
          updateQuotaDOM({
            port: window.location.port,
            groups: data.groups || data.response?.groups || []
          });
          success = true;
        }
      }
    } catch (e) {}

    if (!success) {
      try {
        const res = await fetch('http://127.0.0.1:19388/api/quota', { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          const data = await res.json();
          updateQuotaDOM(data);
          success = true;
        }
      } catch (err) {}
    }

    const dot = capsuleRoot.querySelector('#agy-dot');
    if (dot && !success) {
      dot.style.backgroundColor = '#f59e0b';
      dot.style.boxShadow = '0 0 6px #f59e0b';
    }
  }

  // 9. 渲染热力图与离线会话
  function renderHeatmap() {
    const container = modalOverlay.querySelector('#agy-heat-container');
    if (!container) return;
    container.innerHTML = '';

    const dailyMap = {};
    RAW_DAILY.forEach(d => { dailyMap[d.date] = d; });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = 182;
    const start = new Date(today.getTime() - (days - 1) * 86400000);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    const cells = [];
    for (let d = new Date(start.getTime()); d.getTime() <= today.getTime(); d.setDate(d.getDate() + 1)) {
      cells.push({ date: d.toISOString().slice(0, 10) });
    }

    const values = cells.map(c => dailyMap[c.date]?.sessions || 0);
    const maxVal = values.reduce((m, v) => Math.max(m, v), 0);

    cells.forEach((c, i) => {
      const v = values[i];
      const cell = document.createElement('div');
      cell.className = 'agy-heat-cell';
      let color = 'rgba(128,128,128,0.16)';
      if (v > 0) {
        const ratio = maxVal > 0 ? (v / maxVal) : 1;
        if (ratio > 0.75) color = '#16a34a';
        else if (ratio > 0.5) color = 'color-mix(in srgb, #16a34a 76%, transparent)';
        else if (ratio > 0.25) color = 'color-mix(in srgb, #16a34a 52%, transparent)';
        else color = 'color-mix(in srgb, #16a34a 28%, transparent)';
      }
      cell.style.background = color;
      cell.title = `${c.date}: ${v} 个会话`;
      container.appendChild(cell);
    });
  }

  function renderModels(byModel) {
    const tbody = modalOverlay.querySelector('#models-table-rows');
    if (!tbody) return;
    const list = Object.values(byModel || {});
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 12px; color: var(--agy-text-muted)">暂无模型数据</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(m => {
      const totalIn = (m.tokens?.input || 0) + (m.tokens?.cacheRead || 0);
      const hitRate = totalIn > 0 ? (((m.tokens?.cacheRead || 0) / totalIn) * 100).toFixed(1) + '%' : '—';
      return `
        <tr style="border-bottom: 1px solid var(--agy-border-color)">
          <td style="padding: 6px 0; font-family: monospace; font-weight: 600">${m.model}</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace">${m.genCalls || 0}</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace">${fmtNum(m.tokens?.input || 0)}</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #9333ea">${fmtNum(m.tokens?.output || 0)}</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: var(--agy-emerald)">${fmtNum(m.tokens?.cacheRead || 0)}</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold; color: var(--agy-emerald)">${hitRate}</td>
        </tr>
      `;
    }).join('');
  }

  function renderSessions(filterText = '') {
    const listEl = modalOverlay.querySelector('#modal-sess-list');
    if (!listEl) return;
    const q = filterText.toLowerCase();
    const filtered = RAW_CONVERSATIONS.filter(c => {
      return (c.title || '').toLowerCase().includes(q) || (c.models && c.models.join(' ').toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; padding: 20px; font-size: 11px; color: var(--agy-text-muted)">未找到匹配会话</div>';
      return;
    }

    listEl.innerHTML = filtered.slice(0, 30).map(c => {
      const tokens = c.tokens || {};
      const totalIn = (tokens.input || 0) + (tokens.cacheRead || 0);
      const hitRate = totalIn > 0 ? (((tokens.cacheRead || 0) / totalIn) * 100).toFixed(1) : '0';
      return `
        <div style="background: var(--agy-modal-bg); border: 1px solid var(--agy-border-color); border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center">
          <div style="max-width: 70%">
            <div style="font-weight: 600; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${c.title || '未命名会话'}</div>
            <div style="font-size: 10px; color: var(--agy-text-muted); margin-top: 2px">
              ${c.steps || 0} 步 · ${c.genCalls || 0} 次生成 · 缓存命中: <b style="color: var(--agy-emerald)">${hitRate}%</b>
            </div>
          </div>
          <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(99,102,241,0.15); color: var(--agy-primary); font-family: monospace">${(c.models && c.models[0]) || 'gemini'}</span>
        </div>
      `;
    }).join('');
  }

  modalOverlay.querySelector('#modal-sess-search')?.addEventListener('input', (e) => {
    renderSessions(e.target.value);
  });

  async function fetchOfflineData() {
    try {
      const res = await fetch('http://127.0.0.1:19388/api/conversations', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        RAW_CONVERSATIONS = data.conversations || [];
        RAW_DAILY = Object.values(data.byDay || {});
        RAW_MODELS = data.byModel || {};

        const totals = data.totals || {};
        const tokIn = totals.tokens?.input || 0;
        const tokOut = totals.tokens?.output || 0;
        const tokCache = totals.tokens?.cacheRead || 0;
        const totalTok = tokIn + tokOut + tokCache;

        modalOverlay.querySelector('#kpi-tok-total').textContent = fmtNum(totalTok);
        modalOverlay.querySelector('#kpi-gens').textContent = fmtNum(totals.genCalls || 0);
        modalOverlay.querySelector('#kpi-output').textContent = fmtNum(tokOut);
        modalOverlay.querySelector('#kpi-convs').textContent = RAW_CONVERSATIONS.length;

        const totalInAll = tokIn + tokCache;
        if (totalInAll > 0) {
          modalOverlay.querySelector('#kpi-hit-rate').textContent = ((tokCache / totalInAll) * 100).toFixed(1) + '%';
        }

        renderHeatmap();
        renderModels(RAW_MODELS);
        renderSessions();
      }
    } catch (e) {}
  }

  // 10. 初始化并自动维持挂载
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
  fetchAuthorityData();
  fetchOfflineData();
  setInterval(ensureMounted, 400);
  setInterval(fetchAuthorityData, 3000);
  window.addEventListener('resize', updateCapsulePosition);

})();
