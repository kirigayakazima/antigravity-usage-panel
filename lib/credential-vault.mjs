import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const vaultScript = join(projectRoot, 'bin', 'cred-vault.ps1');
const switchWorker = join(projectRoot, 'bin', 'switch-worker.mjs');

let cachedVault = null;
let cachedAt = 0;
const CACHE_TTL_MS = 15_000;

export function isVaultSupported() {
  return process.platform === 'win32' && existsSync(vaultScript);
}

function runVaultScript(args, timeoutMs = 15_000) {
  return new Promise((resolvePromise, rejectPromise) => {
    if (!isVaultSupported()) {
      resolvePromise({ ok: false, error: '仅支持 Windows 凭据管理器环境' });
      return;
    }
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', vaultScript, ...args],
      { encoding: 'utf8', timeout: timeoutMs, windowsHide: true },
      (err, stdout, stderr) => {
        const text = (stdout || '').trim();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            resolvePromise(parsed);
            return;
          } catch {}
        }
        if (err) {
          resolvePromise({ ok: false, error: (stderr || err.message || 'Vault command failed').trim() });
          return;
        }
        resolvePromise({ ok: false, error: 'Empty vault response' });
      }
    );
  });
}

function escapePsSingle(s) {
  return String(s ?? '').replace(/'/g, "''");
}

function spawnDetachedVaultScript(args) {
  return new Promise((resolvePromise) => {
    if (!isVaultSupported()) {
      resolvePromise({ ok: false, error: '仅支持 Windows 凭据管理器环境' });
      return;
    }
    // Launch node.exe (switch-worker.mjs) via WMI Win32_Process.Create with ShowWindow=0
    // so it runs silently outside Antigravity's Job Object without PowerShell console quirks.
    const argStr = args.map(a => `"${String(a ?? '').replace(/"/g, '\\"')}"`).join(' ');
    const targetCmd = `"${process.execPath}" "${switchWorker}" ${argStr}`;
    const psLauncher = [
      '$ErrorActionPreference = "Stop"',
      '$si = New-CimInstance -ClassName Win32_ProcessStartup -Property @{ ShowWindow = [uint16]0 } -ClientOnly',
      `$r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = '${escapePsSingle(targetCmd)}'; CurrentDirectory = '${escapePsSingle(projectRoot)}'; ProcessStartupInformation = $si }`,
      '$pidVal = if ($r.ProcessId) { $r.ProcessId } else { 0 }',
      '@{ ok = ($r.ReturnValue -eq 0); returnValue = $r.ReturnValue; pid = $pidVal } | ConvertTo-Json -Compress'
    ].join('; ');
    const encoded = Buffer.from(psLauncher, 'utf16le').toString('base64');
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded],
      { encoding: 'utf8', timeout: 8000, windowsHide: true, cwd: projectRoot },
      (err, stdout, stderr) => {
        const text = (stdout || '').trim();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.ok) {
              resolvePromise({ ok: true, launched: true, pid: parsed.pid });
              return;
            }
            resolvePromise({ ok: false, error: `WMI Create failed (code ${parsed.returnValue})` });
            return;
          } catch {}
        }
        resolvePromise({ ok: false, error: (stderr || err?.message || 'WMI launch failed').trim() });
      }
    );
  });
}

export function invalidateVaultCache() {
  cachedVault = null;
  cachedAt = 0;
}

export async function listVaultCredentials(force = false) {
  if (!isVaultSupported()) return { ok: false, hasActive: false, items: [] };
  const now = Date.now();
  if (!force && cachedVault && now - cachedAt < CACHE_TTL_MS) {
    return cachedVault;
  }
  const res = await runVaultScript(['list'], 10_000);
  if (res.ok) {
    cachedVault = {
      ok: true,
      hasActive: Boolean(res.hasActive),
      items: Array.isArray(res.items) ? res.items : []
    };
    cachedAt = now;
    return cachedVault;
  }
  return cachedVault || { ok: false, hasActive: false, items: [], error: res.error };
}

export async function backupAccountCredential(email) {
  const clean = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!clean) return { ok: false, error: '缺少账号邮箱' };
  const res = await runVaultScript(['backup', clean], 10_000);
  if (res.ok) invalidateVaultCache();
  return res;
}

export async function deleteVaultCredential(email) {
  const clean = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!clean) return { ok: false, error: '缺少账号邮箱' };
  const res = await runVaultScript(['delete', clean], 10_000);
  if (res.ok) invalidateVaultCache();
  return res;
}

export async function switchAccountCredential(targetEmail, currentEmail = '') {
  const target = typeof targetEmail === 'string' ? targetEmail.trim().toLowerCase() : '';
  const current = typeof currentEmail === 'string' ? currentEmail.trim().toLowerCase() : '';
  if (!target) return { ok: false, error: '缺少目标账号邮箱' };

  const vault = await listVaultCredentials(true);
  const exists = (vault.items || []).some(item => item.email === target);
  if (!exists) {
    return { ok: false, error: `未找到 ${target} 的本地备份凭据，请先登录该账号完成备份` };
  }

  invalidateVaultCache();
  const args = current ? ['switch', target, current] : ['switch', target];
  const launched = await spawnDetachedVaultScript(args);
  if (!launched.ok) return launched;
  return { ok: true, switchingTo: target, restarting: true, pid: launched.pid };
}

export async function prepareAddAccount(currentEmail = '') {
  const current = typeof currentEmail === 'string' ? currentEmail.trim().toLowerCase() : '';
  invalidateVaultCache();
  const args = current ? ['prepare-add', '', current] : ['prepare-add'];
  const launched = await spawnDetachedVaultScript(args);
  if (!launched.ok) return launched;
  return { ok: true, backedUp: current || null, restarting: true, pid: launched.pid };
}

export function mergeVaultStatus(accounts, vaultItems = []) {
  const byEmail = new Map();
  for (const item of vaultItems || []) {
    if (item?.email) byEmail.set(item.email.toLowerCase(), item);
  }
  return (accounts || []).map(acct => {
    const key = (acct?.email || '').toLowerCase();
    const v = byEmail.get(key);
    return {
      ...acct,
      hasVault: Boolean(v),
      vaultSavedAt: v?.savedAt || null
    };
  });
}
