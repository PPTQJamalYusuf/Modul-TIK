'use strict';

// ============================================================================
// MODUL 1: INTERAKTIF KOMPONEN PC, LATIHAN MENGETIK 10 JARI & GAME MOUSE
// ============================================================================

// 1. DATA DETAIL KOMPONEN KOMPUTER DENGAN AKURASI KONSEPTUAL TINGGI
const KOMPONEN_PC_DATA = {
  monitor: {
    nama: 'Layar Monitor (Perangkat Keluaran / Output)',
    fungsi: 'Menampilkan antarmuka grafis sistem operasi Windows, teks dokumen tugas, gambar, dan video yang sedang diproses komputer.',
    analogi: 'Analogi Kontekstual: Seperti papan tulis di kelas pesantren yang menampilkan materi kajian yang sedang dibahas oleh guru.',
    miskonsepsi: 'Perhatian: Yang tampak di layar adalah tampilan perangkat lunak (software), sedangkan monitor itu sendiri adalah perangkat keras fisiknya (hardware).'
  },
  casing: {
    nama: 'Unit Sistem / Casing PC (Wadah Komponen Pelindung)',
    fungsi: 'Kotak pelindung yang menampung dan melindungi komponen vital di dalamnya seperti Motherboard, Power Supply, Kipas Pendingin, Processor, dan Penyimpanan.',
    analogi: 'Analogi Kontekstual: Seperti bangunan lemari laboratorium yang melindungi rak-rak kitab dan arsip di dalamnya.',
    miskonsepsi: 'Koreksi Miskonsepsi: Kotak ini sering keliru disebut "CPU". Padahal ini adalah Casing (System Unit). CPU yang sesungguhnya adalah chip kecil di dalam motherboard!'
  },
  cpu: {
    nama: 'Processor / CPU (Central Processing Unit — Otak Komputer)',
    fungsi: 'Chip mikroprosesor inti yang bertugas mengeksekusi instruksi program, melakukan perhitungan matematika logis, dan mengoordinasikan seluruh kinerja sistem komputer.',
    analogi: 'Analogi Kontekstual: Seperti akal pikiran santriwati yang menghafal bait kaidah, mencerna masalah, dan memikirkan jawaban.',
    miskonsepsi: 'Koreksi Miskonsepsi: CPU berukuran kecil dan terpasang di atas motherboard di bawah pendingin (heatsink), bukan kotak komputer besar luarnya.'
  },
  ram: {
    nama: 'RAM (Random Access Memory — Memori Kerja Sementara)',
    fungsi: 'Menyimpan data dan instruksi program yang sedang aktif dibuka saat ini agar CPU dapat mengaksesnya dengan kecepatan sangat tinggi.',
    analogi: 'Analogi Kontekstual: Meja belajar tempat meletakkan kitab dan buku tulis yang sedang kita baca sekarang.',
    miskonsepsi: 'Koreksi Miskonsepsi: RAM bersifat sementara (volatile). Begitu laptop dimatikan atau listrik padam mendadak, data di RAM akan hilang seketika jika belum disimpan ke file!'
  },
  storage: {
    nama: 'Media Penyimpanan SSD / Harddisk (Non-Volatile Storage)',
    fungsi: 'Menyimpan sistem operasi Windows, program aplikasi, dan berkas tugas santri secara permanen agar tetap ada saat komputer dimatikan.',
    analogi: 'Analogi Kontekstual: Lemari arsip berkunci tempat menyimpan kitab dan bundel catatan agar bisa dibuka lagi kapan saja.',
    miskonsepsi: 'Koreksi Miskonsepsi: Meskipun tidak hilang saat mati lampu (non-volatile), SSD/HDD TIDAK menjamin data aman selamanya. Komponen elektronik bisa aus, rusak, atau terkena virus; karena itu cadangan (backup) berkala tetap wajib!'
  },
  keyboard: {
    nama: 'Papan Ketik (Keyboard — Perangkat Masukan / Input)',
    fungsi: 'Memasukkan karakter huruf, angka, tanda baca, simbol, serta kombinasi tombol pintasan sistem untuk memberi perintah ke komputer.',
    analogi: 'Analogi Kontekstual: Seperti pena dan tinta yang digunakan santriwati untuk menuliskan ilmu dan catatan faedah.',
    miskonsepsi: 'Tips: Jari harus dilatih bertumpu di baris pangkal (Home Row: ASDF JKL;) dengan memanfaatkan tonjolan taktil di tombol F dan J.'
  },
  mouse: {
    nama: 'Tetikus (Mouse / Touchpad — Perangkat Masukan Penunjuk)',
    fungsi: 'Mengendalikan panah kursor di layar untuk memilih item (klik kiri), membuka menu pilihan (klik kanan), meluncurkan halaman (scroll), dan memindahkan objek (seret-lepas).',
    analogi: 'Analogi Kontekstual: Seperti jari telunjuk kita yang mengarahkan bait-bait nadhom pada lembar kitab saat mengaji.',
    miskonsepsi: 'Koreksi Miskonsepsi: Klik kanan tidak otomatis menghapus file, melainkan membuka menu konteks. Dan efek seret-lepas bergantung pada lokasi tujuan (dalam drive sama = pindah, antar-drive = salin).'
  }
};

