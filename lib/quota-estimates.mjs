import { createHash } from 'node:crypto';

const HOUR = 3_600_000;
const WINDOWS = { '5h': 5 * HOUR, weekly: 7 * 24 * HOUR };
const MIN_USED = 0.05;
const MAX_SAMPLE_AGE = 14 * 24 * HOUR;

export function buildAccountTimeline(historySamples) {
  const timeline = [];
  for (const s of historySamples || []) {
    const account = typeof s?.a === 'string' ? s.a.trim().toLowerCase() : '';
    const at = s?.t;
    if (!account || !Number.isFinite(at)) continue;
    if (!timeline.length || timeline[timeline.length - 1].account !== account) {
      timeline.push({ at, account });
    }
  }
  return timeline;
}

function accountAtTime(timeline, ts) {
  if (!timeline || !timeline.length) return '';
  let lo = 0;
  let hi = timeline.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (timeline[mid].at <= ts) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans >= 0 ? timeline[ans].account : '';
}

// This converts observed local workload into an equivalent Token amount.
// The service reports a fraction, so we do not know its model or cache weights.
export function estimateQuota(quota, events, samples, now = Date.now(), accountTimeline = []) {
  const at = quota.timestamp;
  if (!Number.isFinite(at) || now - at > 30_000) return {};
  const account = quota.account?.email;
  const normAccount = account ? account.trim().toLowerCase() : '';
  const hasTimeline = Boolean(normAccount && Array.isArray(accountTimeline) && accountTimeline.length > 0);
  const estimates = {};
  for (const [key, sample] of samples) {
    if (!Number.isFinite(sample?.capacity) || !Number.isFinite(sample.at) || now - sample.at > MAX_SAMPLE_AGE) samples.delete(key);
  }
  for (const group of quota.groups || []) {
    for (const bucket of group.buckets || []) {
      const id = bucket.bucketId;
      const isArgon = /argon/i.test(id) || /argon/i.test(group.displayName);
      const model = isArgon
        ? /argon/i
        : (id?.startsWith('gemini-') ? /^gemini-(?!.*argon)/i : id?.startsWith('3p-') ? /^(claude|gpt)-/i : null);
      const duration = WINDOWS[bucket.window];
      const fraction = bucket.remainingFraction;
      if (!model || !duration || typeof fraction !== 'number' || !(fraction >= 0 && fraction <= 1)) continue;

      const reset = Date.parse(bucket.resetTime);
      const start = reset - duration;
      const used = 1 - fraction;
      const key = account ? createHash('sha256')
        .update(JSON.stringify([account, quota.account.planName || quota.account.tier, id])).digest('hex') : null;
      const previous = key ? samples.get(key) : null;
      let sample;
      let source;
      if (start <= at && at < reset && used >= MIN_USED) {
        let tokens = 0;
        let calls = 0;
        for (const event of events) {
          if (event.at >= start && event.at <= at && event.tokens > 0 && model.test(event.model)) {
            if (hasTimeline) {
              const owner = accountAtTime(accountTimeline, event.at);
              if (owner && owner !== normAccount) continue;
            }
            tokens += event.tokens;
            calls += 1;
          }
        }
        if (calls >= 3 && tokens >= 1000) {
          sample = { capacity: Math.round(tokens / used), tokens, calls, at, start };
          source = 'current';
          if (key) samples.set(key, sample);
        }
      }
      if (!sample && previous) {
        sample = previous;
        source = 'recent';
      }
      if (sample) {
        estimates[id] = { ...sample, source, remaining: Math.round(sample.capacity * fraction) };
      }
    }
  }
  return estimates;
}

