'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { DB_PATH, BACKUP_DIR, CSV_DEFAULT_PATH } = require('./config');
const { buatSalt, hashPin, buatKodeAktivasi } = require('./utils/security');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

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
  // Pertemuan 1 terbuka secara default untuk kelas 7-12. Pertemuan 2-4 terkunci.
  // Hapus sisa konfigurasi kelas 1-6 lama jika ada
  db.prepare('DELETE FROM pembukaan_pertemuan WHERE kelas < 7').run();

  const stmtCheck = db.prepare('SELECT COUNT(*) as count FROM pembukaan_pertemuan WHERE kelas >= 7 AND kelas <= 12');
  const countRow = stmtCheck.get();
  if (countRow.count === 0) {
    const stmtInsert = db.prepare(`
      INSERT OR IGNORE INTO pembukaan_pertemuan (kelas, modul, pertemuan, terbuka)
      VALUES (?, 1, ?, ?)
    `);
    for (let k = 7; k <= 12; k++) {
      stmtInsert.run(k, 1, 1); // Pertemuan 1 Terbuka
      stmtInsert.run(k, 2, 0); // Pertemuan 2 Terkunci
      stmtInsert.run(k, 3, 0); // Pertemuan 3 Terkunci
      stmtInsert.run(k, 4, 0); // Pertemuan 4 Terkunci
    }
  }
}

// Backup otomatis saat server start
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

// Inisialisasi awal saat modul di-load
initDatabaseSchema();
lakukanBackupDatabase();
autoImporSantriAwal();

module.exports = {
  db,
  initDatabaseSchema,
  lakukanBackupDatabase,
  prosesImporCsvInternal
};
