'use strict';

const { db } = require('../database');
const { ATURAN_XP } = require('../config');
const { BANK_SOAL_MINI, BANK_SOAL_EVALUASI } = require('../data/bank_soal');
const {
  buatSalt,
  hashPin,
  verifikasiPin,
  buatTokenSesi,
  hashToken,
  periksaRateLimit,
  catatGagalLogin,
  resetGagalLogin
} = require('../utils/security');
const {
  sendJson,
  sendError,
  readBodyJson,
  verifikasiSesi
} = require('../utils/http');
const { beriXpSantriAtomik } = require('../utils/xp');

async function handleSantriRoutes(req, res, pathname, method, urlObj, clientIp) {
  // 1. Status Server Ringkas
  if (method === 'GET' && pathname === '/api/status') {
    return sendJson(res, 200, {
      status: 'ok',
      waktu: Date.now(),
      server: 'Lab Komputer Modul 1 TIK',
      pesan: 'Server aktif dan siap melayani santri'
    });
  }

  // 2. Daftar Santri Publik (Untuk dropdown login / aktivasi)
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

  // 3. Aktivasi Akun Santri Baru
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

      const salt = buatSalt();
      const hash = hashPin(pin, salt);
      const sekarang = Date.now();

      db.prepare(`
        UPDATE santri
        SET pin_hash = ?, pin_salt = ?, pin_aktif = 1, kode_aktivasi = NULL
        WHERE id = ?
      `).run(hash, salt, santri_id);

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

  // 4. Login Santri dengan PIN
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

      // Cabut sesi aktif sebelumnya untuk akun ini secara atomik
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

  // 5. Logout Akun Santri/Guru
  if (method === 'POST' && pathname === '/api/logout') {
    const sesi = verifikasiSesi(req);
    if (sesi) {
      db.prepare('UPDATE sesi SET aktif = 0 WHERE token_hash = ?').run(sesi.tokenHash);
    }
    const cookieHeader = 'session_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
    return sendJson(res, 200, { status: 'sukses', pesan: 'Logout berhasil' }, { 'Set-Cookie': cookieHeader });
  }

  // 6. Leaderboard (Dapat diakses santri atau guru terautentikasi)
  if (method === 'GET' && pathname === '/api/leaderboard') {
    const sesi = verifikasiSesi(req);
    if (!sesi) return sendError(res, 401, 'Sesi tidak valid atau telah kedaluwarsa');

    const semuaKelas = db.prepare(`
      SELECT s.id, s.nama, s.kelas, sb.total_xp, sb.level, sb.gelar
      FROM status_belajar sb
      JOIN santri s ON sb.santri_id = s.id
      ORDER BY sb.total_xp DESC, sb.level DESC, s.nama ASC
      LIMIT 25
    `).all();

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
      peringkat_saya: peringkatSaya
    });
  }

  // --------------------------------------------------------------------------
  // AREA KHUSUS SANTRI TERAUTENTIKASI
  // --------------------------------------------------------------------------
  const sesi = verifikasiSesi(req);
  if (!sesi || sesi.peran !== 'santri') {
    return sendError(res, 401, 'Akses terbatas untuk akun santri');
  }

  const santriId = sesi.santriId;
  const kelasSantri = sesi.kelas;

  // Profil & Status Kunci Pertemuan
  if (method === 'GET' && pathname === '/api/santri/profil') {
    const santri = db.prepare('SELECT id, kelas, nama FROM santri WHERE id = ?').get(santriId);
    const sb = db.prepare('SELECT * FROM status_belajar WHERE santri_id = ?').get(santriId);

    const pertemuanRows = db.prepare(`
      SELECT pertemuan, terbuka FROM pembukaan_pertemuan
      WHERE kelas = ? AND modul = 1
      ORDER BY pertemuan ASC
    `).all(kelasSantri);

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

  // Progres Santri Rinci
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

  // Pencatatan Aktivitas & Pemberian XP
  if (method === 'POST' && pathname === '/api/santri/progres/aktivitas') {
    try {
      const body = await readBodyJson(req);
      const { modul, pertemuan, jenis_aktivitas, nama_aktivitas } = body;

      const modNum = parseInt(modul, 10) || 1;
      const pertNum = parseInt(pertemuan, 10);

      if (!pertNum || !jenis_aktivitas) {
        return sendError(res, 400, 'Parameter pertemuan dan jenis_aktivitas wajib diisi');
      }

      // Validasi Kunci Pertemuan
      const cekKunci = db.prepare(`
        SELECT terbuka FROM pembukaan_pertemuan
        WHERE kelas = ? AND modul = ? AND pertemuan = ?
      `).get(kelasSantri, modNum, pertNum);

      if (!cekKunci || cekKunci.terbuka !== 1) {
        return sendError(res, 403, `Pertemuan ${pertNum} masih dikunci oleh Guru untuk Kelas ${kelasSantri}`);
      }

      const xpReward = ATURAN_XP[jenis_aktivitas] || 0;
      const hasil = beriXpSantriAtomik(santriId, modNum, pertNum, jenis_aktivitas, xpReward, nama_aktivitas);
      return sendJson(res, 200, { status: 'sukses', ...hasil });
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  // Mengambil Soal Kuis
  if (method === 'POST' && pathname === '/api/santri/kuis/ambil-soal') {
    try {
      const body = await readBodyJson(req);
      const pertNum = parseInt(body.pertemuan, 10);

      if (!pertNum || pertNum < 1 || pertNum > 4) {
        return sendError(res, 400, 'Nomor pertemuan tidak valid');
      }

      const cekKunci = db.prepare(`
        SELECT terbuka FROM pembukaan_pertemuan
        WHERE kelas = ? AND modul = 1 AND pertemuan = ?
      `).get(kelasSantri, pertNum);

      if (!cekKunci || cekKunci.terbuka !== 1) {
        return sendError(res, 403, `Pertemuan ${pertNum} sedang dikunci`);
      }

      let soalTerpilih = [];
      if (pertNum <= 3) {
        const bank = BANK_SOAL_MINI[pertNum] || [];
        soalTerpilih = bank.map(s => ({
          id: s.id,
          pertanyaan: s.pertanyaan,
          pilihan: s.pilihan
        }));
      } else {
        const bankCopy = [...BANK_SOAL_EVALUASI];
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
      const jawabanSantri = body.jawaban;

      if (!pertNum || !Array.isArray(jawabanSantri)) {
        return sendError(res, 400, 'Format jawaban kuis tidak valid');
      }

      let masterSoal = pertNum <= 3 ? (BANK_SOAL_MINI[pertNum] || []) : BANK_SOAL_EVALUASI;
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

  // Sinkronisasi Offline (Antrean dari browser saat koneksi pulih)
  if (method === 'POST' && pathname === '/api/santri/sinkronisasi-offline') {
    try {
      const body = await readBodyJson(req);
      const { antrean } = body;

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

module.exports = {
  handleSantriRoutes
};
