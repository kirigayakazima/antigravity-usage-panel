@echo off
title Antigravity Quota HUD Launcher
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-hud.ps1"
