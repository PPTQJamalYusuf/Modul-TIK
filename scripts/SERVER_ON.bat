@echo off
setlocal EnableDelayedExpansion
title [ON] Nyalakan Server Lab TIK
cd /d "%~dp0"

echo =======================================================================
echo                 MENYALAKAN SERVER LAB KOMPUTER TIK
echo =======================================================================
echo.

set "SERVER_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set "SERVER_PID=%%p"
)

if defined SERVER_PID (
    echo [INFO] Server SUDAH AKTIF sebelumnya [PID: !SERVER_PID!]
    echo Port 8000 sedang berjalan normal.
    echo.
    echo Membuka browser: http://localhost:8000 ...
    start http://localhost:8000
    exit /b 0
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan unduh dan pasang Node.js dari https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [1/2] Menjalankan server Node.js di port 8000...
start "Lab TIK Server [AKTIF - Port 8000]" cmd /k "cd /d "%~dp0.." && node src/server.js"

echo [2/2] Menunggu koneksi server siap...
ping 127.0.0.1 -n 3 >nul

echo.
echo =======================================================================
echo   [OK] SERVER BERHASIL DINYALAKAN!
echo   - Akses Lokal:  http://localhost:8000
echo   - Panel Guru:   http://localhost:8000/guru
echo =======================================================================
start http://localhost:8000
exit /b 0
