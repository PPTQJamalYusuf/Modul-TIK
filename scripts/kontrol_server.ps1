<#
 ==============================================================================
  KONTROL SERVER LAB TIK SMP (FORMAT TEKS CLI RINGAN)
  PPTQ Jamal Yusuf — Zero GUI / Zero WPF Dependency
 ==============================================================================
#>

$host.UI.RawUI.WindowTitle = "[KONTROL SERVER CLI] Lab TIK SMP - Jamal Yusuf"
$scriptDir = $PSScriptRoot
$rootDir = (Get-Item $scriptDir).Parent.FullName
$pidFile = Join-Path $rootDir "database\server.pid"

function Get-ServerPID {
    # 1. Cek dari PID file
    if (Test-Path $pidFile) {
        try {
            $raw = [System.IO.File]::ReadAllText($pidFile).Trim()
            if ($raw -match '^\d+$') {
                $p = Get-Process -Id ([int]$raw) -ErrorAction SilentlyContinue
                if ($p -and (-not $p.HasExited) -and ($p.ProcessName -ieq "node")) {
                    return $raw
                }
            }
        } catch {}
    }

    # 2. Cek port 8000 via NetTCPConnection
    try {
        $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($conn -and $conn.OwningProcess -gt 0) {
            $foundPid = [string]$conn.OwningProcess
            try { [System.IO.File]::WriteAllText($pidFile, $foundPid) } catch {}
            return $foundPid
        }
    } catch {}

    return $null
}

function Get-WifiIP {
    try {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
            $_.InterfaceAlias -notlike '*Loopback*' -and 
            $_.IPAddress -notlike '169.254*' -and 
            $_.IPAddress -notlike '127.*' 
        } | Select-Object -First 1).IPAddress
        if ($ip) { return $ip }
    } catch {}
    return "127.0.0.1"
}

function Show-Header {
    Clear-Host
    $pidNow = Get-ServerPID
    $ipWifi = Get-WifiIP

    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host "               PUSAT KONTROL SERVER LAB TIK SMP (CLI)                   " -ForegroundColor Yellow
    Write-Host "                    PPTQ JAMAL YUSUF — MODUL 1                         " -ForegroundColor White
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host ""

    if ($pidNow) {
        Write-Host "  STATUS SERVER : " -NoNewline
        Write-Host "[ AKTIF ]" -ForegroundColor Green -NoNewline
        Write-Host " (PID: $pidNow | Port: 8000)" -ForegroundColor Gray
        Write-Host "  AKSES LOKAL   : " -NoNewline
        Write-Host "http://localhost:8000" -ForegroundColor Cyan
        Write-Host "  AKSES WI-FI   : " -NoNewline
        Write-Host "http://$ipWifi`:8000" -ForegroundColor Yellow -NoNewline
        Write-Host " (Untuk Siswa di Lab)" -ForegroundColor Gray
        Write-Host "  PANEL GURU    : " -NoNewline
        Write-Host "http://localhost:8000/guru" -ForegroundColor Magenta
    } else {
        Write-Host "  STATUS SERVER : " -NoNewline
        Write-Host "[ TIDAK AKTIF / MATI ]" -ForegroundColor Red
        Write-Host "  KETERANGAN    : Server belum berjalan. Pilih 1 untuk menyalakan." -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host "  PILIHAN MENU:                                                        " -ForegroundColor Yellow
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host "  [1] Nyalakan Server (Start)" -ForegroundColor White
    Write-Host "  [2] Matikan Server (Stop)" -ForegroundColor White
    Write-Host "  [3] Muat Ulang Server (Restart)" -ForegroundColor White
    Write-Host "  [4] Buka Halaman Siswa (http://localhost:8000)" -ForegroundColor White
    Write-Host "  [5] Buka Panel Guru (http://localhost:8000/guru)" -ForegroundColor White
    Write-Host "  [6] Perbarui Shortcut di Desktop" -ForegroundColor White
    Write-Host "  [0] Keluar (Exit)" -ForegroundColor Gray
    Write-Host "=======================================================================" -ForegroundColor Cyan
}

# Loop CLI Utama
while ($true) {
    Show-Header
    $pilihan = Read-Host "Pilih nomor aksi [1-6, 0]"

    switch ($pilihan) {
        "1" {
            $p = Get-ServerPID
            if ($p) {
                Write-Host "`n[INFO] Server sudah aktif! Membuka browser..." -ForegroundColor Yellow
                Start-Process "http://localhost:8000"
                Start-Sleep -Seconds 2
            } else {
                Write-Host "`n[INFO] Menyalakan server Node.js di port 8000..." -ForegroundColor Cyan
                Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"cd /d `"$rootDir`" && node src/server.js`"" -WorkingDirectory $rootDir
                Start-Sleep -Seconds 3
                Start-Process "http://localhost:8000"
            }
        }
        "2" {
            $p = Get-ServerPID
            if ($p) {
                Write-Host "`n[INFO] Menghentikan server [PID: $p]..." -ForegroundColor Yellow
                Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue
                if (Test-Path $pidFile) { Remove-Item -Force $pidFile -ErrorAction SilentlyContinue }
                Write-Host "[OK] Server berhasil dimatikan." -ForegroundColor Green
                Start-Sleep -Seconds 2
            } else {
                Write-Host "`n[INFO] Server memang sedang tidak aktif." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            }
        }
        "3" {
            Write-Host "`n[INFO] Me-restart server..." -ForegroundColor Cyan
            $p = Get-ServerPID
            if ($p) {
                Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue
                if (Test-Path $pidFile) { Remove-Item -Force $pidFile -ErrorAction SilentlyContinue }
                Start-Sleep -Seconds 1
            }
            Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"cd /d `"$rootDir`" && node src/server.js`"" -WorkingDirectory $rootDir
            Start-Sleep -Seconds 3
            Write-Host "[OK] Server berhasil di-restart!" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
        "4" {
            Start-Process "http://localhost:8000"
        }
        "5" {
            Start-Process "http://localhost:8000/guru"
        }
        "6" {
            Write-Host "`n[INFO] Memperbarui shortcut di desktop..." -ForegroundColor Cyan
            & "$scriptDir\buat_shortcut.ps1"
            Start-Sleep -Seconds 2
        }
        "0" {
            Write-Host "`nKeluar dari Pusat Kontrol Server. Sampai jumpa!" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "`nPilihan tidak valid. Silakan tekan tombol 1 sampai 6, atau 0." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
}
