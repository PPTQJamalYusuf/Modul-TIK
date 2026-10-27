'use strict';

// 8. PERTEMUAN 3: POHON FOLDER TOGGLE
    // ------------------------------------------------------------------------
    function toggleTreeNode(nodeId) {
      const el = document.getElementById(nodeId);
      if (el) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
      }
    }

// 9. PERTEMUAN 4: SIMULASI FILE EXPLORER VIRTUAL & CHECKLIST
    // ------------------------------------------------------------------------
    const INITIAL_VIRTUAL_FS = [
      { id: '1', nama: 'Tugas_TIK', tipe: 'folder' },
      { id: '2', nama: 'Catatan_Modul.txt', tipe: 'file' },
      { id: '3', nama: 'Makalah_Santri.docx', tipe: 'file' }
    ];

    let virtualFs = JSON.parse(JSON.stringify(INITIAL_VIRTUAL_FS));
    let recycleBinFs = [];
    let selectedFsId = null;
    let clipboardFs = null; // { item, action: 'copy'|'cut' }

    function inisialisasiPertemuan4() {
      renderVirtualFs();
      muatChecklistPraktik();
    }

    function renderVirtualFs() {
      const grid = document.getElementById('sim-explorer-grid');
      grid.innerHTML = '';

      if (virtualFs.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 20px;">Folder Dokumen Kosong</div>';
        return;
      }

      virtualFs.forEach(item => {
        const el = document.createElement('div');
        el.className = `explorer-item ${selectedFsId === item.id ? 'selected' : ''}`;
        el.onclick = () => {
          selectedFsId = item.id;
          renderVirtualFs();
        };

        const icon = item.tipe === 'folder' ? '📁' : '📄';
        el.innerHTML = `
          <div class="item-icon">${icon}</div>
          <div class="item-name">${item.nama}</div>
        `;
        grid.appendChild(el);
      });
    }

    function simulasiExplorerBuatFolder() {
      const nama = prompt('Masukkan nama folder baru:', 'Folder_Baru');
      if (!nama) return;
      virtualFs.push({ id: String(Date.now()), nama, tipe: 'folder' });
      renderVirtualFs();
    }

    function simulasiExplorerBuatFile() {
      const nama = prompt('Masukkan nama file baru (.txt):', 'Dokumen_Baru.txt');
      if (!nama) return;
      virtualFs.push({ id: String(Date.now()), nama, tipe: 'file' });
      renderVirtualFs();
    }

    function simulasiExplorerSalin() {
      if (!selectedFsId) return alert('Pilih file atau folder yang ingin disalin.');
      const item = virtualFs.find(i => i.id === selectedFsId);
      clipboardFs = { item: JSON.parse(JSON.stringify(item)), action: 'copy' };
      alert(`"${item.nama}" telah disalin ke clipboard virtual. Tekan Paste untuk menempel.`);
    }

    function simulasiExplorerPotong() {
      if (!selectedFsId) return alert('Pilih file atau folder yang ingin dipotong.');
      const item = virtualFs.find(i => i.id === selectedFsId);
      clipboardFs = { item: JSON.parse(JSON.stringify(item)), action: 'cut' };
      alert(`"${item.nama}" telah dipotong. Tekan Paste di lokasi tujuan.`);
    }

    function simulasiExplorerTempel() {
      if (!clipboardFs) return alert('Tidak ada file di clipboard virtual.');
      if (clipboardFs.action === 'copy') {
        const itemBaru = { ...clipboardFs.item, id: String(Date.now()), nama: `Salinan_${clipboardFs.item.nama}` };
        virtualFs.push(itemBaru);
      } else if (clipboardFs.action === 'cut') {
        virtualFs = virtualFs.filter(i => i.id !== clipboardFs.item.id);
        virtualFs.push(clipboardFs.item);
        clipboardFs = null;
      }
      renderVirtualFs();
    }

    function simulasiExplorerUbahNama() {
      if (!selectedFsId) return alert('Pilih item yang ingin diubah namanya (Rename).');
      const item = virtualFs.find(i => i.id === selectedFsId);
      const namaBaru = prompt('Masukkan nama baru:', item.nama);
      if (namaBaru && namaBaru.trim()) {
        item.nama = namaBaru.trim();
        renderVirtualFs();
      }
    }

    function simulasiExplorerHapus() {
      if (!selectedFsId) return alert('Pilih item yang ingin dihapus.');
      const idx = virtualFs.findIndex(i => i.id === selectedFsId);
      if (idx !== -1) {
        const [dihapus] = virtualFs.splice(idx, 1);
        recycleBinFs.push(dihapus);
        selectedFsId = null;
        renderVirtualFs();
        alert(`"${dihapus.nama}" telah dipindahkan ke Recycle Bin virtual.`);
      }
    }

    function simulasiBukaRecycleBin() {
      if (recycleBinFs.length === 0) {
        alert('Recycle Bin virtual kosong.');
        return;
      }
      const namaList = recycleBinFs.map((item, idx) => `${idx + 1}. ${item.nama}`).join('\n');
      const pilihan = prompt(`Isi Recycle Bin Virtual:\n${namaList}\n\nKetik nomor file yang ingin dipulihkan (Restore):`);
      const num = parseInt(pilihan, 10);
      if (num >= 1 && num <= recycleBinFs.length) {
        const [pulih] = recycleBinFs.splice(num - 1, 1);
        virtualFs.push(pulih);
        renderVirtualFs();
        alert(`"${pulih.nama}" berhasil dipulihkan (Restore) ke folder Dokumen!`);
      }
    }

    // Checklist Praktik Laptop Asli
    const CHECKLIST_ITEMS = [
      { id: 'tugas_1', label: '1. Membuka File Explorer menggunakan tombol Windows + E' },
      { id: 'tugas_2', label: '2. Membuka folder Dokumen (Documents)' },
      { id: 'tugas_3', label: '3. Membuat folder baru bernama Nama_Kelas (contoh: Aisyah_Kelas1)' },
      { id: 'tugas_4', label: '4. Membuat file teks baru catatan_lab.txt di dalam folder tersebut' },
      { id: 'tugas_5', label: '5. Menyalin (Copy & Paste) file catatan_lab.txt' },
      { id: 'tugas_6', label: '6. Mengganti nama (Rename) file hasil salinan menggunakan tombol F2' },
      { id: 'tugas_7', label: '7. Menghapus file tersebut ke Recycle Bin' },
      { id: 'tugas_8', label: '8. Membuka Recycle Bin dan memulihkan (Restore) file tersebut' }
    ];

    async function muatChecklistPraktik() {
      const container = document.getElementById('checklist-container');
      container.innerHTML = '';

      let statusMap = new Map();
      if (STATE.santri) {
        try {
          const res = await apiFetch('/api/santri/progres');
          if (res && res.checklist) {
            statusMap = new Map(res.checklist.map(c => [c.tugas_id, c.status]));
          }
        } catch {}
      }

      CHECKLIST_ITEMS.forEach(item => {
        const row = document.createElement('div');
        row.className = 'checklist-row';
        const st = statusMap.get(item.id) || 'belum';

        row.innerHTML = `
          <label style="font-size: 13px; display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="chk-${item.id}" ${st !== 'belum' ? 'checked' : ''} onchange="handleChecklistChange('${item.id}', this.checked)">
            <span>${item.label}</span>
          </label>
          <span style="font-size: 11px; font-weight: 700; color: ${st === 'diverifikasi_guru' ? 'var(--primary)' : 'var(--text-muted)'};">
            ${st === 'diverifikasi_guru' ? '✓ Terverifikasi Guru' : (st === 'mandiri' ? 'Mandiri' : 'Belum')}
          </span>
        `;
        container.appendChild(row);
      });
    }

    async function handleChecklistChange(tugasId, checked) {
      if (!STATE.santri) return;
      const status = checked ? 'mandiri' : 'belum';
      try {
        await apiFetch('/api/santri/checklist', 'POST', {
          modul: 1,
          pertemuan: 4,
          tugas_id: tugasId,
          status
        });
        muatChecklistPraktik();
      } catch (err) {
        console.error(err.message);
      }
    }