function klikKomponenPc(key) {
  const data = KOMPONEN_PC_DATA[key];
  if (!data) return;
  
  const elNama = document.getElementById('pc-detail-nama');
  const elFungsi = document.getElementById('pc-detail-fungsi');
  const elAnalogi = document.getElementById('pc-detail-analogi');
  
  if (elNama) elNama.textContent = data.nama;
  if (elFungsi) elFungsi.textContent = data.fungsi;
  
  if (elAnalogi) {
    elAnalogi.innerHTML = `
      <strong>💡 ${data.analogi}</strong>
      <div style="margin-top: 6px; font-size: 12px; color: #b45309; border-top: 1px dashed #fcd34d; padding-top: 4px;">
        🛡️ <em>${data.miskonsepsi}</em>
      </div>
    `;
    elAnalogi.style.display = 'block';
  }
}

async function catatAktivitasBaca(pNum) {
  if (!STATE.santri) return;
  try {
    const res = await apiFetch('/api/santri/progres/aktivitas', 'POST', {
      modul: 1,
      pertemuan: pNum,
      jenis_aktivitas: `p${pNum}_baca_materi`,
      nama_aktivitas: `Membaca Materi Pertemuan ${pNum}`
    });

    if (res.status === 'sukses') {
      const btn = document.getElementById(`btn-selesai-baca-p${pNum}`);
      const badge = document.getElementById(`p${pNum}-baca-badge`);
      if (btn) btn.style.display = 'none';
      if (badge) badge.style.display = 'inline-block';
      perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
      if (!res.sudah_pernah) {
        alert(`Alhamdulillah! Anda mendapatkan +${res.xp_diberikan} XP dari menyelesaikan pembacaan materi Sesi ${pNum}.`);
      }
    }
  } catch (err) {
    if (!STATE.isOnline) {
      STATE.offlineQueue.push({
        id_lokal: Date.now(),
        jenis: 'aktivitas',
        payload: { modul: 1, pertemuan: pNum, jenis_aktivitas: `p${pNum}_baca_materi` }
      });
      simpanAntreanOfflineKeStorage();
      updateNetworkStatus(false);
      alert('Anda sedang offline. Progres Anda telah disimpan di antrean laptop dan akan disinkronkan saat terhubung kembali.');
    } else {
      alert(err.message);
    }
  }
}

// 2. PERTEMUAN 2: VIRTUAL KEYBOARD TYPING ENGINE BERTAHAP
function inisialisasiPertemuan2() {
  window.removeEventListener('keydown', handleGlobalKeyDown);
  window.removeEventListener('keyup', handleGlobalKeyUp);
  window.addEventListener('keydown', handleGlobalKeyDown);
  window.addEventListener('keyup', handleGlobalKeyUp);

  gantiTeksLatihanMengetik();
}

function handleGlobalKeyDown(e) {
  const keyUpper = e.key.toUpperCase();
  let elemId = `k-${keyUpper}`;
  if (e.code === 'Space') elemId = 'k-Space';
  if (e.key === ';') elemId = 'k-Semicolon';

  const keyEl = document.getElementById(elemId);
  if (keyEl) keyEl.classList.add('active-key');
}

function handleGlobalKeyUp(e) {
  const keyUpper = e.key.toUpperCase();
  let elemId = `k-${keyUpper}`;
  if (e.code === 'Space') elemId = 'k-Space';
  if (e.key === ';') elemId = 'k-Semicolon';

  const keyEl = document.getElementById(elemId);
  if (keyEl) keyEl.classList.remove('active-key');
}

// Teks Latihan Bertahap: Home Row -> Kata Pendek -> Kalimat Tugas TIK
const TEKS_LATIHAN = {
  easy: 'asdf jkl; asdf jkl; fasa jala lada faja sakal salak alas jada laka',
  medium: 'buku data file lab rapi tugas modul ketik simpan cari folder papan',
  hard: 'Saya menyimpan tugas TIK di folder yang rapi dan membuat cadangan di lab komputer.'
};

