import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateQuota, buildAccountTimeline } from '../lib/quota-estimates.mjs';

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

test('argon bucket only matches argon models and isolates its capacity from standard gemini', () => {
  const argonBucket = { bucketId: 'gemini-argon-wtu-weekly', window: 'weekly', remainingFraction: 0.8, resetTime };
  const argonGroup = { displayName: 'Gemini 4 Argon', buckets: [argonBucket] };
  const standardGroup = { displayName: 'Gemini Models', buckets: [gemini, weekly] };
  const q = { timestamp: at, account: { email: 'local@example.invalid' }, groups: [standardGroup, argonGroup] };

  const argonEvents = [
    ...events,
    event(-hour, 2000, 'gemini-4-argon'),
    event(-2 * hour, 3000, 'gemini-4-argon-trial'),
    event(-3 * hour, 5000, 'gemini-4-argon')
  ];

  const estimates = estimateQuota(q, argonEvents, new Map(), at);

  // Standard gemini should NOT count argon models:
  // standard gemini-5h window: (-3h, -1h, 0h) gemini-3 tokens: 1000 + 2000 + 3000 = 6000.
  // used = 1 - 0.75 = 0.25 -> capacity = 24000. (Argon 2000, 3000 not counted!)
  assert.equal(estimates['gemini-5h'].capacity, 24000);

  // Argon weekly window: 2000 + 3000 + 5000 = 10000.
  // used = 1 - 0.8 = 0.2 -> capacity = 10000 / 0.2 = 50000.
  // remaining = 50000 * 0.8 = 40000.
  assert.equal(estimates['gemini-argon-wtu-weekly'].capacity, 50000);
  assert.equal(estimates['gemini-argon-wtu-weekly'].remaining, 40000);
  assert.equal(estimates['gemini-argon-wtu-weekly'].tokens, 10000);
  assert.equal(estimates['gemini-argon-wtu-weekly'].calls, 3);
});

test('account timeline excludes token events generated while another account was active', () => {
  const timeline = buildAccountTimeline([
    { t: at - 4 * hour, a: 'acctA@example.invalid' },
    { t: at - 2 * hour, a: 'acctB@example.invalid' },
    { t: at - hour, a: 'acctA@example.invalid' }
  ]);
  const mixedEvents = [
    event(-3 * hour, 1000, 'gemini-3'),      // acctA
    event(-1.5 * hour, 90000, 'gemini-3'),   // acctB -> must be excluded for acctA!
    event(-0.5 * hour, 2000, 'gemini-3'),    // acctA
    event(0, 3000, 'gemini-3')               // acctA
  ];
  const estimates = estimateQuota(quota([gemini], 'acctA@example.invalid'), mixedEvents, new Map(), at, timeline);
  // Only acctA's 1000 + 2000 + 3000 = 6000 tokens should count (used 25% -> 24000 capacity)
  assert.equal(estimates['gemini-5h'].tokens, 6000);
  assert.equal(estimates['gemini-5h'].calls, 3);
  assert.equal(estimates['gemini-5h'].capacity, 24000);
});
