'use strict';

// 13. PANEL GURU: LOGIN, MATRIKS KUNCI, IMPOR CSV & RESET
    // ------------------------------------------------------------------------
function navigasiKeGuru() {
  sembunyikanSemuaView();
  const vg = document.getElementById('view-guru');
  if (vg) vg.style.display = 'block';

  const navGuru = document.getElementById('nav-guru');
  if (navGuru) navGuru.classList.add('active');

  if (STATE.guruToken) {
    tampilkanDashboardGuru();
  } else {
    const glb = document.getElementById('guru-login-box');
    const gdc = document.getElementById('guru-dashboard-content');
    if (glb) glb.style.display = 'block';
    if (gdc) gdc.style.display = 'none';
  }
}

function navigasiKeSantri() {
  sembunyikanSemuaView();
  if (STATE.santri) {
    bukaPertemuan(STATE.pertemuanAktif || 1);
  } else {
    bukaDashboard();
  }
}

async function handleGuruLoginSubmit(e) {
  e.preventDefault();
  const pinInput = document.getElementById('guru-pin-input');
  if (!pinInput) return;
  const pin = pinInput.value;
  if (!pin) return;

  try {
    const res = await apiFetch('/api/guru/login', 'POST', { pin });
    if (res.status === 'sukses') {
      STATE.guruToken = res.token;
      tampilkanDashboardGuru();
    }
  } catch (err) {
    alert(err.message);
  }
}

