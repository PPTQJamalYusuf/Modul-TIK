@echo off
setlocal EnableDelayedExpansion
title Kontrol Server Lab TIK - ON/OFF
cd /d "%~dp0"

:MENU
cls
set "STATUS_STR=[TIDAK AKTIF / MATI]"
set "SERVER_PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set "SERVER_PID=%%p"
)
if defined SERVER_PID (
    set "STATUS_STR=[AKTIF - Port 8000 - PID: !SERVER_PID!]"
)

echo =======================================================================
echo                    PANEL KONTROL SERVER LAB TIK
echo =======================================================================
echo  Status Server Saat Ini: !STATUS_STR!
echo =======================================================================
echo.
echo   [1] Nyalakan Server (ON)
echo   [2] Matikan Server  (OFF)
echo   [3] Restart Server
echo   [4] Buka Dashboard Santri  [http://localhost:8000]
echo   [5] Buka Panel Guru        [http://localhost:8000/guru]
echo   [6] Perbarui Shortcut di Desktop
echo   [0] Keluar
echo.
echo =======================================================================
set /p PILIHAN="Pilih menu [1-6, 0]: "

if "%PILIHAN%"=="1" goto NYALAKAN
if "%PILIHAN%"=="2" goto MATIKAN
if "%PILIHAN%"=="3" goto RESTART
if "%PILIHAN%"=="4" goto BUKA_SANTRI
if "%PILIHAN%"=="5" goto BUKA_GURU
if "%PILIHAN%"=="6" goto BUAT_SHORTCUT
if "%PILIHAN%"=="0" exit /b 0
goto MENU

:NYALAKAN
if defined SERVER_PID (
    echo.
    echo [INFO] Server sudah aktif! Membuka browser...
    start http://localhost:8000
    ping 127.0.0.1 -n 2 >nul
    goto MENU
)
echo.
echo [INFO] Menyalakan server...
start "Lab TIK Server [AKTIF - Port 8000]" cmd /k "cd /d "%~dp0.." && node src/server.js"
ping 127.0.0.1 -n 3 >nul
start http://localhost:8000
goto MENU

:MATIKAN
if not defined SERVER_PID (
    echo.
    echo [INFO] Server memang sedang tidak aktif.
    ping 127.0.0.1 -n 2 >nul
    goto MENU
)
echo.
echo [INFO] Mematikan server [PID: !SERVER_PID!]...
taskkill /F /PID !SERVER_PID! >nul 2>&1
ping 127.0.0.1 -n 2 >nul
echo [OK] Server telah dimatikan.
ping 127.0.0.1 -n 2 >nul
goto MENU

:RESTART
if defined SERVER_PID (
    echo.
    echo [INFO] Menghentikan server lama [PID: !SERVER_PID!]...
    taskkill /F /PID !SERVER_PID! >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
)
echo [INFO] Memulai ulang server baru...
start "Lab TIK Server [AKTIF - Port 8000]" cmd /k "cd /d "%~dp0.." && node src/server.js"
ping 127.0.0.1 -n 3 >nul
echo [OK] Server berhasil di-restart!
ping 127.0.0.1 -n 2 >nul
goto MENU

:BUKA_SANTRI
start http://localhost:8000
goto MENU

:BUKA_GURU
start http://localhost:8000/guru
goto MENU

:BUAT_SHORTCUT
powershell -ExecutionPolicy Bypass -File "%~dp0buat_shortcut.ps1"
ping 127.0.0.1 -n 3 >nul
goto MENU
