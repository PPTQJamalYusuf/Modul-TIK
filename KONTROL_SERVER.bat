@echo off
setlocal EnableDelayedExpansion
title [KONTROL SERVER] Lab TIK SMP - PPTQ Jamal Yusuf
cd /d "%~dp0"
color 0F

:MENU
cls
set "STATUS_STR=[TIDAK AKTIF / MATI]"
set "SERVER_PID="
set "WIFI_IP=127.0.0.1"

:: 1. Deteksi PID Port 8000
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set "SERVER_PID=%%p"
)

:: 2. Deteksi Alamat IP Wi-Fi Jaringan Lab
for /f "tokens=2 delims=:" %%a in ('ipconfig 2^>nul ^| findstr /c:"IPv4" ^| findstr /v "127.0.0.1" ^| findstr /v "169.254"') do (
    if "!WIFI_IP!"=="127.0.0.1" (
        for /f "tokens=1" %%b in ("%%a") do set "WIFI_IP=%%b"
    )
)

echo =======================================================================
echo               PUSAT KONTROL SERVER LAB TIK SMP (CLI)
echo                    PPTQ JAMAL YUSUF — MODUL 1
echo =======================================================================
echo.
if defined SERVER_PID (
    echo   STATUS SERVER : [ AKTIF ] (PID: !SERVER_PID! ^| Port: 8000)
    echo   AKSES LOKAL   : http://localhost:8000
    echo   AKSES WI-FI   : http://!WIFI_IP!:8000 (Untuk Siswa di Lab)
    echo   PANEL GURU    : http://localhost:8000/guru
) else (
    echo   STATUS SERVER : [ TIDAK AKTIF / MATI ]
    echo   KETERANGAN    : Server belum berjalan. Tekan 1 untuk menyalakan.
)
echo.
echo =======================================================================
echo   PILIHAN AKSI:
echo =======================================================================
echo   [1] Nyalakan Server (Start)
echo   [2] Matikan Server (Stop)
echo   [3] Muat Ulang Server (Restart)
echo   [4] Buka Halaman Siswa (http://localhost:8000)
echo   [5] Buka Panel Guru     (http://localhost:8000/guru)
echo   [6] Perbarui Shortcut di Desktop
echo   [0] Keluar (Exit)
echo =======================================================================
set /p PILIHAN="Pilih nomor aksi [1-6, 0]: "

if "%PILIHAN%"=="1" goto NYALAKAN
if "%PILIHAN%"=="2" goto MATIKAN
if "%PILIHAN%"=="3" goto RESTART
if "%PILIHAN%"=="4" goto BUKA_SISWA
if "%PILIHAN%"=="5" goto BUKA_GURU
if "%PILIHAN%"=="6" goto BUAT_SHORTCUT
if "%PILIHAN%"=="0" exit /b 0
goto MENU

:NYALAKAN
if defined SERVER_PID (
    echo.
    echo [INFO] Server SUDAH AKTIF sebelumnya [PID: !SERVER_PID!].
    echo Membuka peramban...
    start http://localhost:8000
    ping 127.0.0.1 -n 2 >nul
    goto MENU
)
echo.
echo [1/2] Menyalakan server Node.js di port 8000...
start "Lab TIK Server [Port 8000 - AKTIF]" cmd /k "cd /d "%~dp0" && node src/server.js"
echo [2/2] Menunggu koneksi server siap...
ping 127.0.0.1 -n 3 >nul
echo [OK] Server berhasil dinyalakan! Membuka browser...
start http://localhost:8000
ping 127.0.0.1 -n 2 >nul
goto MENU

:MATIKAN
if not defined SERVER_PID (
    echo.
    echo [INFO] Server memang sedang tidak aktif.
    ping 127.0.0.1 -n 2 >nul
    goto MENU
)
echo.
echo [INFO] Menghentikan proses server [PID: !SERVER_PID!]...
taskkill /F /PID !SERVER_PID! >nul 2>&1
:: Hapus file server.pid jika ada
if exist "%~dp0database\server.pid" del /f /q "%~dp0database\server.pid" >nul 2>&1
echo [OK] Server telah dimatikan secara bersih.
ping 127.0.0.1 -n 2 >nul
goto MENU

:RESTART
echo.
if defined SERVER_PID (
    echo [1/3] Menghentikan proses server lama [PID: !SERVER_PID!]...
    taskkill /F /PID !SERVER_PID! >nul 2>&1
    if exist "%~dp0database\server.pid" del /f /q "%~dp0database\server.pid" >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
)
echo [2/3] Memulai ulang server Node.js baru...
start "Lab TIK Server [Port 8000 - AKTIF]" cmd /k "cd /d "%~dp0" && node src/server.js"
echo [3/3] Menunggu koneksi server siap...
ping 127.0.0.1 -n 3 >nul
echo [OK] Server berhasil di-restart!
ping 127.0.0.1 -n 2 >nul
goto MENU

:BUKA_SISWA
start http://localhost:8000
goto MENU

:BUKA_GURU
start http://localhost:8000/guru
goto MENU

:BUAT_SHORTCUT
echo.
echo [INFO] Memperbarui shortcut di Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\buat_shortcut.ps1"
ping 127.0.0.1 -n 3 >nul
goto MENU
