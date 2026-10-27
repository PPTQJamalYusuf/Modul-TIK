'use strict';

// 14. INITIAL BOOTSTRAP PADA SAAT HALAMAN SELESAI DIMUAT
// ------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', async () => {
  if (typeof initTypewriterAnimation === 'function') {
    initTypewriterAnimation();
  }
  muatAntreanOfflineDariStorage();

  // Cek apakah sudah ada sesi santri aktif
  try {
    const res = await apiFetch('/api/santri/profil');
    if (res && res.status === 'sukses') {
      STATE.santri = res.santri;
      await inisialisasiSesiSantri();
      bukaDashboard();
      return;
    }
  } catch {}

  // Jika URL adalah /guru, buka halaman guru langsung
  if (window.location.pathname === '/guru' || window.location.hash === '#guru') {
    navigasiKeGuru();
  } else {
    perbaruiTampilanGuest();
    bukaDashboard();
  }
});

