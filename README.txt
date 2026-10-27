================================================================================
LAB KOMPUTER: MODUL 1 DASAR TIK
Panduan Instalasi, Pengoperasian Jaringan Lab, dan Pemulihan Data
================================================================================

1. KEBUTUHAN SISTEM
--------------------------------------------------------------------------------
- Laptop Guru: Sistem Operasi Windows 10 atau 11 dengan Node.js versi 22.5.0+ 
  (direkomendasikan Node.js 22 LTS atau Node.js 24 LTS).
- Modul database menggunakan "node:sqlite" resmi bawaan Node.js.
  TIDAK memerlukan npm install, koneksi internet, akun cloud, atau paket tambahan.
- Laptop Santri: Browser modern (Google Chrome atau Microsoft Edge).

2. CARA MENJALANKAN SERVER (LAPTOP GURU)
--------------------------------------------------------------------------------
a. Buka folder proyek ini di Terminal / PowerShell.
b. Jalankan perintah:
     node server.js
c. Server akan menampilkan banner informasi, port (8000), serta alamat IP lokal 
   laptop guru di jaringan Wi-Fi Lab (contoh: http://192.168.1.25:8000).
d. Akses lokal Guru:
   - Panel Guru: http://localhost:8000/guru
   - PIN Guru Default: guru1234 (dapat diubah di Panel Guru)

3. CARA AKSES UNTUK SANTRI
--------------------------------------------------------------------------------
a. Hubungkan seluruh laptop santri ke jaringan Wi-Fi yang sama dengan laptop guru.
b. Buka browser (Chrome atau Edge) pada laptop santri.
c. Masukkan alamat IP yang ditampilkan oleh server guru, contoh:
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
a. Database utama bernama "lab.db" (menggunakan mode SQLite WAL berkinerja tinggi).
b. Server secara otomatis membuat snapshot cadangan konsisten ke folder "backups/"
   setiap kali server dimulai (contoh: backups/lab_backup_YYYY-MM-DDTHH-mm-ss.db).
c. Sistem secara otomatis menyimpan 7 cadangan terakhir dan merotasi file lama.

6. PROSEDUR PEMULIHAN DATA (RECOVERY)
--------------------------------------------------------------------------------
Jika terjadi gangguan pada database utama:
a. Hentikan server (Ctrl + C di terminal).
b. Masuk ke folder "backups/" dan pilih file backup terbaru yang valid.
c. Hapus file "lab.db", "lab.db-wal", dan "lab.db-shm" dari folder utama.
d. Salin file backup pilihan Anda ke folder utama dan ubah namanya menjadi "lab.db".
e. Jalankan kembali: node server.js
f. Data akan pulih ke status titik cadangan tersebut.

7. EKSPOR DATA DAN REKAP NILAI
--------------------------------------------------------------------------------
Guru dapat mengunduh rekap nilai santri dalam format CSV yang kompatibel dengan 
Microsoft Excel (dilengkapi UTF-8 BOM dan proteksi formula injection) melalui tombol 
"Ekspor Rekap CSV" pada Panel Guru.
================================================================================
