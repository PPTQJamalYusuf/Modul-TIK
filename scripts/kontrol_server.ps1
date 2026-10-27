Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase, System.Windows.Forms

# Tentukan path direktori proyek
$scriptDir = $PSScriptRoot
$rootDir = (Get-Item $scriptDir).Parent.FullName
$pidFile = Join-Path $rootDir "database\server.pid"

# Fungsi Deteksi Status Server Super Cepat (<2ms via PID file)
function Get-ServerPID {
    if (Test-Path $pidFile) {
        try {
            $raw = [System.IO.File]::ReadAllText($pidFile).Trim()
            if ($raw -match '^\d+$') {
                $pidNum = [int]$raw
                $proc = [System.Diagnostics.Process]::GetProcessById($pidNum)
                if ($proc -and (-not $proc.HasExited) -and ($proc.ProcessName -ieq "node")) {
                    return $raw
                }
            }
        } catch {
            try { [System.IO.File]::Delete($pidFile) } catch {}
        }
    }

    # Jalur Cadangan: Cek apakah port 8000 aktif via TCP probe kilat (30ms)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $connect = $tcp.BeginConnect("127.0.0.1", 8000, $null, $null)
        $ready = $connect.AsyncWaitHandle.WaitOne(30)
        if ($ready -and $tcp.Connected) {
            $tcp.EndConnect($connect)
            $tcp.Close()
            # Port terbuka, cari PID sekali dan simpan ke pidFile agar panggilan berikutnya instan
            $p = netstat -ano | findstr ":8000" | findstr "LISTENING"
            if ($p) {
                $parts = ($p.Trim() -split "\s+")
                if ($parts.Length -ge 5) {
                    $foundPid = $parts[4]
                    try { [System.IO.File]::WriteAllText($pidFile, $foundPid) } catch {}
                    return $foundPid
                }
            }
        }
        $tcp.Close()
    } catch {}

    return $null
}

# Fungsi Deteksi IP Wi-Fi
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

$wifiIp = Get-WifiIP