async function tampilkanDashboardGuru() {
  const glb = document.getElementById('guru-login-box');
  const gdc = document.getElementById('guru-dashboard-content');
  if (glb) glb.style.display = 'none';
  if (gdc) gdc.style.display = 'block';

  await segarkanStatusServerGuru();
      await segarkanMatriksKunciGuru();
      await muatDataSantriGuru();
    }

    async function segarkanStatusServerGuru() {
      try {
        const res = await apiFetch('/api/guru/status');
        if (res.status === 'sukses') {
          document.getElementById('stat-total-santri').textContent = res.total_santri;
          document.getElementById('stat-santri-aktif').textContent = res.santri_aktif;
          document.getElementById('stat-sesi-aktif').textContent = res.sesi_aktif;
          document.getElementById('stat-db-size').textContent = `${res.ukuran_db_kb} KB`;
        }
      } catch (e) {
        console.error(e.message);
      }
    }

    async function segarkanMatriksKunciGuru() {
      try {
        const res = await apiFetch('/api/guru/pertemuan-status');
        if (res.status === 'sukses') {
          renderMatriksKunciGuru(res.pertemuan);
        }
      } catch (e) {
        console.error(e.message);
      }
    }

    function renderMatriksKunciGuru(list) {
      const container = document.getElementById('guru-locks-container');
      container.innerHTML = '';

      // Kelompokkan per kelas yang tersedia dalam sistem
      const kelasSet = new Set(list.map(item => item.kelas));
      if (kelasSet.size === 0) kelasSet.add(7);
      const daftarKelas = Array.from(kelasSet).sort((a, b) => a - b);

      for (const k of daftarKelas) {
        const card = document.createElement('div');
        card.className = 'lock-class-card';
        const labelKelas = k >= 7 ? `Kelas ${k} (SMP)` : `Kelas ${k}`;
        card.innerHTML = `<strong style="display: block; margin-bottom: 8px;">${labelKelas}</strong>`;

        const rows = list.filter(item => item.kelas === k);
        rows.forEach(r => {
          const btn = document.createElement('button');
          btn.className = `btn btn-sm ${r.terbuka ? 'btn-primary' : 'btn-outline'}`;
          btn.style.width = '100%';
          btn.style.marginBottom = '4px';
          btn.style.fontSize = '11px';
          btn.textContent = `P${r.pertemuan}: ${r.terbuka ? '🔓 Terbuka' : '🔒 Dikunci'}`;
          btn.onclick = () => toggleKunciPertemuanGuru(k, r.pertemuan, !r.terbuka);
          card.appendChild(btn);
        });
        container.appendChild(card);
      }
    }

    async function toggleKunciPertemuanGuru(kelas, pertemuan, terbuka) {
      try {
        await apiFetch('/api/guru/pertemuan-toggle', 'POST', { kelas, pertemuan, terbuka });
        segarkanMatriksKunciGuru();
        if (STATE.santri && STATE.santri.kelas === kelas) {
          segarkanProfilSantri();
        }
      } catch (err) {
        alert(err.message);
      }
    }

    async function muatDataSantriGuru() {
      const kelas = document.getElementById('guru-filter-kelas').value;
      const cari = document.getElementById('guru-search-nama').value;
      const tbody = document.getElementById('guru-santri-tbody');

      let url = '/api/guru/santri?';
      if (kelas) url += `kelas=${kelas}&`;
      if (cari) url += `cari=${encodeURIComponent(cari)}&`;

      try {
        const res = await apiFetch(url);
        if (res.status === 'sukses') {
          renderTabelSantriGuru(res.santri);
        }
      } catch (e) {
        console.error(e.message);
      }
    }

    function renderTabelSantriGuru(list) {
      const tbody = document.getElementById('guru-santri-tbody');
      tbody.innerHTML = '';

      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Tidak ada data santri</td></tr>';
        return;
      }

      list.forEach(s => {
        const tr = document.createElement('tr');
        const kodeAktivasi = s.kode_aktivasi ? `<strong style="color: var(--secondary);">${s.kode_aktivasi}</strong>` : '<span style="color: #16a34a;">PIN Aktif</span>';

        tr.innerHTML = `
          <td><code>${s.id}</code></td>
          <td>${formatNamaKelas(s.kelas)}</td>
          <td><strong>${s.nama}</strong></td>
          <td>${kodeAktivasi}</td>
          <td>${s.total_xp || 0} XP (Lv.${s.level || 1})</td>
          <td>${s.skor_evaluasi !== null && s.skor_evaluasi !== undefined ? `${s.skor_evaluasi}/100` : '-'}</td>
          <td>${s.checklist_selesai || 0}/8 Tugas</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="resetPinSantriGuru('${s.id}')">Reset PIN</button>
            <button class="btn btn-danger btn-sm" onclick="resetProgresSantriGuru('${s.id}')">Reset Progres</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    async function resetPinSantriGuru(santriId) {
      if (!confirm(`Yakin ingin me-reset PIN santri ${santriId}? Santri akan membutuhkan kode aktivasi baru untuk membuat PIN.`)) return;
      try {
        const res = await apiFetch('/api/guru/reset-pin', 'POST', { santri_id: santriId });
        if (res.status === 'sukses') {
          alert(`PIN berhasil di-reset!\nKode Aktivasi Baru: ${res.kode_aktivasi_baru}\nBerikan kode ini kepada santri.`);
          muatDataSantriGuru();
        }
      } catch (err) {
        alert(err.message);
      }
    }

    async function resetProgresSantriGuru(santriId) {
      if (!confirm(`PERINGATAN: Tindakan ini akan menghapus seluruh catatan progres, XP, dan nilai kuis untuk santri ${santriId}. Lanjutkan?`)) return;
      try {
        const res = await apiFetch('/api/guru/reset-progres', 'POST', { santri_id: santriId, konfirmasi: true });
        if (res.status === 'sukses') {
          alert('Seluruh progres santri berhasil direset.');
          muatDataSantriGuru();
        }
      } catch (err) {
        alert(err.message);
      }
    }

    // Modal Impor CSV
    function bukaModalImporCsv() {
      document.getElementById('modal-impor-csv').style.display = 'flex';
      document.getElementById('impor-result-box').style.display = 'none';
    }

    function tutupModalImporCsv() {
      document.getElementById('modal-impor-csv').style.display = 'none';
    }

    function handleFileCsvSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('csv-paste-area').value = ev.target.result;
      };
      reader.readAsText(file);
    }

    async function eksekusiImporCsv() {
      const text = document.getElementById('csv-paste-area').value;
      const resultBox = document.getElementById('impor-result-box');
      if (!text.trim()) return alert('Masukkan teks CSV terlebih dahulu.');

      try {
        const res = await fetch('/api/guru/impor-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: text
        });
        const data = await res.json();
        if (data.status === 'sukses') {
          resultBox.className = 'callout-box callout-adab';
          resultBox.innerHTML = `<strong>Impor Berhasil!</strong><br>Berhasil ditambahkan: ${data.berhasil} santri.<br>Gagal/diabaikan: ${data.gagal}`;
          resultBox.style.display = 'block';
          muatDataSantriGuru();
          segarkanStatusServerGuru();
        } else {
          throw new Error(data.pesan);
        }
      } catch (err) {
        resultBox.className = 'callout-box callout-adab';
        resultBox.style.background = 'var(--danger-light)';
        resultBox.style.color = 'var(--danger)';
        resultBox.textContent = `Kesalahan: ${err.message}`;
        resultBox.style.display = 'block';
      }
    }

    function bukaLeaderboardProyektor() {
      bukaModalLeaderboard();
      gantiTabLeaderboard('semua');
    }
