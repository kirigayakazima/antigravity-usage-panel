@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0bin\install-restart.ps1"
if errorlevel 1 goto failed
timeout /t 5 >nul 2>&1
exit /b 0
:failed
echo.
echo Installation failed. Please review the error above.
pause
exit /b 1
