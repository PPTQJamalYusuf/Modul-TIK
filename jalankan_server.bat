@echo off
title Lab Komputer: Modul 1 Dasar TIK - Server Guru
chcp 65001 >nul
cls

echo =======================================================================
echo          LAB KOMPUTER: MODUL 1 DASAR TIK — SERVER GURU
echo =======================================================================
echo.

:: Memastikan working directory selalu berada di folder file bat ini
cd /d "%~dp0"

:: 1. Memeriksa keberadaan Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di komputer ini!
    echo Silakan unduh dan pasang Node.js v22 LTS atau v24 LTS dari:
    echo https://nodejs.org
    echo.
    echo Tekan tombol apa saja untuk menutup jendela ini...
    pause >nul
    exit /b 1
)

:: 2. Memeriksa file server.js
if not exist "server.js" (
    echo [ERROR] Berkas server.js tidak ditemukan di direktori ini!
    echo Pastikan file bat ini berada di dalam folder yang sama dengan server.js.
    echo.
    pause
    exit /b 1
)

echo [INFO] Menyiapkan server Lab Komputer...
echo.

:: 3. Membuka browser guru secara otomatis setelah jeda 2 detik
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000/guru"

:: 4. Menjalankan server Node.js
node server.js

:: Jika server dihentikan atau terjadi error, cegah jendela tertutup otomatis
echo.
echo =======================================================================
echo Server telah dihentikan.
echo =======================================================================
pause
