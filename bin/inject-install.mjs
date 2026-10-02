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
console.log('   Google 反重力桌面端原生魔改注入安装器 (v4.1)      ');
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

// 3. 注入 native-inject.js 到 dist/preload.js (纯 Web API，零报错，纯白浅色 + 页面内大模态)
const preloadPath = join(tempExtractDir, 'dist', 'preload.js');
if (!existsSync(preloadPath)) {
  console.error('❌ 未在解包目录中找到 dist/preload.js！');
  rmSync(tempExtractDir, { recursive: true, force: true });
  process.exit(1);
}

let originalPreload = readFileSync(preloadPath, 'utf8');
const markerIdx = originalPreload.indexOf('initAntigravityQuotaInjection');
if (markerIdx > 0) {
  const cutoff = originalPreload.lastIndexOf('\n', markerIdx);
  originalPreload = originalPreload.slice(0, cutoff > 0 ? cutoff : markerIdx).trim();
}

const injectCode = readFileSync(injectJsPath, 'utf8');
console.log('💉 正在向 dist/preload.js 注入纯白自适应 + 页面内大模态 HUD v4.1 代码...');
const modifiedPreload = originalPreload + '\n\n' + injectCode;
writeFileSync(preloadPath, modifiedPreload, 'utf8');

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

// 5. 打包回临时 asar
const tempNewAsar = join(tmpdir(), `app-injected-${Date.now()}.asar`);
console.log('📦 正在重新打包 app.asar (unpackDir: node_modules/chrome-devtools-mcp)...');

await asar.createPackageWithOptions(tempExtractDir, tempNewAsar, {
  unpackDir: 'node_modules/chrome-devtools-mcp'
});

// 6. 替换到目标目录
console.log(`🚀 正在应用更新至反重力客户端: ${asarPath}...`);
copyFileSync(tempNewAsar, asarPath);

// 7. 清理临时文件
try {
  rmSync(tempExtractDir, { recursive: true, force: true });
  rmSync(tempNewAsar, { force: true });
} catch (e) {}

console.log('\n🎉 魔改注入 100% 成功完成！');
console.log('👉 此时只需在反重力桌面端窗口内按一下【Ctrl + R】刷新，或者重启反重力：');
console.log('   1. 右上角窗口控制按钮左侧立刻常驻纯白微晶【🟢 5h余: 74.6% · ~65.8M · ⏳ 3h48m】胶囊！');
console.log('   2. 点击胶囊直接在当前页面正中央弹出 6 标签页现代化全屏模态看板，无需跳转外部浏览器！');
console.log('   3. 反重力客户端主进程已挂接自愈钩子，每次重启反重力都会静默守护 19388 端口！\n');
