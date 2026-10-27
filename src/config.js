'use strict';

const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8000;
const DATABASE_DIR = path.join(ROOT_DIR, 'database');
const DB_PATH = path.join(DATABASE_DIR, 'lab.db');
const BACKUP_DIR = path.join(DATABASE_DIR, 'backups');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const CSV_DEFAULT_PATH = path.join(DATABASE_DIR, 'santri.csv');
const PID_FILE = path.join(DATABASE_DIR, 'server.pid');

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

function formatNamaKelas(kelasNum) {
  const k = parseInt(kelasNum, 10);
  if (k <= 9) return `Kelas ${k} SMP`;
  return `Kelas ${k} SMA`;
}

module.exports = {
  PORT,
  ROOT_DIR,
  DB_PATH,
  BACKUP_DIR,
  PUBLIC_DIR,
  CSV_DEFAULT_PATH,
  PID_FILE,
  ATURAN_XP,
  LEVEL_THRESHOLDS,
  hitungLevel,
  formatNamaKelas
};
