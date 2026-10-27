/**
 * ============================================================================
 * LAB KOMPUTER: MODUL 1 DASAR TIK
 * Server Backend Mandiri (Pure Node.js + SQLite Bawaan - Zero NPM)
 * ============================================================================
 */

'use strict';

// 1. PEMERIKSAAN VERSI RUNTIME NODE.JS
const nodeVersion = process.versions.node;
const [majorVer, minorVer] = nodeVersion.split('.').map(Number);

if (majorVer < 22 || (majorVer === 22 && minorVer < 5)) {
  console.error('\n================================================================');
  console.error('[KESALAHAN KRITIS] VERSI NODE.JS TIDAK KOMPATIBEL!');
  console.error(`Versi terdeteksi: v${nodeVersion}`);
  console.error('Aplikasi ini membutuhkan Node.js v22.5.0 atau yang lebih baru');
  console.error('karena menggunakan modul bawaan resmi "node:sqlite".');
  console.error('Silakan unduh dan instal Node.js versi terbaru dari https://nodejs.org');
  console.error('================================================================\n');
  process.exit(1);
}

const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const { PORT, DB_PATH, BACKUP_DIR, PID_FILE } = require('./config');
const { serveStaticFile, sendError } = require('./utils/http');
const { handleSantriRoutes } = require('./routes/santri');
const { handleGuruRoutes } = require('./routes/guru');

// Muat database dan pastikan skema serta backup siap
require('./database');

// 2. DISPATCHER UTAMA SERVER HTTP
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;
  const clientIp = req.socket.remoteAddress || 'unknown';

  try {
    // A. Rute API Guru
    if (pathname.startsWith('/api/guru/')) {
      return await handleGuruRoutes(req, res, pathname, method, urlObj, clientIp);
    }

    // B. Rute API Santri, Leaderboard & Status
    if (pathname.startsWith('/api/santri/') || pathname === '/api/status' || pathname === '/api/logout' || pathname === '/api/leaderboard') {
      return await handleSantriRoutes(req, res, pathname, method, urlObj, clientIp);
    }

    // C. Berkas Statis Frontend (public/index.html, CSS, JS, Assets)
    if (method === 'GET') {
      const terlayani = serveStaticFile(req, res, pathname);
      if (terlayani) return;
    }

    // D. 404 Not Found
    sendError(res, 404, 'Sumber daya tidak ditemukan');
  } catch (err) {
    console.error(`[SERVER ERROR] ${method} ${pathname}:`, err.message);
    sendError(res, 500, 'Terjadi kesalahan internal server');
  }
});

// 3. MENJALANKAN SERVER DAN PENGUMUMAN JARINGAN LOKAL
server.listen(PORT, '0.0.0.0', () => {
  try {
    fs.writeFileSync(PID_FILE, String(process.pid), 'utf8');
  } catch (err) {
    console.warn('[PID WARNING] Gagal menulis PID file:', err.message);
  }

  const hapusPid = () => {
    try {
      if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    } catch {}
  };
  process.on('exit', hapusPid);
  process.on('SIGINT', () => { hapusPid(); process.exit(0); });
  process.on('SIGTERM', () => { hapusPid(); process.exit(0); });
  const ifaces = os.networkInterfaces();
  const alamatIp = [];

  for (const namaIface in ifaces) {
    for (const info of ifaces[namaIface]) {
      if (info.family === 'IPv4' && !info.internal) {
        alamatIp.push(info.address);
      }
    }
  }

  console.log('\n================================================================');
  console.log('       LAB KOMPUTER: MODUL 1 DASAR TIK — SERVER AKTIF           ');
  console.log('================================================================');
  console.log(`Port Server       : ${PORT}`);
  console.log(`Node.js Runtime   : v${process.versions.node} (Official node:sqlite)`);
  console.log(`Database Utama    : ${DB_PATH}`);
  console.log(`Direktori Backup  : ${BACKUP_DIR}`);
  console.log('----------------------------------------------------------------');
  console.log('Alamat Akses Laptop Guru (Lokal):');
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://127.0.0.1:${PORT}`);
  console.log('\nAlamat Akses Santri di Jaringan Wi-Fi Lab:');
  if (alamatIp.length > 0) {
    for (const ip of alamatIp) {
      console.log(`  >>> http://${ip}:${PORT} <<<`);
    }
  } else {
    console.log('  [Peringatan] Belum ada IP Wi-Fi terdeteksi. Hubungkan ke Wi-Fi lab.');
  }
  console.log('----------------------------------------------------------------');
  console.log('Kredensial Default Guru :');
  console.log('  PIN Guru: guru1234 (dapat diubah pada menu Panel Guru)');
  console.log('================================================================\n');
});
