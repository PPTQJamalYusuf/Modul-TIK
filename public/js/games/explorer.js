'use strict';

// ============================================================================
// MODUL 1: SIMULATOR FILE EXPLORER VIRTUAL, PROYEK AKHIR "TUGAS TIK RAPI"
// & CHECKLIST PRAKTIK LAPTOP ASLI (100% DATA DUMMY AMAN)
// ============================================================================

// 1. DATA DUMMY AWAL PROYEK AKHIR TERPADU "TUGAS TIK RAPI"
const INITIAL_DUMMY_FILES = [
  { id: 'f_doc', nama: 'Laporan_Praktikum.docx', tipe: 'file', parentId: null, deskripsi: 'Dokumen naskah tugas praktikum' },
  { id: 'f_pdf', nama: 'Panduan_Lab.pdf', tipe: 'file', parentId: null, deskripsi: 'Bacaan materi panduan resmi lab' },
  { id: 'f_img', nama: 'Bagan_Komputer.png', tipe: 'file', parentId: null, deskripsi: 'Gambar bagan arsitektur komputer' },
  { id: 'f_txt', nama: 'Catatan_Tambahan.txt', tipe: 'file', parentId: null, deskripsi: 'Catatan teks faedah santri' },
  { id: 'f_tmp', nama: 'File_Sampah_Latihan.tmp', tipe: 'file', parentId: null, deskripsi: 'File dummy latihan yang ditandai boleh dihapus' }
];

let virtualFs = JSON.parse(JSON.stringify(INITIAL_DUMMY_FILES));
let recycleBinFs = [];
let currentFolderId = null; // null = Root (C:\Users\Santri\Documents)
let selectedFsId = null;
let clipboardFs = null; // { item, action: 'copy'|'cut' }

// Inisialisasi Tampilan Sesi 4
function inisialisasiPertemuan4() {
  renderVirtualFs();
  muatChecklistPraktik();
}

