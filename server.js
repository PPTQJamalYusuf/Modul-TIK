/**
 * ============================================================================
 * LAB KOMPUTER: MODUL 1 DASAR TIK
 * Server Backend Mandiri (Pure Node.js + SQLite Bawaan)
 * ============================================================================
 * 
 * CATATAN KOMPATIBILITAS NODE.JS:
 * 1. Modul 'node:sqlite' resmi tersedia secara bawaan mulai Node.js 22.5.0.
 * 2. API tersebut berstatus eksperimental pada rilis awal, namun sangat stabil
 *    dan ideal untuk arsitektur server lokal tanpa dependensi eksternal (zero npm).
 * 3. Versi Node.js yang sangat direkomendasikan adalah Node.js 22 LTS atau yang
 *    lebih baru (misalnya Node.js 24 LTS).
 * 4. Jika versi Node.js yang terpasang di komputer guru lebih rendah dari 22.5.0,
 *    harap perbarui instalasi Node.js dari situs resmi (https://nodejs.org).
 *    Jangan mengganti arsitektur ini atau memasang paket npm pihak ketiga secara
 *    diam-diam agar integritas dan portabilitas aplikasi tetap terjaga.
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. PEMERIKSAAN VERSI DAN KELAYAKAN LINGKUNGAN RUNTIME
// ----------------------------------------------------------------------------
const nodeVersion = process.versions.node;
const [majorVer, minorVer] = nodeVersion.split('.').map(Number);

if (majorVer < 22 || (majorVer === 22 && minorVer < 5)) {
  console.error('\n================================================================');
  console.error('[KESALAHAN KRITIS] VERSI NODE.JS TIDAK KOMPATIBEL!');
  console.error(`Versi terdeteksi: v${nodeVersion}`);
  console.error('Aplikasi ini membutuhkan Node.js v22.5.0 atau yang lebih baru');
  console.error('karena menggunakan modul bawaan resmi "node:sqlite".');
  console.error('Silakan unduh dan instal Node.js versi terbaru dari https://nodejs.org');
  console.error('================================================================\n');
  process.exit(1);
}

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (err) {
  console.error('\n================================================================');
  console.error('[KESALAHAN KRITIS] Modul "node:sqlite" tidak dapat dimuat:');
  console.error(err.message);
  console.error('Pastikan Anda menjalankan runtime Node.js resmi yang mendukung SQLite.');
  console.error('================================================================\n');
  process.exit(1);
}

// ----------------------------------------------------------------------------
// 2. IMPORT MODUL RESMI NODE.JS (ZERO THIRD-PARTY NPM)
// ----------------------------------------------------------------------------
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');

// ----------------------------------------------------------------------------
// 3. KONFIGURASI DAN PATH SISTEM
// ----------------------------------------------------------------------------
const PORT = 8000;
const ROOT_DIR = __dirname;
const DB_PATH = path.join(ROOT_DIR, 'lab.db');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CSV_DEFAULT_PATH = path.join(ROOT_DIR, 'santri.csv');

// Aturan XP resmi terpusat (Server-Side Source of Truth)
const ATURAN_XP = {
  // Pertemuan 1
  'p1_baca_materi': 25,
  'p1_kuis': 30, // 3 soal x 10 XP
  // Pertemuan 2
  'p2_baca_materi': 25,
  'p2_game_mouse_easy': 20,
  'p2_game_mouse_medium': 30,
  'p2_game_mouse_hard': 40,
  'p2_typing_easy': 20,
  'p2_typing_medium': 30,
  'p2_typing_hard': 40,
  'p2_kuis': 30, // 3 soal x 10 XP
  // Pertemuan 3
  'p3_baca_materi': 25,
  'p3_pohon_folder': 40,
  'p3_kuis': 30, // 3 soal x 10 XP
  // Pertemuan 4
  'p4_baca_materi': 25,
  'p4_simulasi_file': 50,
  'p4_evaluasi_kuis': 100, // Maksimal 5 soal x 20 XP
  'p4_checklist_tugas': 10 // Per tugas checklist terverifikasi
};

// Ambang Batas Level Pembelajaran
const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, gelar: 'Pemula Komputer' },
  { level: 2, minXp: 100, gelar: 'Penjelajah Desktop' },
  { level: 3, minXp: 250, gelar: 'Cakap Digital' },
  { level: 4, minXp: 450, gelar: 'Mahir Operasi File' },
  { level: 5, minXp: 600, gelar: 'Bintang Lab TIK' }
];

function hitungLevel(xp) {
  let lvl = 1;
  let gelar = LEVEL_THRESHOLDS[0].gelar;
  for (const item of LEVEL_THRESHOLDS) {
    if (xp >= item.minXp) {
      lvl = item.level;
      gelar = item.gelar;
    }
  }
  return { level: lvl, gelar };
}

// ----------------------------------------------------------------------------
// 4. BANK SOAL KUIS (KUNCI DAN PENJELASAN HANYA DISIMPAN DI SERVER)
// ----------------------------------------------------------------------------
const BANK_SOAL_MINI = {
  // Pertemuan 1: Kenal Perangkat & Navigasi Desktop
  1: [
    {
      id: 'p1_q1',
      pertanyaan: 'Manakah urutan siklus kerja komputer yang benar?',
      pilihan: [
        'Output -> Input -> Proses -> Penyimpanan',
        'Input -> Proses -> Output -> Penyimpanan',
        'Penyimpanan -> Output -> Input -> Proses',
        'Proses -> Input -> Penyimpanan -> Output'
      ],
      kunci: 1,
      penjelasan: 'Komputer menerima data (Input), mengolah data (Proses), menampilkan hasil (Output), dan menyimpannya (Penyimpanan).'
    },
    {
      id: 'p1_q2',
      pertanyaan: 'Komponen hardware apa yang bertugas menyimpan file dan sistem operasi secara permanen walaupun komputer dimatikan?',
      pilihan: [
        'RAM (Memory)',
        'Processor (CPU)',
        'Storage (SSD/Harddisk)',
        'Monitor'
      ],
      kunci: 2,
      penjelasan: 'Storage (SSD atau Harddisk) bersifat permanen (non-volatile), sedangkan RAM bersifat sementara.'
    },
    {
      id: 'p1_q3',
      pertanyaan: 'Shortcut keyboard yang digunakan untuk langsung kembali ke tampilan Desktop di Windows adalah...',
      pilihan: [
        'Ctrl + D',
        'Win + D',
        'Alt + F4',
        'Shift + Esc'
      ],
      kunci: 1,
      penjelasan: 'Tombol Windows (Win) + D berguna untuk meminimalkan semua jendela dan langsung menampilkan Desktop.'
    }
  ],

  // Pertemuan 2: Mouse & Home Row Keyboard
  2: [
    {
      id: 'p2_q1',
      pertanyaan: 'Tombol mouse yang paling sering digunakan untuk memilih ikon, menekan tombol, atau mengklik link adalah...',
      pilihan: [
        'Klik Kanan',
        'Scroll Wheel',
        'Klik Kiri',
        'Double Klik Kanan'
      ],
      kunci: 2,
      penjelasan: 'Klik kiri adalah tombol primer untuk memilih dan mengeksekusi aksi standar di komputer.'
    },
    {
      id: 'p2_q2',
      pertanyaan: 'Pada deretan tombol Home Row keyboard, tombol mana yang memiliki tonjolan kecil penanda posisi jari telunjuk?',
      pilihan: [
        'A dan L',
        'S dan K',
        'D dan J',
        'F dan J'
      ],
      kunci: 3,
      penjelasan: 'Tombol F (jari telunjuk kiri) dan J (jari telunjuk kanan) memiliki tonjolan taktil untuk mengetik 10 jari tanpa melihat.'
    },
    {
      id: 'p2_q3',
      pertanyaan: 'Istilah WPM dalam latihan mengetik merupakan singkatan dari...',
      pilihan: [
        'Words Per Minute (Kata per menit)',
        'Windows Program Manager',
        'Wireless Power Meter',
        'Web Page Module'
      ],
      kunci: 0,
      penjelasan: 'WPM adalah standar internasional pengukuran kecepatan mengetik: (Jumlah karakter / 5) / Waktu dalam menit.'
    }
  ],

  // Pertemuan 3: Folder dan Format File
  3: [
    {
      id: 'p3_q1',
      pertanyaan: 'Format file dokumen berikut yang paling tepat digunakan agar tata letak tidak berubah saat dibuka di berbagai perangkat adalah...',
      pilihan: [
        '.txt',
        '.pdf',
        '.docx',
        '.jpg'
      ],
      kunci: 1,
      penjelasan: 'Format PDF (Portable Document Format) mempertahankan format dan tata letak asli di semua jenis perangkat.'
    },
    {
      id: 'p3_q2',
      pertanyaan: 'Di antara karakter berikut, manakah karakter yang DILARANG digunakan pada penamaan file di sistem Windows?',
      pilihan: [
        'Titik (.) dan Garis Bawah (_)',
        'Tanda Hubung (-) dan Spasi',
        'Tanda Titik Dua (:) dan Garis Miring (/)',
        'Angka (0-9) dan Huruf Kapital'
      ],
      kunci: 2,
      penjelasan: 'Windows melarang 9 karakter khusus: \\ / : * ? " < > | karena digunakan untuk fungsi sistem direktori.'
    },
    {
      id: 'p3_q3',
      pertanyaan: 'Di manakah file sistem utama Windows dan folder instalasi program biasanya berada?',
      pilihan: [
        'Drive C:',
        'Drive D:',
        'Recycle Bin',
        'Network Drive'
      ],
      kunci: 0,
      penjelasan: 'Drive C: adalah drive partisi sistem utama (System Drive) tempat sistem operasi Windows dan Program Files berada.'
    }
  ]
};

// Bank Soal Pertemuan 4: Evaluasi Modul (10 Soal Lengkap, 5 Soal Diacak per Percobaan)
const BANK_SOAL_EVALUASI = [
  {
    id: 'eval_1',
    pertanyaan: 'Apa perbedaan mendasar antara operasi "Copy" dan "Cut" saat mengelola file?',
    pilihan: [
      'Copy menghapus file asli, Cut menggandakannya',
      'Copy menggandakan file, Cut memindahkan file asli ke lokasi baru',
      'Copy hanya untuk folder, Cut hanya untuk file',
      'Tidak ada perbedaan, keduanya menghasilkan salinan yang sama'
    ],
    kunci: 1,
    penjelasan: 'Copy menduplikasi file asli (asli tetap ada), sedangkan Cut memindahkan file asli ke lokasi tujuan baru.'
  },
  {
    id: 'eval_2',
    pertanyaan: 'Shortcut keyboard yang digunakan untuk membatalkan tindakan terakhir (Undo) di Windows adalah...',
    pilihan: [
      'Ctrl + C',
      'Ctrl + V',
      'Ctrl + Z',
      'Ctrl + Y'
    ],
    kunci: 2,
    penjelasan: 'Kombinasi Ctrl + Z membatalkan aksi terakhir (Undo), seperti salah memindahkan atau menghapus file.'
  },
  {
    id: 'eval_3',
    pertanyaan: 'Apa yang terjadi apabila kita menghapus file menggunakan kombinasi tombol "Shift + Delete"?',
    pilihan: [
      'File dipindahkan ke folder Dokumen',
      'File langsung dihapus permanen melewati Recycle Bin',
      'File hanya diganti namanya',
      'File dikompres menjadi file .zip'
    ],
    kunci: 1,
    penjelasan: 'Shift + Delete menghapus file secara langsung tanpa menyimpannya di Recycle Bin, sehingga sulit dipulihkan.'
  },
  {
    id: 'eval_4',
    pertanyaan: 'Tombol fungsi pada keyboard yang digunakan untuk mengganti nama (Rename) file atau folder adalah...',
    pilihan: [
      'F1',
      'F2',
      'F5',
      'F12'
    ],
    kunci: 1,
    penjelasan: 'Tombol F2 adalah pintasan resmi Windows untuk langsung mengubah nama item yang sedang dipilih.'
  },
  {
    id: 'eval_5',
    pertanyaan: 'Pintasan keyboard untuk membuat folder baru secara cepat di File Explorer Windows adalah...',
    pilihan: [
      'Ctrl + N',
      'Ctrl + Shift + N',
      'Alt + N',
      'Shift + N'
    ],
    kunci: 1,
    penjelasan: 'Kombinasi Ctrl + Shift + N langsung membuat folder baru "New folder" di direktori aktif.'
  },
  {
    id: 'eval_6',
    pertanyaan: 'Di mana file yang dihapus secara biasa (menekan Delete) ditampung sebelum benar-benar dibersihkan?',
    pilihan: [
      'Downloads',
      'Control Panel',
      'Recycle Bin',
      'Drive D:'
    ],
    kunci: 2,
    penjelasan: 'Recycle Bin berfungsi sebagai tempat penampungan sementara file yang dihapus agar dapat dipulihkan (Restore).'
  },
  {
    id: 'eval_7',
    pertanyaan: 'Pintasan keyboard untuk memilih seluruh file atau teks (Select All) dalam satu folder adalah...',
    pilihan: [
      'Ctrl + S',
      'Ctrl + A',
      'Ctrl + Shift + A',
      'Alt + A'
    ],
    kunci: 1,
    penjelasan: 'Ctrl + A (All) menyeleksi semua item sekaligus.'
  },
  {
    id: 'eval_8',
    pertanyaan: 'Mengapa kita disarankan menggunakan fitur "Safely Remove / Eject" sebelum mencabut flashdisk?',
    pilihan: [
      'Agar flashdisk tidak kehilangan daya baterai',
      'Mencegah kerusakan data karena proses tulis/baca file belum selesai sempurna',
      'Supaya flashdisk otomatis terformat',
      'Hanya sebagai formalitas tanpa fungsi teknis'
    ],
    kunci: 1,
    penjelasan: 'Safely Remove memastikan cache penulisan file telah selesai ditransfer ke flashdisk sebelum daya diputus.'
  },
  {
    id: 'eval_9',
    pertanyaan: 'Manakah contoh penamaan file yang baik, tertib, dan mencerminkan adab kerapian santri?',
    pilihan: [
      'tugasbaru_fix_banget_final.docx',
      'TugasTIK_Aisyah_Kelas1_20261027.docx',
      'asdfghjk.txt',
      'tugas1(1)(2).pdf'
    ],
    kunci: 1,
    penjelasan: 'Nama file yang baik memuat topik tugas, nama pemilik, kelas, dan tanggal untuk memudahkan pencarian.'
  },
  {
    id: 'eval_10',
    pertanyaan: 'Langkah yang benar dan aman untuk mematikan komputer setelah selesai sesi praktikum adalah...',
    pilihan: [
      'Menekan tombol power pada CPU selama 10 detik',
      'Langsung mencabut kabel colokan listrik dari stopkontak',
      'Klik tombol Start -> pilih icon Power -> klik Shut Down dan tunggu hingga layar mati',
      'Menutup layar laptop secara mendadak saat aplikasi masih menyimpan data'
    ],
    kunci: 2,
    penjelasan: 'Prosedur Shut Down resmi memastikan seluruh program ditutup rapi dan berkas sistem tidak mengalami kerusakan (corrupt).'
  }
];

// ----------------------------------------------------------------------------
// 5. HELPER KRIPTOGRAFI DAN KEAMANAN
// ----------------------------------------------------------------------------
function hashPin(pin, salt) {
  return crypto.scryptSync(pin, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
}

function buatSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function verifikasiPin(pinInput, salt, storedHash) {
  try {
    const computedHash = crypto.scryptSync(pinInput, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function buatTokenSesi() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buatKodeAktivasi() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AKT-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Pelacak upaya login untuk mencegah Brute Force (Rate Limiting di Memory)
const pelacakLogin = new Map();

function periksaRateLimit(kunciIdentitas) {
  const sekarang = Date.now();
  const info = pelacakLogin.get(kunciIdentitas);
  if (!info) return { diizinkan: true };
  if (info.terkunciSampai && info.terkunciSampai > sekarang) {
    const sisaDetik = Math.ceil((info.terkunciSampai - sekarang) / 1000);
    return { diizinkan: false, sisaDetik };
  }
  return { diizinkan: true };
}

function catatGagalLogin(kunciIdentitas) {
  const sekarang = Date.now();
  let info = pelacakLogin.get(kunciIdentitas) || { gagal: 0, terkunciSampai: 0 };
  info.gagal += 1;
  if (info.gagal >= 5) {
    info.terkunciSampai = sekarang + 30000; // Kunci 30 detik
    info.gagal = 0; // Reset counter setelah dikunci
  }
  pelacakLogin.set(kunciIdentitas, info);
}

function resetGagalLogin(kunciIdentitas) {
  pelacakLogin.delete(kunciIdentitas);
}

// ----------------------------------------------------------------------------
// 6. INISIALISASI DATABASE SQLITE DAN BACKUP OTOMATIS
// ----------------------------------------------------------------------------
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Konfigurasi performa & integritas data SQLite
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');

function initDatabaseSchema() {
  db.exec(`
    -- Tabel Akun Santri
    CREATE TABLE IF NOT EXISTS santri (
      id TEXT PRIMARY KEY,
      kelas INTEGER NOT NULL,
      nama TEXT NOT NULL,
      kode_aktivasi TEXT,
      pin_hash TEXT,
      pin_salt TEXT,
      pin_aktif INTEGER NOT NULL DEFAULT 0,
      dibuat INTEGER NOT NULL
    );

    -- Tabel Sesi Pengguna (Guru dan Santri)
    CREATE TABLE IF NOT EXISTS sesi (
      token_hash TEXT PRIMARY KEY,
      santri_id TEXT,
      peran TEXT NOT NULL,
      perangkat TEXT,
      dibuat INTEGER NOT NULL,
      kedaluwarsa INTEGER NOT NULL,
      aktif INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
    );

    -- Tabel Status Buka / Kunci Pertemuan per Kelas
    CREATE TABLE IF NOT EXISTS pembukaan_pertemuan (
      kelas INTEGER NOT NULL,
      modul INTEGER NOT NULL DEFAULT 1,
      pertemuan INTEGER NOT NULL,
      terbuka INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (kelas, modul, pertemuan)
    );

    -- Tabel Aktivitas Terverifikasi (Idempotensi XP, Mencegah Dobel)
    CREATE TABLE IF NOT EXISTS aktivitas_terverifikasi (
      id TEXT PRIMARY KEY,
      santri_id TEXT NOT NULL,
      modul INTEGER NOT NULL DEFAULT 1,
      pertemuan INTEGER NOT NULL,
      jenis_aktivitas TEXT NOT NULL,
      xp INTEGER NOT NULL,
      waktu INTEGER NOT NULL,
      FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
    );

    -- Tabel Progres Rinci per Pertemuan
    CREATE TABLE IF NOT EXISTS progres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      santri_id TEXT NOT NULL,
      modul INTEGER NOT NULL DEFAULT 1,
      pertemuan INTEGER NOT NULL,
      aktivitas TEXT NOT NULL,
      status TEXT NOT NULL,
      skor INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      waktu INTEGER NOT NULL,
      UNIQUE (santri_id, modul, pertemuan, aktivitas),
      FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
    );

    -- Tabel Status Belajar Utama Santri (Level & Total XP)
    CREATE TABLE IF NOT EXISTS status_belajar (
      santri_id TEXT PRIMARY KEY,
      modul INTEGER NOT NULL DEFAULT 1,
      pertemuan_terakhir INTEGER NOT NULL DEFAULT 1,
      aktivitas_terakhir TEXT DEFAULT '',
      total_xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      gelar TEXT DEFAULT 'Pemula Komputer',
      diperbarui INTEGER NOT NULL,
      FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
    );

    -- Tabel Checklist Praktik Laptop Asli
    CREATE TABLE IF NOT EXISTS checklist_praktik (
      santri_id TEXT NOT NULL,
      modul INTEGER NOT NULL DEFAULT 1,
      pertemuan INTEGER NOT NULL,
      tugas_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'mandiri', 'diverifikasi_guru'
      waktu INTEGER NOT NULL,
      PRIMARY KEY (santri_id, modul, pertemuan, tugas_id),
      FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
    );

    -- Tabel Rekap Hasil Kuis
    CREATE TABLE IF NOT EXISTS hasil_kuis (
      santri_id TEXT NOT NULL,
      modul INTEGER NOT NULL DEFAULT 1,
      pertemuan INTEGER NOT NULL,
      skor_terbaru INTEGER NOT NULL,
      skor_terbaik INTEGER NOT NULL,
      jumlah_percobaan INTEGER NOT NULL DEFAULT 1,
      waktu INTEGER NOT NULL,
      PRIMARY KEY (santri_id, modul, pertemuan),
      FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE
    );

    -- Tabel Konfigurasi Guru dan Pengaturan Internal
    CREATE TABLE IF NOT EXISTS konfigurasi_guru (
      kunci TEXT PRIMARY KEY,
      nilai TEXT NOT NULL
    );

    -- Tabel Audit Tindakan Guru
    CREATE TABLE IF NOT EXISTS audit_guru (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tindakan TEXT NOT NULL,
      target_santri_id TEXT,
      keterangan TEXT,
      waktu INTEGER NOT NULL
    );

    -- Indeks Kinerja
    CREATE INDEX IF NOT EXISTS idx_santri_kelas ON santri(kelas);
    CREATE INDEX IF NOT EXISTS idx_sesi_santri ON sesi(santri_id);
    CREATE INDEX IF NOT EXISTS idx_progres_santri ON progres(santri_id);
    CREATE INDEX IF NOT EXISTS idx_aktivitas_santri ON aktivitas_terverifikasi(santri_id);
    CREATE INDEX IF NOT EXISTS idx_status_belajar_xp ON status_belajar(total_xp DESC);
  `);

  // Inisialisasi kredensial guru default jika belum ada
  const guruPinRow = db.prepare('SELECT nilai FROM konfigurasi_guru WHERE kunci = ?').get('pin_guru_hash');
  if (!guruPinRow) {
    const saltGuru = buatSalt();
    const hashGuru = hashPin('guru1234', saltGuru);
    db.prepare('INSERT INTO konfigurasi_guru (kunci, nilai) VALUES (?, ?)').run('pin_guru_salt', saltGuru);
    db.prepare('INSERT INTO konfigurasi_guru (kunci, nilai) VALUES (?, ?)').run('pin_guru_hash', hashGuru);
  }

  // Inisialisasi kunci pembukaan pertemuan:
  // Pertemuan 1 terbuka secara default untuk kelas 1-12. Pertemuan 2-4 terkunci.
  const stmtCheck = db.prepare('SELECT COUNT(*) as count FROM pembukaan_pertemuan');
  const countRow = stmtCheck.get();
  if (countRow.count === 0) {
    const stmtInsert = db.prepare(`
      INSERT OR IGNORE INTO pembukaan_pertemuan (kelas, modul, pertemuan, terbuka)
      VALUES (?, 1, ?, ?)
    `);
    for (let k = 1; k <= 12; k++) {
      stmtInsert.run(k, 1, 1); // Pertemuan 1 Terbuka
      stmtInsert.run(k, 2, 0); // Pertemuan 2 Terkunci
      stmtInsert.run(k, 3, 0); // Pertemuan 3 Terkunci
      stmtInsert.run(k, 4, 0); // Pertemuan 4 Terkunci
    }
  }
}

initDatabaseSchema();

// Backup otomatis saat server pertama kali start
function lakukanBackupDatabase() {
  try {
    const waktu = new Date();
    const timestamp = waktu.toISOString().replace(/[:.]/g, '-');
    const namaBackup = `lab_backup_${timestamp}.db`;
    const targetFile = path.join(BACKUP_DIR, namaBackup);

    // Pastikan WAL ter-flush sempurna ke database utama sebelum copy
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    fs.copyFileSync(DB_PATH, targetFile);

    // Rotasi backup: simpan maksimal 7 backup terakhir
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('lab_backup_') && f.endsWith('.db'))
      .sort();

    while (files.length > 7) {
      const tertua = files.shift();
      try {
        fs.unlinkSync(path.join(BACKUP_DIR, tertua));
      } catch {}
    }
    console.log(`[BACKUP] Berhasil membuat backup database: ${namaBackup}`);
  } catch (err) {
    console.error('[BACKUP] Gagal membuat backup database:', err.message);
  }
}

lakukanBackupDatabase();

// Impor otomatis santri.csv jika tabel santri masih kosong
function autoImporSantriAwal() {
  const count = db.prepare('SELECT COUNT(*) as jml FROM santri').get().jml;
  if (count === 0 && fs.existsSync(CSV_DEFAULT_PATH)) {
    try {
      const isi = fs.readFileSync(CSV_DEFAULT_PATH, 'utf-8');
      prosesImporCsvInternal(isi);
      console.log('[IMPOR OTOMATIS] Data santri dari santri.csv berhasil dimuat.');
    } catch (err) {
      console.error('[IMPOR OTOMATIS] Gagal mengimpor santri.csv:', err.message);
    }
  }
}

function prosesImporCsvInternal(csvContent) {
  // Tangani UTF-8 BOM jika ada
  let teks = csvContent;
  if (teks.charCodeAt(0) === 0xFEFF) {
    teks = teks.slice(1);
  }

  const lines = teks.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return { berhasil: 0, gagal: 0, catatan: ['File CSV kosong atau hanya header'] };

  // Validasi Header
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const idxKelas = header.indexOf('kelas');
  const idxNama = header.indexOf('nama');

  if (idxKelas === -1 || idxNama === -1) {
    return { berhasil: 0, gagal: 0, catatan: ['Header CSV wajib memiliki kolom "kelas" dan "nama"'] };
  }

  const stmtGetMaxId = db.prepare('SELECT MAX(CAST(SUBSTR(id, 2) AS INTEGER)) as max_num FROM santri');
  let currentMax = stmtGetMaxId.get().max_num || 0;

  const stmtInsert = db.prepare(`
    INSERT INTO santri (id, kelas, nama, kode_aktivasi, pin_aktif, dibuat)
    VALUES (?, ?, ?, ?, 0, ?)
  `);

  const stmtStatus = db.prepare(`
    INSERT OR IGNORE INTO status_belajar (santri_id, modul, pertemuan_terakhir, aktivitas_terakhir, total_xp, level, gelar, diperbarui)
    VALUES (?, 1, 1, '', 0, 1, 'Pemula Komputer', ?)
  `);

  const stmtKunci = db.prepare(`
    INSERT OR IGNORE INTO pembukaan_pertemuan (kelas, modul, pertemuan, terbuka)
    VALUES (?, 1, ?, ?)
  `);

  let berhasil = 0;
  let gagal = 0;
  const catatan = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    const kelasStr = row[idxKelas];
    const nama = row[idxNama];
    const kelasNum = parseInt(kelasStr, 10);

    if (isNaN(kelasNum) || kelasNum < 1 || kelasNum > 12 || !nama) {
      gagal++;
      catatan.push(`Baris ${i + 1} diabaikan: Format kelas (1-12) atau nama tidak valid`);
      continue;
    }

    currentMax++;
    const santriId = 'S' + String(currentMax).padStart(3, '0');
    const kodeAktivasi = buatKodeAktivasi();
    const sekarang = Date.now();

    try {
      stmtInsert.run(santriId, kelasNum, nama, kodeAktivasi, sekarang);
      stmtStatus.run(santriId, sekarang);
      stmtKunci.run(kelasNum, 1, 1);
      stmtKunci.run(kelasNum, 2, 0);
      stmtKunci.run(kelasNum, 3, 0);
      stmtKunci.run(kelasNum, 4, 0);
      berhasil++;
    } catch (e) {
      gagal++;
      catatan.push(`Baris ${i + 1} (${nama}): ${e.message}`);
    }
  }

  return { berhasil, gagal, catatan };
}

autoImporSantriAwal();

// ----------------------------------------------------------------------------
// 7. HELPER HTTP DAN MIDDLEWARE AUTENTIKASI
// ----------------------------------------------------------------------------
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    const val = decodeURIComponent(parts.join('='));
    list[key] = val;
  });
  return list;
}

function sendJson(res, statusCode, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { status: 'error', pesan: message });
}

function readBodyJson(req, maxBytes = 1048576) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        reject(new Error('Ukuran data request melebihi batas'));
      } else {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      try {
        const str = Buffer.concat(chunks).toString('utf-8');
        if (!str || str.trim() === '') return resolve({});
        const parsed = JSON.parse(str);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Format JSON data request tidak valid'));
      }
    });
    req.on('error', reject);
  });
}

function readBodyText(req, maxBytes = 5242880) { // 5MB untuk CSV
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        reject(new Error('Ukuran file melebihi batas 5MB'));
      } else {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });
    req.on('error', reject);
  });
}

// Verifikasi Sesi Token (Santri atau Guru)
function verifikasiSesi(req) {
  const cookies = parseCookies(req);
  let rawToken = cookies.session_token;

  // Fallback: Authorization header "Bearer <token>"
  const authHeader = req.headers['authorization'];
  if (!rawToken && authHeader && authHeader.startsWith('Bearer ')) {
    rawToken = authHeader.slice(7).trim();
  }

  if (!rawToken) return null;

  const tHash = hashToken(rawToken);
  const sekarang = Date.now();

  const stmt = db.prepare(`
    SELECT s.token_hash, s.santri_id, s.peran, s.kedaluwarsa,
           st.nama, st.kelas
    FROM sesi s
    LEFT JOIN santri st ON s.santri_id = st.id
    WHERE s.token_hash = ? AND s.aktif = 1 AND s.kedaluwarsa > ?
  `);

  const row = stmt.get(tHash, sekarang);
  if (!row) return null;

  return {
    tokenHash: row.token_hash,
    santriId: row.santri_id,
    peran: row.peran,
    nama: row.nama,
    kelas: row.kelas
  };
}

// ----------------------------------------------------------------------------
// 8. LOGIKA BISNIS: PROGRESS, LEVEL, DAN PEMBERIAN XP ATOMIK
// ----------------------------------------------------------------------------
function beriXpSantriAtomik(santriId, modul, pertemuan, jenisAktivitas, xpReward, namaAktivitas = '') {
  // Id aktivitas unik: santriId_modul_pertemuan_jenisAktivitas
  const idAktivitas = `${santriId}_m${modul}_p${pertemuan}_${jenisAktivitas}`;
  const sekarang = Date.now();

  // 1. Periksa apakah aktivitas ini sudah pernah diberi XP
  const cek = db.prepare('SELECT id, xp FROM aktivitas_terverifikasi WHERE id = ?').get(idAktivitas);
  if (cek) {
    // Sudah pernah diselesaikan, jangan gandakan XP
    const sb = db.prepare('SELECT total_xp, level, gelar FROM status_belajar WHERE santri_id = ?').get(santriId);
    return {
      berhasil: true,
      sudah_pernah: true,
      xp_diberikan: 0,
      total_xp: sb ? sb.total_xp : 0,
      level: sb ? sb.level : 1,
      gelar: sb ? sb.gelar : 'Pemula Komputer'
    };
  }

  // 2. Berikan XP dalam transaksi aman
  db.exec('BEGIN TRANSACTION;');
  try {
    // Catat ke tabel aktivitas_terverifikasi
    db.prepare(`
      INSERT INTO aktivitas_terverifikasi (id, santri_id, modul, pertemuan, jenis_aktivitas, xp, waktu)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(idAktivitas, santriId, modul, pertemuan, jenisAktivitas, xpReward, sekarang);

    // Catat ke tabel progres
    db.prepare(`
      INSERT INTO progres (santri_id, modul, pertemuan, aktivitas, status, xp, waktu)
      VALUES (?, ?, ?, ?, 'selesai', ?, ?)
      ON CONFLICT(santri_id, modul, pertemuan, aktivitas)
      DO UPDATE SET status = 'selesai', xp = ?, waktu = ?
    `).run(santriId, modul, pertemuan, namaAktivitas || jenisAktivitas, xpReward, sekarang, xpReward, sekarang);

    // Update total XP dan kalkulasi level baru
    const sbOld = db.prepare('SELECT total_xp FROM status_belajar WHERE santri_id = ?').get(santriId);
    const xpBaru = (sbOld ? sbOld.total_xp : 0) + xpReward;
    const { level, gelar } = hitungLevel(xpBaru);

    db.prepare(`
      UPDATE status_belajar
      SET total_xp = ?, level = ?, gelar = ?, pertemuan_terakhir = MAX(pertemuan_terakhir, ?),
          aktivitas_terakhir = ?, diperbarui = ?
      WHERE santri_id = ?
    `).run(xpBaru, level, gelar, pertemuan, namaAktivitas || jenisAktivitas, sekarang, santriId);

    db.exec('COMMIT;');

    return {
      berhasil: true,
      sudah_pernah: false,
      xp_diberikan: xpReward,
      total_xp: xpBaru,
      level,
      gelar
    };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

// ----------------------------------------------------------------------------
// 9. ROUTER DAN PENANGANAN REQUEST HTTP
// ----------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;
  const clientIp = req.socket.remoteAddress || 'unknown';

  // Penanganan File Statis (HANYA index.html yang disajikan secara publik)
  if (method === 'GET' && (pathname === '/' || pathname === '/index.html' || pathname === '/guru')) {
    if (!fs.existsSync(INDEX_HTML_PATH)) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Antarmuka pengguna (index.html) sedang disiapkan. Silakan refresh sebentar lagi.');
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    fs.createReadStream(INDEX_HTML_PATH).pipe(res);
    return;
  }

  // --------------------------------------------------------------------------
  // API PUBLIK: STATUS & DAFTAR SANTRI
  // --------------------------------------------------------------------------
  if (method === 'GET' && pathname === '/api/status') {
    return sendJson(res, 200, {
      status: 'ok',
      aplikasi: 'Lab Komputer: Modul 1 Dasar TIK',
      node_version: process.versions.node,
      waktu_server: Date.now()
    });
  }

  // Daftar santri publik (untuk dropdown login / aktivasi santri)
  // TIDAK MEMBOCORKAN HASH, SALT, KODE AKTIVASI, ATAU PIN
  if (method === 'GET' && pathname === '/api/santri/daftar-publik') {
    const kelasFilter = urlObj.searchParams.get('kelas');
    let query = 'SELECT id, kelas, nama, pin_aktif FROM santri';
    const params = [];
    if (kelasFilter) {
      query += ' WHERE kelas = ?';
      params.push(parseInt(kelasFilter, 10));
    }
    query += ' ORDER BY kelas ASC, nama ASC';
    const list = db.prepare(query).all(...params);
    return sendJson(res, 200, { status: 'sukses', santri: list });
  }

  // --------------------------------------------------------------------------
  // API AUTENTIKASI SANTRI: AKTIVASI & LOGIN
  // --------------------------------------------------------------------------
  if (method === 'POST' && pathname === '/api/santri/aktivasi') {
    try {
      const body = await readBodyJson(req);
      const { santri_id, kode_aktivasi, pin } = body;

      if (!santri_id || !kode_aktivasi || !pin) {
        return sendError(res, 400, 'ID Santri, kode aktivasi, dan PIN 4-digit wajib diisi');
      }

      if (!/^\d{4}$/.test(pin)) {
        return sendError(res, 400, 'PIN harus berupa 4 angka numerik');
      }

      const santri = db.prepare('SELECT * FROM santri WHERE id = ?').get(santri_id);
      if (!santri) {
        return sendError(res, 404, 'Akun santri tidak ditemukan');
      }

      if (santri.pin_aktif === 1) {
        return sendError(res, 400, 'Akun ini sudah aktif. Silakan langsung login dengan PIN');
      }

      if (santri.kode_aktivasi !== kode_aktivasi.trim().toUpperCase()) {
        return sendError(res, 401, 'Kode aktivasi tidak sesuai. Minta kode aktivasi resmi dari Guru');
      }

      // Hash PIN dengan scrypt dan salt acak
      const salt = buatSalt();
      const hash = hashPin(pin, salt);
      const sekarang = Date.now();

      db.prepare(`
        UPDATE santri
        SET pin_hash = ?, pin_salt = ?, pin_aktif = 1, kode_aktivasi = NULL
        WHERE id = ?
      `).run(hash, salt, santri_id);

      // Terbitkan sesi login pertama
      const rawToken = buatTokenSesi();
      const tHash = hashToken(rawToken);
      const kedaluwarsa = sekarang + (24 * 60 * 60 * 1000); // 24 Jam

      db.prepare(`
        INSERT INTO sesi (token_hash, santri_id, peran, perangkat, dibuat, kedaluwarsa, aktif)
        VALUES (?, ?, 'santri', ?, ?, ?, 1)
      `).run(tHash, santri_id, req.headers['user-agent'] || 'Browser Santri', sekarang, kedaluwarsa);

      const cookieHeader = `session_token=${rawToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;

      return sendJson(res, 200, {
        status: 'sukses',
        pesan: 'Aktivasi akun berhasil! Selamat datang di Lab Komputer TIK.',
        token: rawToken,
        santri: {
          id: santri.id,
          nama: santri.nama,
          kelas: santri.kelas
        }
      }, { 'Set-Cookie': cookieHeader });
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  if (method === 'POST' && pathname === '/api/santri/login') {
    try {
      const body = await readBodyJson(req);
      const { santri_id, pin } = body;

      if (!santri_id || !pin) {
        return sendError(res, 400, 'Pilih akun santri dan masukkan PIN');
      }

      const rateKey = `santri_${santri_id}_${clientIp}`;
      const rateCek = periksaRateLimit(rateKey);
      if (!rateCek.diizinkan) {
        return sendError(res, 429, `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${rateCek.sisaDetik} detik.`);
      }

      const santri = db.prepare('SELECT * FROM santri WHERE id = ?').get(santri_id);
      if (!santri || santri.pin_aktif !== 1 || !santri.pin_hash || !santri.pin_salt) {
        catatGagalLogin(rateKey);
        return sendError(res, 401, 'Akun belum aktif atau identitas/PIN tidak valid');
      }

      const cocok = verifikasiPin(pin, santri.pin_salt, santri.pin_hash);
      if (!cocok) {
        catatGagalLogin(rateKey);
        return sendError(res, 401, 'Identitas akun atau PIN yang dimasukkan keliru');
      }

      resetGagalLogin(rateKey);

      // PENCEGAHAN SESI GANDA: Cabut sesi aktif sebelumnya untuk akun ini secara atomik
      db.prepare('UPDATE sesi SET aktif = 0 WHERE santri_id = ? AND aktif = 1').run(santri.id);

      const rawToken = buatTokenSesi();
      const tHash = hashToken(rawToken);
      const sekarang = Date.now();
      const kedaluwarsa = sekarang + (24 * 60 * 60 * 1000);

      db.prepare(`
        INSERT INTO sesi (token_hash, santri_id, peran, perangkat, dibuat, kedaluwarsa, aktif)
        VALUES (?, ?, 'santri', ?, ?, ?, 1)
      `).run(tHash, santri.id, req.headers['user-agent'] || 'Browser Santri', sekarang, kedaluwarsa);

      const cookieHeader = `session_token=${rawToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;

      // Ambil profil belajar terkini
      const sb = db.prepare('SELECT total_xp, level, gelar, pertemuan_terakhir, aktivitas_terakhir FROM status_belajar WHERE santri_id = ?').get(santri.id);

      return sendJson(res, 200, {
        status: 'sukses',
        pesan: 'Login berhasil',
        token: rawToken,
        santri: {
          id: santri.id,
          nama: santri.nama,
          kelas: santri.kelas,
          total_xp: sb ? sb.total_xp : 0,
          level: sb ? sb.level : 1,
          gelar: sb ? sb.gelar : 'Pemula Komputer',
          pertemuan_terakhir: sb ? sb.pertemuan_terakhir : 1,
          aktivitas_terakhir: sb ? sb.aktivitas_terakhir : ''
        }
      }, { 'Set-Cookie': cookieHeader });
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  // Logout (Mencabut sesi di server)
  if (method === 'POST' && pathname === '/api/logout') {
    const sesi = verifikasiSesi(req);
    if (sesi) {
      db.prepare('UPDATE sesi SET aktif = 0 WHERE token_hash = ?').run(sesi.tokenHash);
    }
    const cookieHeader = 'session_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
    return sendJson(res, 200, { status: 'sukses', pesan: 'Logout berhasil' }, { 'Set-Cookie': cookieHeader });
  }

  // --------------------------------------------------------------------------
  // API GURU: LOGIN
  // --------------------------------------------------------------------------
  if (method === 'POST' && pathname === '/api/guru/login') {
    try {
      const body = await readBodyJson(req);
      const { pin } = body;
      if (!pin) return sendError(res, 400, 'PIN Guru wajib diisi');

      const rateKey = `guru_${clientIp}`;
      const rateCek = periksaRateLimit(rateKey);
      if (!rateCek.diizinkan) {
        return sendError(res, 429, `Upaya login terkunci. Coba lagi dalam ${rateCek.sisaDetik} detik.`);
      }

      const saltRow = db.prepare('SELECT nilai FROM konfigurasi_guru WHERE kunci = ?').get('pin_guru_salt');
      const hashRow = db.prepare('SELECT nilai FROM konfigurasi_guru WHERE kunci = ?').get('pin_guru_hash');

      if (!saltRow || !hashRow) {
        return sendError(res, 500, 'Kredensial guru belum diinisialisasi');
      }

      const cocok = verifikasiPin(pin, saltRow.nilai, hashRow.nilai);
      if (!cocok) {
        catatGagalLogin(rateKey);
        return sendError(res, 401, 'PIN Guru tidak valid');
      }

      resetGagalLogin(rateKey);

      const rawToken = buatTokenSesi();
      const tHash = hashToken(rawToken);
      const sekarang = Date.now();
      const kedaluwarsa = sekarang + (12 * 60 * 60 * 1000); // 12 Jam

      db.prepare(`
        INSERT INTO sesi (token_hash, santri_id, peran, perangkat, dibuat, kedaluwarsa, aktif)
        VALUES (?, NULL, 'guru', ?, ?, ?, 1)
      `).run(tHash, req.headers['user-agent'] || 'Laptop Guru', sekarang, kedaluwarsa);

      const cookieHeader = `session_token=${rawToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200`;
      return sendJson(res, 200, {
        status: 'sukses',
        pesan: 'Selamat datang di Panel Guru Lab TIK',
        token: rawToken
      }, { 'Set-Cookie': cookieHeader });
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  // --------------------------------------------------------------------------
  // API LEADERBOARD (TERBUKA UNTUK SANTRI/GURU TERAUTENTIKASI, POLLING 5 DETIK)
  // --------------------------------------------------------------------------
  if (method === 'GET' && pathname === '/api/leaderboard') {
    const sesi = verifikasiSesi(req);
    if (!sesi) return sendError(res, 401, 'Sesi tidak valid atau telah kedaluwarsa');

    // Tab Semua Kelas (Top 25)
    const semuaKelas = db.prepare(`
      SELECT s.id, s.nama, s.kelas, sb.total_xp, sb.level, sb.gelar
      FROM status_belajar sb
      JOIN santri s ON sb.santri_id = s.id
      ORDER BY sb.total_xp DESC, sb.level DESC, s.nama ASC
      LIMIT 25
    `).all();

    // Tab Kelas Saya
    let kelasSaya = [];
    let peringkatSaya = null;

    if (sesi.peran === 'santri' && sesi.kelas) {
      kelasSaya = db.prepare(`
        SELECT s.id, s.nama, s.kelas, sb.total_xp, sb.level, sb.gelar
        FROM status_belajar sb
        JOIN santri s ON sb.santri_id = s.id
        WHERE s.kelas = ?
        ORDER BY sb.total_xp DESC, sb.level DESC, s.nama ASC
      `).all(sesi.kelas);

      const idx = kelasSaya.findIndex(item => item.id === sesi.santriId);
      if (idx !== -1) {
        peringkatSaya = idx + 1;
      }
    }

    return sendJson(res, 200, {
      status: 'sukses',
      semua_kelas: semuaKelas,
      kelas_saya: kelasSaya,
      santri_aktif_id: sesi.santriId,
      peringkat_kelas: peringkatSaya
    });
  }

  // --------------------------------------------------------------------------
  // API AREA SANTRI (MEMBUTUHKAN PERAN 'santri')
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/api/santri/')) {
    const sesi = verifikasiSesi(req);
    if (!sesi || sesi.peran !== 'santri') {
      return sendError(res, 401, 'Akses terbatas untuk akun santri');
    }

    const santriId = sesi.santriId;
    const kelasSantri = sesi.kelas;

    // Profil Lengkap & Status Kunci Pertemuan
    if (method === 'GET' && pathname === '/api/santri/profil') {
      const santri = db.prepare('SELECT id, kelas, nama FROM santri WHERE id = ?').get(santriId);
      const sb = db.prepare('SELECT * FROM status_belajar WHERE santri_id = ?').get(santriId);

      // Status pembukaan pertemuan untuk kelas santri ini
      const pertemuanRows = db.prepare(`
        SELECT pertemuan, terbuka FROM pembukaan_pertemuan
        WHERE kelas = ? AND modul = 1
        ORDER BY pertemuan ASC
      `).all(kelasSantri);

      // Hitung ringkasan kuis dan checklist
      const rekapKuis = db.prepare(`
        SELECT pertemuan, skor_terbaik, skor_terbaru, jumlah_percobaan
        FROM hasil_kuis WHERE santri_id = ? AND modul = 1
      `).all(santriId);

      const rekapChecklist = db.prepare(`
        SELECT COUNT(*) as selesai FROM checklist_praktik
        WHERE santri_id = ? AND modul = 1 AND status != 'belum'
      `).get(santriId);

      return sendJson(res, 200, {
        status: 'sukses',
        santri: {
          id: santri.id,
          nama: santri.nama,
          kelas: santri.kelas,
          total_xp: sb ? sb.total_xp : 0,
          level: sb ? sb.level : 1,
          gelar: sb ? sb.gelar : 'Pemula Komputer',
          pertemuan_terakhir: sb ? sb.pertemuan_terakhir : 1,
          aktivitas_terakhir: sb ? sb.aktivitas_terakhir : ''
        },
        pertemuan_status: pertemuanRows,
        rekap_kuis: rekapKuis,
        checklist_selesai: rekapChecklist ? rekapChecklist.selesai : 0
      });
    }

    // Detail Seluruh Progres Santri
    if (method === 'GET' && pathname === '/api/santri/progres') {
      const listAktivitas = db.prepare(`
        SELECT id, modul, pertemuan, jenis_aktivitas, xp, waktu
        FROM aktivitas_terverifikasi WHERE santri_id = ?
      `).all(santriId);

      const listChecklist = db.prepare(`
        SELECT tugas_id, pertemuan, status, waktu
        FROM checklist_praktik WHERE santri_id = ? AND modul = 1
      `).all(santriId);

      const listKuis = db.prepare(`
        SELECT pertemuan, skor_terbaik, skor_terbaru, jumlah_percobaan
        FROM hasil_kuis WHERE santri_id = ? AND modul = 1
      `).all(santriId);

      return sendJson(res, 200, {
        status: 'sukses',
        aktivitas_selesai: listAktivitas,
        checklist: listChecklist,
        kuis: listKuis
      });
    }

    // Pencatatan Aktivitas & Pemberian XP (Server-Side Anti-Cheat & Validasi Kunci Pertemuan)
    if (method === 'POST' && pathname === '/api/santri/progres/aktivitas') {
      try {
        const body = await readBodyJson(req);
        const { modul, pertemuan, jenis_aktivitas, nama_aktivitas } = body;

        const modNum = parseInt(modul, 10) || 1;
        const pertNum = parseInt(pertemuan, 10);

        if (!pertNum || !jenis_aktivitas) {
          return sendError(res, 400, 'Parameter pertemuan dan jenis_aktivitas wajib diisi');
        }

        // VALIDASI KEAMANAN: Periksa apakah pertemuan ini sudah dibuka guru untuk kelas ini
        const cekKunci = db.prepare(`
          SELECT terbuka FROM pembukaan_pertemuan
          WHERE kelas = ? AND modul = ? AND pertemuan = ?
        `).get(kelasSantri, modNum, pertNum);

        if (!cekKunci || cekKunci.terbuka !== 1) {
          return sendError(res, 403, `Pertemuan ${pertNum} masih dikunci oleh Guru untuk Kelas ${kelasSantri}`);
        }

        // Ambil aturan nilai XP resmi dari konfigurasi server (tidak menerima nominal dari browser)
        const xpReward = ATURAN_XP[jenis_aktivitas] || 0;

        const hasil = beriXpSantriAtomik(santriId, modNum, pertNum, jenis_aktivitas, xpReward, nama_aktivitas);
        return sendJson(res, 200, {
          status: 'sukses',
          ...hasil
        });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Mengambil Soal Kuis (HANYA MENGIRIM PERTANYAAN DAN PILIHAN, KUNCI RAHASIA TETAP DI SERVER)
    if (method === 'POST' && pathname === '/api/santri/kuis/ambil-soal') {
      try {
        const body = await readBodyJson(req);
        const pertNum = parseInt(body.pertemuan, 10);

        if (!pertNum || pertNum < 1 || pertNum > 4) {
          return sendError(res, 400, 'Nomor pertemuan tidak valid');
        }

        // Periksa status kunci pertemuan
        const cekKunci = db.prepare(`
          SELECT terbuka FROM pembukaan_pertemuan
          WHERE kelas = ? AND modul = 1 AND pertemuan = ?
        `).get(kelasSantri, pertNum);

        if (!cekKunci || cekKunci.terbuka !== 1) {
          return sendError(res, 403, `Pertemuan ${pertNum} sedang dikunci`);
        }

        let soalTerpilih = [];
        if (pertNum <= 3) {
          // Mini-kuis 3 soal
          const bank = BANK_SOAL_MINI[pertNum] || [];
          soalTerpilih = bank.map(s => ({
            id: s.id,
            pertanyaan: s.pertanyaan,
            pilihan: s.pilihan
          }));
        } else {
          // Evaluasi Pertemuan 4: Acak 5 soal dari 10 bank soal tanpa duplikasi
          const bankCopy = [...BANK_SOAL_EVALUASI];
          // Fisher-Yates Shuffle
          for (let i = bankCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bankCopy[i], bankCopy[j]] = [bankCopy[j], bankCopy[i]];
          }
          soalTerpilih = bankCopy.slice(0, 5).map(s => ({
            id: s.id,
            pertanyaan: s.pertanyaan,
            pilihan: s.pilihan
          }));
        }

        return sendJson(res, 200, {
          status: 'sukses',
          pertemuan: pertNum,
          soal: soalTerpilih
        });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Mengirim Jawaban Kuis & Penilaian Resmi di Server
    if (method === 'POST' && pathname === '/api/santri/kuis/kirim-jawaban') {
      try {
        const body = await readBodyJson(req);
        const pertNum = parseInt(body.pertemuan, 10);
        const jawabanSantri = body.jawaban; // Array of { id, pilihan }

        if (!pertNum || !Array.isArray(jawabanSantri)) {
          return sendError(res, 400, 'Format jawaban kuis tidak valid');
        }

        // Cari bank soal yang relevan
        let masterSoal = [];
        if (pertNum <= 3) {
          masterSoal = BANK_SOAL_MINI[pertNum] || [];
        } else {
          masterSoal = BANK_SOAL_EVALUASI;
        }

        const mapSoal = new Map(masterSoal.map(s => [s.id, s]));

        let jumlahBenar = 0;
        const totalSoal = jawabanSantri.length;
        const evaluasiRinci = [];

        for (const item of jawabanSantri) {
          const soalAsli = mapSoal.get(item.id);
          if (!soalAsli) continue;

          const adalahBenar = (item.pilihan === soalAsli.kunci);
          if (adalahBenar) jumlahBenar++;

          evaluasiRinci.push({
            id: soalAsli.id,
            pertanyaan: soalAsli.pertanyaan,
            pilihan: soalAsli.pilihan,
            jawaban_santri: item.pilihan,
            kunci_benar: soalAsli.kunci,
            benar: adalahBenar,
            penjelasan: soalAsli.penjelasan
          });
        }

        const skor = totalSoal > 0 ? Math.round((jumlahBenar / totalSoal) * 100) : 0;
        const sekarang = Date.now();

        // Rekap ke database
        const hasilLama = db.prepare(`
          SELECT skor_terbaik, jumlah_percobaan FROM hasil_kuis
          WHERE santri_id = ? AND modul = 1 AND pertemuan = ?
        `).get(santriId, pertNum);

        const skorTerbaikBaru = hasilLama ? Math.max(hasilLama.skor_terbaik, skor) : skor;
        const percobaanBaru = hasilLama ? (hasilLama.jumlah_percobaan + 1) : 1;

        db.prepare(`
          INSERT INTO hasil_kuis (santri_id, modul, pertemuan, skor_terbaru, skor_terbaik, jumlah_percobaan, waktu)
          VALUES (?, 1, ?, ?, ?, ?, ?)
          ON CONFLICT(santri_id, modul, pertemuan)
          DO UPDATE SET skor_terbaru = ?, skor_terbaik = ?, jumlah_percobaan = ?, waktu = ?
        `).run(santriId, pertNum, skor, skorTerbaikBaru, percobaanBaru, sekarang,
               skor, skorTerbaikBaru, percobaanBaru, sekarang);

        // Beri XP jika lulus kuis (minimal skor 60)
        let infoXp = { xp_diberikan: 0 };
        if (skor >= 60) {
          const jenisAktivitas = (pertNum === 4) ? 'p4_evaluasi_kuis' : `p${pertNum}_kuis`;
          const baseReward = ATURAN_XP[jenisAktivitas] || 30;
          infoXp = beriXpSantriAtomik(santriId, 1, pertNum, jenisAktivitas, baseReward, `Kuis Pertemuan ${pertNum}`);
        }

        const sb = db.prepare('SELECT total_xp, level, gelar FROM status_belajar WHERE santri_id = ?').get(santriId);

        return sendJson(res, 200, {
          status: 'sukses',
          skor,
          skor_terbaik: skorTerbaikBaru,
          jumlah_benar: jumlahBenar,
          total_soal: totalSoal,
          evaluasi: evaluasiRinci,
          xp_didapat: infoXp.xp_diberikan,
          total_xp: sb.total_xp,
          level: sb.level,
          gelar: sb.gelar
        });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Checklist Praktik Mandiri
    if (method === 'POST' && pathname === '/api/santri/checklist') {
      try {
        const body = await readBodyJson(req);
        const { modul, pertemuan, tugas_id, status } = body;
        const modNum = parseInt(modul, 10) || 1;
        const pertNum = parseInt(pertemuan, 10);

        if (!pertNum || !tugas_id || !status) {
          return sendError(res, 400, 'Parameter checklist tidak lengkap');
        }

        const sekarang = Date.now();
        db.prepare(`
          INSERT INTO checklist_praktik (santri_id, modul, pertemuan, tugas_id, status, waktu)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(santri_id, modul, pertemuan, tugas_id)
          DO UPDATE SET status = ?, waktu = ?
        `).run(santriId, modNum, pertNum, tugas_id, status, sekarang, status, sekarang);

        return sendJson(res, 200, { status: 'sukses', tugas_id, status });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Sinkronisasi Offline (Antrean dari localStorage saat koneksi pulih)
    if (method === 'POST' && pathname === '/api/santri/sinkronisasi-offline') {
      try {
        const body = await readBodyJson(req);
        const { antrean } = body; // Array of { jenis, payload }

        if (!Array.isArray(antrean)) {
          return sendError(res, 400, 'Format antrean offline tidak valid');
        }

        const hasilSinkron = [];

        for (const item of antrean) {
          try {
            if (item.jenis === 'aktivitas') {
              const { modul, pertemuan, jenis_aktivitas, nama_aktivitas } = item.payload;
              const xpReward = ATURAN_XP[jenis_aktivitas] || 0;
              const resXp = beriXpSantriAtomik(santriId, modul || 1, pertemuan, jenis_aktivitas, xpReward, nama_aktivitas);
              hasilSinkron.push({ id_lokal: item.id_lokal, sukses: true, res: resXp });
            } else if (item.jenis === 'checklist') {
              const { modul, pertemuan, tugas_id, status } = item.payload;
              db.prepare(`
                INSERT INTO checklist_praktik (santri_id, modul, pertemuan, tugas_id, status, waktu)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(santri_id, modul, pertemuan, tugas_id)
                DO UPDATE SET status = ?, waktu = ?
              `).run(santriId, modul || 1, pertemuan, tugas_id, status, Date.now(), status, Date.now());
              hasilSinkron.push({ id_lokal: item.id_lokal, sukses: true });
            }
          } catch (e) {
            hasilSinkron.push({ id_lokal: item.id_lokal, sukses: false, pesan: e.message });
          }
        }

        const sb = db.prepare('SELECT total_xp, level, gelar FROM status_belajar WHERE santri_id = ?').get(santriId);
        return sendJson(res, 200, {
          status: 'sukses',
          hasil: hasilSinkron,
          total_xp: sb.total_xp,
          level: sb.level,
          gelar: sb.gelar
        });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    return sendError(res, 404, 'Endpoint santri tidak ditemukan');
  }

  // --------------------------------------------------------------------------
  // API AREA GURU (MEMBUTUHKAN PERAN 'guru')
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/api/guru/')) {
    const sesi = verifikasiSesi(req);
    if (!sesi || sesi.peran !== 'guru') {
      return sendError(res, 401, 'Akses terbatas untuk Akun Guru');
    }

    // Status Ringkasan Server & Statistik
    if (method === 'GET' && pathname === '/api/guru/status') {
      const totalSantri = db.prepare('SELECT COUNT(*) as jml FROM santri').get().jml;
      const santriAktif = db.prepare('SELECT COUNT(*) as jml FROM santri WHERE pin_aktif = 1').get().jml;
      const totalSesi = db.prepare('SELECT COUNT(*) as jml FROM sesi WHERE aktif = 1 AND kedaluwarsa > ?').get(Date.now()).jml;

      // Ambil ukuran file database
      let dbSize = 0;
      try {
        dbSize = fs.statSync(DB_PATH).size;
      } catch {}

      // Ambil alamat IP lokal
      const ifaces = os.networkInterfaces();
      const ipList = [];
      for (const dev in ifaces) {
        for (const details of ifaces[dev]) {
          if (details.family === 'IPv4' && !details.internal) {
            ipList.push(details.address);
          }
        }
      }

      return sendJson(res, 200, {
        status: 'sukses',
        uptime_detik: Math.round(process.uptime()),
        memory_usage_mb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        ip_lokal: ipList,
        total_santri: totalSantri,
        santri_aktif: santriAktif,
        sesi_aktif: totalSesi,
        ukuran_db_kb: Math.round(dbSize / 1024)
      });
    }

    // Mengambil Daftar Seluruh Santri dengan Data Pembelajaran & Kode Aktivasi
    if (method === 'GET' && pathname === '/api/guru/santri') {
      const kelasFilter = urlObj.searchParams.get('kelas');
      const cari = urlObj.searchParams.get('cari');

      let query = `
        SELECT s.id, s.kelas, s.nama, s.kode_aktivasi, s.pin_aktif, s.dibuat,
               sb.total_xp, sb.level, sb.gelar, sb.pertemuan_terakhir,
               hk.skor_terbaik as skor_evaluasi,
               (SELECT COUNT(*) FROM checklist_praktik cp WHERE cp.santri_id = s.id AND cp.status != 'belum') as checklist_selesai
        FROM santri s
        LEFT JOIN status_belajar sb ON s.id = sb.santri_id
        LEFT JOIN hasil_kuis hk ON s.id = hk.santri_id AND hk.modul = 1 AND hk.pertemuan = 4
        WHERE 1 = 1
      `;
      const params = [];

      if (kelasFilter) {
        query += ' AND s.kelas = ?';
        params.push(parseInt(kelasFilter, 10));
      }

      if (cari) {
        query += ' AND s.nama LIKE ?';
        params.push(`%${cari}%`);
      }

      query += ' ORDER BY s.kelas ASC, s.nama ASC';
      const list = db.prepare(query).all(...params);

      return sendJson(res, 200, { status: 'sukses', santri: list });
    }

    // Status Kunci Pertemuan per Kelas
    if (method === 'GET' && pathname === '/api/guru/pertemuan-status') {
      const rows = db.prepare(`
        SELECT kelas, modul, pertemuan, terbuka
        FROM pembukaan_pertemuan
        ORDER BY kelas ASC, pertemuan ASC
      `).all();

      return sendJson(res, 200, { status: 'sukses', pertemuan: rows });
    }

    // Buka / Kunci Pertemuan
    if (method === 'POST' && pathname === '/api/guru/pertemuan-toggle') {
      try {
        const body = await readBodyJson(req);
        const { kelas, modul, pertemuan, terbuka } = body;

        const k = parseInt(kelas, 10);
        const p = parseInt(pertemuan, 10);
        const m = parseInt(modul, 10) || 1;
        const t = terbuka ? 1 : 0;

        if (!k || !p) {
          return sendError(res, 400, 'Parameter kelas dan pertemuan wajib diisi');
        }

        db.prepare(`
          INSERT INTO pembukaan_pertemuan (kelas, modul, pertemuan, terbuka)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(kelas, modul, pertemuan)
          DO UPDATE SET terbuka = ?
        `).run(k, m, p, t, t);

        // Catat Audit Guru
        db.prepare(`
          INSERT INTO audit_guru (tindakan, target_santri_id, keterangan, waktu)
          VALUES ('TOGGLE_PERTEMUAN', NULL, ?, ?)
        `).run(`Kelas ${k} Modul ${m} Pertemuan ${p} -> ${t ? 'DIBUKA' : 'DIKUNCI'}`, Date.now());

        return sendJson(res, 200, { status: 'sukses', kelas: k, pertemuan: p, terbuka: t });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Impor Santri dari File / Teks CSV
    if (method === 'POST' && pathname === '/api/guru/impor-csv') {
      try {
        const csvRaw = await readBodyText(req);
        if (!csvRaw || csvRaw.trim().length === 0) {
          return sendError(res, 400, 'Isi CSV tidak boleh kosong');
        }

        const hasil = prosesImporCsvInternal(csvRaw);

        // Catat Audit Guru
        db.prepare(`
          INSERT INTO audit_guru (tindakan, target_santri_id, keterangan, waktu)
          VALUES ('IMPOR_CSV', NULL, ?, ?)
        `).run(`Impor CSV: ${hasil.berhasil} sukses, ${hasil.gagal} gagal`, Date.now());

        return sendJson(res, 200, { status: 'sukses', ...hasil });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Reset PIN Santri (Generate Kode Aktivasi Baru)
    if (method === 'POST' && pathname === '/api/guru/reset-pin') {
      try {
        const body = await readBodyJson(req);
        const { santri_id } = body;

        if (!santri_id) return sendError(res, 400, 'ID Santri wajib disertakan');

        const kodeBaru = buatKodeAktivasi();
        db.prepare(`
          UPDATE santri
          SET pin_aktif = 0, pin_hash = NULL, pin_salt = NULL, kode_aktivasi = ?
          WHERE id = ?
        `).run(kodeBaru, santri_id);

        // Cabut seluruh sesi aktif santri ini
        db.prepare('UPDATE sesi SET aktif = 0 WHERE santri_id = ?').run(santri_id);

        // Catat Audit Guru
        db.prepare(`
          INSERT INTO audit_guru (tindakan, target_santri_id, keterangan, waktu)
          VALUES ('RESET_PIN', ?, ?, ?)
        `).run(santri_id, `PIN di-reset, kode baru: ${kodeBaru}`, Date.now());

        return sendJson(res, 200, {
          status: 'sukses',
          pesan: 'PIN berhasil di-reset. Berikan kode aktivasi baru kepada santri.',
          kode_aktivasi_baru: kodeBaru
        });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Reset Progres Santri (Dengan Konfirmasi Eksplisit)
    if (method === 'POST' && pathname === '/api/guru/reset-progres') {
      try {
        const body = await readBodyJson(req);
        const { santri_id, konfirmasi } = body;

        if (!santri_id || konfirmasi !== true) {
          return sendError(res, 400, 'Konfirmasi eksplisit diperlukan untuk menghapus progres');
        }

        db.exec('BEGIN TRANSACTION;');
        try {
          db.prepare('DELETE FROM aktivitas_terverifikasi WHERE santri_id = ?').run(santri_id);
          db.prepare('DELETE FROM progres WHERE santri_id = ?').run(santri_id);
          db.prepare('DELETE FROM checklist_praktik WHERE santri_id = ?').run(santri_id);
          db.prepare('DELETE FROM hasil_kuis WHERE santri_id = ?').run(santri_id);
          db.prepare(`
            UPDATE status_belajar
            SET total_xp = 0, level = 1, gelar = 'Pemula Komputer', pertemuan_terakhir = 1,
                aktivitas_terakhir = '', diperbarui = ?
            WHERE santri_id = ?
          `).run(Date.now(), santri_id);

          db.prepare(`
            INSERT INTO audit_guru (tindakan, target_santri_id, keterangan, waktu)
            VALUES ('RESET_PROGRES', ?, 'Seluruh progres dan XP direset ke nol', ?)
          `).run(santri_id, Date.now());

          db.exec('COMMIT;');
          return sendJson(res, 200, { status: 'sukses', pesan: 'Seluruh progres santri telah di-reset.' });
        } catch (e) {
          db.exec('ROLLBACK;');
          throw e;
        }
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Verifikasi Checklist Tugas oleh Guru
    if (method === 'POST' && pathname === '/api/guru/verifikasi-checklist') {
      try {
        const body = await readBodyJson(req);
        const { santri_id, modul, pertemuan, tugas_id, status } = body;

        if (!santri_id || !pertemuan || !tugas_id) {
          return sendError(res, 400, 'Parameter tugas checklist tidak lengkap');
        }

        const sekarang = Date.now();
        db.prepare(`
          INSERT INTO checklist_praktik (santri_id, modul, pertemuan, tugas_id, status, waktu)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(santri_id, modul, pertemuan, tugas_id)
          DO UPDATE SET status = ?, waktu = ?
        `).run(santri_id, modul || 1, pertemuan, tugas_id, status || 'diverifikasi_guru', sekarang, status || 'diverifikasi_guru', sekarang);

        // Berikan XP jika statusnya diverifikasi guru
        if (status === 'diverifikasi_guru') {
          const jenisAktivitas = `p${pertemuan}_checklist_${tugas_id}`;
          beriXpSantriAtomik(santri_id, modul || 1, pertemuan, jenisAktivitas, ATURAN_XP['p4_checklist_tugas'], `Tugas Praktik ${tugas_id}`);
        }

        return sendJson(res, 200, { status: 'sukses', pesan: 'Tugas praktik berhasil diverifikasi guru' });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    // Ekspor Rekap Progres Santri ke CSV (UTF-8 BOM + Sanitasi Formula Injection)
    if (method === 'GET' && pathname === '/api/guru/ekspor-csv') {
      const data = db.prepare(`
        SELECT s.id, s.kelas, s.nama, s.pin_aktif,
               sb.total_xp, sb.level, sb.gelar, sb.pertemuan_terakhir,
               hk1.skor_terbaik as kuis_p1,
               hk2.skor_terbaik as kuis_p2,
               hk3.skor_terbaik as kuis_p3,
               hk4.skor_terbaik as kuis_evaluasi,
               (SELECT COUNT(*) FROM checklist_praktik cp WHERE cp.santri_id = s.id AND cp.status = 'diverifikasi_guru') as checklist_diverifikasi
        FROM santri s
        LEFT JOIN status_belajar sb ON s.id = sb.santri_id
        LEFT JOIN hasil_kuis hk1 ON s.id = hk1.santri_id AND hk1.pertemuan = 1
        LEFT JOIN hasil_kuis hk2 ON s.id = hk2.santri_id AND hk2.pertemuan = 2
        LEFT JOIN hasil_kuis hk3 ON s.id = hk3.santri_id AND hk3.pertemuan = 3
        LEFT JOIN hasil_kuis hk4 ON s.id = hk4.santri_id AND hk4.pertemuan = 4
        ORDER BY s.kelas ASC, s.nama ASC
      `).all();

      // Sanitasi formula injection Excel: jika sel diawali =, +, -, @, beri awalan petik satu '
      function amankanCsv(val) {
        if (val === null || val === undefined) return '';
        let str = String(val).trim();
        if (/^[=+\-@]/.test(str)) {
          str = "'" + str;
        }
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }

      let csvText = '\uFEFF'; // UTF-8 BOM untuk kompatibilitas Microsoft Excel
      csvText += 'ID Santri,Kelas,Nama Santri,Status Akun,Total XP,Level,Gelar,Pertemuan Terakhir,Kuis P1,Kuis P2,Kuis P3,Kuis Evaluasi P4,Checklist Terverifikasi\n';

      for (const row of data) {
        const line = [
          amankanCsv(row.id),
          amankanCsv(row.kelas),
          amankanCsv(row.nama),
          amankanCsv(row.pin_aktif === 1 ? 'Aktif' : 'Belum Aktivasi'),
          amankanCsv(row.total_xp || 0),
          amankanCsv(row.level || 1),
          amankanCsv(row.gelar || 'Pemula Komputer'),
          amankanCsv(row.pertemuan_terakhir || 1),
          amankanCsv(row.kuis_p1 ?? '-'),
          amankanCsv(row.kuis_p2 ?? '-'),
          amankanCsv(row.kuis_p3 ?? '-'),
          amankanCsv(row.kuis_evaluasi ?? '-'),
          amankanCsv(row.checklist_diverifikasi || 0)
        ].join(',');
        csvText += line + '\n';
      }

      const tanggal = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const namaFile = `Rekap_Nilai_TIK_Santri_${tanggal}.csv`;

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${namaFile}"`,
        'X-Content-Type-Options': 'nosniff'
      });
      return res.end(csvText);
    }

    // Ganti PIN Guru
    if (method === 'POST' && pathname === '/api/guru/ganti-pin') {
      try {
        const body = await readBodyJson(req);
        const { pin_lama, pin_baru } = body;

        if (!pin_lama || !pin_baru) {
          return sendError(res, 400, 'PIN lama dan PIN baru wajib diisi');
        }

        const saltRow = db.prepare('SELECT nilai FROM konfigurasi_guru WHERE kunci = ?').get('pin_guru_salt');
        const hashRow = db.prepare('SELECT nilai FROM konfigurasi_guru WHERE kunci = ?').get('pin_guru_hash');

        if (!verifikasiPin(pin_lama, saltRow.nilai, hashRow.nilai)) {
          return sendError(res, 401, 'PIN lama tidak cocok');
        }

        const saltBaru = buatSalt();
        const hashBaru = hashPin(pin_baru, saltBaru);

        db.prepare('UPDATE konfigurasi_guru SET nilai = ? WHERE kunci = ?').run(saltBaru, 'pin_guru_salt');
        db.prepare('UPDATE konfigurasi_guru SET nilai = ? WHERE kunci = ?').run(hashBaru, 'pin_guru_hash');

        db.prepare(`
          INSERT INTO audit_guru (tindakan, target_santri_id, keterangan, waktu)
          VALUES ('GANTI_PIN_GURU', NULL, 'PIN guru berhasil diperbarui', ?)
        `).run(Date.now());

        return sendJson(res, 200, { status: 'sukses', pesan: 'PIN Guru berhasil diperbarui' });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    return sendError(res, 404, 'Endpoint guru tidak ditemukan');
  }

  // --------------------------------------------------------------------------
  // PENOLAKAN PATH ARBITRER / TIDAK DIIZINKAN (PATH TRAVERSAL PROTECTION)
  // --------------------------------------------------------------------------
  sendError(res, 404, 'Sumber daya tidak ditemukan');
});

// ----------------------------------------------------------------------------
// 10. MENJALANKAN SERVER DAN PENGUMUMAN JARINGAN LOKAL
// ----------------------------------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  const alamatIp = [];

  for (const namaIface in ifaces) {
    for (const info of ifaces[namaIface]) {
      if (info.family === 'IPv4' && !info.internal) {
        alamatIp.push(info.address);
      }
    }
  }

  console.log('\n================================================================');
  console.log('       LAB KOMPUTER: MODUL 1 DASAR TIK — SERVER AKTIF           ');
  console.log('================================================================');
  console.log(`Port Server       : ${PORT}`);
  console.log(`Node.js Runtime   : v${process.versions.node} (Official node:sqlite)`);
  console.log(`Database Utama    : ${DB_PATH}`);
  console.log(`Direktori Backup  : ${BACKUP_DIR}`);
  console.log('----------------------------------------------------------------');
  console.log('Alamat Akses Laptop Guru (Lokal):');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://127.0.0.1:${PORT}`);
  console.log('\nAlamat Akses Santri di Jaringan Wi-Fi Lab:');
  if (alamatIp.length > 0) {
    alamatIp.forEach(ip => {
      console.log(`  >>> http://${ip}:${PORT} <<<`);
    });
  } else {
    console.log('  [PERINGATAN] Laptop belum terhubung ke jaringan Wi-Fi Lab.');
  }
  console.log('----------------------------------------------------------------');
  console.log('Kredensial Default Guru :');
  console.log('  PIN Guru: guru1234 (dapat diubah pada menu Panel Guru)');
  console.log('----------------------------------------------------------------');
  console.log('Petunjuk Jaringan Windows:');
  console.log('1. Pastikan profil jaringan Wi-Fi disetel ke "Private network".');
  console.log('2. Izinkan Node.js di Windows Defender Firewall.');
  console.log('3. Pastikan fitur AP Isolation / Client Isolation pada router Wi-Fi');
  console.log('   dalam kondisi nonaktif agar santri dapat terhubung.');
  console.log('================================================================\n');
});

// Shutdown Tertib (Graceful Shutdown)
function hentikanServerTertib(sinyal) {
  console.log(`\n[SISTEM] Menerima sinyal ${sinyal}. Menutup server dan database...`);
  server.close(() => {
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
      db.close();
      console.log('[SISTEM] Database SQLite berhasil ditutup secara aman.');
    } catch (e) {
      console.error('[SISTEM] Kesalahan saat menutup database:', e.message);
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => hentikanServerTertib('SIGINT'));
process.on('SIGTERM', () => hentikanServerTertib('SIGTERM'));
