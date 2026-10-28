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
