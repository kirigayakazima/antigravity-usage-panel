import http from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const asar = require('@electron/asar');

const PORT = 19388;
const projectRoot = process.cwd();
const daemonScript = join(projectRoot, 'daemon.mjs');

function ping(timeout = 1000) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/api/ping`, { timeout }, (res) => {
      if (res.statusCode === 200) {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ ok: true, data: JSON.parse(body) });
          } catch (e) {
            resolve({ ok: true, raw: body });
          }
        });
      } else {
        resolve({ ok: false, status: res.statusCode });
      }
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
  });
}

async function ensureDaemon() {
  console.log('🔍 [Lifecycle Hook] 正在检查 19388 守护服务状态...');
  const check1 = await ping(800);
  if (check1.ok) {
    console.log(`✅ [Lifecycle Hook] 19388 守护服务已在运行 (LS Port: ${check1.data?.port || 'auto'})，跳过启动。`);
    return { ok: true, action: 'skipped' };
  }

  console.log('⚡ [Lifecycle Hook] 19388 服务未运行，生命周期钩子正在自愈拉起...');
  const child = spawn('node', [daemonScript], {
    cwd: projectRoot,
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref();

  // 轮询等待端口就绪 (最多等待 3 秒)
  for (let i = 0; i < 6; i++) {
    await new Promise(r => setTimeout(r, 500));
    const check2 = await ping(600);
    if (check2.ok) {
      console.log(`🎉 [Lifecycle Hook] 19388 守护服务已成功自愈激活并就绪！(耗时 ${(i + 1) * 500}ms)`);
      return { ok: true, action: 'started' };
    }
  }

  console.warn('⚠️ [Lifecycle Hook] 守护进程已尝试拉起，但 19388 端口响应稍慢，将在后台持续就绪。');
  return { ok: false, action: 'starting' };
}

function checkClientInjection() {
  const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
  const asarPath = join(localAppData, 'Programs', 'antigravity', 'resources', 'app.asar');
  if (!existsSync(asarPath)) return { installed: false, reason: 'app.asar not found' };

  try {
    const buf = asar.extractFile(asarPath, 'dist/preload.js');
    const preloadStr = buf.toString('utf8');
    const isV41 = preloadStr.includes('v4.1');
    const hasHook = preloadStr.includes('initAntigravityQuotaInjection');
    return { installed: true, isV41, hasHook };
  } catch (e) {
    return { installed: false, error: e.message };
  }
}

async function main() {
  console.log('====================================================');
  console.log('   Antigravity Usage Panel 交互生命周期自愈检查     ');
  console.log('====================================================');

  const daemonResult = await ensureDaemon();

  const clientStatus = checkClientInjection();
  console.log('🖥️ [Lifecycle Hook] 客户端注入状态:', clientStatus.isV41 ? 'v4.1 (纯白微晶 + 页面内大模态)' : '需更新');

  if (!clientStatus.isV41) {
    console.log('🔄 [Lifecycle Hook] 发现客户端注入未更新到 v4.1，自动执行 inject:install...');
    const { execSync } = await import('node:child_process');
    try {
      execSync('node ./bin/inject-install.mjs', { stdio: 'inherit', cwd: projectRoot });
    } catch (e) {
      console.error('❌ 自动安装注入失败:', e.message);
    }
  } else {
    console.log('✨ [Lifecycle Hook] 客户端注入代码已是最新 v4.1！');
  }

  console.log('====================================================');
  console.log('✅ 生命周期健康检查全部完成！');
  console.log('====================================================');
}

main().catch(console.error);
