// antigravity-usage-panel — 反重力桌面端右侧辅助面板（Auxiliary Pane）原生 UI 扩展后端
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// 动态兼容 sidecar_sdk（在 Antigravity 宿主环境中直接由宿主提供）
let SidecarApp, Response;
try {
  const sdk = await import('sidecar_sdk');
  SidecarApp = sdk.SidecarApp;
  Response = sdk.Response;
} catch (e) {
  console.warn('sidecar_sdk not found, using fallback shim for standalone development');
  SidecarApp = class {
    page() {}
    api() {}
    run() {}
  };
  Response = class {
    constructor(body, opts) { this.body = body; this.opts = opts; }
  };
}

const SVC = '/exa.language_server_pb.LanguageServerService';
const PORT_RE = /listening on random port at (\d+) for HTTP(?!S)/;

function safeStat(p) {
  try {
    return statSync(p).mtimeMs;
  } catch {
    return 0;
  }
}

function portFromLogFile(file) {
  try {
    const m = readFileSync(file, 'utf8').match(PORT_RE);
    if (m) return Number(m[1]);
  } catch {}
  return null;
}

function newestLogs(dir, limit = 4) {
  try {
    return readdirSync(dir)
      .filter((n) => n.endsWith('.log'))
      .map((n) => ({ p: join(dir, n), t: safeStat(join(dir, n)) }))
      .sort((a, b) => b.t - a.t)
      .slice(0, limit)
      .map((f) => f.p);
  } catch {
    return [];
  }
}

function logCandidates() {
  const home = homedir();
  const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
  const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');
  const out = [];
  out.push(join(appData, 'Antigravity', 'logs', 'language_server.log'));
  out.push(join(localAppData, 'Antigravity', 'logs', 'language_server.log'));
  out.push(...newestLogs(join(home, '.gemini', 'antigravity', 'log'), 4));
  out.push(...newestLogs(join(home, '.gemini', 'antigravity-cli', 'log'), 2));
  return out;
}

function discoverPort() {
  for (const file of logCandidates()) {
    const port = portFromLogFile(file);
    if (port !== null) return { port, source: file };
  }
  return null;
}

async function probePort(port, timeoutMs = 4000) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html.includes('__APP_CONFIG__')) return null;
    const m = html.match(/csrfToken":"([^"]+)"/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

class Collector {
  constructor() {
    this.port = null;
    this.csrf = null;
    this.source = null;
  }

  async handshake(force = false) {
    if (!force && this.port && this.csrf) {
      const csrf = await probePort(this.port);
      if (csrf) {
        this.csrf = csrf;
        return;
      }
    }

    const hit = discoverPort();
    if (hit) {
      const csrf = await probePort(hit.port);
      if (csrf) {
        this.port = hit.port;
        this.csrf = csrf;
        this.source = hit.source;
        return;
      }
    }

    throw new Error('未找到反重力运行端口或握手失败');
  }

  async call(method, body = {}) {
    await this.handshake(false);
    try {
      const res = await fetch(`http://127.0.0.1:${this.port}${SVC}/${method}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-codeium-csrf-token': this.csrf || '',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (err.message && (err.message.includes('401') || err.message.includes('403'))) {
        await this.handshake(true);
        const res2 = await fetch(`http://127.0.0.1:${this.port}${SVC}/${method}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-codeium-csrf-token': this.csrf || '',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000),
        });
        return await res2.json();
      }
      throw err;
    }
  }

  async collect() {
    try {
      const [quotaRaw, statusRaw] = await Promise.all([
        this.call('RetrieveUserQuotaSummary'),
        this.call('GetUserStatus'),
      ]);

      const resp = (quotaRaw && (quotaRaw.response ?? quotaRaw)) ?? {};
      const us = (statusRaw && (statusRaw.userStatus ?? statusRaw)) ?? {};
      const planInfo = (us.planStatus && us.planStatus.planInfo) ?? {};

      const groups = (resp.groups ?? []).map((g) => ({
        name: g.displayName || '',
        description: g.description || '',
        buckets: (g.buckets ?? []).map((b) => ({
          id: b.bucketId || b.displayName || '',
          label: b.displayName || '',
          window: b.window || '',
          remainingFraction: Number(b.remainingFraction ?? 1),
          resetTime: b.resetTime || '',
          description: b.description || '',
        })),
      }));

      return {
        ok: true,
        port: this.port,
        source: this.source,
        timestamp: Date.now(),
        account: {
          name: us.name || '',
          email: us.email || '',
          planName: planInfo.planName || 'Free',
        },
        credits: {
          promptAvailable: us.planStatus?.availablePromptCredits ?? 0,
          promptMonthly: planInfo.monthlyPromptCredits ?? 0,
          flowAvailable: us.planStatus?.availableFlowCredits ?? 0,
          flowMonthly: planInfo.monthlyFlowCredits ?? 0,
        },
        groups,
      };
    } catch (e) {
      return {
        ok: false,
        port: this.port,
        error: e.message || String(e),
        timestamp: Date.now(),
      };
    }
  }
}

const collector = new Collector();
const app = new SidecarApp();

const readLocal = (name) => readFileSync(join(HERE, name), 'utf8');

// 静态文件与页面路由
app.page('/', () => readLocal('index.html'));
app.page('/app.js', () => readLocal('app.js'));
app.api('/styles.css', () => new Response(readLocal('styles.css'), { contentType: 'text/css' }), 'GET');

// API 接口
app.api('/api/status', () => ({
  status: 'running',
  uptime: Math.round(process.uptime()),
  node: process.version,
}), 'GET');

app.api('/api/quota', async () => await collector.collect(), 'GET');

app.api('/api/refresh', async () => {
  await collector.handshake(true);
  return await collector.collect();
}, 'POST');

app.run();
