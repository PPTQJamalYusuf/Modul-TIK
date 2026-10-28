'use strict';

// ============================================================================
// SUITE PENGUJIAN OTOMATIS: MODUL 1 DASAR TIK
// ============================================================================

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlPath = path.join(ROOT_DIR, 'public', 'index.html');
const { BANK_SOAL_MINI, BANK_SOAL_EVALUASI } = require('../src/data/bank_soal');

console.log('================================================================');
console.log('🚀 MEMULAI PENGUJIAN OTOMATIS: PENDALAMAN MATERI MODUL 1');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [LULUS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ [GAGAL] ${testName}`);
    console.error(`    Alasan: ${err.message}\n`);
  }
}

// ----------------------------------------------------------------------------
// 1. PENGUJIAN BANK SOAL & UMPAN BALIK
// ----------------------------------------------------------------------------
console.log('--- 1. Pengujian Bank Soal & Umpan Balik Kuis ---');

runTest('Bank Soal Mini Sesi 1-3 tersedia dan valid', () => {
  for (let s = 1; s <= 3; s++) {
    const list = BANK_SOAL_MINI[s];
    assert(Array.isArray(list) && list.length >= 3, `Sesi ${s} harus memiliki minimal 3 soal`);
    list.forEach((soal, idx) => {
      assert(soal.id, `Soal ${s}.${idx} harus punya ID`);
      assert(typeof soal.pertanyaan === 'string' && soal.pertanyaan.length > 10, `Soal ${s}.${idx} teks tidak valid`);
      assert(Array.isArray(soal.pilihan) && soal.pilihan.length >= 4, `Soal ${s}.${idx} harus punya >= 4 opsi`);
      assert(Number.isInteger(soal.kunci) && soal.kunci >= 0 && soal.kunci < soal.pilihan.length, `Soal ${s}.${idx} kunci tidak valid`);
      assert(typeof soal.penjelasan === 'string' && soal.penjelasan.length > 15, `Soal ${s}.${idx} harus memiliki penjelasan umpan balik`);
    });
  }
});

runTest('Bank Soal Evaluasi Akhir Sesi 4 (10 soal skenario) valid', () => {
  assert(Array.isArray(BANK_SOAL_EVALUASI) && BANK_SOAL_EVALUASI.length === 10, 'Evaluasi akhir harus memiliki 10 soal');
  BANK_SOAL_EVALUASI.forEach((soal, idx) => {
    assert(soal.id, `Evaluasi soal ${idx} harus punya ID`);
    assert(soal.pilihan.length >= 4, `Evaluasi soal ${idx} harus punya >= 4 pilihan`);
    assert(soal.kunci >= 0 && soal.kunci < soal.pilihan.length, `Evaluasi soal ${idx} kunci tidak valid`);
    assert(soal.penjelasan.length > 20, `Evaluasi soal ${idx} harus memiliki penjelasan edukatif mendalam`);
  });
});

runTest('Koreksi miskonsepsi wajib terwakili dalam bank soal', () => {
  const allQuestions = [
    ...BANK_SOAL_MINI[1],
    ...BANK_SOAL_MINI[2],
    ...BANK_SOAL_MINI[3],
    ...BANK_SOAL_EVALUASI
  ];
  
  const textCorpus = allQuestions.map(q => q.pertanyaan + ' ' + q.penjelasan).join(' ');

  assert(/casing/i.test(textCorpus) && /prosesor|cpu/i.test(textCorpus), 'Harus ada soal pembeda casing vs CPU');
  assert(/aman selamanya|cadangan|backup/i.test(textCorpus), 'Harus ada soal koreksi SSD tidak aman selamanya / butuh backup');
  assert(/drive d/i.test(textCorpus) && /documents/i.test(textCorpus), 'Harus ada soal Drive D tidak selalu ada / Documents di C sah');
  assert(/mengubah ekstensi|konversi format/i.test(textCorpus), 'Harus ada soal mengubah ekstensi bukan konversi format');
  assert(/ctrl \+ z/i.test(textCorpus) && /batas/i.test(textCorpus), 'Harus ada soal batasan Ctrl+Z');
  assert(/recycle bin/i.test(textCorpus) && /flashdisk|permanen/i.test(textCorpus), 'Harus ada soal keterbatasan Recycle Bin pada flashdisk');
  assert(/seret-lepas|drag and drop|konteks/i.test(textCorpus), 'Harus ada soal efek drag-drop bergantung konteks');
});

// ----------------------------------------------------------------------------
// 2. PENGUJIAN STRUKTUR PEDAGOGIS HTML VIEW 1-4
// ----------------------------------------------------------------------------
console.log('\n--- 2. Pengujian Struktur Pedagogis public/index.html ---');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');

runTest('Semua 4 sesi (view-p1 s/d view-p4) ada di index.html', () => {
  assert(htmlContent.includes('id="view-p1"'), 'view-p1 harus ada');
  assert(htmlContent.includes('id="view-p2"'), 'view-p2 harus ada');
  assert(htmlContent.includes('id="view-p3"'), 'view-p3 harus ada');
  assert(htmlContent.includes('id="view-p4"'), 'view-p4 harus ada');
});

runTest('Komponen Pedagogis Lengkap di setiap Sesi (Tujuan, Materi, Miskonsepsi, Ringkasan, Kuis)', () => {
  for (let s = 1; s <= 4; s++) {
    const vTag = `id="view-p${s}"`;
    const vStart = htmlContent.indexOf(vTag);
    const vEnd = htmlContent.indexOf('</section>', vStart);
    const viewSection = htmlContent.substring(vStart, vEnd);

    assert(/Tujuan:/i.test(viewSection), `Sesi ${s} harus memuat Tujuan Pembelajaran`);
    assert(/Misi \d/i.test(viewSection), `Sesi ${s} harus memuat subbab/misi bertahap`);
    assert(/Miskonsepsi/i.test(viewSection), `Sesi ${s} harus memuat kartu Koreksi Miskonsepsi`);
    assert(/Ringkasan Inti/i.test(viewSection), `Sesi ${s} harus memuat Ringkasan Inti`);
    assert(/kuis-container-p/i.test(viewSection), `Sesi ${s} harus memuat wadah kuis`);
  }
});

runTest('Keberadaan Proyek Akhir Terpadu "Tugas TIK Rapi" di Sesi 4', () => {
  const v4Start = htmlContent.indexOf('id="view-p4"');
  const v4End = htmlContent.indexOf('</section>', v4Start);
  const view4 = htmlContent.substring(v4Start, v4End);

  assert(/Tugas TIK Rapi/i.test(view4), 'Sesi 4 harus memuat Proyek Akhir Tugas TIK Rapi');
  assert(/sim-explorer-grid/.test(view4), 'Sesi 4 harus memuat grid explorer virtual');
  assert(/verifikasiProyekAkhirTugasRapi/.test(view4), 'Sesi 4 harus memuat tombol pemicu verifikasi hasil proyek');
  assert(/proyek-verifikasi-feedback/.test(view4), 'Sesi 4 harus memuat kontainer umpan balik hasil proyek');
});

// ----------------------------------------------------------------------------
// 3. PENGUJIAN SIMULATOR DAN LOGIKA PROYEK AKHIR
// ----------------------------------------------------------------------------
console.log('\n--- 3. Pengujian Logika Simulator & Verifikasi Proyek Akhir ---');

runTest('File explorer.js memuat data dummy awal yang aman', () => {
  const explorerJs = fs.readFileSync(path.join(ROOT_DIR, 'public', 'js', 'games', 'explorer.js'), 'utf8');
  assert(explorerJs.includes('Laporan_Praktikum.docx'), 'Harus ada dummy dokumen');
  assert(explorerJs.includes('Panduan_Lab.pdf'), 'Harus ada dummy bacaan');
  assert(explorerJs.includes('Bagan_Komputer.png'), 'Harus ada dummy gambar');
  assert(explorerJs.includes('Catatan_Tambahan.txt'), 'Harus ada dummy catatan');
  assert(explorerJs.includes('File_Sampah_Latihan.tmp'), 'Harus ada dummy file sampah latihan');
  assert(explorerJs.includes('resetSimulasiExplorer'), 'Harus ada fungsi reset simulasi');
  assert(explorerJs.includes('verifikasiProyekAkhirTugasRapi'), 'Harus ada mesin verifikasi proyek');
});

runTest('File mouse_typing.js memuat data komponen akurat & latihan bertahap', () => {
  const mouseTypingJs = fs.readFileSync(path.join(ROOT_DIR, 'public', 'js', 'games', 'mouse_typing.js'), 'utf8');
  assert(mouseTypingJs.includes('casing:'), 'Harus ada komponen casing terpisah');
  assert(mouseTypingJs.includes('cpu:'), 'Harus ada komponen cpu terpisah');
  assert(mouseTypingJs.includes('ram:'), 'Harus ada komponen ram');
  assert(mouseTypingJs.includes('storage:'), 'Harus ada komponen storage');
  assert(mouseTypingJs.includes('asdf jkl;'), 'Harus ada teks latihan Home Row');
  assert(mouseTypingJs.includes('cadangan'), 'Harus ada teks latihan tugas TIK & backup');
});

// ----------------------------------------------------------------------------
// REKAPITULASI
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passedTests} DARI ${totalTests} PENGUJIAN LULUS (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}

