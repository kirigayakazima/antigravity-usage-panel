import http from 'node:http';
import { readdirSync, readFileSync, statSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { scanConversations } from './lib/conversations.js';
import { HistoryStore } from './lib/history.js';

process.on('uncaughtException', (err) => {
  try {
    writeFileSync('d:/CodePackage/DSPlug/antigravity-usage-panel/crash.txt', `[${new Date().toISOString()}] Uncaught: ${err.stack || err.message}\n`, { flag: 'a' });
  } catch (e) {}
});

process.on('unhandledRejection', (err) => {
  try {
    writeFileSync('d:/CodePackage/DSPlug/antigravity-usage-panel/crash.txt', `[${new Date().toISOString()}] Rejection: ${err?.stack || err?.message || err}\n`, { flag: 'a' });
  } catch (e) {}
});

import { execSync } from 'node:child_process';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PORT = 19388;
const home = homedir();
const historyDir = join(home, '.dsh', 'antigravity-usage');
const historyStore = new HistoryStore(historyDir, 180);
try {
  historyStore.load();
} catch (e) {}
const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');

const logDirs = [
  join(appData, 'Antigravity', 'logs'),
  join(localAppData, 'Antigravity', 'logs'),
  join(home, '.gemini', 'antigravity', 'log'),
  join(home, '.gemini', 'antigravity-cli', 'log')
];

let cachedPort = null;
let cachedCsrf = null;
let cachedProto = 'http';
let lastQuotaData = null;
let lastQuotaTime = 0;
let lastConvData = null;
let lastConvTime = 0;

async function testLsConnection(port, knownCsrf = null) {
  for (const proto of ['https', 'http']) {
    try {
      let csrf = knownCsrf;
      if (!csrf) {
        try {
          const r = await fetch(`${proto}://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1000) });
          const t = await r.text();
          const m = t.match(/csrfToken":"([^"]+)"/);
          if (m) csrf = m[1];
        } catch (e) {}
      }

      if (csrf) {
        const qRes = await fetch(`${proto}://127.0.0.1:${port}/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-codeium-csrf-token': csrf },
          body: '{}',
          signal: AbortSignal.timeout(1500)
        });
        if (qRes.ok) {
          const data = await qRes.json();
          if (data.response?.groups || data.groups) {
            return { port, csrf, protocol: proto };
          }
        }
      }
    } catch (e) {}
  }
  return null;
}

async function discoverLanguageServer() {
  // 1. Windows: wmic + netstat (超快，几十毫秒即可秒级发现最新 HTTPS/HTTP 端口与 Token)
  if (process.platform === 'win32') {
    try {
      const wmicOut = execSync('wmic process where "name=\'language_server.exe\'" get ProcessId,CommandLine /format:list', {
        encoding: 'utf8',
        timeout: 2000,
        windowsHide: true
      });
      const pidMatch = wmicOut.match(/ProcessId=(\d+)/i);
      const cmdMatch = wmicOut.match(/CommandLine=(.+)/i);
      if (pidMatch && cmdMatch) {
        const pid = pidMatch[1];
        const cmd = cmdMatch[1];
        const csrfMatch = cmd.match(/--csrf_token\s+([a-f0-9\-]+)/i);
        const csrf = csrfMatch ? csrfMatch[1] : null;

        const netOut = execSync('netstat -ano -p tcp', {
          encoding: 'utf8',
          timeout: 2000,
          windowsHide: true
        });
        const portMatches = [...netOut.matchAll(new RegExp(`127\\.0\\.0\\.1:(\\d+)\\s+.*LISTENING\\s+${pid}`, 'gi'))];
        const ports = portMatches.map(m => Number(m[1]));

        for (const port of ports) {
          const ok = await testLsConnection(port, csrf);
          if (ok) return ok;
        }
      }
    } catch (e) {}
  }

  // 2. 兜底扫描日志文件
  const candidates = [];
  for (const dir of logDirs) {
    try {
      const files = readdirSync(dir).filter(f => f.endsWith('.log'));
      for (const file of files) {
        const full = join(dir, file);
        try {
          const stat = statSync(full);
          candidates.push({ full, mtime: stat.mtimeMs });
        } catch (e) {}
      }
    } catch (e) {}
  }

  candidates.sort((a, b) => b.mtime - a.mtime);

  const PORT_RE = /listening on random port at (\d+) for HTTP/g;
  for (const item of candidates) {
    try {
      const content = readFileSync(item.full, 'utf8');
      const matches = [...content.matchAll(PORT_RE)];
      for (let i = matches.length - 1; i >= 0; i--) {
        const port = Number(matches[i][1]);
        const ok = await testLsConnection(port);
        if (ok) return ok;
      }
    } catch (e) {}
  }

  return null;
}

async function getQuota() {
  const now = Date.now();
  if (lastQuotaData && now - lastQuotaTime < 2000) {
    return lastQuotaData;
  }

  if (!cachedPort || !cachedCsrf) {
    const ls = await discoverLanguageServer();
    if (ls) {
      cachedPort = ls.port;
      cachedCsrf = ls.csrf;
      cachedProto = ls.protocol || 'http';
    }
  }

  if (!cachedPort || !cachedCsrf) {
    if (lastQuotaData) return lastQuotaData;
    throw new Error('Language server not detected or offline');
  }

  try {
    const res = await fetch(`${cachedProto}://127.0.0.1:${cachedPort}/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-codeium-csrf-token': cachedCsrf
      },
      body: '{}',
      signal: AbortSignal.timeout(2000)
    });

    if (!res.ok) {
      cachedPort = null;
      cachedCsrf = null;
      throw new Error(`HTTP ${res.status}`);
    }

    let userStatus = null;
    try {
      const uRes = await fetch(`${cachedProto}://127.0.0.1:${cachedPort}/exa.language_server_pb.LanguageServerService/GetUserStatus`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-codeium-csrf-token': cachedCsrf
        },
        body: '{}',
        signal: AbortSignal.timeout(1500)
      });
      if (uRes.ok) {
        userStatus = await uRes.json();
      }
    } catch (e) {}

    const us = (userStatus && (userStatus.userStatus ?? userStatus)) ?? {};
    const planInfo = (us.planStatus && us.planStatus.planInfo) ?? {};

    const data = await res.json();
    lastQuotaData = {
      port: cachedPort,
      protocol: cachedProto,
      timestamp: now,
      raw: data,
      account: {
        name: us.name || '',
        email: us.email || '',
        tier: planInfo.planTier || '',
        planName: planInfo.planName || ''
      },
      credits: us.credits || null,
      groups: data.groups || data.response?.groups || []
    };
    lastQuotaTime = now;

    try {
      historyStore.append({
        ok: true,
        ts: now,
        port: cachedPort,
        groups: (data.groups || data.response?.groups || []).map(g => ({
          name: g.displayName || '',
          buckets: (g.buckets || []).map(b => ({
            id: b.bucketId || b.displayName,
            remainingFraction: b.remainingFraction
          }))
        }))
      });
    } catch (e) {}

    return lastQuotaData;
  } catch (err) {
    cachedPort = null;
    cachedCsrf = null;
    if (lastQuotaData) return lastQuotaData;
    throw err;
  }
}

