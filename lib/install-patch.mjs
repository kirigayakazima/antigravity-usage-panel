import { Script } from 'node:vm';
import { join } from 'node:path';

export function checkSyntax(code, filename) {
  new Script(code, { filename });
  return code;
}

export function enableDevTools(code) {
  // The compiled call contains a comma. Match the entire known expression.
  const property = /^([\t ]*)devTools:\s*(?:true|false|\(0,\s*[\w$]+\.isDebugConsoleEnabled\)\(\)),[\t ]*\r?$/gm;
  if ([...code.matchAll(property)].length !== 1) {
    throw new Error('不兼容的 devTools 配置，已停止安装，未修改客户端。');
  }
  return checkSyntax(code.replace(property, '$1devTools: true,'), 'dist/utils.js');
}

function replaceOnce(code, marker, snippet) {
  if (code.split(marker).length !== 2) throw new Error(`未找到唯一的兼容挂载点: ${marker}`);
  return code.replace(marker, () => snippet + '\n' + marker);
}

export function patchClient({ utils, main, preload }, projectRoot, injectCode, nodePath) {
  for (const [name, code] of Object.entries({ utils, main, preload })) {
    checkSyntax(code, `original/dist/${name}.js`);
    if (/ANTIGRAVITY_USAGE_PANEL_AUTO_LAUNCH|initAntigravityQuotaInjection|\[Antigravity HUD\]/.test(code)) {
      throw new Error('备份中已有注入代码，拒绝重复注入。请使用当前版本的原始备份。');
    }
  }
  checkSyntax(injectCode, 'inject/native-inject.js');
  utils = enableDevTools(utils);
  const newMarker = "hubContents.on('did-finish-load', handleDidFinishLoad);";
  const oldMarker = "win.webContents.on('did-finish-load', () => {";
  const marker = utils.includes(newMarker) ? newMarker : oldMarker;
  const target = marker === newMarker ? 'hubContents' : 'win.webContents';
  const logPath = JSON.stringify(join(projectRoot, 'renderer.log'));
  const injection = `
        // [Antigravity HUD] Main World injection
        try {
            const _fs = require('node:fs');
            const _injectFile = ${JSON.stringify(join(projectRoot, 'inject', 'native-inject.js'))};
            const _log = (msg) => { try { _fs.appendFileSync(${logPath}, msg + '\\n'); } catch (_) {} };
            ${target}.on('did-finish-load', () => {
                try {
                    if (_fs.existsSync(_injectFile)) {
                        void ${target}.executeJavaScript(_fs.readFileSync(_injectFile, 'utf8'))
                            .then(() => _log('[Init] HUD successfully injected into Main World'))
                            .catch(err => _log('[ExecErr] ' + (err.stack || err.message)));
                    }
                } catch (err) { _log('[ExecErr] ' + err.message); }
            });
            ${target}.on('console-message', (_event, _level, _msg) => _log('[Console:' + _level + '] ' + _msg));
            ${target}.on('before-input-event', (event, input) => {
                if (input.type !== 'keyDown') return;
                const key = String(input.key).toLowerCase();
                if (((input.control || input.meta) && key === 'r') || key === 'f5') {
                    event.preventDefault();
                    ${target}.reload();
                } else if (key === 'f12' || ((input.control || input.meta) && input.shift && key === 'i')) {
                    event.preventDefault();
                    ${target}.toggleDevTools();
                }
            });
        } catch (_) {}
`;
  // Keep the application's original handler on both old and new clients.
  utils = replaceOnce(utils, marker, injection);
  main += `
// ANTIGRAVITY_USAGE_PANEL_AUTO_LAUNCH
try {
  const _http = require('node:http');
  const _cp = require('node:child_process');
  const _fs = require('node:fs');
  const _req = _http.get('http://127.0.0.1:19388/api/ping', res => res.resume());
  _req.on('error', () => {
    const daemon = ${JSON.stringify(join(projectRoot, 'daemon.mjs'))};
    if (_fs.existsSync(daemon)) {
      const p = _cp.spawn(${JSON.stringify(nodePath)}, [daemon], {
        detached: true, stdio: 'ignore', windowsHide: true,
        cwd: ${JSON.stringify(projectRoot)}
      });
      p.on('error', () => {});
      p.unref();
    }
  });
  _req.setTimeout(800, () => _req.destroy());
} catch (_) {}
`;
  preload += '\n\n' + injectCode;
  return Object.fromEntries(Object.entries({ utils, main, preload }).map(([name, code]) =>
    [name, checkSyntax(code, `patched/dist/${name}.js`)]));
}
