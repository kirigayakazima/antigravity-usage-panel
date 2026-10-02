import { existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
const appDir = join(localAppData, 'Programs', 'antigravity');
const resourcesDir = join(appDir, 'resources');
const asarPath = join(resourcesDir, 'app.asar');
const bakPath = join(resourcesDir, 'app.asar.bak');

console.log('====================================================');
console.log('   Google 反重力桌面端魔改卸载与还原工具 (Route 2)   ');
console.log('====================================================');

if (!existsSync(bakPath)) {
  console.error(`❌ 未找到官方原始纯净备份文件: ${bakPath}，无法自动还原。`);
  process.exit(1);
}

console.log(`🔄 正在从备份恢复官方原始 app.asar...`);
copyFileSync(bakPath, asarPath);

console.log('✅ 还原成功！反重力客户端已完全恢复至官方纯净出厂版本。');
console.log('👉 在反重力窗口按【Ctrl + R】刷新或重启即可生效。\n');
