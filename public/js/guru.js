'use strict';

// 13. PANEL GURU: LOGIN, MATRIKS KUNCI, IMPOR CSV & RESET
    // ------------------------------------------------------------------------
function navigasiKeGuru() {
  sembunyikanSemuaView();
  const vg = document.getElementById('view-guru');
  if (vg) {
    vg.style.display = 'block';
    if (typeof gulirKeAtas === 'function') {
      gulirKeAtas(vg);
      setTimeout(() => gulirKeAtas(vg), 10);
    }
  }

  // Sembunyikan sidebar siswa saat berada di portal guru
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.style.display = 'none';

  const intro = document.getElementById('guru-intro-screen');
  const panel = document.getElementById('guru-panel-main');

  if (STATE.guruToken) {
    if (intro) intro.style.display = 'none';
    if (panel) panel.style.display = 'block';
    tampilkanDashboardGuru();
  } else {
    // TAMPILKAN HANYA LAYAR INTRO LOGIN GURU (TANPA KONTEN DASHBOARD)
    if (intro) intro.style.display = 'grid';
    if (panel) panel.style.display = 'none';
    const pinInput = document.getElementById('guru-pin-input');
    if (pinInput) pinInput.value = '';
    const alertBox = document.getElementById('guru-login-alert');
    if (alertBox) alertBox.style.display = 'none';
  }
}

function navigasiKeSantri() {
  window.location.hash = '';
  if (window.history && window.history.pushState) {
    window.history.pushState(null, '', '/');
  }
  sembunyikanSemuaView();
  if (STATE.santri) {
    bukaPertemuan(STATE.pertemuanAktif || 1);
  } else {
    perbaruiTampilanGuest();
    bukaDashboard();
  }
}

function lakukanLogoutGuru() {
  STATE.guruToken = null;
  navigasiKeGuru();
}

async function handleGuruLoginSubmit(e) {
  e.preventDefault();
  const pinInput = document.getElementById('guru-pin-input');
  const alertBox = document.getElementById('guru-login-alert');
  if (alertBox) alertBox.style.display = 'none';

  if (!pinInput) return;
  const pin = pinInput.value.trim();
  if (!pin) return;

  try {
    const res = await apiFetch('/api/guru/login', 'POST', { pin });
    if (res.status === 'sukses') {
      STATE.guruToken = res.token;
      pinInput.value = '';
      tampilkanDashboardGuru();
    }
  } catch (err) {
    if (alertBox) {
      alertBox.textContent = err.message || 'PIN Guru tidak valid.';
      alertBox.style.display = 'block';
    } else {
      alert(err.message);
    }
  }
}

