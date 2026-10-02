import http from 'node:http';
import { readdirSync, readFileSync, statSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { scanConversations } from './lib/conversations.js';

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

const PORT = 19388;
const home = homedir();
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
let lastQuotaData = null;
let lastQuotaTime = 0;
let lastConvData = null;
let lastConvTime = 0;

function findLanguageServerPort() {
  const PORT_RE = /listening on random port at (\d+) for HTTP(?!S)/;
  let candidates = [];

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

  for (const item of candidates) {
    try {
      const content = readFileSync(item.full, 'utf8');
      const matches = [...content.matchAll(new RegExp(PORT_RE, 'g'))];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        return Number(lastMatch[1]);
      }
    } catch (e) {}
  }
  return null;
}

async function getCsrfToken(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) });
    const html = await res.text();
    const match = html.match(/csrfToken":"([^"]+)"/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

async function getQuota() {
  const now = Date.now();
  if (lastQuotaData && now - lastQuotaTime < 2000) {
    return lastQuotaData;
  }

  let port = cachedPort;
  let csrf = cachedCsrf;

  if (!port || !csrf) {
    port = findLanguageServerPort();
    if (port) {
      csrf = await getCsrfToken(port);
      if (csrf) {
        cachedPort = port;
        cachedCsrf = csrf;
      }
    }
  }

  if (!port || !csrf) {
    if (lastQuotaData) return lastQuotaData;
    throw new Error('Language server not detected or offline');
  }

  try {
    const res = await fetch(`http://127.0.0.1:${port}/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-codeium-csrf-token': csrf
      },
      body: '{}',
      signal: AbortSignal.timeout(2000)
    });

    if (!res.ok) {
      cachedCsrf = null;
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    lastQuotaData = {
      port,
      timestamp: now,
      raw: data,
      groups: data.groups || data.response?.groups || []
    };
    lastQuotaTime = now;
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
    const result = await scanConversations({ dataDir });
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
