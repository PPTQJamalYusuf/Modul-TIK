/**
 * ============================================================================
 * MODUL PEMBACA DOKUMEN PDF (On-Demand Lightweight Viewer)
 * Tanggung Jawab: Mengelola antarmuka modal pembaca PDF hemat memori dengan lazy loading dan pembersihan RAM otomatis saat ditutup.
 * ============================================================================
 */

'use strict';

/**
 * Membuka modal PDF secara on-demand agar tidak membebani memori browser saat tidak dibaca.
 * @param {string} pdfUrl - Path relatif berkas PDF yang disajikan server
 * @param {string} judul - Judul dokumen untuk header modal
 */
function bukaModalPdf(pdfUrl = '/docs/02_Panduan_Pengenalan_Komputer_Dasar_SIK_140422-1.pdf', judul = 'Panduan Pengenalan Komputer Dasar (SIK)') {
  const modal = document.getElementById('modal-pdf-viewer');
  const titleEl = document.getElementById('modal-pdf-title');
  const tabLink = document.getElementById('modal-pdf-link-tab');
  const frameWrapper = document.getElementById('modal-pdf-frame-wrapper');

  if (!modal || !frameWrapper) return;

  if (titleEl) titleEl.textContent = judul;
  if (tabLink) {
    tabLink.href = pdfUrl;
    tabLink.setAttribute('aria-label', `Buka dokumen ${judul} di tab baru`);
  }

  // Tampilkan modal terlebih dahulu
  modal.style.display = 'flex';

  // Lazy loading: Injeksi elemen iframe HANYA saat modal dibuka (menghemat RAM client & beban jaringan awal)
  frameWrapper.innerHTML = `
    <div id="pdf-loading-indicator" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ffffff; font-size: 13.5px; display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 1;">
      <div style="width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #38bdf8; border-radius: 50%; animation: spinPdf 0.8s linear infinite;"></div>
      <span>Memuat dokumen modul...</span>
    </div>
    <iframe id="pdf-active-frame" src="${pdfUrl}#toolbar=1&navpanes=0" title="${judul}" style="width: 100%; height: 100%; border: none; position: relative; z-index: 2; opacity: 0; transition: opacity 0.25s ease;" onload="this.style.opacity = '1'; document.getElementById('pdf-loading-indicator')?.remove();"></iframe>
  `;
}

/**
 * Menutup modal PDF dan seketika mengosongkan iframe dari DOM untuk membebaskan memori RAM browser.
 */
function tutupModalPdf() {
  const modal = document.getElementById('modal-pdf-viewer');
  const frameWrapper = document.getElementById('modal-pdf-frame-wrapper');

  if (modal) modal.style.display = 'none';

  // Pembersihan kritis: Menghapus iframe seketika agar browser melepaskan alokasi memori (RAM) dokumen PDF
  if (frameWrapper) {
    frameWrapper.innerHTML = '';
  }
}

// Event listener: Tutup modal saat tombol Escape ditekan atau area luar modal diklik
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('modal-pdf-viewer');
    if (modal && modal.style.display === 'flex') {
      tutupModalPdf();
    }
  }
});

