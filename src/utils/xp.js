'use strict';

const { db } = require('../database');
const { hitungLevel } = require('../config');

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

module.exports = {
  beriXpSantriAtomik
};
