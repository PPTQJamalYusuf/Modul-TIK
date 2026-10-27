'use strict';

const fs = require('node:fs');
const os = require('node:os');
const { db, prosesImporCsvInternal } = require('../database');
const { DB_PATH, ATURAN_XP } = require('../config');
const {
  buatSalt,
  hashPin,
  verifikasiPin,
  buatTokenSesi,
  hashToken,
  buatKodeAktivasi,
  periksaRateLimit,
  catatGagalLogin,
  resetGagalLogin
} = require('../utils/security');
const {
  sendJson,
  sendError,
  readBodyJson,
  readBodyText,
  verifikasiSesi,
  amankanCsv
} = require('../utils/http');
const { beriXpSantriAtomik } = require('../utils/xp');

async function handleGuruRoutes(req, res, pathname, method, urlObj, clientIp) {
  // 1. Login Guru
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
  // VALIDASI PERAN GURU UNTUK ENDPOINT SETELAHNYA
  // --------------------------------------------------------------------------
  const sesi = verifikasiSesi(req);
  if (!sesi || sesi.peran !== 'guru') {
    return sendError(res, 401, 'Akses terbatas untuk Akun Guru');
  }

  // Status Ringkasan Server & Statistik
  if (method === 'GET' && pathname === '/api/guru/status') {
    const totalSantri = db.prepare('SELECT COUNT(*) as jml FROM santri').get().jml;
    const santriAktif = db.prepare('SELECT COUNT(*) as jml FROM santri WHERE pin_aktif = 1').get().jml;
    const totalSesi = db.prepare('SELECT COUNT(*) as jml FROM sesi WHERE aktif = 1 AND kedaluwarsa > ?').get(Date.now()).jml;

    let dbSize = 0;
    try {
      dbSize = fs.statSync(DB_PATH).size;
    } catch {}

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

      db.prepare('UPDATE sesi SET aktif = 0 WHERE santri_id = ?').run(santri_id);

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

    let csvText = '\uFEFF';
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

module.exports = {
  handleGuruRoutes
};