async function tampilkanDashboardGuru() {
  const intro = document.getElementById('guru-intro-screen');
  const panel = document.getElementById('guru-panel-main');
  if (intro) intro.style.display = 'none';
  if (panel) panel.style.display = 'block';

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
      if (!container) return;
      container.innerHTML = '';

      // Filter hanya kelas 7-12 (SMP dan SMA)
      const kelasValid = (list || []).filter(item => item.kelas >= 7 && item.kelas <= 12);
      const kelasSet = new Set(kelasValid.map(item => item.kelas));
      if (kelasSet.size === 0) [7, 8, 9, 10, 11, 12].forEach(k => kelasSet.add(k));
      const daftarKelas = Array.from(kelasSet).sort((a, b) => a - b);

      for (const k of daftarKelas) {
        const card = document.createElement('div');
        card.className = 'lock-class-card';
        const labelKelas = k <= 9 ? `Kelas ${k} SMP` : `Kelas ${k} SMA`;
        card.innerHTML = `<strong style="display: block; margin-bottom: 8px; color: var(--dark); font-weight: 700;">${labelKelas}</strong>`;

        const rows = kelasValid.filter(item => item.kelas === k);
        for (let p = 1; p <= 4; p++) {
          const r = rows.find(item => item.pertemuan === p) || { pertemuan: p, terbuka: p === 1 ? 1 : 0 };
          const btn = document.createElement('button');
          btn.className = `btn btn-sm ${r.terbuka ? 'btn-primary' : 'btn-outline'}`;
          btn.style.width = '100%';
          btn.style.marginBottom = '4px';
          btn.style.fontSize = '11px';
          btn.textContent = `P${r.pertemuan}: ${r.terbuka ? '🔓 Terbuka' : '🔒 Dikunci'}`;
          btn.onclick = () => toggleKunciPertemuanGuru(k, r.pertemuan, !r.terbuka);
          card.appendChild(btn);
        }
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

    let currentSantriList = [];

    function renderTabelSantriGuru(list) {
      currentSantriList = list || [];
      const tbody = document.getElementById('guru-santri-tbody');
      tbody.innerHTML = '';

      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Tidak ada data santri</td></tr>';
        return;
      }

      list.forEach(s => {
        const tr = document.createElement('tr');
        const statusPin = s.pin_aktif ? '<span style="color: #16a34a; font-weight: bold;">🟢 Aktif</span>' : '<span style="color: var(--secondary); font-weight: bold;">🟡 Belum Buat PIN</span>';

        tr.innerHTML = `
          <td><code>${s.id}</code></td>
          <td>${formatNamaKelas(s.kelas)}</td>
          <td><strong>${s.nama}</strong></td>
          <td>${statusPin}</td>
          <td>${s.total_xp || 0} XP (Lv.${s.level || 1})</td>
          <td>
            ${s.nama_perangkat ? `
              <div onclick="tampilkanDetailBiodataSantri('${s.id}')" style="cursor: pointer; display: inline-block;" title="Klik untuk rincian lengkap">
                <span class="badge" style="background: #e0f2fe; color: #0369a1; font-size: 11.5px; padding: 3px 8px; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                  💻 ${s.nama_perangkat} 🔍
                </span>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px; max-width: 130px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${s.prosesor ? s.prosesor : '-'}
                </div>
              </div>
            ` : '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">Belum mengisi</span>'}
          </td>
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
      if (!confirm(`Yakin ingin me-reset PIN santri ${santriId}? Santri dapat langsung membuat Password/PIN baru sendiri saat login.`)) return;
      try {
        const res = await apiFetch('/api/guru/reset-pin', 'POST', { santri_id: santriId });
        if (res.status === 'sukses') {
          alert('Alhamdulillah! PIN berhasil di-reset. Santri dapat langsung membuat Password/PIN baru.');
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

function tampilkanDetailBiodataSantri(santriId) {
  const s = (typeof currentSantriList !== 'undefined' ? currentSantriList : []).find(item => item.id === santriId);
  if (!s) return;

  const modal = document.getElementById('modal-detail-biodata');
  const container = document.getElementById('modal-detail-biodata-content');
  if (!modal || !container) return;

  container.innerHTML = `
    <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px;">
      <div style="font-weight: 700; font-size: 14px; color: #166534;">${s.nama} (${s.id})</div>
      <div style="font-size: 12px; color: #15803d; margin-top: 2px;">Kelas: ${typeof formatNamaKelas === 'function' ? formatNamaKelas(s.kelas) : s.kelas} | Total XP: ${s.total_xp || 0} XP</div>
    </div>

    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
        <span style="color: #64748b; font-weight: 600;">1. Nama Perangkat:</span>
        <strong style="color: #1e40af; font-family: monospace; font-size: 13.5px;">${s.nama_perangkat || '(Belum diisi)'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
        <span style="color: #64748b; font-weight: 600;">2. Otak (Prosesor / CPU):</span>
        <strong style="color: #1e40af;">${s.prosesor || '(Belum diisi)'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
        <span style="color: #64748b; font-weight: 600;">3. Meja Kerja (RAM):</span>
        <strong style="color: #1e40af;">${s.ram || '(Belum diisi)'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
        <span style="color: #64748b; font-weight: 600;">4. Sistem Operasi (OS):</span>
        <strong style="color: #1e40af;">${s.sistem_operasi || '(Belum diisi)'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding-bottom: 2px;">
        <span style="color: #64748b; font-weight: 600;">5. Lemari Simpan (Drive C:):</span>
        <strong style="color: #1e40af;">${s.penyimpanan || '(Belum diisi)'}</strong>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

function tutupModalDetailBiodata() {
  const modal = document.getElementById('modal-detail-biodata');
  if (modal) modal.style.display = 'none';
}
