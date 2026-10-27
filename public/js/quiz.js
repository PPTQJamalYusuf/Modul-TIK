'use strict';

// 10. KUIS ENGINE (MINI KUIS P1-P3 & EVALUASI P4 DENGAN PENILAIAN SERVER)
    // ------------------------------------------------------------------------
    async function muatKuisPertemuan(pNum) {
      const container = document.getElementById(`kuis-container-p${pNum}`);
      container.innerHTML = '<div style="padding: 10px; color: var(--text-muted);">Memuat soal kuis dari server...</div>';

      try {
        const res = await apiFetch('/api/santri/kuis/ambil-soal', 'POST', { pertemuan: pNum });
        if (res.status === 'sukses' && res.soal) {
          renderSoalKuis(pNum, res.soal);
        }
      } catch (err) {
        container.innerHTML = `<div class="callout-box callout-adab" style="color: var(--danger);">${err.message}</div>`;
      }
    }

    function renderSoalKuis(pNum, daftarSoal) {
      const container = document.getElementById(`kuis-container-p${pNum}`);
      container.innerHTML = '';

      daftarSoal.forEach((soal, idx) => {
        const box = document.createElement('div');
        box.className = 'quiz-question-box';
        box.id = `qbox-${soal.id}`;

        let opsiHtml = '';
        soal.pilihan.forEach((pilihan, pIdx) => {
          opsiHtml += `
            <label class="quiz-option-label">
              <input type="radio" name="jawaban_${soal.id}" value="${pIdx}">
              <span>${pilihan}</span>
            </label>
          `;
        });

        box.innerHTML = `
          <strong>Soal ${idx + 1}: ${soal.pertanyaan}</strong>
          <div class="quiz-options">${opsiHtml}</div>
          <div id="exp-${soal.id}" class="quiz-explanation-box" style="display: none;"></div>
        `;
        container.appendChild(box);
      });

      const btnSubmit = document.createElement('button');
      btnSubmit.className = 'btn btn-primary';
      btnSubmit.style.marginTop = '14px';
      btnSubmit.textContent = 'Periksa Jawaban Kuis';
      btnSubmit.onclick = () => submitKuisJawaban(pNum, daftarSoal);
      container.appendChild(btnSubmit);
    }

    async function submitKuisJawaban(pNum, daftarSoal) {
      const jawaban = [];
      let adaKosong = false;

      daftarSoal.forEach(soal => {
        const selected = document.querySelector(`input[name="jawaban_${soal.id}"]:checked`);
        if (!selected) {
          adaKosong = true;
        } else {
          jawaban.push({ id: soal.id, pilihan: parseInt(selected.value, 10) });
        }
      });

      if (adaKosong) {
        if (!confirm('Masih ada soal yang belum dijawab. Yakin ingin mengirim sekarang?')) return;
      }

      try {
        const res = await apiFetch('/api/santri/kuis/kirim-jawaban', 'POST', {
          pertemuan: pNum,
          jawaban
        });

        if (res.status === 'sukses') {
          // Tampilkan Pembahasan dan Kunci Resmi dari Server
          res.evaluasi.forEach(item => {
            const expBox = document.getElementById(`exp-${item.id}`);
            if (expBox) {
              expBox.className = `quiz-explanation-box ${item.benar ? 'exp-correct' : 'exp-wrong'}`;
              expBox.innerHTML = `
                <strong>${item.benar ? '✓ Jawaban Anda Benar!' : '✕ Jawaban Kurang Tepat'}</strong><br>
                <span>Jawaban yang benar: <strong>${item.pilihan[item.kunci_benar]}</strong></span><br>
                <span style="font-size: 12px; margin-top: 4px; display: block;">${item.penjelasan}</span>
              `;
              expBox.style.display = 'block';
            }
          });

          perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
          alert(`Kuis Selesai!\nSkor Anda: ${res.skor}/100 (Skor Terbaik: ${res.skor_terbaik})\nXP Diperoleh: +${res.xp_didapat} XP`);
        }
      } catch (err) {
        alert(err.message);
      }
    }

// 12. SERTIFIKAT KELULUSAN
// ------------------------------------------------------------------------
function tampilkanSertifikat() {
  sembunyikanSemuaView();
  const certView = document.getElementById('view-sertifikat');
  if (certView) certView.style.display = 'block';

  if (STATE.santri) {
    const certNama = document.getElementById('cert-nama');
    const certKelas = document.getElementById('cert-kelas');
    const certXp = document.getElementById('cert-xp');
    const certDate = document.getElementById('cert-date');

    if (certNama) certNama.textContent = STATE.santri.nama;
    if (certKelas) certKelas.textContent = `Santriwati ${typeof formatNamaKelas === 'function' ? formatNamaKelas(STATE.santri.kelas) : 'Kelas ' + STATE.santri.kelas}`;
    if (certXp) certXp.textContent = `Total Capaian: ${STATE.santri.total_xp} XP (Level ${STATE.santri.level} • ${STATE.santri.gelar || 'Santri Terpelajar'})`;

    const now = new Date();
    const tglStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    if (certDate) certDate.textContent = `Tanggal: ${tglStr}`;
  }
}

function navigasiKeSertifikat() {
  if (!STATE.santri) {
    bukaModalAuth();
    return;
  }
  tampilkanSertifikat();
  const navSertifikat = document.getElementById('nav-sertifikat');
  if (navSertifikat) navSertifikat.classList.add('active');
}

function navigasiKembaliDariSertifikat() {
  if (STATE.pertemuanAktif) {
    bukaPertemuan(STATE.pertemuanAktif);
  } else {
    bukaDashboard();
  }
}