async function getConversations() {
  const now = Date.now();
  if (lastConvData && now - lastConvTime < 10000) {
    return lastConvData;
  }

  try {
    const dataDir = mkdtempSync(join(tmpdir(), 'au-conv-'));
    const result = await scanConversations({ dataDir, maxConversationScan: Infinity });
    lastConvData = {
      timestamp: now,
      ...result
    };
    lastConvTime = now;
    return lastConvData;
  } catch (err) {
    if (lastConvData) return lastConvData;
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-codeium-csrf-token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, port: cachedPort, time: Date.now() }));
    return;
  }

  if (url.pathname === '/api/quota') {
    try {
      const quota = await getQuota();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(quota));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, port: cachedPort }));
    }
    return;
  }

  if (url.pathname === '/api/conversations') {
    try {
      const conv = await getConversations();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(conv));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }
  if (url.pathname === '/api/history') {
    try {
      const range = url.searchParams.get('range') || '24h';
      const history = historyStore.query(range, 400);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(history));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/all') {
    try {
      const [quota, conv] = await Promise.allSettled([getQuota(), getConversations()]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        quota: quota.status === 'fulfilled' ? quota.value : { error: quota.reason?.message },
        conversations: conv.status === 'fulfilled' ? conv.value : { error: conv.reason?.message },
        serverPort: cachedPort,
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const filePath = join(process.cwd(), 'index.html');
      const content = readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading index.html: ' + e.message);
    }
    return;
  }

  if (url.pathname === '/hud' || url.pathname === '/hud.html') {
    try {
      const filePath = join(process.cwd(), 'hud.html');
      const content = readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading hud.html: ' + e.message);
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  try {
    writeFileSync('d:/CodePackage/DSPlug/antigravity-usage-panel/pid.txt', String(process.pid));
  } catch (e) {}
  console.log(`[Antigravity Quota Daemon] Running on http://127.0.0.1:${PORT}`);
  getQuota().then(q => {
    console.log(`[Daemon Initialized] Connected to language server on port ${q.port}`);
  }).catch(e => {
    console.warn(`[Daemon Initialized] Waiting for language server: ${e.message}`);
  });
});
