import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateQuota } from '../lib/quota-estimates.mjs';

const hour = 3600000;
const at = Date.parse('2026-11-07T03:00:00Z');
const resetTime = new Date(at + 2 * hour).toISOString();
const gemini = { bucketId: 'gemini-5h', window: '5h', remainingFraction: 0.75, resetTime };
const weekly = { bucketId: 'gemini-weekly', window: 'weekly', remainingFraction: 0.5, resetTime };
const third = { bucketId: '3p-5h', window: '5h', remainingFraction: 0.75, resetTime };
const quota = (buckets, email = 'local@example.invalid') => ({ timestamp: at, account: { email }, groups: [{ buckets }] });
const event = (delta, tokens, model = 'gemini-3') => ({ at: at + delta, tokens, model });
const events = [
  event(-3 * hour - 1, 6000), // belongs to the weekly window only
  event(-3 * hour, 1000), event(-hour, 2000), event(0, 3000),
  event(1, 1e6), // metadata arrived after the quota sample
  event(-hour, 6000, 'gpt-5'), event(-hour, 1e6, 'unrecognized-model')
];

test('5h and weekly references match only the correct model and exact time window', () => {
  const estimates = estimateQuota(quota([gemini, weekly, third]), events, new Map(), at);
  assert.equal(estimates['gemini-5h'].capacity, 24000);
  assert.equal(estimates['gemini-5h'].remaining, 18000);
  assert.equal(estimates['gemini-weekly'].capacity, 24000);
  assert.equal(estimates['gemini-weekly'].remaining, 12000);
  assert.equal(estimates['3p-5h'], undefined, 'one call is insufficient');
});

test('no fabricated estimates for stale, empty, tiny, or unrecognized windows', () => {
  const estimate = (bucket, timestamp = at) => estimateQuota(quota([bucket]), events, new Map(), timestamp);
  assert.deepEqual(estimate(gemini, at + 31000), {});
  assert.deepEqual(estimate({ ...gemini, window: 'other' }), {});
  assert.deepEqual(estimate({ ...gemini, remainingFraction: 1 }), {});
  assert.deepEqual(estimate({ ...gemini, remainingFraction: 0.999 }), {});
  assert.deepEqual(estimate({ ...gemini, resetTime: 'invalid' }), {});
});

test('a full window can reuse a recent valid sample from the same account and bucket', () => {
  const samples = new Map();
  estimateQuota(quota([gemini]), events, samples, at);
  const full = { ...gemini, remainingFraction: 1 };
  const result = estimateQuota(quota([full]), [], samples, at)['gemini-5h'];
  assert.equal(result.source, 'recent');
  assert.equal(result.remaining, result.capacity);
  assert.deepEqual(estimateQuota(quota([full], 'other@example.invalid'), [], samples, at), {});
});