// Tree Node Toggle untuk Sesi 3 (Pohon Direktori)
function toggleTreeNode(nodeId) {
  const el = document.getElementById(nodeId);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

// Render Simulator File Explorer Virtual
function renderVirtualFs() {
  const grid = document.getElementById('sim-explorer-grid');
  const pathText = document.getElementById('sim-path-text');
  const btnUp = document.getElementById('btn-sim-up');
  
  if (!grid) return;
  grid.innerHTML = '';

  // Update Path Teks
  let currentPath = 'C:\\Users\\Santri\\Documents';
  if (currentFolderId) {
    const curFolder = virtualFs.find(item => item.id === currentFolderId);
    if (curFolder) {
      currentPath += `\\${curFolder.nama}`;
    }
    if (btnUp) btnUp.style.display = 'inline-block';
  } else {
    if (btnUp) btnUp.style.display = 'none';
  }
  if (pathText) pathText.textContent = currentPath;

  // Filter item yang berada di folder aktif saat ini
  const itemsInCurrentFolder = virtualFs.filter(item => item.parentId === currentFolderId);

  if (itemsInCurrentFolder.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 30px; font-size: 13px;">
        📁 Folder ini masih kosong. Klik tombol <strong>"Folder Baru"</strong> atau <strong>"Tempel (Paste)"</strong> untuk menaruh berkas di sini.
      </div>
    `;
    return;
  }

  itemsInCurrentFolder.forEach(item => {
    const el = document.createElement('div');
    el.className = `explorer-item ${selectedFsId === item.id ? 'selected' : ''}`;
    
    // Klik 1x untuk memilih item
    el.onclick = () => {
      selectedFsId = item.id;
      renderVirtualFs();
    };

    // Klik ganda untuk membuka folder
    if (item.tipe === 'folder') {
      el.ondblclick = () => {
        currentFolderId = item.id;
        selectedFsId = null;
        renderVirtualFs();
      };
    }

    let icon = '📄';
    if (item.tipe === 'folder') {
      icon = '📁';
    } else if (item.nama.endsWith('.docx')) {
      icon = '📝';
    } else if (item.nama.endsWith('.pdf')) {
      icon = '📕';
    } else if (item.nama.endsWith('.png') || item.nama.endsWith('.jpg')) {
      icon = '🖼️';
    } else if (item.nama.endsWith('.tmp')) {
      icon = '🗑️';
    }

    el.innerHTML = `
      <div class="item-icon" style="font-size: 28px;">${icon}</div>
      <div class="item-name" style="font-size: 12px; margin-top: 4px; word-break: break-all;">${item.nama}</div>
    `;
    grid.appendChild(el);
  });
}

// Navigasi Kembali ke Folder Atas
function simulasiKembaliKeFolderAtas() {
  if (!currentFolderId) return;
  const cur = virtualFs.find(i => i.id === currentFolderId);
  currentFolderId = cur ? cur.parentId : null;
  selectedFsId = null;
  renderVirtualFs();
}

// Buat Folder Baru
function simulasiExplorerBuatFolder() {
  const nama = prompt('Masukkan nama folder baru (contoh: Kelas_Aisyah_Modul1 atau Dokumen):', 'Folder_Baru');
  if (!nama || !nama.trim()) return;

  const namaBersih = nama.trim();
  // Validasi karakter terlarang Windows: \ / : * ? " < > |
  const karakterTerlarang = /[\\/:*?"<>|]/;
  if (karakterTerlarang.test(namaBersih)) {
    alert('Nama folder tidak boleh memuat karakter khusus sistem: \\ / : * ? " < > |');
    return;
  }

  // Cek duplikasi di folder yang sama
  const kembar = virtualFs.some(i => i.parentId === currentFolderId && i.nama.toLowerCase() === namaBersih.toLowerCase());
  if (kembar) {
    alert(`Folder dengan nama "${namaBersih}" sudah ada di lokasi ini.`);
    return;
  }

  virtualFs.push({
    id: 'f_' + Date.now(),
    nama: namaBersih,
    tipe: 'folder',
    parentId: currentFolderId
  });
  renderVirtualFs();
}

// Buat File Baru
function simulasiExplorerBuatFile() {
  const nama = prompt('Masukkan nama file baru beserta ekstensinya (contoh: Catatan_Ringkas.txt):', 'Dokumen_Baru.txt');
  if (!nama || !nama.trim()) return;

  const namaBersih = nama.trim();
  const karakterTerlarang = /[\\/:*?"<>|]/;
  if (karakterTerlarang.test(namaBersih)) {
    alert('Nama file tidak boleh memuat karakter khusus sistem: \\ / : * ? " < > |');
    return;
  }

  virtualFs.push({
    id: 'f_' + Date.now(),
    nama: namaBersih,
    tipe: 'file',
    parentId: currentFolderId
  });
  renderVirtualFs();
}

// Salin Berkas (Copy)
function simulasiExplorerSalin() {
  if (!selectedFsId) return alert('Pilih satu file atau folder terlebih dahulu untuk disalin (Copy).');
  const item = virtualFs.find(i => i.id === selectedFsId);
  if (!item) return;
  clipboardFs = { item: JSON.parse(JSON.stringify(item)), action: 'copy' };
  alert(`"${item.nama}" telah disalin ke Clipboard virtual (Ctrl+C).\nBuka folder tujuan lalu tekan "Paste (Ctrl+V)". File asli tetap ada di tempat ini.`);
}

// Potong Berkas (Cut / Pindahkan)
function simulasiExplorerPotong() {
  if (!selectedFsId) return alert('Pilih satu file atau folder terlebih dahulu untuk dipotong/dipindahkan (Cut).');
  const item = virtualFs.find(i => i.id === selectedFsId);
  if (!item) return;
  clipboardFs = { item: JSON.parse(JSON.stringify(item)), action: 'cut' };
  alert(`"${item.nama}" telah dipotong ke Clipboard virtual (Ctrl+X).\nBuka folder tujuan lalu tekan "Paste (Ctrl+V)" untuk memindahkannya.`);
}

// Tempelkan Berkas (Paste)
function simulasiExplorerTempel() {
  if (!clipboardFs) return alert('Clipboard virtual kosong. Gunakan tombol Copy (Ctrl+C) atau Cut (Ctrl+X) terlebih dahulu.');

  const itemSumber = clipboardFs.item;
  
  // Periksa apakah nama file sudah ada di folder tujuan saat ini
  const kembar = virtualFs.find(i => i.parentId === currentFolderId && i.nama.toLowerCase() === itemSumber.nama.toLowerCase());
  
  let targetNama = itemSumber.nama;
  if (kembar) {
    const pilihan = confirm(`Peringatan Konflik Berkas:\nDi folder tujuan sudah ada file bernama "${kembar.nama}".\n\nKlik OK untuk menempel dengan nama salinan otomatis ("Salinan_${kembar.nama}"), atau Batal untuk membatalkan.`);
    if (!pilihan) return;
    targetNama = `Salinan_${itemSumber.nama}`;
  }

  if (clipboardFs.action === 'copy') {
    // Copy: buat item baru di folder tujuan
    virtualFs.push({
      id: 'f_' + Date.now(),
      nama: targetNama,
      tipe: itemSumber.tipe,
      parentId: currentFolderId,
      deskripsi: itemSumber.deskripsi || ''
    });
    alert(`"${targetNama}" berhasil disalin ke folder ini.`);
  } else if (clipboardFs.action === 'cut') {
    // Cut: pindahkan lokasi parentId
    const itemAsli = virtualFs.find(i => i.id === itemSumber.id);
    if (itemAsli) {
      itemAsli.parentId = currentFolderId;
      itemAsli.nama = targetNama;
    }
    clipboardFs = null; // Selesai dipindahkan
    alert(`"${targetNama}" berhasil dipindahkan ke folder ini.`);
  }

  renderVirtualFs();
}

// Ubah Nama Berkas (Rename / F2)
function simulasiExplorerUbahNama() {
  if (!selectedFsId) return alert('Pilih berkas yang ingin diubah namanya (Rename / F2).');
  const item = virtualFs.find(i => i.id === selectedFsId);
  if (!item) return;

  const namaBaru = prompt('Masukkan nama berkas baru:\n(Peringatan: jangan hapus tanda titik dan ekstensinya!)', item.nama);
  if (!namaBaru || !namaBaru.trim()) return;

  const namaBersih = namaBaru.trim();
  const karakterTerlarang = /[\\/:*?"<>|]/;
  if (karakterTerlarang.test(namaBersih)) {
    alert('Nama berkas tidak boleh memuat karakter khusus sistem: \\ / : * ? " < > |');
    return;
  }

  // Jika file memiliki ekstensi lama, cek apakah ekstensi diubah tanpa sengaja
  const dotIndexLama = item.nama.lastIndexOf('.');
  const dotIndexBaru = namaBersih.lastIndexOf('.');
  if (item.tipe === 'file' && dotIndexLama !== -1) {
    const extLama = item.nama.substring(dotIndexLama).toLowerCase();
    const extBaru = dotIndexBaru !== -1 ? namaBersih.substring(dotIndexBaru).toLowerCase() : '';
    if (extLama !== extBaru) {
      const konfirmasi = confirm(`Peringatan Perubahan Ekstensi:\nAnda mengubah ekstensi dari "${extLama}" menjadi "${extBaru}".\nMengubah ekstensi BUKAN mengonversi format isi file dan dapat membuat file gagal dibuka.\n\nTetap gunakan nama baru ini?`);
      if (!konfirmasi) return;
    }
  }

  item.nama = namaBersih;
  renderVirtualFs();
}

// Hapus Berkas (Delete ke Recycle Bin Virtual)
function simulasiExplorerHapus() {
  if (!selectedFsId) return alert('Pilih berkas yang ingin dihapus (Delete).');
  const idx = virtualFs.findIndex(i => i.id === selectedFsId);
  if (idx !== -1) {
    const itemHapus = virtualFs[idx];
    const konfirmasi = confirm(`Apakah Anda yakin ingin memindahkan "${itemHapus.nama}" ke Recycle Bin virtual?`);
    if (!konfirmasi) return;

    virtualFs.splice(idx, 1);
    recycleBinFs.push({ ...itemHapus, waktuHapus: Date.now() });
    selectedFsId = null;
    renderVirtualFs();
    alert(`"${itemHapus.nama}" telah dipindahkan ke Recycle Bin virtual.\nAnda dapat memulihkannya kapan saja melalui tombol Recycle Bin.`);
  }
}

// Buka Recycle Bin Virtual & Restore File
function simulasiBukaRecycleBin() {
  if (recycleBinFs.length === 0) {
    alert('Recycle Bin virtual saat ini kosong.');
    return;
  }

  const namaList = recycleBinFs.map((item, idx) => `${idx + 1}. ${item.nama} (${item.tipe})`).join('\n');
  const pilihan = prompt(`🗑️ ISI RECYCLE BIN VIRTUAL:\n${namaList}\n\nKetik nomor file yang ingin dipulihkan (Restore):`);
  const num = parseInt(pilihan, 10);
  
  if (num >= 1 && num <= recycleBinFs.length) {
    const [pulih] = recycleBinFs.splice(num - 1, 1);
    pulih.parentId = currentFolderId; // Pulihkan ke folder aktif
    virtualFs.push(pulih);
    renderVirtualFs();
    alert(`Alhamdulillah! "${pulih.nama}" berhasil dipulihkan (Restore) ke folder ini.`);
  }
}

// Reset Ulang Simulasi Data Dummy ke Kondisi Awal
function resetSimulasiExplorer() {
  if (!confirm('Ulangi simulasi dari awal? Semua perubahan virtual akan dikembalikan ke data dummy awal.')) return;
  virtualFs = JSON.parse(JSON.stringify(INITIAL_DUMMY_FILES));
  recycleBinFs = [];
  currentFolderId = null;
  selectedFsId = null;
  clipboardFs = null;
  renderVirtualFs();

  const feedbackBox = document.getElementById('proyek-verifikasi-feedback');
  if (feedbackBox) feedbackBox.style.display = 'none';
  alert('Simulasi berhasil direset ke kondisi awal dummy. Silakan mulai berlatih kembali!');
}

// 2. MESIN VERIFIKASI PROYEK AKHIR TERPADU: "TUGAS TIK RAPI"
async function verifikasiProyekAkhirTugasRapi() {
  const feedbackBox = document.getElementById('proyek-verifikasi-feedback');
  if (!feedbackBox) return;

  const checklistHasil = [];
  let semuaSesuai = true;

  // A. Periksa apakah santri telah membuat folder proyek
  const folderProyek = virtualFs.find(item => item.tipe === 'folder');
  if (folderProyek) {
    checklistHasil.push({ lolos: true, pesan: `✔ Folder proyek utama ditemukan: "${folderProyek.nama}"` });
  } else {
    checklistHasil.push({ lolos: false, pesan: `✕ Belum membuat folder proyek utama (contoh: Kelas7_Aisyah_Modul1). Gunakan tombol "Folder Baru".` });
    semuaSesuai = false;
  }

  // B. Periksa keberadaan subfolder: Dokumen, Bacaan, Gambar
  const subfolders = virtualFs.filter(item => item.tipe === 'folder');
  const subNamaList = subfolders.map(f => f.nama.toLowerCase());

  const adaDokumen = subNamaList.some(n => n.includes('dokumen') || n.includes('doc'));
  const adaBacaan = subNamaList.some(n => n.includes('bacaan') || n.includes('buku') || n.includes('pdf'));
  const adaGambar = subNamaList.some(n => n.includes('gambar') || n.includes('foto') || n.includes('img'));

  if (adaDokumen) {
    checklistHasil.push({ lolos: true, pesan: `✔ Subfolder "Dokumen" tersedia.` });
  } else {
    checklistHasil.push({ lolos: false, pesan: `✕ Subfolder "Dokumen" belum dibuat.` });
    semuaSesuai = false;
  }

  if (adaBacaan) {
    checklistHasil.push({ lolos: true, pesan: `✔ Subfolder "Bacaan" tersedia.` });
  } else {
    checklistHasil.push({ lolos: false, pesan: `✕ Subfolder "Bacaan" belum dibuat.` });
    semuaSesuai = false;
  }

  if (adaGambar) {
    checklistHasil.push({ lolos: true, pesan: `✔ Subfolder "Gambar" tersedia.` });
  } else {
    checklistHasil.push({ lolos: false, pesan: `✕ Subfolder "Gambar" belum dibuat.` });
    semuaSesuai = false;
  }

  // C. Periksa apakah berkas Laporan_Praktikum.docx dan Bagan_Komputer.png berada di subfolder (bukan berserakan di root)
  const fileDiRoot = virtualFs.filter(item => item.parentId === null && item.tipe === 'file');
  const masihAdaDocDiRoot = fileDiRoot.some(f => f.nama.endsWith('.docx') || f.nama.endsWith('.pdf') || f.nama.endsWith('.png'));

  if (!masihAdaDocDiRoot && (adaDokumen || adaBacaan || adaGambar)) {
    checklistHasil.push({ lolos: true, pesan: `✔ Berkas dummy latihan telah dirapikan ke dalam subfolder yang sesuai.` });
  } else {
    checklistHasil.push({ lolos: false, pesan: `⚠ Masih ada berkas tugas yang berada di folder luar (root). Pindahkan (Cut/Paste) file dokumen, PDF, dan gambar ke subfoldernya masing-masing.` });
    semuaSesuai = false;
  }

  // D. Periksa apakah File_Sampah_Latihan.tmp telah dihapus
  const sampahDiFs = virtualFs.some(item => item.nama.includes('Sampah') || item.nama.endsWith('.tmp'));
  const sampahDiRecycle = recycleBinFs.some(item => item.nama.includes('Sampah') || item.nama.endsWith('.tmp'));

  if (!sampahDiFs || sampahDiRecycle) {
    checklistHasil.push({ lolos: true, pesan: `✔ Berkas sampah dummy latihan telah dihapus dengan aman.` });
  } else {
    checklistHasil.push({ lolos: false, pesan: `⚠ File sampah dummy "File_Sampah_Latihan.tmp" belum dihapus. Pilih file tersebut lalu klik tombol Delete.` });
    semuaSesuai = false;
  }

  // Tampilkan Hasil Pemeriksaan
  let listHtml = '';
  checklistHasil.forEach(item => {
    listHtml += `<li style="margin: 4px 0; color: ${item.lolos ? '#15803d' : '#b91c1c'}; font-weight: 500;">${item.pesan}</li>`;
  });

  feedbackBox.style.display = 'block';
  if (semuaSesuai) {
    feedbackBox.className = 'callout-box';
    feedbackBox.style.background = '#f0fdf4';
    feedbackBox.style.borderColor = '#86efac';
    feedbackBox.innerHTML = `
      <div style="font-size: 24px;">🏆</div>
      <div>
        <strong style="color: #166534; font-size: 15px;">Maa Syaa Allah! Proyek Akhir "Tugas TIK Rapi" Lolos Verifikasi Sempurna!</strong>
        <p style="font-size: 13px; color: #15803d; margin: 6px 0;">Semua kriteria penataan struktur folder, pemindahan berkas dummy, dan pembersihan sampah telah dikerjakan dengan sangat tertib dan tepat.</p>
        <ul style="font-size: 12px; padding-left: 20px; margin: 8px 0;">${listHtml}</ul>
      </div>
    `;

    // Catat ke server jika sudah login
    if (STATE.santri) {
      try {
        const res = await apiFetch('/api/santri/progres/aktivitas', 'POST', {
          modul: 1,
          pertemuan: 4,
          jenis_aktivitas: 'p4_simulasi_file',
          nama_aktivitas: 'Proyek Akhir Tugas TIK Rapi'
        });
        if (res.status === 'sukses' && !res.sudah_pernah) {
          perbaruiProfilHeader(res.total_xp, res.level, res.gelar);
          alert(`Maa syaa Allah! Proyek akhir diverifikasi sukses (+${res.xp_diberikan} XP).`);
        }
      } catch (err) {
        console.error(err.message);
      }
    }
  } else {
    feedbackBox.className = 'callout-box';
    feedbackBox.style.background = '#fffbeb';
    feedbackBox.style.borderColor = '#fde68a';
    feedbackBox.innerHTML = `
      <div style="font-size: 24px;">📝</div>
      <div>
        <strong style="color: #92400e; font-size: 15px;">Catatan Evaluasi Kerapian Proyek:</strong>
        <p style="font-size: 13px; color: #78350f; margin: 4px 0;">Berikut daftar poin yang masih perlu Anda rapikan sebelum pekerjaan dianggap tuntas:</p>
        <ul style="font-size: 12px; padding-left: 20px; margin: 8px 0;">${listHtml}</ul>
        <span style="font-size: 12px; color: #b45309;">Silakan lanjutkan merapikan file di simulator, lalu klik tombol "Periksa Hasil Pekerjaan" kembali.</span>
      </div>
    `;
  }
}

// 3. CHECKLIST PRAKTIK LAPTOP ASLI SANTRI (VERIFIKASI GURU)
const CHECKLIST_ITEMS = [
  { id: 'tugas_1', label: '1. Membuka File Explorer menggunakan tombol Windows + E' },
  { id: 'tugas_2', label: '2. Membuka folder Dokumen (Documents) di laptop' },
  { id: 'tugas_3', label: '3. Membuat folder baru bernama Kelas_Nama (contoh: Kelas7_Aisyah)' },
  { id: 'tugas_4', label: '4. Di dalamnya, membuat subfolder Dokumen, Bacaan, dan Gambar' },
  { id: 'tugas_5', label: '5. Menyalin (Copy & Paste) sebuah file latihan ke subfolder yang sesuai' },
  { id: 'tugas_6', label: '6. Mengganti nama (Rename) file latihan menggunakan tombol F2 dengan format standar' },
  { id: 'tugas_7', label: '7. Menghapus file latihan dummy ke Recycle Bin' },
  { id: 'tugas_8', label: '8. Membuka Recycle Bin dan memulihkan (Restore) file tersebut kembali' }
];

async function muatChecklistPraktik() {
  const container = document.getElementById('checklist-container');
  if (!container) return;
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
      <label style="font-size: 13px; display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1;">
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
