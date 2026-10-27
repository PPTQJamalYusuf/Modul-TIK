'use strict';

// 6. PERTEMUAN 1: INTERAKTIF KOMPONEN PC & BACA MATERI
    // ------------------------------------------------------------------------
    const KOMPONEN_PC_DATA = {
      monitor: {
        nama: 'Layar Monitor (Perangkat Keluaran / Output)',
        fungsi: 'Menampilkan tampilan visual sistem operasi, program teks, gambar, dan video yang sedang dikerjakan.',
        analogi: 'Analogi Sehari-hari: Seperti papan tulis di ruang kelas pesantren yang menampilkan apa yang sedang dibahas.'
      },
      cpu: {
        nama: 'System Case, Processor (CPU) & RAM',
        fungsi: 'Wadah komponen utama komputer. Di dalamnya terdapat CPU (otak yang mengolah instruksi) dan RAM (memori kerja sementara).',
        analogi: 'Analogi Sehari-hari: CPU adalah otak santri yang menghafal dan menghitung, sedangkan RAM adalah meja belajar tempat meletakkan kitab yang sedang dibaca.'
      },
      keyboard: {
        nama: 'Papan Ketik (Keyboard - Perangkat Input)',
        fungsi: 'Memasukkan huruf, angka, simbol, dan perintah pintasan ke komputer.',
        analogi: 'Analogi Sehari-hari: Seperti pena dan tinta yang digunakan santriwati untuk menulis catatan ilmu.'
      },
      mouse: {
        nama: 'Tetikus (Mouse - Perangkat Penunjuk / Input)',
        fungsi: 'Mengendalikan kursor penunjuk di layar, memilih objek, menekan tombol, dan menyeret file.',
        analogi: 'Analogi Sehari-hari: Seperti jari telunjuk kita yang menunjuk bait nadhom pada kitab saat mengaji.'
      }
    };

    function klikKomponenPc(key) {
      const data = KOMPONEN_PC_DATA[key];
      if (!data) return;
      document.getElementById('pc-detail-nama').textContent = data.nama;
      document.getElementById('pc-detail-fungsi').textContent = data.fungsi;
      const analogiBox = document.getElementById('pc-detail-analogi');
      analogiBox.textContent = data.analogi;
      analogiBox.style.display = 'block';
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
          document.getElementById(`btn-selesai-baca-p${pNum}`).style.display = 'none';
          document.getElementById(`p${pNum}-baca-badge`).style.display = 'inline-block';
          perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
          if (!res.sudah_pernah) {
            alert(`Alhamdulillah! Anda mendapatkan +${res.xp_diberikan} XP dari membaca materi Pertemuan ${pNum}.`);
          }
        }
      } catch (err) {
        if (!STATE.isOnline) {
          // Masukkan ke antrean offline
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

// 7. PERTEMUAN 2: MINI GAME MOUSE & VIRTUAL KEYBOARD TYPING ENGINE
    // ------------------------------------------------------------------------
    function inisialisasiPertemuan2() {
      // Inisialisasi Listener Keyboard Nyata untuk Virtual Keyboard
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

    // Mesin Latihan Mengetik & Perhitungan WPM
    const TEKS_LATIHAN = {
      easy: 'asdf jkl; asdf jkl; fasa jala lada faja sakal salak alas jada laka',
      medium: 'belajar komputer dengan tertib dan teliti di lab santri putri',
      hard: 'Teknologi Informasi dan Komunikasi Membantu Santri Belajar Mandiri!'
    };

    let typingStartTime = null;

    function gantiTeksLatihanMengetik() {
      const diff = document.getElementById('typing-diff-select').value;
      const targetEl = document.getElementById('typing-target');
      const inputEl = document.getElementById('typing-input');

      targetEl.textContent = TEKS_LATIHAN[diff] || TEKS_LATIHAN.easy;
      inputEl.value = '';
      typingStartTime = null;
      document.getElementById('stat-wpm').textContent = 'WPM: 0';
      document.getElementById('stat-accuracy').textContent = 'Akurasi: 100%';
      document.getElementById('typing-feedback').textContent = 'Siap mengetik';

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
      document.getElementById('stat-accuracy').textContent = `Akurasi: ${akurasi}%`;

      if (typingStartTime) {
        const menit = (Date.now() - typingStartTime) / 60000;
        const wpm = menit > 0 ? Math.round((benar / 5) / menit) : 0;
        document.getElementById('stat-wpm').textContent = `WPM: ${wpm}`;
      }

      if (inputVal === targetText) {
        feedback.textContent = '🎉 Luar biasa! Seluruh kalimat selesai dengan sempurna!';
        feedback.style.color = 'var(--primary)';

        const diff = document.getElementById('typing-diff-select').value;
        catatAktivitasMengetikSelesai(diff);
      } else {
        feedback.textContent = `Sedang mengetik... (${benar}/${targetText.length})`;
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

    // Mini Game Mouse
    let mouseGameInterval = null;
    let mouseTimeRemaining = 45;
    let mouseScore = 0;

    function mulaiMiniGameMouse() {
      const arena = document.getElementById('mouse-arena');
      const diff = document.getElementById('mouse-game-diff').value;
      arena.innerHTML = '';

      mouseScore = 0;
      mouseTimeRemaining = diff === 'easy' ? 45 : (diff === 'medium' ? 35 : 25);
      document.getElementById('mouse-score-display').textContent = `Skor: ${mouseScore}`;
      document.getElementById('mouse-timer-display').textContent = `Waktu: ${mouseTimeRemaining}s`;

      // Buat Drop Box untuk Drag and Drop
      const dropBox = document.createElement('div');
      dropBox.className = 'drop-target-box';
      dropBox.id = 'mouse-drop-box';
      dropBox.textContent = 'Tarik ke Sini (Drop Box)';
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
      const targetLama = document.getElementById('active-mouse-target');
      if (targetLama) targetLama.remove();

      if (mouseTimeRemaining <= 0) return;

      const target = document.createElement('div');
      target.id = 'active-mouse-target';
      target.className = 'mouse-target';

      // Acak posisi
      const maxX = arena.clientWidth - 80;
      const maxY = arena.clientHeight - 80;
      const x = Math.max(10, Math.floor(Math.random() * maxX));
      const y = Math.max(10, Math.floor(Math.random() * maxY));
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;

      // Acak aksi: Klik Kiri, Klik Kanan, Double Klik, atau Drag
      const aksiList = ['klik_kiri', 'klik_kanan', 'double_klik', 'drag'];
      const aksi = aksiList[Math.floor(Math.random() * aksiList.length)];

      if (aksi === 'klik_kiri') {
        target.textContent = 'Klik 1x';
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
        target.textContent = 'Klik 2x Cepat';
        target.style.background = '#8b5cf6';
        target.ondblclick = () => { tambahSkorMouse(20); munculkanTargetMouse(); };
      } else if (aksi === 'drag') {
        target.textContent = 'Tarik Aku!';
        target.style.background = 'var(--accent)';
        target.draggable = true;
        target.ondragstart = (e) => {
          e.dataTransfer.setData('text/plain', 'mouse_target');
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
      document.getElementById('mouse-score-display').textContent = `Skor: ${mouseScore}`;
    }

    async function akhiriMiniGameMouse() {
      clearInterval(mouseGameInterval);
      const arena = document.getElementById('mouse-arena');
      arena.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h4 style="font-size: 18px; color: var(--primary-dark);">Permainan Selesai!</h4>
          <p style="font-size: 15px; margin: 8px 0;">Skor Akhir Gerakan Mouse Anda: <strong>${mouseScore} Poin</strong></p>
          <button class="btn btn-primary" onclick="mulaiMiniGameMouse()">Coba Lagi</button>
        </div>
      `;

      if (mouseScore >= 50 && STATE.santri) {
        const diff = document.getElementById('mouse-game-diff').value;
        try {
          const res = await apiFetch('/api/santri/progres/aktivitas', 'POST', {
            modul: 1,
            pertemuan: 2,
            jenis_aktivitas: `p2_game_mouse_${diff}`,
            nama_aktivitas: `Mini Game Mouse (${diff})`
          });
          if (res.status === 'sukses' && !res.sudah_pernah) {
            perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
            alert(`Selamat! Anda mendapatkan +${res.xp_diberikan} XP dari mini game mouse.`);
          }
        } catch (e) {
          console.error(e.message);
        }
      }
    }