let typingStartTime = null;

function gantiTeksLatihanMengetik() {
  const diffSelect = document.getElementById('typing-diff-select');
  const diff = diffSelect ? diffSelect.value : 'easy';
  const targetEl = document.getElementById('typing-target');
  const inputEl = document.getElementById('typing-input');

  if (!targetEl || !inputEl) return;

  targetEl.textContent = TEKS_LATIHAN[diff] || TEKS_LATIHAN.easy;
  inputEl.value = '';
  typingStartTime = null;
  
  const wpmEl = document.getElementById('stat-wpm');
  const accEl = document.getElementById('stat-accuracy');
  const feedEl = document.getElementById('typing-feedback');
  
  if (wpmEl) wpmEl.textContent = 'WPM: 0';
  if (accEl) accEl.textContent = 'Akurasi: 100%';
  if (feedEl) {
    feedEl.textContent = 'Letakkan jari di Home Row (F & J). Mulai mengetik dengan tenang dan teliti!';
    feedEl.style.color = 'var(--text-muted)';
  }

  inputEl.oninput = handleTypingInput;
}

function handleTypingInput(e) {
  const inputVal = e.target.value;
  const targetText = document.getElementById('typing-target').textContent;
  const feedback = document.getElementById('typing-feedback');

  if (!typingStartTime && inputVal.length > 0) {
    typingStartTime = Date.now();
  }

  // Hitung Karakter Benar
  let benar = 0;
  for (let i = 0; i < inputVal.length; i++) {
    if (inputVal[i] === targetText[i]) benar++;
  }

  const totalKetik = inputVal.length;
  const akurasi = totalKetik > 0 ? Math.round((benar / totalKetik) * 100) : 100;
  const accEl = document.getElementById('stat-accuracy');
  if (accEl) accEl.textContent = `Akurasi: ${akurasi}%`;

  if (typingStartTime) {
    const menit = (Date.now() - typingStartTime) / 60000;
    const wpm = menit > 0 ? Math.round((benar / 5) / menit) : 0;
    const wpmEl = document.getElementById('stat-wpm');
    if (wpmEl) wpmEl.textContent = `WPM: ${wpm}`;
  }

  if (inputVal === targetText) {
    feedback.textContent = '🎉 Maa syaa Allah! Latihan selesai dengan akurasi dan ketelitian sempurna!';
    feedback.style.color = 'var(--primary)';

    const diff = document.getElementById('typing-diff-select').value;
    catatAktivitasMengetikSelesai(diff);
  } else {
    feedback.textContent = `Sedang mengetik... (${benar}/${targetText.length} karakter tepat). Utamakan itqan / ketelitian!`;
    feedback.style.color = 'var(--text-muted)';
  }
}

async function catatAktivitasMengetikSelesai(diff) {
  if (!STATE.santri) return;
  try {
    const jenisAktivitas = `p2_typing_${diff}`;
    const res = await apiFetch('/api/santri/progres/aktivitas', 'POST', {
      modul: 1,
      pertemuan: 2,
      jenis_aktivitas: jenisAktivitas,
      nama_aktivitas: `Latihan Mengetik (${diff})`
    });
    if (res.status === 'sukses' && !res.sudah_pernah) {
      perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
      alert(`Maa syaa Allah! Latihan mengetik selesai (+${res.xp_diberikan} XP).`);
    }
  } catch (err) {
    console.error(err.message);
  }
}

// 3. MINI GAME KENDALI MOUSE & TOUCHPAD (DENGAN DUKUNGAN AKSESIBILITAS)
let mouseGameInterval = null;
let mouseTimeRemaining = 45;
let mouseScore = 0;

function mulaiMiniGameMouse() {
  const arena = document.getElementById('mouse-arena');
  const diffSelect = document.getElementById('mouse-game-diff');
  const diff = diffSelect ? diffSelect.value : 'easy';
  if (!arena) return;
  arena.innerHTML = '';

  mouseScore = 0;
  mouseTimeRemaining = diff === 'easy' ? 45 : (diff === 'medium' ? 35 : 25);
  document.getElementById('mouse-score-display').textContent = `Skor: ${mouseScore}`;
  document.getElementById('mouse-timer-display').textContent = `Waktu: ${mouseTimeRemaining}s`;

  // Buat Drop Box untuk Drag and Drop
  const dropBox = document.createElement('div');
  dropBox.className = 'drop-target-box';
  dropBox.id = 'mouse-drop-box';
  dropBox.textContent = 'Kotak Tujuan (Drop Box)';
  dropBox.ondragover = e => e.preventDefault();
  dropBox.ondrop = handleTargetDrop;
  arena.appendChild(dropBox);

  if (mouseGameInterval) clearInterval(mouseGameInterval);

  mouseGameInterval = setInterval(() => {
    mouseTimeRemaining--;
    document.getElementById('mouse-timer-display').textContent = `Waktu: ${mouseTimeRemaining}s`;
    if (mouseTimeRemaining <= 0) {
      akhiriMiniGameMouse();
    }
  }, 1000);

  munculkanTargetMouse();
}

