'use strict';

// 4. AUTENTIKASI: LOGIN, AKTIVASI & LOGOUT SANTRI
// ------------------------------------------------------------------------
let targetPertemuanSetelahLogin = null;

function bukaModalAuth(targetPertemuan = null) {
  targetPertemuanSetelahLogin = targetPertemuan;
  const modal = document.getElementById('modal-auth');
  if (modal) {
    modal.style.display = 'flex';
    gantiTabAuth('login');
  }
}

function tutupModalAuth() {
  const modal = document.getElementById('modal-auth');
  if (modal) modal.style.display = 'none';
  targetPertemuanSetelahLogin = null;
}

async function muatDaftarSantriAuth() {
  const filterElem = document.getElementById('login-kelas-filter');
  const select = document.getElementById('login-santri-select');
  if (!filterElem || !select) return;

  const kelas = filterElem.value;
  select.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';

  if (!kelas) return;

  try {
    const res = await apiFetch(`/api/santri/daftar-publik?kelas=${kelas}`);
    if (res.santri) {
      res.santri.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.nama} ${s.pin_aktif ? '' : '(Perlu Aktivasi)'}`;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    console.error('Gagal mengambil daftar santri:', e.message);
  }
}

async function muatDaftarSantriAktivasi() {
  const filterElem = document.getElementById('aktivasi-kelas-filter');
  const select = document.getElementById('aktivasi-santri-select');
  if (!filterElem || !select) return;

  const kelas = filterElem.value;
  select.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';

  if (!kelas) return;

  try {
    const res = await apiFetch(`/api/santri/daftar-publik?kelas=${kelas}`);
    if (res.santri) {
      res.santri.forEach(s => {
        if (!s.pin_aktif) {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.nama;
          select.appendChild(opt);
        }
      });
    }
  } catch (e) {
    console.error('Gagal mengambil daftar santri:', e.message);
  }
}

function gantiTabAuth(tab) {
  const formLogin = document.getElementById('form-login');
  const formAktivasi = document.getElementById('form-aktivasi');
  const btnLogin = document.getElementById('tab-btn-login');
  const btnAktivasi = document.getElementById('tab-btn-aktivasi');
  const alertBox = document.getElementById('auth-alert-box');
  if (alertBox) alertBox.style.display = 'none';

  if (!formLogin || !formAktivasi) return;

  if (tab === 'login') {
    formLogin.style.display = 'block';
    formAktivasi.style.display = 'none';
    if (btnLogin) btnLogin.className = 'btn btn-primary';
    if (btnAktivasi) btnAktivasi.className = 'btn btn-outline';
    muatDaftarSantriAuth();
  } else {
    formLogin.style.display = 'none';
    formAktivasi.style.display = 'block';
    if (btnLogin) btnLogin.className = 'btn btn-outline';
    if (btnAktivasi) btnAktivasi.className = 'btn btn-primary';
    muatDaftarSantriAktivasi();
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const santriId = document.getElementById('login-santri-select').value;
  const pin = document.getElementById('login-pin-input').value;
  const alertBox = document.getElementById('auth-alert-box');

  if (!santriId || !pin) return;

  try {
    const res = await apiFetch('/api/santri/login', 'POST', { santri_id: santriId, pin });
    if (res.status === 'sukses') {
      STATE.santri = res.santri;
      document.getElementById('login-pin-input').value = '';
      tutupModalAuth();
      await inisialisasiSesiSantri();

      if (targetPertemuanSetelahLogin) {
        bukaPertemuan(targetPertemuanSetelahLogin);
        targetPertemuanSetelahLogin = null;
      }
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'callout-box callout-adab';
      alertBox.style.borderLeftColor = 'var(--danger)';
      alertBox.style.background = 'var(--danger-light)';
      alertBox.style.color = 'var(--danger)';
      alertBox.textContent = err.message;
      alertBox.style.display = 'block';
    }
  }
}

async function handleAktivasiSubmit(e) {
  e.preventDefault();
  const santriId = document.getElementById('aktivasi-santri-select').value;
  const kode = document.getElementById('aktivasi-kode-input').value;
  const pin = document.getElementById('aktivasi-pin-input').value;
  const alertBox = document.getElementById('auth-alert-box');

  if (!santriId || !kode || !pin) return;

  try {
    const res = await apiFetch('/api/santri/aktivasi', 'POST', {
      santri_id: santriId,
      kode_aktivasi: kode,
      pin
    });
    if (res.status === 'sukses') {
      alert('Alhamdulillah! Akun berhasil diaktivasi. Silakan masuk dengan PIN baru Anda.');
      gantiTabAuth('login');
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = 'callout-box callout-adab';
      alertBox.style.borderLeftColor = 'var(--danger)';
      alertBox.style.background = 'var(--danger-light)';
      alertBox.style.color = 'var(--danger)';
      alertBox.textContent = err.message;
      alertBox.style.display = 'block';
    }
  }
}

async function lakukanLogout() {
  try {
    await apiFetch('/api/logout', 'POST');
  } catch {}
  STATE.santri = null;
  perbaruiTampilanGuest();
  bukaDashboard();
}

function perbaruiTampilanGuest() {
  const userChip = document.getElementById('user-header-chip');
  const btnLogout = document.getElementById('btn-logout');
  const btnAuth = document.getElementById('btn-auth-trigger');
  const btnLanjut = document.getElementById('btn-lanjut-belajar');

  if (userChip) userChip.style.display = 'none';
  if (btnLogout) btnLogout.style.display = 'none';
  if (btnAuth) btnAuth.style.display = 'inline-flex';
  if (btnLanjut) btnLanjut.style.display = 'none';

  // Update profil sidebar ke state Tamu
  const sideAvatar = document.getElementById('side-avatar');
  const sideNama = document.getElementById('side-nama');
  const sideKelas = document.getElementById('side-kelas-gelar');
  const sideLevel = document.getElementById('side-level-txt');
  const sideXp = document.getElementById('side-xp-txt');
  const sideFill = document.getElementById('side-progress-fill');

  if (sideAvatar) sideAvatar.textContent = '🌸';
  if (sideNama) sideNama.textContent = 'Mode Tamu';
  if (sideKelas) sideKelas.textContent = 'Klik untuk Masuk Akun';
  if (sideLevel) sideLevel.textContent = 'Tamu';
  if (sideXp) sideXp.textContent = '0 XP';
  if (sideFill) sideFill.style.width = '0%';
}

// 5. INISIALISASI SESI SANTRI & NAVIGASI VIEW
// ------------------------------------------------------------------------
async function inisialisasiSesiSantri() {
  const userChip = document.getElementById('user-header-chip');
  const btnLogout = document.getElementById('btn-logout');
  const btnAuth = document.getElementById('btn-auth-trigger');
  const btnLanjut = document.getElementById('btn-lanjut-belajar');
  const btnLb = document.getElementById('btn-open-leaderboard');

  if (userChip) userChip.style.display = 'flex';
  if (btnLogout) btnLogout.style.display = 'inline-flex';
  if (btnAuth) btnAuth.style.display = 'none';
  if (btnLanjut) btnLanjut.style.display = 'inline-flex';
  if (btnLb) btnLb.style.display = 'inline-flex';

  await segarkanProfilSantri();

  // Mulai polling papan juara setiap 5 detik
  if (STATE.leaderboardTimer) clearInterval(STATE.leaderboardTimer);
  STATE.leaderboardTimer = setInterval(segarkanDataLeaderboard, 5000);
}

async function segarkanProfilSantri() {
  try {
    const res = await apiFetch('/api/santri/profil');
    if (res.status === 'sukses') {
      STATE.santri = res.santri;
      STATE.pertemuanStatus = res.pertemuan_status;

      perbaruiProfilHeader(res.santri.total_xp, res.santri.level, res.santri.gelar);
      perbaruiStatusKunciPertemuan(res.pertemuan_status);
    }
  } catch (err) {
    console.error('Gagal mengambil profil:', err.message);
  }
}

function formatNamaKelas(k) {
  const num = parseInt(k, 10);
  if (num <= 9) return `Kelas ${num} SMP`;
  return `Kelas ${num} SMA`;
}

function perbaruiProfilHeader(xp, level, gelar) {
  if (!STATE.santri) return;

  const headerNama = document.getElementById('header-user-nama');
  const headerKelas = document.getElementById('header-user-kelas');
  const headerXp = document.getElementById('header-user-xp');
  const sideAvatar = document.getElementById('side-avatar');
  const sideNama = document.getElementById('side-nama');
  const sideKelas = document.getElementById('side-kelas-gelar');
  const sideLevel = document.getElementById('side-level-txt');
  const sideXp = document.getElementById('side-xp-txt');
  const sideFill = document.getElementById('side-progress-fill');

  if (headerNama) headerNama.textContent = STATE.santri.nama;
  if (headerKelas) headerKelas.textContent = formatNamaKelas(STATE.santri.kelas);
  if (headerXp) headerXp.textContent = `${xp} XP`;

  if (sideAvatar) sideAvatar.textContent = STATE.santri.nama.charAt(0).toUpperCase();
  if (sideNama) sideNama.textContent = STATE.santri.nama;
  if (sideKelas) sideKelas.textContent = `${formatNamaKelas(STATE.santri.kelas)} • ${gelar}`;
  if (sideLevel) sideLevel.textContent = `Level ${level}`;

  const nextXp = level * 150;
  const fillPct = Math.min(100, Math.round((xp / nextXp) * 100));
  if (sideFill) sideFill.style.width = `${fillPct}%`;
  if (sideXp) sideXp.textContent = `${xp} / ${nextXp} XP`;
}

function perbaruiStatusKunciPertemuan(statusList) {
  if (!statusList) return;
  const map = new Map(statusList.map(s => [s.pertemuan, s.terbuka]));
  for (let p = 1; p <= 4; p++) {
    const btn = document.getElementById(`nav-p${p}`);
    const badge = document.getElementById(`status-p${p}`);
    if (!btn || !badge) continue;
    const terbuka = map.get(p) === 1;

    if (terbuka) {
      btn.classList.remove('locked');
      badge.className = 'badge-status badge-selesai';
      badge.textContent = 'Buka';
      badge.style.display = 'inline-block';
    } else {
      btn.classList.add('locked');
      badge.className = 'item-meta';
      badge.textContent = '🔒 Dikunci';
      badge.style.display = 'inline-block';
    }
  }
}

function sembunyikanSemuaView() {
  const views = ['view-dashboard', 'view-p1', 'view-p2', 'view-p3', 'view-p4', 'view-guru', 'view-sertifikat'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = 'none';
  });

  const navs = ['nav-home', 'nav-typing', 'nav-p1', 'nav-p2', 'nav-p3', 'nav-p4', 'nav-sertifikat', 'nav-guru', 'nav-leaderboard'];
  navs.forEach(n => {
    const el = document.getElementById(n);
    if (el) el.classList.remove('active');
  });
}

function bukaDashboard() {
  sembunyikanSemuaView();
  const el = document.getElementById('view-dashboard');
  if (el) el.style.display = 'block';
  const navHome = document.getElementById('nav-home');
  if (navHome) navHome.classList.add('active');
}

function bukaPertemuan(pNum) {
  // Jika belum login, buka modal login dan simpan target pertemuan
  if (!STATE.santri) {
    bukaModalAuth(pNum);
    return;
  }

  // Cek apakah pertemuan dikunci oleh guru
  const map = new Map(STATE.pertemuanStatus.map(s => [s.pertemuan, s.terbuka]));
  if (map.get(pNum) !== 1) {
    alert(`Pertemuan ${pNum} masih dikunci oleh Guru untuk Kelas ${STATE.santri.kelas}.`);
    return;
  }

  sembunyikanSemuaView();
  STATE.pertemuanAktif = pNum;
  const viewEl = document.getElementById(`view-p${pNum}`);
  if (viewEl) viewEl.style.display = 'block';

  const navEl = document.getElementById(`nav-p${pNum}`);
  if (navEl) navEl.classList.add('active');

  if (pNum === 2) {
    inisialisasiPertemuan2();
  } else if (pNum === 4) {
    inisialisasiPertemuan4();
  }
}

function navigasiLanjutBelajar() {
  if (!STATE.santri) {
    bukaModalAuth(1);
    return;
  }
  bukaPertemuan(STATE.santri.pertemuan_terakhir || 1);
}

