import http from 'node:http';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { scanConversations } from './lib/conversations.js';
import { HistoryStore } from './lib/history.js';
import { estimateQuota, buildAccountTimeline } from './lib/quota-estimates.mjs';
import { loadAccounts, saveAccounts, upsertAccountSnapshot, removeAccountSnapshot, listAccountSummaries } from './lib/accounts.mjs';
import {
  isVaultSupported,
  listVaultCredentials,
  backupAccountCredential,
  switchAccountCredential,
  prepareAddAccount,
  deleteVaultCredential,
  mergeVaultStatus
} from './lib/credential-vault.mjs';

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

import { execFileSync, execSync } from 'node:child_process';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PORT = 19388;
const home = homedir();
const historyDir = join(home, '.dsh', 'antigravity-usage');
const conversationCacheDir = join(historyDir, 'panel-cache');
const quotaSamplesFile = join(historyDir, 'panel-quota-samples.json');
const accountsFile = join(historyDir, 'panel-accounts.json');
const accountsMap = loadAccounts(accountsFile);
let lastAccountsSave = 0;
let lastActiveEmail = '';
const autoBackedUpEmails = new Map();
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
let conversationScan;
let tokenEvents = [];
const quotaSamples = new Map();
try {
  for (const [key, sample] of Object.entries(JSON.parse(readFileSync(quotaSamplesFile, 'utf8')))) {
    quotaSamples.set(key, sample);
  }
} catch {}

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
  // 1. Antigravity 2.34.0+ 优先从 Local Storage (LevelDB) 扫描最新的 agy_session_csrf_token 与端口 (2ms 秒连)
  try {
    const levelDbDir = join(appData, 'Antigravity', 'Local Storage', 'leveldb');
    const files = readdirSync(levelDbDir).map(f => ({ path: join(levelDbDir, f), mtime: statSync(join(levelDbDir, f)).mtimeMs }));
    files.sort((a, b) => b.mtime - a.mtime);
    const TOKEN_RE = /agy_session_csrf_token[^\w-]*([a-f0-9\-]{36})[^\n]*?https:\/\/127\.0\.0\.1:(\d+)/gi;
    const candidates = [];
    for (const { path } of files) {
      try {
        const text = readFileSync(path).toString('latin1');
        for (const m of text.matchAll(TOKEN_RE)) {
          candidates.push({ csrf: m[1], port: Number(m[2]) });
        }
      } catch {}
    }
    for (const { port, csrf } of candidates.reverse()) {
      const ok = await testLsConnection(port, csrf);
      if (ok) return ok;
    }
  } catch {}

  // 2. Windows: 进程命令行与端口发现（优先 wmic，兜底 PowerShell Get-CimInstance）
  if (process.platform === 'win32') {
    let pid = null;
    let csrf = null;

    try {
      const wmicOut = execSync('wmic process where "name=\'language_server.exe\'" get ProcessId,CommandLine /format:list', {
        encoding: 'utf8',
        timeout: 1500,
        windowsHide: true
      });
      const pidMatch = wmicOut.match(/ProcessId=(\d+)/i);
      const cmdMatch = wmicOut.match(/CommandLine=(.+)/i);
      if (pidMatch) pid = pidMatch[1];
      if (cmdMatch) {
        const csrfMatch = cmdMatch[1].match(/--csrf_token\s+([a-f0-9\-]+)/i);
        if (csrfMatch) csrf = csrfMatch[1];
      }
    } catch {}

    if (!pid || !csrf) {
      try {
        const psOut = execFileSync('powershell.exe', [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          'Get-CimInstance Win32_Process -Filter "name=\'language_server.exe\'" | Select-Object -Property ProcessId, CommandLine | Format-List'
        ], { encoding: 'utf8', timeout: 3500, windowsHide: true });
        const pidMatch = psOut.match(/ProcessId\s*:\s*(\d+)/i);
        const csrfMatch = psOut.match(/--csrf_token\s+([a-f0-9\-]+)/i);
        if (pidMatch) pid = pidMatch[1];
        if (csrfMatch) csrf = csrfMatch[1];
      } catch {}
    }

    if (pid && csrf) {
      try {
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
      } catch {}
    }
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
        const ok = await testLsConnection(port, cachedCsrf);
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
      const email = us.email || '';
      if (upsertAccountSnapshot(accountsMap, lastQuotaData, {})) {
        if (email !== lastActiveEmail || now - lastAccountsSave > 15_000) {
          saveAccounts(accountsFile, accountsMap);
          lastAccountsSave = now;
          lastActiveEmail = email;
        }
      }
      if (email && isVaultSupported()) {
        const lastBak = autoBackedUpEmails.get(email.toLowerCase()) || 0;
        if (now - lastBak > 10 * 60_000) {
          autoBackedUpEmails.set(email.toLowerCase(), now);
          backupAccountCredential(email).catch(() => {});
        }
      }
      historyStore.append({
        ok: true,
        ts: now,
        port: cachedPort,
        account: email,
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

  if (!conversationScan) {
    conversationScan = scanConversations({ dataDir: conversationCacheDir, maxConversationScan: Infinity, includeTokenEvents: true })
      .then(({ tokenEvents: events, ...result }) => {
        tokenEvents = events || [];
        lastConvTime = Date.now();
        lastConvData = { timestamp: lastConvTime, ...result };
        return lastConvData;
      })
      .finally(() => { conversationScan = null; });
  }
  return conversationScan;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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

  if (url.pathname === '/api/ls-auth' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { port, csrf } = JSON.parse(body);
        if (port && csrf) {
          const ok = await testLsConnection(Number(port), csrf);
          if (ok) {
            cachedPort = ok.port;
            cachedCsrf = ok.csrf;
            cachedProto = ok.protocol || 'https';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, port: cachedPort }));
            return;
          }
        }
      } catch {}
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false }));
    });
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

  if (url.pathname === '/api/accounts') {
    if (req.method === 'DELETE') {
      const email = url.searchParams.get('email') || '';
      const removed = removeAccountSnapshot(accountsMap, email);
      if (removed) saveAccounts(accountsFile, accountsMap);
      const activeEmail = lastQuotaData?.account?.email || '';
      const vault = await listVaultCredentials();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        removed,
        activeEmail,
        vaultSupported: isVaultSupported(),
        accounts: mergeVaultStatus(listAccountSummaries(accountsMap, activeEmail), vault.items)
      }));
      return;
    }
    try {
      await getQuota().catch(() => null);
      const activeEmail = lastQuotaData?.account?.email || '';
      const vault = await listVaultCredentials();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        activeEmail,
        vaultSupported: isVaultSupported(),
        accounts: mergeVaultStatus(listAccountSummaries(accountsMap, activeEmail), vault.items)
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message, accounts: [] }));
    }
    return;
  }

  if (url.pathname === '/api/accounts/backup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        await getQuota().catch(() => null);
        let reqEmail = '';
        try { reqEmail = JSON.parse(body || '{}').email || ''; } catch {}
        const targetEmail = (reqEmail || lastQuotaData?.account?.email || '').trim();
        const result = await backupAccountCredential(targetEmail);
        const activeEmail = lastQuotaData?.account?.email || '';
        const vault = await listVaultCredentials(true);
        res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ...result,
          activeEmail,
          vaultSupported: isVaultSupported(),
          accounts: mergeVaultStatus(listAccountSummaries(accountsMap, activeEmail), vault.items)
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/accounts/switch' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const targetEmail = (parsed.email || '').trim();
        const activeEmail = lastQuotaData?.account?.email || '';
        const result = await switchAccountCredential(targetEmail, activeEmail);
        if (result.ok) {
          cachedPort = null;
          cachedCsrf = null;
          lastQuotaData = null;
          lastQuotaTime = 0;
        }
        res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/accounts/prepare-add' && req.method === 'POST') {
    try {
      await getQuota().catch(() => null);
      const activeEmail = lastQuotaData?.account?.email || '';
      const result = await prepareAddAccount(activeEmail);
      if (result.ok) {
        cachedPort = null;
        cachedCsrf = null;
        lastQuotaData = null;
        lastQuotaTime = 0;
      }
      res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/accounts/vault' && req.method === 'DELETE') {
    try {
      const email = url.searchParams.get('email') || '';
      const result = await deleteVaultCredential(email);
      const activeEmail = lastQuotaData?.account?.email || '';
      const vault = await listVaultCredentials(true);
      res.writeHead(result.ok ? 200 : 400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ...result,
        activeEmail,
        vaultSupported: isVaultSupported(),
        accounts: mergeVaultStatus(listAccountSummaries(accountsMap, activeEmail), vault.items)
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/quota-estimates') {
    try {
      const [, quota] = await Promise.all([getConversations(), getQuota()]);
      const accountTimeline = buildAccountTimeline(historyStore.samples);
      const estimates = estimateQuota(quota, tokenEvents, quotaSamples, Date.now(), accountTimeline);
      if (Object.values(estimates).some(sample => sample.source === 'current')) {
        try { writeFileSync(quotaSamplesFile, JSON.stringify(Object.fromEntries(quotaSamples)), 'utf8'); } catch {}
      }
      if (upsertAccountSnapshot(accountsMap, quota, estimates)) {
        saveAccounts(accountsFile, accountsMap);
        lastAccountsSave = Date.now();
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ estimates }));
    } catch {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ estimates: {} }));
    }
    return;
  }
  if (url.pathname === '/api/history') {
    try {
      const range = url.searchParams.get('range') || '24h';
      const account = url.searchParams.get('account') || '';
      const history = historyStore.query(range, 400, account);
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
