import { existsSync, copyFileSync, cpSync, readFileSync, writeFileSync, rmSync,
  mkdtempSync, renameSync, createReadStream, lstatSync, readlinkSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { patchClient, checkSyntax } from '../lib/install-patch.mjs';

const require = createRequire(import.meta.url);
const asar = require('@electron/asar');
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
const resourcesDir = join(localAppData, 'Programs', 'antigravity', 'resources');
const asarPath = join(resourcesDir, 'app.asar');
const bakPath = join(resourcesDir, 'app.asar.bak');
const scripts = ['utils', 'main', 'preload'];

function readScripts(archive) {
  return Object.fromEntries(scripts.map(name => [name, asar.extractFile(archive, `dist/${name}.js`).toString('utf8')]));
}

function removeTemp(path, parent) {
  const rel = relative(resolve(parent), resolve(path));
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error(`拒绝清理不安全路径: ${path}`);
  rmSync(path, { recursive: true, force: true });
}

async function install() {
  if (!existsSync(asarPath)) throw new Error(`未找到客户端: ${asarPath}`);
  const source = existsSync(bakPath) ? bakPath : asarPath;
  const original = readScripts(source);
  const installedPkg = JSON.parse(asar.extractFile(asarPath, 'package.json'));
  const backupPkg = JSON.parse(asar.extractFile(source, 'package.json'));
  if (installedPkg.version !== backupPkg.version) {
    throw new Error(`备份版本 ${backupPkg.version} 与客户端 ${installedPkg.version} 不一致，已停止，避免覆盖新版客户端。`);
  }
  const patched = patchClient(original, projectRoot,
    readFileSync(join(projectRoot, 'inject', 'native-inject.js'), 'utf8'), process.execPath);
  console.log(`✅ ${backupPkg.version}: 挂载点及三个注入文件的语法校验通过。`);

  if (!existsSync(bakPath)) {
    copyFileSync(asarPath, bakPath);
    console.log(`📦 已保存原始备份: ${bakPath}`);
  }
  const unpackedPath = `${asarPath}.unpacked`;
  const backupUnpackedPath = `${bakPath}.unpacked`;
  if (!existsSync(backupUnpackedPath) && existsSync(unpackedPath)) {
    cpSync(unpackedPath, backupUnpackedPath, { recursive: true });
  }

  const extractDir = mkdtempSync(join(tmpdir(), 'agy-asar-inject-'));
  const stageDir = mkdtempSync(join(resourcesDir, 'agy-install-'));
  const stageAsar = join(stageDir, 'app.asar');
  try {
    asar.extractAll(bakPath, extractDir);
    for (const name of scripts) writeFileSync(join(extractDir, 'dist', `${name}.js`), patched[name], 'utf8');

    // Preserve every entry's original packed/unpacked status, including native assets.
    const entries = asar.listPackage(bakPath).map(entry => entry.replace(/^[/\\]+/, ''));
    const streams = entries.map(entry => {
      const diskPath = join(extractDir, entry);
      const info = asar.statFile(bakPath, entry, false);
      const stat = lstatSync(diskPath);
      return {
        path: entry, type: info.files ? 'directory' : info.link ? 'link' : 'file',
        stat, unpacked: Boolean(info.unpacked),
        streamGenerator: () => createReadStream(diskPath),
        ...(info.link ? { symlink: readlinkSync(diskPath) } : {})
      };
    });
    await asar.createPackageFromStreams(stageAsar, streams);
    for (const [name, code] of Object.entries(readScripts(stageAsar))) {
      checkSyntax(code, `packed/dist/${name}.js`);
      if (code !== patched[name]) throw new Error(`打包内容校验失败: ${name}`);
    }
    for (const entry of entries) {
      const before = asar.statFile(bakPath, entry, false);
      const after = asar.statFile(stageAsar, entry, false);
      if (Boolean(before.unpacked) !== Boolean(after.unpacked)) throw new Error(`unpacked 标记发生变化: ${entry}`);
      // Never silently overwrite another version's external assets.
      if (before.unpacked && !before.files && !before.link) {
        if (!readFileSync(join(unpackedPath, entry)).equals(asar.extractFile(stageAsar, entry))) {
          throw new Error(`客户端 unpacked 资源与备份不一致: ${entry}`);
        }
      }
    }
    console.log('✅ 打包后语法、脚本内容及 unpacked 资源校验通过。');
    const previousPath = `${asarPath}.previous-${Date.now()}`;
    renameSync(asarPath, previousPath);
    try {
      renameSync(stageAsar, asarPath);
    } catch (error) {
      renameSync(previousPath, asarPath);
      throw error;
    }
    console.log(`✅ 安装完成；安装前文件保留于 ${previousPath}`);
  } finally {
    removeTemp(extractDir, tmpdir());
    removeTemp(stageDir, resourcesDir);
  }
}

install().catch(error => {
  console.error(`❌ 安装失败: ${error.stack || error.message}`);
  process.exitCode = 1;
});
