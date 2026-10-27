================================================================================
LAB KOMPUTER: MODUL 1 DASAR TIK
Pusat Kontrol Server GUI, Panduan Operasional Lab, dan Pemulihan Data
================================================================================

1. KEBUTUHAN SISTEM
--------------------------------------------------------------------------------
- Laptop Guru: Sistem Operasi Windows 10 atau 11 dengan Node.js versi 22.5.0+ 
  (direkomendasikan Node.js 22 LTS atau Node.js 24 LTS).
- Modul database menggunakan "node:sqlite" resmi bawaan Node.js.
  TIDAK memerlukan npm install, koneksi internet, akun cloud, atau paket tambahan.
- Laptop Santri: Browser modern (Google Chrome atau Microsoft Edge).

2. PUSAT KONTROL SERVER (1 APP GUI DESKTOP)
--------------------------------------------------------------------------------
Sistem kini dilengkapi 1 Aplikasi Desktop GUI terpadu yang sangat mudah digunakan:

A. Menjalankan Aplikasi Kontrol:
   - Cukup klik ganda icon di Desktop: "Kontrol Server Lab TIK"
   - Atau klik file "KONTROL_SERVER.bat" / "KONTROL_SERVER.vbs" di folder utama.

B. Fitur Aplikasi GUI Kontrol Server:
   - 🟢 Status Real-Time: Mendeteksi server aktif/mati, port 8000, dan nomor PID.
   - 🚀 ON / NYALAKAN SERVER: Menghidupkan server Node.js di latar belakang.
   - 🛑 OFF / MATIKAN SERVER: Mematikan proses server dengan aman dan tuntas.
   - 🔄 RESTART SERVER: Memulai ulang server dalam 1 klik.
   - 🎒 Buka Web Santri: Membuka browser santri (http://localhost:8000).
   - 👨‍🏫 Buka Panel Guru: Membuka browser guru (http://localhost:8000/guru).
   - 📋 Salin URL Wi-Fi: Mendeteksi IP Wi-Fi guru (misal http://192.168.1.x:8000) 
     dan menyalinnya langsung ke clipboard agar mudah dibagikan ke santri.
   - 📁 Akses Cepat: Membuka folder Database & folder Backup otomatis.
   - 📜 Log Aktivitas: Catatan aktivitas real-time dengan penanda waktu.

3. CARA AKSES UNTUK SANTRI
--------------------------------------------------------------------------------
a. Hubungkan seluruh laptop santri ke jaringan Wi-Fi yang sama dengan laptop guru.
b. Buka browser (Chrome atau Edge) pada laptop santri.
c. Masukkan alamat IP Wi-Fi yang tertera pada GUI Kontrol Server guru, contoh:
     http://192.168.1.25:8000
d. Santri memilih Kelas dan Nama pada halaman aktivasi, lalu memasukkan 
   Kode Aktivasi (diberikan oleh guru melalui Panel Guru) dan membuat PIN 4-digit.
e. Pada sesi belajar berikutnya, santri cukup login menggunakan Kelas, Nama, dan PIN.

4. PENGATURAN FIREWALL DAN ROUTER WI-FI (PENTING)
--------------------------------------------------------------------------------
a. Windows Defender Firewall (Laptop Guru):
   - Saat pertama kali menjalankan server, Windows akan menampilkan jendela peringatan.
   - Centang "Private networks" (Jaringan Pribadi) dan klik "Allow access".
   - Jika santri tidak dapat membuka alamat IP guru:
     Buka Windows Defender Firewall -> "Allow an app through firewall" -> pastikan
     "Node.js: Server-side JavaScript" diizinkan pada profil Private.
b. Pengaturan Router Wi-Fi Lab:
   - Pastikan fitur "AP Isolation" / "Client Isolation" / "Guest Isolation" pada 
     router Wi-Fi dalam kondisi NONAKTIF (Disabled). Jika fitur ini aktif, laptop
     santri tidak akan diizinkan berkomunikasi dengan laptop guru.

5. MANAJEMEN DATABASE DAN CADANGAN (BACKUP)
--------------------------------------------------------------------------------
a. Database utama bernama "lab.db" tersimpan rapi di dalam folder "database/".
b. Server secara otomatis membuat snapshot cadangan konsisten ke folder "database/backups/"
   setiap kali server dimulai (contoh: database/backups/lab_backup_YYYY-MM-DDTHH-mm-ss.db).
c. Sistem secara otomatis menyimpan 7 cadangan terakhir dan merotasi file lama.

6. STRUKTUR DIREKTORI BERSIH DAN RAPI
--------------------------------------------------------------------------------
Folder utama dibuat sangat rapi agar pengajar tidak bingung:

Modul TIK/
│
├── KONTROL_SERVER.bat       # Launcher 1-App GUI Kontrol Server Lab TIK
├── KONTROL_SERVER.vbs       # Launcher senyap tanpa jendela konsol hitam
├── README.txt               # Buku panduan lengkap ini
├── index.html               # Launcher web lokal alternatif
│
├── database/                # Berisi database SQLite & file data
│   ├── lab.db               # Database SQLite utama
│   ├── santri.csv           # Master data 104 santriwati
│   ├── Daftar Nilai.xlsx    # Arsip Excel nilai
│   └── backups/             # Cadangan otomatis terotasi
│
├── src/                     # Backend Modular (Node.js Resmi, Zero NPM)
│   ├── server.js            # Entry point server HTTP
│   ├── config.js            # Konfigurasi port, path, level, XP
│   ├── database.js          # Inisialisasi SQLite & rotasi backup
│   ├── data/                # Bank soal & evaluasi modul
│   ├── utils/               # Keamanan, kriptografi, sanitasi HTTP
│   └── routes/              # Handler API santri dan guru
│
├── public/                  # Frontend Web Modular
│   ├── css/                 # Desain sistem Kindergarten & EdClub
│   └── js/                  # State, auth, kuis, game mouse & keyboard
│
├── scripts/                 # Skrip sistem & batch utilitas
│   ├── kontrol_server.ps1   # Kode aplikasi GUI desktop Windows (WPF)
│   ├── buat_shortcut.ps1    # Generator shortcut desktop otomatis
│   ├── SERVER_ON.bat        # Skrip batch alternatif menyalakan server
│   ├── SERVER_OFF.bat       # Skrip batch alternatif mematikan server
│   └── SERVER_CONTROL.bat   # Skrip konsol kontrol teks
│
└── docs/                    # Dokumentasi & aset referensi desain
================================================================================


