// antigravity-usage-panel — 前端逻辑
const $ = (id) => document.getElementById(id);

let countdownTargetMs = null;
let countdownTimer = null;

function formatCountdown(targetMs) {
  if (!targetMs) return '--:--';
  const diff = Math.max(0, targetMs - Date.now());
  const totalSec = Math.floor(diff / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}h ${m}m ${s}s`;
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (countdownTargetMs) {
      $('gemini-5h-timer').textContent = formatCountdown(countdownTargetMs);
    }
  }, 1000);
}

async function callApi(path, options = {}) {
  // window.sidecar.fetch 自动注入授权令牌，若独立测试则退化为普通 fetch
  const fetcher = (window.sidecar && typeof window.sidecar.fetch === 'function') 
    ? window.sidecar.fetch.bind(window.sidecar) 
    : window.fetch.bind(window);

  const res = await fetcher(path, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function renderQuota(data) {
  if (!data.ok) {
    $('port-status').textContent = `连接异常: ${data.error || '未运行'}`;
    $('port-status').style.color = '#f87171';
    $('gemini-status').className = 'badge badge-err';
    $('gemini-status').textContent = '离线';
    return;
  }

  $('port-status').textContent = `语言服务器正常 (Port ${data.port})`;
  $('port-status').style.color = '#34d399';
  $('user-name').textContent = data.account.name || 'Antigravity User';
  $('user-plan').textContent = `${data.account.planName} 订阅`;

  // 遍历分组
  const geminiGroup = (data.groups || []).find(g => g.name.toLowerCase().includes('gemini'));
  if (geminiGroup) {
    const b5h = geminiGroup.buckets.find(b => b.window === '5h' || b.id.includes('5h'));
    const bWeek = geminiGroup.buckets.find(b => b.window === 'weekly' || b.id.includes('weekly'));

    if (b5h) {
      const pct = (b5h.remainingFraction * 100).toFixed(1);
      $('gemini-5h-val').textContent = `${pct}%`;
      $('gemini-5h-bar').style.width = `${pct}%`;
      if (b5h.resetTime) {
        countdownTargetMs = Date.parse(b5h.resetTime);
        $('gemini-5h-timer').textContent = formatCountdown(countdownTargetMs);
      }
    }

    if (bWeek) {
      const pct = (bWeek.remainingFraction * 100).toFixed(1);
      $('gemini-week-val').textContent = `${pct}%`;
      $('gemini-week-bar').style.width = `${pct}%`;
      if (bWeek.description) {
        $('gemini-week-desc').textContent = bWeek.description.replace('You have used some of your weekly limit, ', '');
      }
    }
  }

  // 3p 组 (Claude & GPT)
  const claudeGroup = (data.groups || []).find(g => g.name.toLowerCase().includes('claude') || g.name.toLowerCase().includes('gpt'));
  if (claudeGroup) {
    const b5h = claudeGroup.buckets.find(b => b.window === '5h' || b.id.includes('5h'));
    const bWeek = claudeGroup.buckets.find(b => b.window === 'weekly' || b.id.includes('weekly'));
    if (b5h) {
      const pct = (b5h.remainingFraction * 100).toFixed(0);
      $('claude-5h-val').textContent = `${pct}%`;
      $('claude-5h-bar').style.width = `${pct}%`;
    }
    if (bWeek) {
      const pct = (bWeek.remainingFraction * 100).toFixed(0);
      $('claude-week-val').textContent = `${pct}%`;
      $('claude-week-bar').style.width = `${pct}%`;
    }
  }

  // Credits
  if (data.credits) {
    $('prompt-avail').textContent = data.credits.promptAvailable.toLocaleString();
    $('prompt-total').textContent = `/ ${data.credits.promptMonthly.toLocaleString()}`;
    $('flow-avail').textContent = data.credits.flowAvailable.toLocaleString();
    $('flow-total').textContent = `/ ${data.credits.flowMonthly.toLocaleString()}`;
  }

  $('last-sync').textContent = `更新于 ${new Date().toLocaleTimeString()}`;
}

async function refresh(force = false) {
  const btn = $('refresh-btn');
  btn.classList.add('spinning');
  try {
    const data = force 
      ? await callApi('/api/refresh', { method: 'POST' }) 
      : await callApi('/api/quota');
    renderQuota(data);
  } catch (err) {
    $('port-status').textContent = '请求失败: ' + err.message;
  } finally {
    btn.classList.remove('spinning');
  }
}

$('refresh-btn').addEventListener('click', () => refresh(true));

// 启动
startCountdown();
refresh();
setInterval(() => refresh(false), 5000);
