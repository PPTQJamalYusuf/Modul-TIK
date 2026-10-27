@echo off
setlocal EnableDelayedExpansion
title [OFF] Matikan Server Lab TIK
cd /d "%~dp0"

echo =======================================================================
echo                  MEMATIKAN SERVER LAB KOMPUTER TIK
echo =======================================================================
echo.

set "FOUND_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set "FOUND_PID=%%p"
)

if not defined FOUND_PID (
    echo [INFO] Server Lab TIK saat ini sedang TIDAK AKTIF.
    echo Port 8000 tidak digunakan oleh proses apa pun.
    echo.
    ping 127.0.0.1 -n 3 >nul
    exit /b 0
)

echo [INFO] Menemukan proses server aktif pada Port 8000 [PID: !FOUND_PID!].
echo Menghentikan proses secara aman...

taskkill /F /PID !FOUND_PID! >nul 2>&1

ping 127.0.0.1 -n 2 >nul

set "VERIFY_PID="
for /f "tokens=5" %%v in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set "VERIFY_PID=%%v"
)

if defined VERIFY_PID (
    echo [PERINGATAN] Port 8000 masih terdeteksi. Mencoba mematikan paksa...
    taskkill /F /PID !VERIFY_PID! >nul 2>&1
)

echo.
echo =======================================================================
echo   [OK] SERVER LAB TIK BERHASIL DIMATIKAN!
echo   Port 8000 sekarang sudah bebas dan aman.
echo =======================================================================
echo.
ping 127.0.0.1 -n 3 >nul
exit /b 0
