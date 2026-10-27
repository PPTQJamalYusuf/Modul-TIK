@echo off
title Lab TIK - Pusat Kontrol Server
cd /d "%~dp0"
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\kontrol_server.ps1"
exit /b 0
