import { existsSync, copyFileSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
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

const projectRoot = process.cwd();
const injectJsPath = join(projectRoot, 'inject', 'native-inject.js');

console.log('====================================================');
console.log('   Google 反重力桌面端原生魔改注入安装器 (Route 2)   ');
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

// 2. 解包当前 asar 到临时目录 (匹配同级的 app.asar.unpacked 目录)
const tempExtractDir = mkdtempSync(join(tmpdir(), 'agy-asar-inject-'));
console.log(`📂 正在解包 app.asar 到临时目录: ${tempExtractDir}...`);
asar.extractAll(asarPath, tempExtractDir);

// 3. 注入 native-inject.js 到 dist/preload.js
const preloadPath = join(tempExtractDir, 'dist', 'preload.js');
if (!existsSync(preloadPath)) {
  console.error('❌ 未在解包目录中找到 dist/preload.js！');
  rmSync(tempExtractDir, { recursive: true, force: true });
  process.exit(1);
}

const originalPreload = readFileSync(preloadPath, 'utf8');
const injectCode = readFileSync(injectJsPath, 'utf8');

console.log('💉 正在向 dist/preload.js 注入顶栏胶囊 HUD 代码...');
const modifiedPreload = originalPreload + '\n\n' + injectCode;
writeFileSync(preloadPath, modifiedPreload, 'utf8');

// 4. 打包回临时 asar
const tempNewAsar = join(tmpdir(), `app-injected-${Date.now()}.asar`);
console.log('📦 正在重新打包 app.asar (unpackDir: node_modules/chrome-devtools-mcp)...');

await asar.createPackageWithOptions(tempExtractDir, tempNewAsar, {
  unpackDir: 'node_modules/chrome-devtools-mcp'
});

// 5. 替换到目标目录
console.log(`🚀 正在应用更新至反重力客户端: ${asarPath}...`);
copyFileSync(tempNewAsar, asarPath);

// 6. 清理临时文件
try {
  rmSync(tempExtractDir, { recursive: true, force: true });
  rmSync(tempNewAsar, { force: true });
} catch (e) {}

console.log('\n🎉 魔改注入 100% 成功完成！');
console.log('👉 此时只需在反重力桌面端窗口内按一下【Ctrl + R】刷新，或者重启反重力，');
console.log('   右上角窗口控制按钮左侧就会立刻出现常驻的【🟢 5h余: 74.6% · ~65.8M · ⏳ 3h48m】状态胶囊！');
console.log('💡 若日后需要还原，执行 npm run inject:uninstall 即可秒级恢复官方出厂状态。\n');
