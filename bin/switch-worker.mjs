import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const vaultScript = join(projectRoot, 'bin', 'cred-vault.ps1');
const metaDir = join(homedir(), '.dsh', 'antigravity-usage');
const logFile = join(metaDir, 'vault.log');
const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
const appPath = join(localAppData, 'Programs', 'antigravity', 'Antigravity.exe');

function log(msg) {
  try {
    mkdirSync(metaDir, { recursive: true });
    const line = `[${new Date().toLocaleString('sv-SE')}] ${msg}\n`;
    appendFileSync(logFile, line, 'utf8');
  } catch {}
}

function runPsVault(args) {
  const out = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', vaultScript, ...args],
    { encoding: 'utf8', timeout: 15_000, windowsHide: true }
  );
  return JSON.parse((out || '').trim());
}

function stopAntigravity() {
  log('Stopping Antigravity and language_server...');
  for (const image of ['Antigravity.exe', 'language_server.exe']) {
    try {
      execFileSync('taskkill.exe', ['/F', '/T', '/IM', image], {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
        stdio: 'ignore'
      });
    } catch {}
  }
}

function waitUntilExited(maxMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const out = execFileSync('tasklist.exe', ['/FI', 'IMAGENAME eq Antigravity.exe', '/NH'], {
        encoding: 'utf8',
        timeout: 2000,
        windowsHide: true
      });
      if (!out.toLowerCase().includes('antigravity.exe')) return true;
    } catch {
      return true;
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
  }
  return false;
}

function launchAntigravity() {
  if (!existsSync(appPath)) {
    throw new Error(`Antigravity.exe not found at ${appPath}`);
  }
  const proxy = process.env.AGY_PROXY_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890';
  const env = {
    ...process.env,
    HTTP_PROXY: process.env.HTTP_PROXY || proxy,
    HTTPS_PROXY: process.env.HTTPS_PROXY || proxy,
    ALL_PROXY: process.env.ALL_PROXY || proxy,
    NO_PROXY: process.env.NO_PROXY || 'localhost,127.0.0.1'
  };
  log(`Launching Antigravity with proxy HTTP_PROXY=${env.HTTP_PROXY}, NO_PROXY=${env.NO_PROXY}`);
  const child = spawn(appPath, [], {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
    env
  });
  child.unref();
  log(`Launched Antigravity PID=${child.pid || 'unknown'}`);
}

const [, , action, targetEmail = '', currentEmail = ''] = process.argv;

try {
  if (action === 'selftest') {
    const res = runPsVault(['list']);
    log(`Selftest ok: items=${(res.items || []).length}, hasActive=${res.hasActive}`);
    process.exit(0);
  }

  if (action === 'switch') {
    const target = targetEmail.trim().toLowerCase();
    const cur = currentEmail.trim().toLowerCase();
    log(`Switch worker started -> ${target} (current: ${cur || 'none'})`);

    if (cur && cur !== target) {
      try {
        const bak = runPsVault(['backup', cur]);
        log(`Pre-switch backup for ${cur}: ok=${bak.ok}`);
      } catch (e) {
        log(`Pre-switch backup warning: ${e.message}`);
      }
    }

    stopAntigravity();
    const exited = waitUntilExited(5000);
    log(`Antigravity exited cleanly: ${exited}`);

    const res = runPsVault(['restore-only', target]);
    log(`Credential restored for ${target}: ok=${res.ok}, blobSize=${res.blobSize}`);

    launchAntigravity();
    process.exit(0);
  }

  if (action === 'prepare-add') {
    const cur = currentEmail.trim().toLowerCase();
    log(`Prepare-add worker started (current: ${cur || 'none'})`);

    if (cur) {
      const bak = runPsVault(['backup', cur]);
      log(`Backed up ${cur}: ok=${bak.ok}`);
      if (!bak.ok) throw new Error(bak.error || 'Backup failed');
    }

    stopAntigravity();
    const exited = waitUntilExited(5000);
    log(`Antigravity exited cleanly: ${exited}`);

    const res = runPsVault(['clear-active']);
    log(`Cleared active credential: ok=${res.ok}`);

    launchAntigravity();
    process.exit(0);
  }

  throw new Error(`Unknown action: ${action}`);
} catch (err) {
  log(`ERROR in switch-worker (${action}): ${err?.stack || err?.message || err}`);
  process.exit(1);
}