function munculkanTargetMouse() {
  const arena = document.getElementById('mouse-arena');
  if (!arena) return;
  const targetLama = document.getElementById('active-mouse-target');
  if (targetLama) targetLama.remove();

  if (mouseTimeRemaining <= 0) return;

  const target = document.createElement('div');
  target.id = 'active-mouse-target';
  target.className = 'mouse-target';

  // Acak posisi
  const maxX = Math.max(50, arena.clientWidth - 110);
  const maxY = Math.max(50, arena.clientHeight - 90);
  const x = Math.max(15, Math.floor(Math.random() * maxX));
  const y = Math.max(15, Math.floor(Math.random() * maxY));
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  // Acak aksi: Klik Kiri, Klik Kanan, Double Klik, atau Drag
  const aksiList = ['klik_kiri', 'klik_kanan', 'double_klik', 'drag'];
  const aksi = aksiList[Math.floor(Math.random() * aksiList.length)];

  if (aksi === 'klik_kiri') {
    target.textContent = 'Klik Kiri 1x';
    target.onclick = () => { tambahSkorMouse(10); munculkanTargetMouse(); };
  } else if (aksi === 'klik_kanan') {
    target.textContent = 'Klik Kanan';
    target.style.background = 'var(--secondary)';
    target.oncontextmenu = (e) => {
      e.preventDefault();
      tambahSkorMouse(15);
      munculkanTargetMouse();
    };
  } else if (aksi === 'double_klik') {
    target.textContent = 'Klik Ganda (2x)';
    target.style.background = '#8b5cf6';
    target.ondblclick = () => { tambahSkorMouse(20); munculkanTargetMouse(); };
  } else if (aksi === 'drag') {
    target.textContent = 'Seret ke Kotak';
    target.title = 'Tarik objek ini ke kotak tujuan, atau klik tombol aksesibilitas bila menggunakan touchpad';
    target.style.background = 'var(--accent)';
    target.draggable = true;
    target.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', 'mouse_target');
    };
    // Alternatif Aksesibilitas bagi pengguna touchpad yang kesulitan seret-lepas
    target.onclick = () => {
      tambahSkorMouse(15);
      munculkanTargetMouse();
    };
  }

  arena.appendChild(target);
}

function handleTargetDrop(e) {
  e.preventDefault();
  tambahSkorMouse(25);
  munculkanTargetMouse();
}

function tambahSkorMouse(poin) {
  mouseScore += poin;
  const scoreEl = document.getElementById('mouse-score-display');
  if (scoreEl) scoreEl.textContent = `Skor: ${mouseScore}`;
}

async function akhiriMiniGameMouse() {
  clearInterval(mouseGameInterval);
  const arena = document.getElementById('mouse-arena');
  if (!arena) return;
  arena.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <h4 style="font-size: 18px; color: var(--primary-dark);">Latihan Mouse Selesai!</h4>
      <p style="font-size: 14px; margin: 8px 0; color: var(--text-muted);">
        Skor Gerakan & Refleks Mouse Anda: <strong>${mouseScore} Poin</strong>.
      </p>
      <button class="btn btn-primary" onclick="mulaiMiniGameMouse()">Ulangi Latihan</button>
    </div>
  `;

  if (mouseScore >= 40 && STATE.santri) {
    const diffSelect = document.getElementById('mouse-game-diff');
    const diff = diffSelect ? diffSelect.value : 'easy';
    try {
      const res = await apiFetch('/api/santri/progres/aktivitas', 'POST', {
        modul: 1,
        pertemuan: 2,
        jenis_aktivitas: `p2_game_mouse_${diff}`,
        nama_aktivitas: `Mini Game Mouse (${diff})`
      });
      if (res.status === 'sukses' && !res.sudah_pernah) {
        perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
        alert(`Selamat! Keterampilan mouse Anda meningkat (+${res.xp_diberikan} XP).`);
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}
