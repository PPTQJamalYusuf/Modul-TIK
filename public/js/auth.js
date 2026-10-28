
'use strict';

// ----------------------------------------------------------------------------
// PENGENDALIAN SIDEBAR OTOMATIS & TOGGLE NAVIGASI
// ----------------------------------------------------------------------------
function sembunyikanSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.style.display = 'none';
  }
  perbaruiTombolToggleSidebar(false);
}

function tampilkanSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.style.display = 'flex';
  }
  perbaruiTombolToggleSidebar(true);
}

function toggleSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;
  const isHidden = (sidebar.style.display === 'none' || getComputedStyle(sidebar).display === 'none');
  if (isHidden) {
    tampilkanSidebar();
  } else {
    sembunyikanSidebar();
  }
}

function perbaruiTombolToggleSidebar(isTerbuka) {
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  if (btnToggle) {
    btnToggle.style.display = 'inline-flex';
    if (true) {
      const iconSpan = document.getElementById('icon-toggle-sidebar');
      const textSpan = document.getElementById('text-toggle-sidebar');
      if (iconSpan) iconSpan.textContent = isTerbuka ? '✕' : '☰';
      if (textSpan) textSpan.textContent = isTerbuka ? 'Tutup Menu' : 'Menu Navigasi';
      btnToggle.title = isTerbuka ? 'Sembunyikan Sidebar Navigasi' : 'Tampilkan Sidebar Navigasi';
      if (isTerbuka) {
        btnToggle.classList.add('btn-sidebar-open');
      } else {
        btnToggle.classList.remove('btn-sidebar-open');
      }
    } else {
      btnToggle.style.display = 'none';
    }
  }

  document.querySelectorAll('.btn-toggle-sidebar-view').forEach(btn => {
    btn.innerHTML = isTerbuka ? '<span>✕ Tutup Navigasi</span>' : '<span>☰ Buka Navigasi</span>';
    btn.title = isTerbuka ? 'Sembunyikan Sidebar Navigasi' : 'Tampilkan Sidebar Navigasi';
  });
}


// 4. AUTENTIKASI: LOGIN, BUAT PASSWORD & LOGOUT SANTRI
// ------------------------------------------------------------------------
let targetPertemuanSetelahLogin = null;
let santriListCache = [];

