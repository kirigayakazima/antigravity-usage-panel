import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  loadAccounts,
  saveAccounts,
  upsertAccountSnapshot,
  removeAccountSnapshot,
  listAccountSummaries
} from '../lib/accounts.mjs';
import { HistoryStore } from '../lib/history.js';

test('accounts store saves, updates, sorts active first, and removes snapshots', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agy-accounts-'));
  const file = join(dir, 'panel-accounts.json');
  try {
    const map = loadAccounts(file);
    assert.equal(map.size, 0);

    const quotaA = {
      timestamp: 1000,
      port: 1111,
      account: { email: 'a@example.com', name: 'Alice', planName: 'Pro' },
      credits: { promptAvailable: 100, promptMonthly: 500 },
      groups: [{ displayName: 'Gemini', buckets: [{ bucketId: 'gemini-5h', remainingFraction: 0.8 }] }]
    };
    const quotaB = {
      timestamp: 2000,
      port: 2222,
      account: { email: 'b@example.com', name: 'Bob', planName: 'Free' },
      credits: null,
      groups: [{ displayName: 'Gemini', buckets: [{ bucketId: 'gemini-5h', remainingFraction: 0.4 }] }]
    };

    assert.equal(upsertAccountSnapshot(map, quotaA, { 'gemini-5h': { capacity: 1000, remaining: 800 } }), true);
    assert.equal(upsertAccountSnapshot(map, quotaB, {}), true);
    assert.equal(saveAccounts(file, map), true);

    const reloaded = loadAccounts(file);
    const listA = listAccountSummaries(reloaded, 'a@example.com');
    assert.equal(listA.length, 2);
    assert.equal(listA[0].email, 'a@example.com');
    assert.equal(listA[0].isActive, true);
    assert.equal(listA[1].email, 'b@example.com');
    assert.equal(listA[1].isActive, false);

    assert.equal(removeAccountSnapshot(reloaded, 'b@example.com'), true);
    assert.equal(listAccountSummaries(reloaded, 'a@example.com').length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('HistoryStore isolates samples and consumption by account', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agy-history-'));
  try {
    const store = new HistoryStore(dir, 30);
    const now = Date.now();
    store.append({
      ok: true,
      ts: now - 10_000,
      account: 'a@example.com',
      groups: [{ name: 'Gemini', buckets: [{ id: 'gemini-5h', remainingFraction: 0.9 }] }]
    });
    store.append({
      ok: true,
      ts: now - 5_000,
      account: 'b@example.com',
      groups: [{ name: 'Gemini', buckets: [{ id: 'gemini-5h', remainingFraction: 0.2 }] }]
    });
    store.append({
      ok: true,
      ts: now,
      account: 'a@example.com',
      groups: [{ name: 'Gemini', buckets: [{ id: 'gemini-5h', remainingFraction: 0.7 }] }]
    });

    const qA = store.query('24h', 100, 'a@example.com');
    assert.equal(qA.sampleCount, 2);
    assert.deepEqual(qA.accounts.sort(), ['a@example.com', 'b@example.com']);
    assert.ok(Math.abs(qA.buckets[0].consumed - 0.2) < 1e-6);

    const qB = store.query('24h', 100, 'b@example.com');
    assert.equal(qB.sampleCount, 1);
    assert.equal(qB.buckets[0].consumed, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
