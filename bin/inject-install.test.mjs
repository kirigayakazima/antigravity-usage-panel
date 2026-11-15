import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { Script } from 'node:vm';
import { EventEmitter } from 'node:events';
import { enableDevTools, patchClient } from '../lib/install-patch.mjs';
const asar = createRequire(import.meta.url)('@electron/asar');
const newMarker = "hubContents.on('did-finish-load', handleDidFinishLoad);";
const oldMarker = "win.webContents.on('did-finish-load', () => {";
const fixture = (marker = newMarker) => ({
  utils: `const options = {\n devTools: (0, debugConsole_1.isDebugConsoleEnabled)(),\n};\n${marker}${marker === oldMarker ? ' originalHandler(); });' : ''}`,
  main: '"use strict";\n', preload: '"use strict";\n'
});
const patch = input => patchClient(input, "D:\\目录 with spaces\\O'Brien", '(function initAntigravityQuotaInjection() {})();', process.execPath);

test('compiled devTools call containing a comma remains valid JavaScript', () => {
  const code = fixture().utils;
  assert.throws(() => new Script(code.replace(/devTools:\s*[^,]+,/, 'devTools: true,')), SyntaxError);
  const result = enableDevTools(code);
  assert.match(result, /devTools: true,/);
  assert.doesNotThrow(() => new Script(result));
});

test('new and old hooks preserve original handlers and valid escaped paths', () => {
  for (const marker of [newMarker, oldMarker]) {
    const result = patch(fixture(marker));
    assert.ok(result.utils.endsWith(marker + (marker === oldMarker ? ' originalHandler(); });' : '')));
    assert.ok(!result.utils.includes('did-finish-load-orig'));
    for (const code of Object.values(result)) assert.doesNotThrow(() => new Script(code));
    assert.ok(result.main.includes(JSON.stringify(process.execPath)));
    assert.ok(result.main.includes(JSON.stringify("D:\\目录 with spaces\\O'Brien")));
    const contents = new EventEmitter();
    let originalCalls = 0;
    new Script(result.utils).runInNewContext({
      hubContents: contents, win: { webContents: contents },
      handleDidFinishLoad: () => originalCalls++, originalHandler: () => originalCalls++,
      require: () => ({ existsSync: () => false })
    });
    contents.emit('did-finish-load');
    assert.equal(originalCalls, 1);
  }
});

test('unknown expressions, missing hooks, corrupt input and patched backups fail closed', () => {
  assert.throws(() => patch({ ...fixture(), utils: fixture().utils.replace(newMarker, '') }), /挂载点/);
  assert.throws(() => enableDevTools('const options = {\n devTools: someCall(1, 2),\n};'), /不兼容/);
  assert.throws(() => patch({ ...fixture(), main: 'const =' }), SyntaxError);
  assert.throws(() => patch(patch(fixture())), /已有注入/);
});

test('archive install preserves unpacked assets, reinstalls, and leaves app unchanged on invalid backups', async () => {
  const root = mkdtempSync(join(tmpdir(), 'agy-installer-test-'));
  try {
    const source = join(root, 'source');
    const resources = join(root, 'Programs', 'antigravity', 'resources');
    mkdirSync(join(source, 'dist'), { recursive: true });
    mkdirSync(join(source, 'native'), { recursive: true });
    mkdirSync(resources, { recursive: true });
    const writeSource = (version = 'test-1', broken = false) => {
      writeFileSync(join(source, 'package.json'), JSON.stringify({ version, main: 'dist/main.js' }));
      for (const [name, code] of Object.entries(fixture())) {
        writeFileSync(join(source, 'dist', `${name}.js`), broken && name === 'utils' ? 'const =' : code);
      }
      writeFileSync(join(source, 'native', 'resource.bin'), Buffer.from([0, 1, 128, 255]));
    };
    writeSource();
    const archive = join(resources, 'app.asar');
    await asar.createPackageWithOptions(source, archive, { unpackDir: 'native' });
    const run = () => spawnSync(process.execPath, [resolve('bin/inject-install.mjs')], {
      env: { ...process.env, LOCALAPPDATA: root }, cwd: tmpdir(), encoding: 'utf8'
    });
    for (let i = 0; i < 2; i++) {
      const result = run();
      assert.equal(result.status, 0, result.stdout + result.stderr);
      asar.uncache(archive);
      assert.equal(asar.statFile(archive, 'native/resource.bin').unpacked, true);
      assert.deepEqual(asar.extractFile(archive, 'native/resource.bin'), Buffer.from([0, 1, 128, 255]));
      assert.doesNotThrow(() => new Script(asar.extractFile(archive, 'dist/utils.js').toString()));
    }
    const before = readFileSync(archive);
    writeSource('test-2');
    await asar.createPackageWithOptions(source, `${archive}.bak`, { unpackDir: 'native' });
    assert.notEqual(run().status, 0);
    assert.deepEqual(readFileSync(archive), before);
    writeSource('test-1', true);
    await asar.createPackageWithOptions(source, `${archive}.bak`, { unpackDir: 'native' });
    assert.notEqual(run().status, 0);
    assert.deepEqual(readFileSync(archive), before);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
