$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$dir = (Get-Item $PSScriptRoot).Parent.FullName

# Bersihkan shortcut lama jika ada
Get-ChildItem -Path $desktop -Filter "*Server Lab TIK.lnk" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $desktop -Filter "*Server TIK.lnk" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $desktop -Filter "Nyalakan Server*.lnk" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $desktop -Filter "Matikan Server*.lnk" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $desktop -Filter "Panel Kontrol Server*.lnk" | Remove-Item -Force -ErrorAction SilentlyContinue

# Buat shortcut utama: CLI Kontrol Server Lab TIK SMP
$targetBat = Join-Path $dir "KONTROL_SERVER.bat"

$sc = $ws.CreateShortcut((Join-Path $desktop "Kontrol Server Lab TIK.lnk"))
$sc.TargetPath = $targetBat
$sc.WorkingDirectory = $dir
$sc.Description = "Pusat Kontrol Server Lab TIK SMP (CLI Teks Ringan)"
$sc.IconLocation = "$env:SystemRoot\System32\shell32.dll, 15"
$sc.Save()

Write-Host "[SUKSES] Shortcut Kontrol Server Lab TIK (CLI) berhasil dibuat di Desktop!" -ForegroundColor Green
Write-Host " Lokasi Target: $desktop\Kontrol Server Lab TIK.lnk" -ForegroundColor Cyan
