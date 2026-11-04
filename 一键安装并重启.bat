@echo off
chcp 65001 >nul
title Google 反重力额度监控插件 - 一键修复安装与重启
cd /d "%~dp0"

echo ===================================================================
echo    Google 反重力桌面端（Antigravity）额度与用量监控面板 - 一键修复
echo ===================================================================
echo.

:: 1. 检查并关闭正在运行的反重力客户端（释放 app.asar 写入锁定）
echo [1/4] 检查反重力客户端运行状态...
tasklist /fi "imagename eq Antigravity.exe" 2>nul | find /i "Antigravity.exe" >nul
if %errorlevel% equ 0 (
    echo [*] 检测到反重力客户端正在运行，正在自动安全关闭以更新文件...
    taskkill /f /im Antigravity.exe >nul 2>&1
    timeout /t 1 /nobreak >nul
) else (
    echo [*] 反重力客户端未运行，无需关闭。
)

:: 2. 执行魔改注入与解包重构
echo.
echo [2/4] 正在注入最新版 HUD 挂载器与原生快捷键...
node ./bin/inject-install.mjs
if %errorlevel% neq 0 (
    echo.
    echo ❌ 注入失败，请检查上面错误信息！
    pause
    exit /b %errorlevel%
)

:: 3. 检查并确保后台守护进程 (Daemon 19388) 正在运行
echo.
echo [3/4] 检查后台监控守护服务 (端口 19388)...
powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://127.0.0.1:19388/api/ping' -TimeoutSec 1).StatusCode } catch { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] 后台守护服务未启动，正在启动守护后台进程...
    powershell -NoProfile -Command "Start-Process node -ArgumentList 'daemon.mjs' -WorkingDirectory '%~dp0' -WindowStyle Hidden"
    timeout /t 2 /nobreak >nul
    echo ✅ 后台守护服务已在端口 19388 启动并挂起。
) else (
    echo ✅ 后台守护服务已经在端口 19388 正常运行。
)

:: 4. 重新启动反重力客户端
echo.
echo [4/4] 正在重新启动反重力客户端...
set "APP_PATH=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
if exist "%APP_PATH%" (
    start "" "%APP_PATH%"
    echo ✅ 反重力客户端已成功拉起！
) else (
    echo ⚠️ 未在默认路径找到 Antigravity.exe，请手动启动反重力客户端。
)

echo.
echo ===================================================================
echo 🎉 插件安装与客户端重启全部完成！
echo 👉 客户端打开后顶栏即可看到额度胶囊，按 Ctrl+R 可立即强制重载面板。
echo ===================================================================
echo.
timeout /t 5
