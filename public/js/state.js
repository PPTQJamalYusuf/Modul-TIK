'use strict';

// 1. STATE MANAGEMENT APLIKASI
// ------------------------------------------------------------------------
const STATE = {
  santri: null,         // Data akun santri yang login
  guruToken: null,      // Token sesi guru
  pertemuanAktif: 1,    // Pertemuan yang sedang dibuka (1–4)
  pertemuanStatus: [],  // Status kunci pertemuan untuk kelas aktif
  offlineQueue: [],     // Antrean aktivitas yang belum disinkronkan ke server
  isOnline: true,
  leaderboardTab: 'kelas',
  leaderboardView: 'chart',
  leaderboardTimer: null,
  typingEngine: null,
  mouseGame: null,
  virtualFs: null
};

/**
 * Mengembalikan posisi scroll ke bagian paling atas layar dan container konten
 * saat berpindah sesi atau kembali ke beranda.
 */
function gulirKeAtas(targetEl) {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const ca = document.querySelector('.content-area');
    if (ca) {
      ca.scrollTop = 0;
    }
    const ml = document.querySelector('.main-layout');
    if (ml) {
      ml.scrollTop = 0;
    }
    if (targetEl) {
      const el = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }
  } catch (err) {
    console.warn('Scroll reset error:', err);
  }
}
