'use strict';

/**
 * ============================================================================
 * MODUL GLOSARIUM PINTAR TIK (Bab 11 Naskah Materi Lab Komputer)
 * Istilah Esensial Komputer A-Z dengan Pencarian Real-Time
 * ============================================================================
 */

const DATA_GLOSARIUM = [
  { istilah: 'Backup / Cadangan', kategori: 'Sistem', arti: 'Salinan tambahan dari data penting untuk membantu pemulihan jika salinan utama bermasalah atau rusak.' },
  { istilah: 'Booting', kategori: 'Sistem', arti: 'Proses menyalakan dan memuat sistem operasi ke dalam memori komputer hingga komputer siap digunakan.' },
  { istilah: 'Browser / Peramban', kategori: 'Aplikasi', arti: 'Aplikasi untuk membuka dan menelusuri halaman situs web (misalnya Google Chrome, Microsoft Edge, Mozilla Firefox).' },
  { istilah: 'Casing', kategori: 'Hardware', arti: 'Kotak wadah pelindung fisik tempat terpasangnya komponen internal komputer (motherboard, prosesor, RAM, power supply).' },
  { istilah: 'CPU / Prosesor', kategori: 'Hardware', arti: 'Chip sirkuit terpadu (Central Processing Unit) yang bertindak sebagai otak utama komputer untuk memproses instruksi.' },
  { istilah: 'Desktop', kategori: 'Antarmuka', arti: 'Area kerja utama layar Windows yang menampilkan ikon aplikasi, dokumen, wallpaper, dan taskbar setelah pengguna login.' },
  { istilah: 'Directory / Direktori', kategori: 'Berkas', arti: 'Nama lain dari folder; wadah digital untuk mengelompokkan berkas dan subfolder secara terstruktur.' },
  { istilah: 'Drive', kategori: 'Berkas', arti: 'Partisi atau lokasi media penyimpanan yang dikenali oleh sistem operasi dengan huruf pengenal (misalnya C:, D:, atau USB Flashdisk).' },
  { istilah: 'Driver', kategori: 'Sistem', arti: 'Perangkat lunak khusus yang memungkinkan sistem operasi berkomunikasi dengan perangkat keras (seperti printer, mouse, kartu grafis).' },
  { istilah: 'Ekstensi File', kategori: 'Berkas', arti: 'Akhiran nama file setelah tanda titik (misalnya .docx, .pdf, .png) yang memberi tahu sistem jenis dan aplikasi pembuka file tersebut.' },
  { istilah: 'File / Berkas', kategori: 'Berkas', arti: 'Unit data digital yang disimpan dengan nama tertentu pada media penyimpanan komputer.' },
  { istilah: 'File Explorer', kategori: 'Aplikasi', arti: 'Aplikasi bawaan Windows untuk mengelola, menyalin, memindahkan, dan menelusuri file, folder, serta drive (Shortcut: Win + E).' },
  { istilah: 'Flashdisk / USB Drive', kategori: 'Hardware', arti: 'Media penyimpanan eksternal portabel berukuran kecil yang dihubungkan melalui lubang port USB komputer.' },
  { istilah: 'Folder', kategori: 'Berkas', arti: 'Wadah digital untuk menyimpan dan mengorganisasi kumpulan berkas dan folder lain di dalamnya agar tertata rapi.' },
  { istilah: 'GUI (Graphical User Interface)', kategori: 'Antarmuka', arti: 'Antarmuka berbasis visual (ikon, jendela, tombol grafis) yang memudahkan pengguna berinteraksi dengan komputer.' },
  { istilah: 'Hardware / Perangkat Keras', kategori: 'Hardware', arti: 'Seluruh komponen fisik komputer yang dapat disentuh dan dilihat secara nyata (monitor, keyboard, mouse, casing).' },
  { istilah: 'Home Row', kategori: 'Antarmuka', arti: 'Baris tombol acuan di tengah keyboard (ASDF untuk tangan kiri dan JKL; untuk tangan kanan) sebagai posisi pangkal mengetik 10 jari.' },
  { istilah: 'Input', kategori: 'Sistem', arti: 'Data, sinyal, atau instruksi yang dimasukkan oleh pengguna ke dalam komputer melalui perangkat input (keyboard, mouse).' },
  { istilah: 'Operating System (OS)', kategori: 'Sistem', arti: 'Perangkat lunak utama (seperti Microsoft Windows) yang menjembatani perangkat keras, aplikasi, dan pengguna.' },
  { istilah: 'Output', kategori: 'Sistem', arti: 'Hasil pengolahan data yang disajikan oleh komputer kepada pengguna melalui perangkat output (layar monitor, printer, speaker).' },
  { istilah: 'Path / Jalur Berkas', kategori: 'Berkas', arti: 'Alamat atau urutan navigasi lengkap untuk menemukan lokasi spesifik sebuah file atau folder (contoh: C:\\Dokumen\\TIK\\Tugas.docx).' },
  { istilah: 'RAM (Random Access Memory)', kategori: 'Hardware', arti: 'Memori kerja cepat yang bersifat sementara (volatile); datanya akan hilang saat komputer dimatikan atau listrik padam.' },
  { istilah: 'Recycle Bin', kategori: 'Berkas', arti: 'Tempat penampungan sementara berkas yang dihapus di Windows sebelum dihapus permanen atau dipulihkan kembali (Restore).' },
  { istilah: 'Rename', kategori: 'Berkas', arti: 'Operasi mengganti nama sebuah file atau folder tanpa merusak maupun mengubah isi data di dalamnya.' },
  { istilah: 'Shortcut / Pintasan', kategori: 'Antarmuka', arti: 'Kombinasi tombol keyboard (seperti Ctrl + C, Ctrl + V) atau ikon penunjuk kilat untuk mempercepat pekerjaan.' },
  { istilah: 'Software / Perangkat Lunak', kategori: 'Sistem', arti: 'Kumpulan instruksi atau program digital yang mengendalikan kerja komputer (sistem operasi, browser, program pengolah kata).' },
  { istilah: 'Storage / Penyimpanan', kategori: 'Hardware', arti: 'Media penyimpanan permanen (seperti SSD atau hard disk) yang menyimpan berkas dan sistem operasi bahkan saat komputer mati.' },
  { istilah: 'Taskbar', kategori: 'Antarmuka', arti: 'Bilah panjang di bagian bawah layar Windows untuk membuka menu Start, melihat aplikasi aktif, dan informasi jam/jaringan.' },
  { istilah: 'Touchpad', kategori: 'Hardware', arti: 'Permukaan peka sentuhan pada laptop yang berfungsi sebagai pengganti mouse untuk mengendalikan kursor dan gestur multi-jari.' }
];

