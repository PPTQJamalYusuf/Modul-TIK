'use strict';

/**
 * ============================================================================
 * MODUL BIODATA KOMPUTERKU (INTERAKTIF & OFFLINE-READY)
 * ============================================================================
 * Mengelola input identitas komputer oleh santri (Device Name, CPU, RAM, OS, Storage),
 * penyimpanan otomatis ke LocalStorage & Server (SQLite lab.db), serta pembuatan
 * dan pengunduhan berkas .txt untuk praktik File Explorer.
 */

const BIODATA_STORAGE_KEY = 'modul1_biodata_komputer';

let localBiodata = {
  nama_perangkat: '',
  prosesor: '',
  ram: '',
  sistem_operasi: '',
  penyimpanan: ''
};

async function muatBiodataKomputer() {
  try {
    const raw = localStorage.getItem(BIODATA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      localBiodata = { ...localBiodata, ...parsed };
      isiNilaiFormBiodata(localBiodata);
    }
  } catch (err) {
    console.warn('[BIODATA] Gagal membaca LocalStorage:', err);
  }

  if (typeof STATE !== 'undefined' && STATE.santri) {
    try {
      const res = await apiFetch('/api/santri/biodata-komputer');
      if (res && res.status === 'sukses' && res.biodata) {
        localBiodata = {
          nama_perangkat: res.biodata.nama_perangkat || localBiodata.nama_perangkat,
          prosesor: res.biodata.prosesor || localBiodata.prosesor,
          ram: res.biodata.ram || localBiodata.ram,
          sistem_operasi: res.biodata.sistem_operasi || localBiodata.sistem_operasi,
          penyimpanan: res.biodata.penyimpanan || localBiodata.penyimpanan
        };
        isiNilaiFormBiodata(localBiodata);
        localStorage.setItem(BIODATA_STORAGE_KEY, JSON.stringify(localBiodata));
        tampilkanStatusBiodata('✅ Tersimpan di server host guru');
      }
    } catch (err) {
      console.warn('[BIODATA] Sinkron server dilewati (offline/guest):', err.message);
    }
  }
}

function isiNilaiFormBiodata(data) {
  const fields = ['nama_perangkat', 'prosesor', 'ram', 'sistem_operasi', 'penyimpanan'];
  fields.forEach(field => {
    const els = document.querySelectorAll(`[data-biodata="${field}"]`);
    els.forEach(el => {
      if (el && document.activeElement !== el) {
        el.value = data[field] || '';
      }
    });
  });

  const reviewNama = document.getElementById('review-biodata-nama');
  if (reviewNama) reviewNama.textContent = data.nama_perangkat || '(Belum diisi)';
  const reviewCpu = document.getElementById('review-biodata-cpu');
  if (reviewCpu) reviewCpu.textContent = data.prosesor || '(Belum diisi)';
  const reviewRam = document.getElementById('review-biodata-ram');
  if (reviewRam) reviewRam.textContent = data.ram || '(Belum diisi)';
  const reviewOs = document.getElementById('review-biodata-os');
  if (reviewOs) reviewOs.textContent = data.sistem_operasi || '(Belum diisi)';
  const reviewDrive = document.getElementById('review-biodata-penyimpanan');
  if (reviewDrive) reviewDrive.textContent = data.penyimpanan || '(Belum diisi)';
}

function bacaNilaiFormBiodata() {
  const fields = ['nama_perangkat', 'prosesor', 'ram', 'sistem_operasi', 'penyimpanan'];
  fields.forEach(field => {
    const el = document.querySelector(`[data-biodata="${field}"]`);
    if (el) {
      localBiodata[field] = el.value.trim();
    }
  });
  return localBiodata;
}

async function simpanBiodataKomputer() {
  const data = bacaNilaiFormBiodata();

  if (!data.nama_perangkat && !data.prosesor && !data.ram && !data.sistem_operasi) {
    alert('Harap isi minimal Nama Perangkat atau Prosesor komputer.');
    return;
  }

  try {
    localStorage.setItem(BIODATA_STORAGE_KEY, JSON.stringify(data));
    isiNilaiFormBiodata(data);
  } catch (err) {
    console.error('Gagal simpan lokal:', err);
  }

  tampilkanStatusBiodata('Menyimpan...');

  if (typeof STATE !== 'undefined' && STATE.santri) {
    try {
      const res = await apiFetch('/api/santri/biodata-komputer', 'POST', data);
      if (res && res.status === 'sukses') {
        let msg = '✅ Berhasil disimpan ke Server!';
        if (res.xp && res.xp.xp_diberikan > 0) {
          msg = `🎉 Tersimpan! +${res.xp.xp_diberikan} XP ditambahkan!`;
          if (typeof perbaruiBadgeXpHeader === 'function') {
            perbaruiBadgeXpHeader(res.xp.total_xp, res.xp.level, res.xp.gelar);
          }
        }
        tampilkanStatusBiodata(msg);
        return;
      }
    } catch (err) {
      tampilkanStatusBiodata('⚠️ Tersimpan di laptop lokal (Gagal kirim ke host)');
      return;
    }
  }

  tampilkanStatusBiodata('✅ Tersimpan di browser laptop ini (Login untuk +15 XP)');
}

function tampilkanStatusBiodata(pesan) {
  document.querySelectorAll('.biodata-status-label').forEach(el => {
    el.textContent = pesan;
  });
}

function unduhBiodataTxt() {
  const data = bacaNilaiFormBiodata();
  const namaSantri = (typeof STATE !== 'undefined' && STATE.santri) ? STATE.santri.nama : 'Santri';
  const kelasSantri = (typeof STATE !== 'undefined' && STATE.santri) ? STATE.santri.kelas : 'Lab Komputer';
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const isiFile = `====================================================
BIODATA KOMPUTERKU (LAB TIK)
====================================================
Nama Santri     : ${namaSantri}
Kelas / Halaqah : ${kelasSantri}
Tanggal Catat   : ${tanggal}
----------------------------------------------------
1. Nama Perangkat : ${data.nama_perangkat || '(Belum diisi)'}
2. Otak (Prosesor): ${data.prosesor || '(Belum diisi)'}
3. Meja Kerja(RAM): ${data.ram || '(Belum diisi)'}
4. Sistem Operasi : ${data.sistem_operasi || '(Belum diisi)'}
5. Lemari Simpan  : ${data.penyimpanan || '(Belum diisi)'}
====================================================
Petunjuk Praktik Sesi 3:
Simpan berkas ini di dalam folder:
TIK > Modul_1 > Biodata_Komputer_${namaSantri.replace(/\s+/g, '_')}.txt
====================================================\n`;

  try {
    const blob = new Blob([isiFile], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biodata_komputer.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    tampilkanStatusBiodata('📥 Berkas biodata_komputer.txt berhasil diunduh!');
  } catch (err) {
    alert('Gagal mengunduh berkas: ' + err.message);
  }
}

function gulirKeFormBiodata() {
  const el = document.getElementById('form-biodata-container');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const firstInput = el.querySelector('input');
    if (firstInput) firstInput.focus();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-biodata]').forEach(input => {
    input.addEventListener('input', (e) => {
      const field = e.target.getAttribute('data-biodata');
      localBiodata[field] = e.target.value;
      document.querySelectorAll(`[data-biodata="${field}"]`).forEach(other => {
        if (other !== e.target) {
          other.value = e.target.value;
        }
      });
    });
  });

  setTimeout(muatBiodataKomputer, 300);
});