function bukaModalAuth(targetPertemuan = null) {
  targetPertemuanSetelahLogin = targetPertemuan;
  const modal = document.getElementById('modal-auth');
  const alertBox = document.getElementById('auth-alert-box');
  if (alertBox) alertBox.style.display = 'none';

  if (modal) {
    modal.style.display = 'flex';
    const filterElem = document.getElementById('login-kelas-filter');
    if (filterElem && filterElem.value) {
      muatDaftarSantriAuth();
    }
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
  const banner = document.getElementById('auth-status-banner');
  const pinContainer = document.getElementById('pin-field-container');
  const btnSubmit = document.getElementById('btn-submit-auth');
  const alertBox = document.getElementById('auth-alert-box');

  if (banner) banner.style.display = 'none';
  if (pinContainer) pinContainer.style.display = 'none';
  if (btnSubmit) btnSubmit.style.display = 'none';
  if (alertBox) alertBox.style.display = 'none';

  if (!filterElem || !select) return;

  const kelas = filterElem.value;
  select.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';

  if (!kelas) return;

  try {
    const res = await apiFetch(`/api/santri/daftar-publik?kelas=${kelas}`);
    santriListCache = res.santri || [];
    if (santriListCache.length > 0) {
      santriListCache.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.nama} ${s.pin_aktif ? '' : '🌸 (Buat PIN Baru)'}`;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    console.error('Gagal mengambil daftar santri:', e.message);
  }
}

function cekStatusSantriDipilih() {
  const select = document.getElementById('login-santri-select');
  const banner = document.getElementById('auth-status-banner');
  const pinContainer = document.getElementById('pin-field-container');
  const lblPin = document.getElementById('lbl-pin-input');
  const pinInput = document.getElementById('login-pin-input');
  const btnSubmit = document.getElementById('btn-submit-auth');
  const alertBox = document.getElementById('auth-alert-box');

  if (alertBox) alertBox.style.display = 'none';

  if (!select) return;
  const santriId = select.value;
  const santri = santriListCache.find(s => s.id === santriId);

  if (!santri) {
    if (banner) banner.style.display = 'none';
    if (pinContainer) pinContainer.style.display = 'none';
    if (btnSubmit) btnSubmit.style.display = 'none';
    return;
  }

  if (pinContainer) pinContainer.style.display = 'block';
  if (btnSubmit) btnSubmit.style.display = 'block';
  if (pinInput) {
    pinInput.value = '';
    pinInput.focus();
  }

  if (santri.pin_aktif) {
    // Santri sudah memiliki Password/PIN
    if (banner) {
      banner.style.display = 'block';
      banner.className = 'callout-box';
      banner.style.borderLeftColor = 'var(--primary)';
      banner.style.background = '#F0FDF4';
      banner.style.color = '#15803D';
      banner.innerHTML = `<strong>🔒 Akun Santri:</strong> Masukkan Password/PIN Anda untuk melanjutkan belajar.<br><small style="color: #64748B;">(Lupa Password/PIN? Minta Guru untuk Reset PIN di lab)</small>`;
    }
    if (lblPin) lblPin.textContent = 'Password / PIN Anda:';
    if (pinInput) pinInput.placeholder = 'Ketik PIN / Password Anda';
    if (btnSubmit) {
      btnSubmit.textContent = 'Buka Lab & Mulai Belajar 🚀';
      btnSubmit.className = 'btn btn-primary';
    }
  } else {
    // Santri belum memiliki Password/PIN -> Langsung buat
    if (banner) {
      banner.style.display = 'block';
      banner.className = 'callout-box callout-adab';
      banner.style.borderLeftColor = 'var(--secondary)';
      banner.style.background = '#FFFBEB';
      banner.style.color = '#B45309';
      banner.innerHTML = `<strong>🌸 Pertama Kali Masuk:</strong> Anda belum memiliki Password/PIN. Silakan tentukan Password/PIN baru Anda di bawah (minimal 4 karakter/angka). Ingat baik-baik ya!`;
    }
    if (lblPin) lblPin.textContent = 'Buat Password / PIN Baru:';
    if (pinInput) pinInput.placeholder = 'Tentukan 4 digit PIN / Password baru';
    if (btnSubmit) {
      btnSubmit.textContent = '✨ Simpan Password & Masuk Belajar';
      btnSubmit.className = 'btn btn-secondary';
    }
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const select = document.getElementById('login-santri-select');
  const pinInput = document.getElementById('login-pin-input');
  const alertBox = document.getElementById('auth-alert-box');

  if (!select || !pinInput) return;

  const santriId = select.value;
  const pin = pinInput.value.trim();

  if (!santriId || !pin) return;

  if (pin.length < 4) {
    if (alertBox) {
      alertBox.className = 'callout-box callout-adab';
      alertBox.style.borderLeftColor = 'var(--danger)';
      alertBox.style.background = 'var(--danger-light)';
      alertBox.style.color = 'var(--danger)';
      alertBox.textContent = 'Password/PIN minimal 4 karakter atau angka.';
      alertBox.style.display = 'block';
    }
    return;
  }

  const santri = santriListCache.find(s => s.id === santriId);
  const endpoint = (santri && santri.pin_aktif) ? '/api/santri/login' : '/api/santri/buat-pin';

  try {
    const res = await apiFetch(endpoint, 'POST', { santri_id: santriId, pin });
    if (res.status === 'sukses') {
      STATE.santri = res.santri;
      pinInput.value = '';
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

// ========================================================================
// HERO WORKSTATION: 2D TYPEWRITER & HERO DIRECT LOGIN
// ========================================================================
let typewriterStarted = false;

function initTypewriterAnimation() {
  if (typewriterStarted) return;
  const target = document.getElementById('tech-typing-target');
  if (!target) return;
  typewriterStarted = true;

  const phrases = [
    "Latihan Mengetik 10 Jari Cepat...",
    "Mengenal Hardware & Bedakan RAM vs SSD...",
    "Eksplorasi Lemari Berkas Windows...",
    "Kuasai Shortcut Keyboard Pintar...",
    "Taklukkan Misi Lab & Raih Sertifikat Emas!"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 85;

  function typeStep() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      target.textContent = currentPhrase.substring(0, charIndex);
      typingSpeed = 35;
    } else {
      charIndex++;
      target.textContent = currentPhrase.substring(0, charIndex);
      typingSpeed = 75 + Math.random() * 40;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Selesai mengetik satu kalimat, tunggu sejenak
      isDeleting = true;
      typingSpeed = 2200;
    } else if (isDeleting && charIndex === 0) {
      // Selesai menghapus, ganti ke kalimat berikutnya
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400;
    }

    setTimeout(typeStep, typingSpeed);
  }

  typeStep();
}

let heroSantriListCache = [];

async function muatDaftarSantriHero() {
  const filterElem = document.getElementById('hero-kelas-filter');
  const select = document.getElementById('hero-santri-select');
  const banner = document.getElementById('hero-auth-banner');
  const pinContainer = document.getElementById('hero-pin-container');
  const btnSubmit = document.getElementById('hero-btn-submit');
  const alertBox = document.getElementById('hero-auth-alert');

  if (banner) banner.style.display = 'none';
  if (pinContainer) pinContainer.style.display = 'none';
  if (btnSubmit) btnSubmit.style.display = 'none';
  if (alertBox) alertBox.style.display = 'none';

  if (!filterElem || !select) return;

  const kelas = filterElem.value;
  select.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';

  if (!kelas) return;

  try {
    const res = await apiFetch(`/api/santri/daftar-publik?kelas=${kelas}`);
    heroSantriListCache = res.santri || [];
    if (heroSantriListCache.length > 0) {
      heroSantriListCache.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.nama} ${s.pin_aktif ? '' : '🌸 (Buat PIN Baru)'}`;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    console.error('Gagal mengambil daftar santri hero:', e.message);
  }
}

function cekStatusSantriHero() {
  const select = document.getElementById('hero-santri-select');
  const banner = document.getElementById('hero-auth-banner');
  const pinContainer = document.getElementById('hero-pin-container');
  const lblPin = document.getElementById('hero-lbl-pin');
  const pinInput = document.getElementById('hero-pin-input');
  const btnSubmit = document.getElementById('hero-btn-submit');
  const alertBox = document.getElementById('hero-auth-alert');

  if (alertBox) alertBox.style.display = 'none';

  if (!select) return;
  const santriId = select.value;
  const santri = heroSantriListCache.find(s => s.id === santriId);

  if (!santri) {
    if (banner) banner.style.display = 'none';
    if (pinContainer) pinContainer.style.display = 'none';
    if (btnSubmit) btnSubmit.style.display = 'none';
    return;
  }

  if (pinContainer) pinContainer.style.display = 'block';
  if (btnSubmit) btnSubmit.style.display = 'block';
  if (pinInput) {
    pinInput.value = '';
    pinInput.focus();
  }

  if (santri.pin_aktif) {
    if (banner) {
      banner.style.display = 'block';
      banner.style.background = '#f0f9ff';
      banner.style.borderLeftColor = '#0284c7';
      banner.style.color = '#0369a1';
      banner.innerHTML = `<strong>🔒 Akun Terdaftar:</strong> Masukkan Password/PIN Anda untuk melanjutkan belajar.<br><small style="color: #64748b;">(Lupa Password? Hubungi Guru untuk reset PIN di lab)</small>`;
    }
    if (lblPin) lblPin.textContent = 'Password / PIN Anda:';
    if (pinInput) pinInput.placeholder = 'Ketik Password/PIN Anda';
    if (btnSubmit) {
      btnSubmit.textContent = '🚀 Buka Lab & Mulai Belajar';
      btnSubmit.className = 'btn btn-primary tech-btn-login';
    }
  } else {
    if (banner) {
      banner.style.display = 'block';
      banner.style.background = '#fffbeb';
      banner.style.borderLeftColor = '#f59e0b';
      banner.style.color = '#b45309';
      banner.innerHTML = `<strong>🌸 Pertama Kali Masuk:</strong> Anda belum memiliki Password/PIN. Silakan tentukan Password baru Anda di bawah (min. 4 karakter). Ingat baik-baik ya!`;
    }
    if (lblPin) lblPin.textContent = 'Buat Password / PIN Baru:';
    if (pinInput) pinInput.placeholder = 'Tentukan 4 digit PIN / Password baru';
    if (btnSubmit) {
      btnSubmit.textContent = '✨ Simpan Password & Masuk Belajar';
      btnSubmit.className = 'btn btn-secondary tech-btn-login';
    }
  }
}

async function handleHeroAuthSubmit(e) {
  e.preventDefault();
  const select = document.getElementById('hero-santri-select');
  const pinInput = document.getElementById('hero-pin-input');
  const alertBox = document.getElementById('hero-auth-alert');

  if (!select || !pinInput) return;

  const santriId = select.value;
  const pin = pinInput.value.trim();

  if (!santriId || !pin) return;

  if (pin.length < 4) {
    if (alertBox) {
      alertBox.textContent = 'Password/PIN minimal 4 karakter atau angka.';
      alertBox.style.display = 'block';
    }
    return;
  }

  const santri = heroSantriListCache.find(s => s.id === santriId);
  const endpoint = (santri && santri.pin_aktif) ? '/api/santri/login' : '/api/santri/buat-pin';

  try {
    const res = await apiFetch(endpoint, 'POST', { santri_id: santriId, pin });
    if (res.status === 'sukses') {
      STATE.santri = res.santri;
      pinInput.value = '';
      if (alertBox) alertBox.style.display = 'none';
      await inisialisasiSesiSantri();
    }
  } catch (err) {
    if (alertBox) {
      alertBox.textContent = err.message || 'Gagal masuk akun.';
      alertBox.style.display = 'block';
    }
  }
}

// Kompatibilitas mundur
function gantiTabAuth() {}
function muatDaftarSantriAktivasi() {}
function handleLoginSubmit(e) { return handleAuthSubmit(e); }
function handleAktivasiSubmit(e) { return handleAuthSubmit(e); }

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
  perbaruiTombolToggleSidebar(false);

  if (userChip) userChip.style.display = 'none';
  if (btnLogout) btnLogout.style.display = 'none';
  if (btnAuth) btnAuth.style.display = 'none';
  if (btnLanjut) btnLanjut.style.display = 'none';

  // Sembunyikan sidebar navigasi & konten pembelajaran (HANYA LAYAR INTRO LOGIN)
  const sidebar = document.getElementById('app-sidebar');
  const learningContent = document.getElementById('dashboard-learning-content');

  if (sidebar) sidebar.style.display = 'none';
  if (learningContent) learningContent.style.display = 'none';

  // Toggle hero workstation cards
  const heroLoginCard = document.getElementById('hero-login-card');
  const heroProfileCard = document.getElementById('hero-profile-card');
  const terminalSubtext = document.getElementById('terminal-subtext');

  if (heroLoginCard) heroLoginCard.style.display = 'block';
  if (heroProfileCard) heroProfileCard.style.display = 'none';
  if (terminalSubtext) terminalSubtext.textContent = 'Menunggu santri masuk lab... Siap belajar! 🚀';

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

  // Tampilkan sidebar dan konten pembelajaran setelah santri berhasil masuk
  const sidebar = document.getElementById('app-sidebar');
  const learningContent = document.getElementById('dashboard-learning-content');

  if (sidebar) sidebar.style.display = STATE.pertemuanAktif ? 'none' : 'flex';
  perbaruiTombolToggleSidebar(!STATE.pertemuanAktif);
  if (learningContent) learningContent.style.display = 'block';

  // Toggle hero workstation cards
  const heroLoginCard = document.getElementById('hero-login-card');
  const heroProfileCard = document.getElementById('hero-profile-card');
  const terminalSubtext = document.getElementById('terminal-subtext');

  if (heroLoginCard) heroLoginCard.style.display = 'none';
  if (heroProfileCard) heroProfileCard.style.display = 'block';

  if (STATE.santri && terminalSubtext) {
    terminalSubtext.textContent = `Sesi aktif: ${STATE.santri.nama} (${formatNamaKelas(STATE.santri.kelas)}) siap berpetualang! 🎯`;
  }

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

  // Hero Card Profile Elements
  const heroNama = document.getElementById('hero-profile-nama');
  const heroKelas = document.getElementById('hero-profile-kelas');
  const heroLevel = document.getElementById('hero-profile-level');
  const heroXp = document.getElementById('hero-profile-xp');
  const heroBar = document.getElementById('hero-profile-bar');

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

  // Update Hero Profile Card
  if (heroNama) heroNama.textContent = STATE.santri.nama;
  if (heroKelas) heroKelas.textContent = formatNamaKelas(STATE.santri.kelas);
  if (heroLevel) heroLevel.textContent = `Level ${level} • ${gelar}`;
  if (heroXp) heroXp.textContent = `${xp} XP`;
  if (heroBar) heroBar.style.width = `${fillPct}%`;
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

  if (typeof gulirKeAtas === 'function') {
    gulirKeAtas();
  }
}

function bukaDashboard() {
  sembunyikanSemuaView();
  const el = document.getElementById('view-dashboard');
  if (el) {
    el.style.display = 'block';
    if (typeof gulirKeAtas === 'function') {
      gulirKeAtas(el);
      setTimeout(() => gulirKeAtas(el), 10);
    }
  }

  const sidebar = document.getElementById('app-sidebar');
  const learningContent = document.getElementById('dashboard-learning-content');

  if (STATE.santri) {
    tampilkanSidebar();
    if (learningContent) learningContent.style.display = 'block';
  } else {
    sembunyikanSidebar();
    if (learningContent) learningContent.style.display = 'none';
  }

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
  if (viewEl) {
    viewEl.style.display = 'block';
    if (typeof gulirKeAtas === 'function') {
      gulirKeAtas(viewEl);
      setTimeout(() => gulirKeAtas(viewEl), 10);
    }
  }

  // Otomatis sembunyikan sidebar saat membuka modul agar ruang belajar lapang & fokus
  sembunyikanSidebar();

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