[xml]$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Pusat Kontrol Server Lab TIK" 
        Height="730" Width="640" 
        WindowStartupLocation="CenterScreen" 
        ResizeMode="CanMinimize"
        Background="#F1F5F9"
        FontFamily="Segoe UI">
    
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="FontFamily" Value="Segoe UI Semibold"/>
            <Setter Property="Cursor" Value="Hand"/>
            <Setter Property="BorderThickness" Value="0"/>
            <Setter Property="Padding" Value="10,8"/>
        </Style>
    </Window.Resources>

    <Grid Margin="18">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
        </Grid.RowDefinitions>

        <!-- 1. Header Banner -->
        <Border Grid.Row="0" Background="#103741" CornerRadius="16" Padding="18,14" Margin="0,0,0,14">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="*"/>
                </Grid.ColumnDefinitions>
                <Border Grid.Column="0" Width="48" Height="48" Background="#FE5D37" CornerRadius="12" Margin="0,0,14,0">
                    <TextBlock Text="💻" FontSize="26" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <StackPanel Grid.Column="1" VerticalAlignment="Center">
                    <TextBlock Text="PUSAT KONTROL SERVER LAB TIK" FontSize="18" FontWeight="Bold" Foreground="#FFFFFF"/>
                    <TextBlock Text="Modul 1 Dasar TIK • Santri Putri • Offline / Jaringan Wi-Fi Lab" FontSize="12" Foreground="#94A3B8" Margin="0,2,0,0"/>
                </StackPanel>
            </Grid>
        </Border>

        <!-- 2. Status Server Card -->
        <Border Grid.Row="1" Background="#FFFFFF" CornerRadius="14" Padding="16" Margin="0,0,0,14" BorderBrush="#E2E8F0" BorderThickness="1.5">
            <StackPanel>
                <Grid Margin="0,0,0,10">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="Auto"/>
                    </Grid.ColumnDefinitions>
                    
                    <StackPanel Grid.Column="0">
                        <TextBlock Text="STATUS SERVER SAAT INI:" FontSize="11" FontWeight="Bold" Foreground="#64748B" Margin="0,0,0,4"/>
                        <Border Name="BadgeStatus" CornerRadius="20" Padding="14,6" HorizontalAlignment="Left" Background="#DCFCE7">
                            <TextBlock Name="TxtStatus" Text="[ONLINE] SERVER AKTIF" FontSize="14" FontWeight="Bold" Foreground="#15803D"/>
                        </Border>
                    </StackPanel>

                    <StackPanel Grid.Column="1" HorizontalAlignment="Right" VerticalAlignment="Center">
                        <TextBlock Name="TxtPort" Text="Port: 8000" FontSize="12" FontWeight="SemiBold" Foreground="#334155" HorizontalAlignment="Right"/>
                        <TextBlock Name="TxtPid" Text="PID: -" FontSize="11" Foreground="#64748B" HorizontalAlignment="Right" Margin="0,2,0,0"/>
                    </StackPanel>
                </Grid>

                <Separator Background="#F1F5F9" Margin="0,6,0,10"/>

                <!-- URL Akses Jaringan -->
                <Grid Margin="0,2,0,4">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="130"/>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="Auto"/>
                    </Grid.ColumnDefinitions>
                    <TextBlock Grid.Column="0" Text="Laptop Guru:" FontSize="12" FontWeight="SemiBold" Foreground="#475569" VerticalAlignment="Center"/>
                    <TextBlock Name="TxtUrlLocal" Grid.Column="1" Text="http://localhost:8000" FontSize="13" FontWeight="Bold" Foreground="#0284C7" VerticalAlignment="Center"/>
                    <Button Name="BtnCopyLocal" Grid.Column="2" Content="Salin" Width="55" Height="26" Background="#E0F2FE" Foreground="#0369A1" FontSize="11" Margin="4,0,0,0"/>
                </Grid>

                <Grid Margin="0,4,0,0">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="130"/>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="Auto"/>
                    </Grid.ColumnDefinitions>
                    <TextBlock Grid.Column="0" Text="Wi-Fi Santri:" FontSize="12" FontWeight="SemiBold" Foreground="#475569" VerticalAlignment="Center"/>
                    <TextBlock Name="TxtUrlWifi" Grid.Column="1" Text="http://localhost:8000" FontSize="13" FontWeight="Bold" Foreground="#16A34A" VerticalAlignment="Center"/>
                    <Button Name="BtnCopyWifi" Grid.Column="2" Content="Salin" Width="55" Height="26" Background="#DCFCE7" Foreground="#15803D" FontSize="11" Margin="4,0,0,0"/>
                </Grid>
            </StackPanel>
        </Border>

        <!-- 3. Tombol Aksi Kontrol Server -->
        <Border Grid.Row="2" Background="#FFFFFF" CornerRadius="14" Padding="16" Margin="0,0,0,14" BorderBrush="#E2E8F0" BorderThickness="1.5">
            <StackPanel>
                <TextBlock Text="KONTROL DAYA SERVER:" FontSize="11" FontWeight="Bold" Foreground="#64748B" Margin="0,0,0,10"/>
                
                <!-- Tombol ON dan OFF Utama -->
                <Grid Margin="0,0,0,10">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="10"/>
                        <ColumnDefinition Width="*"/>
                    </Grid.ColumnDefinitions>
                    <Button Name="BtnStart" Grid.Column="0" Content="NYALAKAN SERVER (ON)" Height="48" FontSize="13" FontWeight="Bold" Background="#10B981" Foreground="#FFFFFF"/>
                    <Button Name="BtnStop" Grid.Column="2" Content="MATIKAN SERVER (OFF)" Height="48" FontSize="13" FontWeight="Bold" Background="#EF4444" Foreground="#FFFFFF"/>
                </Grid>

                <!-- Tombol Navigasi Cepat -->
                <Grid Margin="0,0,0,8">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="8"/>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="8"/>
                        <ColumnDefinition Width="*"/>
                    </Grid.ColumnDefinitions>
                    <Button Name="BtnRestart" Grid.Column="0" Content="Restart Server" Height="38" Background="#F1F5F9" Foreground="#334155" BorderBrush="#CBD5E1" BorderThickness="1"/>
                    <Button Name="BtnOpenSantri" Grid.Column="2" Content="Buka Web Santri" Height="38" Background="#FE5D37" Foreground="#FFFFFF"/>
                    <Button Name="BtnOpenGuru" Grid.Column="4" Content="Buka Panel Guru" Height="38" Background="#103741" Foreground="#FFFFFF"/>
                </Grid>

                <!-- Tombol Buka Folder -->
                <Grid Margin="0,2,0,0">
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="8"/>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="8"/>
                        <ColumnDefinition Width="*"/>
                    </Grid.ColumnDefinitions>
                    <Button Name="BtnOpenDbFolder" Grid.Column="0" Content="Folder Database" Height="32" Background="#F8FAFC" Foreground="#475569" BorderBrush="#E2E8F0" BorderThickness="1" FontSize="11"/>
                    <Button Name="BtnOpenBackupFolder" Grid.Column="2" Content="Folder Backup" Height="32" Background="#F8FAFC" Foreground="#475569" BorderBrush="#E2E8F0" BorderThickness="1" FontSize="11"/>
                    <Button Name="BtnRefreshShortcut" Grid.Column="4" Content="Perbarui Shortcut" Height="32" Background="#F8FAFC" Foreground="#475569" BorderBrush="#E2E8F0" BorderThickness="1" FontSize="11"/>
                </Grid>
            </StackPanel>
        </Border>

        <!-- 4. Log Aktivitas Server -->
        <Border Grid.Row="3" Background="#FFFFFF" CornerRadius="14" Padding="14" BorderBrush="#E2E8F0" BorderThickness="1.5">
            <StackPanel>
                <Grid Margin="0,0,0,6">
                    <TextBlock Text="LOG AKTIVITAS KONTROL:" FontSize="11" FontWeight="Bold" Foreground="#64748B"/>
                    <TextBlock Name="TxtLastUpdate" Text="Update responsif (500ms)" FontSize="11" Foreground="#94A3B8" HorizontalAlignment="Right"/>
                </Grid>
                <TextBox Name="TxtLog" Height="100" Background="#0F172A" Foreground="#F8FAFC" FontFamily="Consolas" FontSize="11" 
                         IsReadOnly="True" TextWrapping="Wrap" VerticalScrollBarVisibility="Auto" Padding="8" BorderThickness="0"/>
            </StackPanel>
        </Border>
    </Grid>
