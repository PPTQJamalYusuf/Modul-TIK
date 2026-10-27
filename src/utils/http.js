'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { PUBLIC_DIR } = require('../config');
const { hashToken } = require('./security');
const { db } = require('../database');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    const val = decodeURIComponent(parts.join('='));
    list[key] = val;
  });
  return list;
}

function sendJson(res, statusCode, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { status: 'error', pesan: message });
}

function readBodyJson(req, maxBytes = 1048576) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        reject(new Error('Ukuran data request melebihi batas'));
      } else {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      try {
        const str = Buffer.concat(chunks).toString('utf-8');
        if (!str || str.trim() === '') return resolve({});
        const parsed = JSON.parse(str);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Format JSON data request tidak valid'));
      }
    });
    req.on('error', reject);
  });
}

function readBodyText(req, maxBytes = 5242880) { // 5MB untuk CSV
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        req.destroy();
        reject(new Error('Ukuran file melebihi batas 5MB'));
      } else {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });
    req.on('error', reject);
  });
}

// Verifikasi Sesi Token (Santri atau Guru)
function verifikasiSesi(req) {
  const cookies = parseCookies(req);
  let rawToken = cookies.session_token;

  // Fallback: Authorization header "Bearer <token>"
  const authHeader = req.headers['authorization'];
  if (!rawToken && authHeader && authHeader.startsWith('Bearer ')) {
    rawToken = authHeader.slice(7).trim();
  }

  if (!rawToken) return null;

  const tHash = hashToken(rawToken);
  const sekarang = Date.now();

  const stmt = db.prepare(`
    SELECT s.token_hash, s.santri_id, s.peran, s.kedaluwarsa,
           st.nama, st.kelas
    FROM sesi s
    LEFT JOIN santri st ON s.santri_id = st.id
    WHERE s.token_hash = ? AND s.aktif = 1 AND s.kedaluwarsa > ?
  `);

  const row = stmt.get(tHash, sekarang);
  if (!row) return null;

  return {
    tokenHash: row.token_hash,
    santriId: row.santri_id,
    peran: row.peran,
    nama: row.nama,
    kelas: row.kelas
  };
}

// Sanitasi formula injection Excel: jika sel diawali =, +, -, @, beri awalan petik satu '
function amankanCsv(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Penyajian Berkas Statis (Public Directory) dengan Proteksi Path Traversal
function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' || pathname === '/guru' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  // Pastikan path tetap berada di dalam PUBLIC_DIR (Cegah Path Traversal)
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendError(res, 403, 'Akses direktori ditolak');
  }

  if (!fs.existsSync(filePath)) {
    return false; // Berikan kesempatan ke handler berikutnya atau 404
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isCode = ext === '.html' || ext === '.js' || ext === '.css';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': isCode ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400'
  });

  fs.createReadStream(filePath).pipe(res);
  return true;
}

module.exports = {
  parseCookies,
  sendJson,
  sendError,
  readBodyJson,
  readBodyText,
  verifikasiSesi,
  amankanCsv,
  serveStaticFile
};
