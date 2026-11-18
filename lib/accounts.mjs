import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function loadAccounts(filePath) {
  const map = new Map();
  try {
    if (!existsSync(filePath)) return map;
    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    if (!raw || typeof raw !== 'object') return map;
    const list = Array.isArray(raw) ? raw : Object.values(raw);
    for (const item of list) {
      if (item && typeof item.email === 'string' && item.email.trim()) {
        map.set(item.email.trim(), item);
      }
    }
  } catch {
    // Ignore corrupt cache file and start fresh.
  }
  return map;
}

export function saveAccounts(filePath, map) {
  try {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify(Object.fromEntries(map), null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export function upsertAccountSnapshot(map, quotaData, estimates = {}) {
  const email = quotaData?.account?.email?.trim();
  if (!email) return false;
  const groups = Array.isArray(quotaData.groups) ? quotaData.groups : [];
  if (groups.length === 0) return false;

  const existing = map.get(email) || {};
  const mergedEstimates = { ...(existing.estimates || {}), ...(estimates || {}) };

  map.set(email, {
    email,
    name: quotaData.account.name || existing.name || '',
    tier: quotaData.account.tier || existing.tier || '',
    planName: quotaData.account.planName || existing.planName || '',
    credits: quotaData.credits ?? existing.credits ?? null,
    groups,
    estimates: mergedEstimates,
    lastSeenAt: quotaData.timestamp || Date.now(),
    port: quotaData.port || existing.port || null
  });
  return true;
}

export function removeAccountSnapshot(map, email) {
  const key = (email || '').trim();
  if (!key) return false;
  return map.delete(key);
}

export function listAccountSummaries(map, activeEmail = '') {
  const active = (activeEmail || '').trim();
  return [...map.values()].sort((a, b) => {
    if (a.email === active && b.email !== active) return -1;
    if (b.email === active && a.email !== active) return 1;
    return (b.lastSeenAt || 0) - (a.lastSeenAt || 0);
  }).map(item => ({
    ...item,
    isActive: item.email === active
  }));
}