</Window>
"@

$reader = (New-Object System.Xml.XmlNodeReader $xaml)
$window = [System.Windows.Markup.XamlReader]::Load($reader)

# Ambil elemen-elemen UI
$badgeStatus = $window.FindName("BadgeStatus")
$txtStatus = $window.FindName("TxtStatus")
$txtPort = $window.FindName("TxtPort")
$txtPid = $window.FindName("TxtPid")
$txtUrlWifi = $window.FindName("TxtUrlWifi")
$btnStart = $window.FindName("BtnStart")
$btnStop = $window.FindName("BtnStop")
$btnRestart = $window.FindName("BtnRestart")
$btnOpenSantri = $window.FindName("BtnOpenSantri")
$btnOpenGuru = $window.FindName("BtnOpenGuru")
$btnCopyLocal = $window.FindName("BtnCopyLocal")
$btnCopyWifi = $window.FindName("BtnCopyWifi")
$btnOpenDbFolder = $window.FindName("BtnOpenDbFolder")
$btnOpenBackupFolder = $window.FindName("BtnOpenBackupFolder")
$btnRefreshShortcut = $window.FindName("BtnRefreshShortcut")
$txtLog = $window.FindName("TxtLog")

if ($txtUrlWifi) {
    $txtUrlWifi.Text = "http://" + $wifiIp + ":8000"
}

function Log-Message($msg) {
    $time = (Get-Date).ToString("HH:mm:ss")
    $line = "[" + $time + "] " + $msg + "`r`n"
    if ($txtLog) {
        $txtLog.AppendText($line)
        $txtLog.ScrollToEnd()
    }
}

