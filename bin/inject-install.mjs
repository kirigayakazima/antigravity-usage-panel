import { existsSync, copyFileSync, cpSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const asar = require('@electron/asar');

const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
const appDir = join(localAppData, 'Programs', 'antigravity');
const resourcesDir = join(appDir, 'resources');
const asarPath = join(resourcesDir, 'app.asar');
const bakPath = join(resourcesDir, 'app.asar.bak');
const origUnpackedPath = join(resourcesDir, 'app.asar.unpacked');
const bakUnpackedPath = join(resourcesDir, 'app.asar.bak.unpacked');

const projectRoot = process.cwd();
const injectJsPath = join(projectRoot, 'inject', 'native-inject.js');

console.log('====================================================');
console.log('   Google 反重力桌面端原生魔改注入安装器 (v4.2 双核引擎) ');
console.log('====================================================');

if (!existsSync(asarPath)) {
  console.error(`❌ 未找到反重力客户端 app.asar: ${asarPath}`);
  process.exit(1);
}

// 1. 确保纯净备份存在
if (!existsSync(bakPath)) {
  console.log(`📦 正在创建原始客户端纯净备份: ${bakPath}...`);
  copyFileSync(asarPath, bakPath);
  console.log('✅ 纯净备份创建成功！');
} else {
  console.log(`🛡️ 检测到已存在的纯净备份: ${bakPath}`);
}

if (!existsSync(bakUnpackedPath) && existsSync(origUnpackedPath)) {
  console.log(`📦 正在备份 unpacked 资源包: ${bakUnpackedPath}...`);
  try {
    cpSync(origUnpackedPath, bakUnpackedPath, { recursive: true });
    console.log('✅ unpacked 备份创建成功！');
  } catch (e) {
    console.warn('⚠️ 备份 unpacked 失败:', e.message);
  }
}

// 2. 永远从官方纯净备份还原后再解包 (保证绝对无任何旧版残留)
const tempExtractDir = mkdtempSync(join(tmpdir(), 'agy-asar-inject-'));
console.log(`📂 正在解包官方纯净 app.asar.bak 到临时目录: ${tempExtractDir}...`);
asar.extractAll(bakPath, tempExtractDir);

// 3. 注入 dist/utils.js (主进程核心注入：主世界 executeJavaScript + DevTools 开启 + Ctrl+R 快捷键)
const utilsPath = join(tempExtractDir, 'dist', 'utils.js');
if (existsSync(utilsPath)) {
  let utilsCode = readFileSync(utilsPath, 'utf8');

  // 开启 devTools (让 F12 / Ctrl+Shift+I 永远可用)
  utilsCode = utilsCode.replace('devTools: !electron_1.app.isPackaged,', 'devTools: true,');

  // 在 did-finish-load 中注入主世界执行脚本与控制台捕获
  const didFinishLoadMarker = `win.webContents.on('did-finish-load', () => {`;
  const utilsInjection = `
        win.webContents.on('did-finish-load', () => {
            // [Antigravity HUD] Main World 动态安全注入
            try {
                const _fs = require('node:fs');
                const _injectFile = 'd:\\\\CodePackage\\\\DSPlug\\\\antigravity-usage-panel\\\\inject\\\\native-inject.js';
                if (_fs.existsSync(_injectFile)) {
                    const _code = _fs.readFileSync(_injectFile, 'utf8');
                    void win.webContents.executeJavaScript(_code).then(() => {
                        _fs.appendFileSync('d:\\\\CodePackage\\\\DSPlug\\\\antigravity-usage-panel\\\\renderer.log', '[Init] HUD successfully injected into Main World\\n');
                    }).catch(err => {
                        _fs.appendFileSync('d:\\\\CodePackage\\\\DSPlug\\\\antigravity-usage-panel\\\\renderer.log', '[ExecErr] ' + (err.stack || err.message) + '\\n');
                    });
                }
            } catch (_err) {
                try {
                    require('node:fs').appendFileSync('d:\\\\CodePackage\\\\DSPlug\\\\antigravity-usage-panel\\\\renderer.log', '[MainErr] ' + _err.message + '\\n');
                } catch (e) {}
            }
        });

        // 控制台日志实时同步至 renderer.log
        win.webContents.on('console-message', (_event, _level, _msg) => {
            try {
                require('node:fs').appendFileSync('d:\\\\CodePackage\\\\DSPlug\\\\antigravity-usage-panel\\\\renderer.log', '[Console:' + _level + '] ' + _msg + '\\n');
            } catch (e) {}
        });

        // 绑定原生快捷键: Ctrl+R / F5 真实刷新页面, F12 快速唤出开发者调试工具
        win.webContents.on('before-input-event', (event, input) => {
            if (input.type === 'keyDown') {
                if (((input.control || input.meta) && input.key.toLowerCase() === 'r') || input.key === 'F5') {
                    event.preventDefault();
                    win.webContents.reload();
                } else if (input.key === 'F12' || ((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i')) {
                    event.preventDefault();
                    win.webContents.toggleDevTools();
                }
            }
        });

        win.webContents.on('did-finish-load-orig', () => {`;

  if (utilsCode.includes(didFinishLoadMarker)) {
    utilsCode = utilsCode.replace(didFinishLoadMarker, utilsInjection);
    console.log('⚡ 正在向 dist/utils.js 注入主世界 HUD 挂载器与 Ctrl+R/F12 原生快捷键...');
    writeFileSync(utilsPath, utilsCode, 'utf8');
  } else {
    console.warn('⚠️ 未在 dist/utils.js 中找到 did-finish-load 挂载点');
  }
}

// 4. 向 dist/main.js 注入伴随自愈钩子 (主进程纯 Node 环境，反重力启动时自动拉起 19388)
const mainPath = join(tempExtractDir, 'dist', 'main.js');
if (existsSync(mainPath)) {
  let mainCode = readFileSync(mainPath, 'utf8');
  const mainMarker = 'ANTIGRAVITY_USAGE_PANEL_AUTO_LAUNCH';
  if (mainCode.includes(mainMarker)) {
    const idx = mainCode.indexOf(mainMarker);
    const cutoff = mainCode.lastIndexOf('\n', idx);
    mainCode = mainCode.slice(0, cutoff > 0 ? cutoff : idx).trim();
  }
  const autoLaunchSnippet = `
// ==================== ANTIGRAVITY_USAGE_PANEL_AUTO_LAUNCH ====================
try {
  const _http = require('node:http');
  const _cp = require('node:child_process');
  const _fs = require('node:fs');
  const _req = _http.get('http://127.0.0.1:19388/api/ping', () => {});
  _req.on('error', () => {
    const daemon = 'd:\\\\CodePackage\\\\DSPlug\\\\antigravity-usage-panel\\\\daemon.mjs';
    if (_fs.existsSync(daemon)) {
      const p = _cp.spawn('node', [daemon], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
        cwd: 'd:\\\\CodePackage\\\\DSPlug\\\\antigravity-usage-panel'
      });
      p.unref();
    }
  });
  _req.setTimeout(800, () => _req.destroy());
} catch (_e) {}
// =============================================================================
`;
  writeFileSync(mainPath, mainCode + '\n' + autoLaunchSnippet, 'utf8');
  console.log('⚡ 正在向 dist/main.js 注入伴随自愈生命周期钩子 (客户端启动即自动守护)...');
}

// 5. 保留 preload.js 注入 (双重保险)
const preloadPath = join(tempExtractDir, 'dist', 'preload.js');
if (existsSync(preloadPath)) {
  let originalPreload = readFileSync(preloadPath, 'utf8');
  const markerIdx = originalPreload.indexOf('initAntigravityQuotaInjection');
  if (markerIdx > 0) {
    const cutoff = originalPreload.lastIndexOf('\n', markerIdx);
    originalPreload = originalPreload.slice(0, cutoff > 0 ? cutoff : markerIdx).trim();
  }
  const injectCode = readFileSync(injectJsPath, 'utf8');
  const modifiedPreload = originalPreload + '\n\n' + injectCode;
  writeFileSync(preloadPath, modifiedPreload, 'utf8');
}

// 6. 打包回临时 asar
const tempNewAsar = join(tmpdir(), `app-injected-${Date.now()}.asar`);
console.log('📦 正在重新打包 app.asar (unpackDir: node_modules/chrome-devtools-mcp)...');

await asar.createPackageWithOptions(tempExtractDir, tempNewAsar, {
  unpackDir: 'node_modules/chrome-devtools-mcp'
});

// 7. 替换到目标目录
console.log(`🚀 正在应用更新至反重力客户端: ${asarPath}...`);
copyFileSync(tempNewAsar, asarPath);

// 8. 清理临时文件
try {
  rmSync(tempExtractDir, { recursive: true, force: true });
  rmSync(tempNewAsar, { force: true });
} catch (e) {}

console.log('\n🎉 魔改注入 100% 成功完成！');
console.log('👉 注入亮点：');
console.log('   1. 【主世界直通注入】通过 webContents.executeJavaScript 绕过 contextIsolation，直达真实 DOM 与 CSRF；');
console.log('   2. 【原生快捷键解锁】开启 Ctrl+R / F5 真实页面重载，开启 F12 开发者调试控制台；');
console.log('   3. 【透明日志追踪】所有前端输出与潜在报错自动记录至 renderer.log；');
console.log('   4. 【主进程伴随守护】反重力桌面端启动即可自动拉起 19388 守护服务！\n');
