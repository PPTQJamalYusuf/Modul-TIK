'use strict';

// 2. KONTROL JARINGAN & OFFLINE QUEUE (localStorage)
    // ------------------------------------------------------------------------
    function updateNetworkStatus(online) {
      STATE.isOnline = online;
      const badge = document.getElementById('net-status-badge');
      const text = document.getElementById('net-status-text');
      if (online) {
        badge.className = 'net-badge net-online';
        text.textContent = STATE.offlineQueue.length > 0 
          ? `Online (Menyinkronkan ${STATE.offlineQueue.length} data...)` 
          : 'Tersambung ke Server';
        if (STATE.offlineQueue.length > 0) {
          sinkronkanAntreanOffline();
        }
      } else {
        badge.className = 'net-badge net-offline';
        text.textContent = `Offline (${STATE.offlineQueue.length} tertunda)`;
      }
    }

    window.addEventListener('online', () => updateNetworkStatus(true));
    window.addEventListener('offline', () => updateNetworkStatus(false));

    function simpanAntreanOfflineKeStorage() {
      try {
        localStorage.setItem('antrean_offline_tik', JSON.stringify(STATE.offlineQueue));
      } catch {}
    }

    function muatAntreanOfflineDariStorage() {
      try {
        const raw = localStorage.getItem('antrean_offline_tik');
        if (raw) STATE.offlineQueue = JSON.parse(raw);
      } catch {}
    }

    async function sinkronkanAntreanOffline() {
      if (!STATE.santri || STATE.offlineQueue.length === 0) return;
      try {
        const res = await apiFetch('/api/santri/sinkronisasi-offline', 'POST', {
          antrean: STATE.offlineQueue
        });
        if (res && res.status === 'sukses') {
          STATE.offlineQueue = [];
          simpanAntreanOfflineKeStorage();
          updateNetworkStatus(true);
          perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi antrean offline:', err.message);
      }
    }

// 3. API FETCH WRAPPER
    // ------------------------------------------------------------------------
    async function apiFetch(endpoint, method = 'GET', body = null) {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (body) {
        opts.body = JSON.stringify(body);
      }

      try {
        const response = await fetch(endpoint, opts);
        const data = await response.json();
        updateNetworkStatus(true);

        if (!response.ok) {
          throw new Error(data.pesan || `HTTP Error ${response.status}`);
        }
        return data;
      } catch (err) {
        if (!navigator.onLine || err.name === 'TypeError') {
          updateNetworkStatus(false);
        }
        throw err;
      }
    }

// 11. PAPAN JUARA (LEADERBOARD) POLING 5 DETIK
    // ------------------------------------------------------------------------
    function bukaModalLeaderboard() {
      document.getElementById('modal-leaderboard').style.display = 'flex';
      segarkanDataLeaderboard();
    }

    function tutupModalLeaderboard() {
      document.getElementById('modal-leaderboard').style.display = 'none';
    }

    function gantiTabLeaderboard(tab) {
      STATE.leaderboardTab = tab;
      document.getElementById('tab-lb-kelas').className = tab === 'kelas' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
      document.getElementById('tab-lb-semua').className = tab === 'semua' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
      segarkanDataLeaderboard();
    }

    async function segarkanDataLeaderboard() {
      if (!STATE.santri) return;
      try {
        const res = await apiFetch('/api/leaderboard');
        if (res.status === 'sukses') {
          const list = STATE.leaderboardTab === 'kelas' ? res.kelas_saya : res.semua_kelas;
          renderLeaderboardTable(list, res.santri_aktif_id);
        }
      } catch {}
    }

    function renderLeaderboardTable(list, myId) {
      const tbody = document.getElementById('leaderboard-tbody');
      tbody.innerHTML = '';

      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Belum ada data skor</td></tr>';
        return;
      }

      list.forEach((item, idx) => {
        const tr = document.createElement('tr');
        if (item.id === myId) {
          tr.style.background = '#dcfce7';
          tr.style.fontWeight = 'bold';
        }

        let medali = `${idx + 1}`;
        if (idx === 0) medali = '🥇 1';
        if (idx === 1) medali = '🥈 2';
        if (idx === 2) medali = '🥉 3';

        tr.innerHTML = `
          <td>${medali}</td>
          <td>${item.nama} ${item.id === myId ? '(Anda)' : ''}</td>
          <td>Kelas ${item.kelas}</td>
          <td>Lv.${item.level} - ${item.gelar || 'Pemula'}</td>
          <td><strong>${item.total_xp} XP</strong></td>
        `;
        tbody.appendChild(tr);
      });
    }