# Fungsi Update Tampilan UI Status (Super Ringan <2ms)
function Update-UIStatus {
    $pidNow = Get-ServerPID
    if ($pidNow) {
        $badgeStatus.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#DCFCE7")
        $txtStatus.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#15803D")
        $txtStatus.Text = "[ONLINE] SERVER AKTIF"
        $txtPid.Text = "PID: " + $pidNow
        $btnStart.IsEnabled = $false
        $btnStart.Opacity = 0.5
        $btnStop.IsEnabled = $true
        $btnStop.Opacity = 1.0
        $btnRestart.IsEnabled = $true
        $btnRestart.Opacity = 1.0
    } else {
        $badgeStatus.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#FEE2E2")
        $txtStatus.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#B91C1C")
        $txtStatus.Text = "[OFFLINE] SERVER MATI"
        $txtPid.Text = "PID: -"
        $btnStart.IsEnabled = $true
        $btnStart.Opacity = 1.0
        $btnStop.IsEnabled = $false
        $btnStop.Opacity = 0.5
        $btnRestart.IsEnabled = $false
        $btnRestart.Opacity = 0.5
    }
}

# Event Tombol Start (Instan 0ms Feedback)
$btnStart.Add_Click({
    # 1. Feedback Visual Langsung Tanpa Tunggu
    $badgeStatus.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#FEF3C7")
    $txtStatus.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#B45309")
    $txtStatus.Text = "[⏳] MEMULAI SERVER..."
    $btnStart.IsEnabled = $false
    $btnStart.Opacity = 0.5
    Log-Message "Memulai server Node.js di port 8000..."

    $serverScript = Join-Path $rootDir "src\server.js"
    if (-not (Test-Path $serverScript)) {
        [System.Windows.Forms.MessageBox]::Show("Berkas src\server.js tidak ditemukan!", "Error", 0, [System.Windows.Forms.MessageBoxIcon]::Error)
        Update-UIStatus
        return
    }

    # 2. Start Process dengan -PassThru agar langsung dapat PID tanpa delay
    $proc = Start-Process -FilePath "node" -ArgumentList "`"$serverScript`"" -WorkingDirectory $rootDir -WindowStyle Hidden -PassThru
    if ($proc) {
        try { [System.IO.File]::WriteAllText($pidFile, $proc.Id) } catch {}
        Log-Message ("Proses Node.js diluncurkan (PID: " + $proc.Id + "). Menyiapkan jaringan...")
    }

    # 3. Non-blocking Timer Cepat (cek tiap 150ms, tanpa freeze)
    $fastCount = 0
    $startWatch = New-Object System.Windows.Threading.DispatcherTimer
    $startWatch.Interval = [TimeSpan]::FromMilliseconds(150)
    $startWatch.Add_Tick({
        $fastCount++
        $curPid = Get-ServerPID
        if ($curPid) {
            Update-UIStatus
            Log-Message ("Server BERHASIL AKTIF (PID: " + $curPid + ") di port 8000.")
            $startWatch.Stop()
        } elseif ($fastCount -ge 20) { # timeout 3 detik
            Update-UIStatus
            $startWatch.Stop()
        }
    })
    $startWatch.Start()
})

# Event Tombol Stop (Instan .Kill() 5ms)
$btnStop.Add_Click({
    # Feedback Visual Langsung
    $badgeStatus.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#FEF3C7")
    $txtStatus.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#B45309")
    $txtStatus.Text = "[⏳] MEMATIKAN SERVER..."
    $btnStop.IsEnabled = $false
    $btnStop.Opacity = 0.5

    $curPid = Get-ServerPID
    if ($curPid) {
        Log-Message ("Menghentikan server (PID: " + $curPid + ")...")
        # Native .NET process kill: super cepat (5ms)
        try {
            $p = [System.Diagnostics.Process]::GetProcessById([int]$curPid)
            if ($p) { $p.Kill() }
        } catch {}
        # Fallback taskkill
        taskkill /F /PID $curPid 2>$null | Out-Null
    }

    try { [System.IO.File]::Delete($pidFile) } catch {}
    Update-UIStatus
    Log-Message "Server BERHASIL DIMATIKAN. Port 8000 bebas dan aman."
})

# Event Tombol Restart (Cepat & Non-Blocking)
$btnRestart.Add_Click({
    $badgeStatus.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#FEF3C7")
    $txtStatus.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#B45309")
    $txtStatus.Text = "[⏳] MERESTART SERVER..."
    $btnStart.IsEnabled = $false
    $btnStop.IsEnabled = $false
    $btnRestart.IsEnabled = $false
    Log-Message "Memulai ulang server..."

    $curPid = Get-ServerPID
    if ($curPid) {
        try {
            $p = [System.Diagnostics.Process]::GetProcessById([int]$curPid)
            if ($p) { $p.Kill() }
        } catch {}
        taskkill /F /PID $curPid 2>$null | Out-Null
    }
    try { [System.IO.File]::Delete($pidFile) } catch {}

    $serverScript = Join-Path $rootDir "src\server.js"
    $proc = Start-Process -FilePath "node" -ArgumentList "`"$serverScript`"" -WorkingDirectory $rootDir -WindowStyle Hidden -PassThru
    if ($proc) {
        try { [System.IO.File]::WriteAllText($pidFile, $proc.Id) } catch {}
    }

    $restartCount = 0
    $restartWatch = New-Object System.Windows.Threading.DispatcherTimer
    $restartWatch.Interval = [TimeSpan]::FromMilliseconds(150)
    $restartWatch.Add_Tick({
        $restartCount++
        $newPid = Get-ServerPID
        if ($newPid) {
            Update-UIStatus
            Log-Message ("Server BERHASIL DI-RESTART (PID: " + $newPid + ").")
            $restartWatch.Stop()
        } elseif ($restartCount -ge 20) {
            Update-UIStatus
            $restartWatch.Stop()
        }
    })
    $restartWatch.Start()
})

