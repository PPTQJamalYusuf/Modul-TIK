'use strict';

const crypto = require('node:crypto');

function hashPin(pin, salt) {
  return crypto.scryptSync(pin, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
}

function buatSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function verifikasiPin(pinInput, salt, storedHash) {
  try {
    const computedHash = crypto.scryptSync(pinInput, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function buatTokenSesi() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buatKodeAktivasi() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AKT-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Pelacak upaya login untuk mencegah Brute Force (Rate Limiting di Memory)
const pelacakLogin = new Map();

function periksaRateLimit(kunciIdentitas) {
  const sekarang = Date.now();
  const info = pelacakLogin.get(kunciIdentitas);
  if (!info) return { diizinkan: true };
  if (info.terkunciSampai && info.terkunciSampai > sekarang) {
    const sisaDetik = Math.ceil((info.terkunciSampai - sekarang) / 1000);
    return { diizinkan: false, sisaDetik };
  }
  return { diizinkan: true };
}

function catatGagalLogin(kunciIdentitas) {
  const sekarang = Date.now();
  let info = pelacakLogin.get(kunciIdentitas) || { gagal: 0, terkunciSampai: 0 };
  info.gagal += 1;
  if (info.gagal >= 5) {
    info.terkunciSampai = sekarang + 30000; // Kunci 30 detik
    info.gagal = 0; // Reset counter setelah dikunci
  }
  pelacakLogin.set(kunciIdentitas, info);
}

function resetGagalLogin(kunciIdentitas) {
  pelacakLogin.delete(kunciIdentitas);
}

module.exports = {
  hashPin,
  buatSalt,
  verifikasiPin,
  buatTokenSesi,
  hashToken,
  buatKodeAktivasi,
  periksaRateLimit,
  catatGagalLogin,
  resetGagalLogin
};