let glosariumFilterAktif = 'Semua';

function bukaModalGlosarium() {
  const modal = document.getElementById('modal-glosarium');
  if (modal) {
    modal.style.display = 'flex';
    renderDaftarGlosarium();
    const input = document.getElementById('input-cari-glosarium');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
    }
  }
}

function tutupModalGlosarium() {
  const modal = document.getElementById('modal-glosarium');
  if (modal) modal.style.display = 'none';
}

function setKategoriGlosarium(kat) {
  glosariumFilterAktif = kat;
  const pills = document.querySelectorAll('.glosarium-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-kat') === kat) {
      p.className = 'btn btn-primary btn-sm glosarium-pill';
    } else {
      p.className = 'btn btn-outline btn-sm glosarium-pill';
    }
  });
  renderDaftarGlosarium();
}

function renderDaftarGlosarium() {
  const container = document.getElementById('glosarium-list-container');
  if (!container) return;

  const keyword = (document.getElementById('input-cari-glosarium')?.value || '').toLowerCase().trim();

  const filtered = DATA_GLOSARIUM.filter(item => {
    const cocokKategori = glosariumFilterAktif === 'Semua' || item.kategori === glosariumFilterAktif;
    const cocokKeyword = !keyword || 
      item.istilah.toLowerCase().includes(keyword) || 
      item.arti.toLowerCase().includes(keyword);
    return cocokKategori && cocokKeyword;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 12px; color: var(--text-muted);">
        <div style="font-size: 32px; margin-bottom: 6px;">🔍</div>
        <p style="font-weight: 700;">Istilah tidak ditemukan</p>
        <p style="font-size: 13px;">Coba gunakan kata kunci lain (misal: RAM, File, CPU, dll.)</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div style="background: #ffffff; border: 1.5px solid var(--border); border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; transition: border-color 0.2s ease;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; gap: 8px;">
        <strong style="color: var(--primary-dark); font-size: 15px;">${item.istilah}</strong>
        <span style="font-size: 11px; font-weight: 700; color: #0f766e; background: #ccfbf1; padding: 2px 8px; border-radius: 12px;">${item.kategori}</span>
      </div>
      <p style="font-size: 13.5px; color: #334155; line-height: 1.6; margin: 0;">${item.arti}</p>
    </div>
  `).join('');
}