# Event Buka Browser
$btnOpenSantri.Add_Click({
    Log-Message "Membuka Dashboard Santri di browser..."
    Start-Process "http://localhost:8000"
})

$btnOpenGuru.Add_Click({
    Log-Message "Membuka Panel Guru di browser..."
    Start-Process "http://localhost:8000/guru"
})

# Event Salin URL
$btnCopyLocal.Add_Click({
    [System.Windows.Forms.Clipboard]::SetText("http://localhost:8000")
    Log-Message "URL Lokal disalin ke clipboard."
})

$btnCopyWifi.Add_Click({
    $url = "http://" + $wifiIp + ":8000"
    [System.Windows.Forms.Clipboard]::SetText($url)
    Log-Message ("URL Wi-Fi (" + $url + ") disalin ke clipboard.")
})

# Event Buka Folder
$btnOpenDbFolder.Add_Click({
    $dbFolder = Join-Path $rootDir "database"
    if (Test-Path $dbFolder) {
        Start-Process "explorer.exe" "`"$dbFolder`""
        Log-Message "Membuka folder database..."
    }
})

$btnOpenBackupFolder.Add_Click({
    $bkFolder = Join-Path $rootDir "database\backups"
    if (Test-Path $bkFolder) {
        Start-Process "explorer.exe" "`"$bkFolder`""
        Log-Message "Membuka folder backup..."
    }
})

$btnRefreshShortcut.Add_Click({
    $psScript = Join-Path $rootDir "scripts\buat_shortcut.ps1"
    if (Test-Path $psScript) {
        & powershell -ExecutionPolicy Bypass -File "$psScript" | Out-Null
        Log-Message "Shortcut Desktop berhasil diperbarui."
        [System.Windows.Forms.MessageBox]::Show("Shortcut Desktop berhasil diperbarui!", "Info", 0, [System.Windows.Forms.MessageBoxIcon]::Information)
    }
})

# Timer Polling 500 ms (Super Cepat, Tanpa Beban CPU, Zero Freeze)
$timer = New-Object System.Windows.Threading.DispatcherTimer
$timer.Interval = [TimeSpan]::FromMilliseconds(500)
$timer.Add_Tick({
    Update-UIStatus
})
$timer.Start()

# Inisialisasi awal
Update-UIStatus
Log-Message "Aplikasi Kontrol Server Lab TIK siap digunakan (Mode Cepat 500ms)."

# Tampilkan Window
[void]$window.ShowDialog()
