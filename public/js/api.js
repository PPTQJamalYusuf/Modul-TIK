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

// 11. PAPAN JUARA (LEADERBOARD) POLING 5 DETIK & DIAGRAM BATANG (BAR CHART)
    // ------------------------------------------------------------------------
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

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

    function gantiTampilanLeaderboard(mode) {
      STATE.leaderboardView = mode;
      const chartEl = document.getElementById('leaderboard-chart-container');
      const tableEl = document.getElementById('leaderboard-table-container');
      const btnChart = document.getElementById('btn-lb-view-chart');
      const btnTable = document.getElementById('btn-lb-view-table');

      if (mode === 'chart') {
        if (chartEl) chartEl.style.display = 'flex';
        if (tableEl) tableEl.style.display = 'none';
        if (btnChart) {
          btnChart.className = 'btn btn-sm btn-primary';
          btnChart.style.background = '';
          btnChart.style.border = '';
        }
        if (btnTable) {
          btnTable.className = 'btn btn-sm btn-outline';
          btnTable.style.background = 'transparent';
          btnTable.style.border = 'none';
        }
      } else {
        if (chartEl) chartEl.style.display = 'none';
        if (tableEl) tableEl.style.display = 'block';
        if (btnTable) {
          btnTable.className = 'btn btn-sm btn-primary';
          btnTable.style.background = '';
          btnTable.style.border = '';
        }
        if (btnChart) {
          btnChart.className = 'btn btn-sm btn-outline';
          btnChart.style.background = 'transparent';
          btnChart.style.border = 'none';
        }
      }
    }

    async function segarkanDataLeaderboard() {
      if (!STATE.santri) return;
      try {
        const res = await apiFetch('/api/leaderboard');
        if (res.status === 'sukses') {
          const list = STATE.leaderboardTab === 'kelas' ? res.kelas_saya : res.semua_kelas;
          const myId = res.santri_aktif_id || (STATE.santri ? STATE.santri.id : null);
          renderLeaderboardChart(list, myId);
          renderLeaderboardTable(list, myId);
        }
      } catch {}
    }

    function renderLeaderboardChart(list, myId) {
      const container = document.getElementById('leaderboard-chart-container');
      if (!container) return;
      container.innerHTML = '';

      if (!list || list.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <div style="font-size: 40px; margin-bottom: 8px;">🌟</div>
            <p style="font-weight: 700; font-size: 15px; color: var(--dark);">Belum ada data skor santri</p>
            <p style="font-size: 13px;">Selesaikan modul atau latihan mengetik untuk mengumpulkan skor XP pertama!</p>
          </div>
        `;
        return;
      }

      // Hitung skor maksimum untuk skala bar (minimal 100 XP agar bar awal proporsional)
      const maxXP = Math.max(...list.map(s => s.total_xp || 0), 100);

      list.forEach((item, idx) => {
        const xp = item.total_xp || 0;
        // Skala persentase dengan ambang minimal 6% jika memiliki XP
        const pct = Math.max(Math.round((xp / maxXP) * 100), xp > 0 ? 6 : 0);
        const isMe = myId && item.id === myId;

        let rankBadgeClass = '';
        let barClass = '';
        let medali = `${idx + 1}`;

        if (idx === 0) {
          medali = '🥇';
          rankBadgeClass = 'lb-rank-gold';
          barClass = 'lb-bar-gold';
        } else if (idx === 1) {
          medali = '🥈';
          rankBadgeClass = 'lb-rank-silver';
          barClass = 'lb-bar-silver';
        } else if (idx === 2) {
          medali = '🥉';
          rankBadgeClass = 'lb-rank-bronze';
          barClass = 'lb-bar-bronze';
        }

        const initial = (item.nama || '?').trim().charAt(0).toUpperCase();

        const div = document.createElement('div');
        div.className = `lb-chart-item ${isMe ? 'is-me' : ''}`;
        div.innerHTML = `
          <div class="lb-item-header">
            <div class="lb-user-meta">
              <div class="lb-rank-badge ${rankBadgeClass}">${medali}</div>
              <div class="lb-avatar">${escapeHtml(initial)}</div>
              <div class="lb-name-group">
                <span class="lb-name">
                  ${escapeHtml(item.nama)}
                  ${isMe ? '<span class="lb-me-tag">👑 Anda</span>' : ''}
                </span>
                <span class="lb-sub">Kelas ${escapeHtml(item.kelas || '-')} • Lv.${item.level || 1} (${escapeHtml(item.gelar || 'Santri Pemula')})</span>
              </div>
            </div>
            <div class="lb-xp-tag">
              <strong>${xp}</strong> <small>XP</small>
            </div>
          </div>
          <div class="lb-bar-track">
            <div class="lb-bar-fill ${barClass}" style="width: ${pct}%;"></div>
          </div>
        `;
        container.appendChild(div);
      });
    }

    function renderLeaderboardTable(list, myId) {
      const tbody = document.getElementById('leaderboard-tbody');
      if (!tbody) return;
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
          <td>${escapeHtml(item.nama)} ${item.id === myId ? '(Anda)' : ''}</td>
          <td>Kelas ${escapeHtml(item.kelas || '-')}</td>
          <td>Lv.${item.level || 1} - ${escapeHtml(item.gelar || 'Pemula')}</td>
          <td><strong>${item.total_xp || 0} XP</strong></td>
        `;
        tbody.appendChild(tr);
      });
    }
