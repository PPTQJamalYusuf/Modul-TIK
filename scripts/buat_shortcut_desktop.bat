@echo off
title Buat Shortcut Desktop Lab TIK
chcp 65001 >nul
cd /d "%~dp0"

echo =======================================================================
echo          📌 MEMBUAT SHORTCUT SERVER DI DESKTOP WINDOWS
echo =======================================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0buat_shortcut.ps1"

echo.
pause
