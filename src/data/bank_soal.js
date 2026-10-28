'use strict';

// ----------------------------------------------------------------------------
// BANK SOAL KUIS DAN EVALUASI MODUL 1 (PENALARAN & PENERAPAN NYATA)
// Kunci dan penjelasan umpan balik resmi disimpan di sisi server
// ----------------------------------------------------------------------------
const BANK_SOAL_MINI = {
  // Pertemuan 1: Sahabat Komputer (Konsep, Hardware, RAM/SSD, Navigasi)
  1: [
    {
      id: 'p1_q1',
      pertanyaan: 'Ketika seorang santri mengetik catatan di pengolah kata lalu menyimpannya, manakah urutan alur kerja komputer yang benar?',
      pilihan: [
        'Keluaran (Monitor) -> Masukan (Keyboard) -> Pemrosesan (CPU) -> Penyimpanan (SSD)',
        'Masukan (Keyboard) -> Pemrosesan (CPU) -> Keluaran (Monitor) -> Penyimpanan (SSD)',
        'Penyimpanan (SSD) -> Keluaran (Monitor) -> Masukan (Keyboard) -> Pemrosesan (CPU)',
        'Pemrosesan (CPU) -> Masukan (Keyboard) -> Penyimpanan (SSD) -> Keluaran (Monitor)'
      ],
      kunci: 1,
      penjelasan: 'Komputer menerima masukan data dari keyboard (Input), CPU mengolah instruksi tombol (Proses), hasilnya tampak di layar monitor (Output), lalu disimpan ke media penyimpanan seperti SSD saat berkas disimpan.'
    },
    {
      id: 'p1_q2',
      pertanyaan: 'Sering kali orang menyebut kotak komputer besar desktop sebagai "CPU". Mengapa sebutan tersebut secara teknis kurang tepat?',
      pilihan: [
        'Karena CPU sebenarnya adalah layar monitor yang menampilkan gambar',
        'Karena kotak tersebut adalah unit sistem (casing) yang menampung banyak komponen; CPU adalah chip prosesor inti di dalamnya',
        'Karena CPU hanyalah nama program perangkat lunak di dalam Windows',
        'Karena CPU hanya ada di komputer jinjing (laptop), bukan komputer desktop'
      ],
      kunci: 1,
      penjelasan: 'Secara teknis, kotak besar tersebut adalah unit sistem/casing. CPU (Central Processing Unit/Prosesor) adalah chip kecil di dalam motherboard yang bertugas mengolah instruksi program.'
    },
    {
      id: 'p1_q3',
      pertanyaan: 'Meskipun data tugas sudah disimpan di dalam SSD atau Harddisk (media non-volatile), mengapa kita tetap dianjurkan membuat cadangan (backup)?',
      pilihan: [
        'Karena data di SSD otomatis terhapus setiap kali komputer dimatikan',
        'Karena SSD hanya menyimpan huruf, tidak bisa menyimpan gambar',
        'Karena media penyimpanan fisik tetap bisa mengalami kerusakan, aus, terkena virus, atau terhapus tanpa sengaja',
        'Karena sistem Windows mewajibkan setiap santri membeli dua laptop'
      ],
      kunci: 2,
      penjelasan: 'Media penyimpanan permanen (non-volatile) tetap menjaga data saat listrik mati, tetapi tidak menjamin aman selamanya. Perangkat keras bisa mengalami kerusakan atau file korup, sehingga cadangan (backup) ke media lain tetap penting.'
    },
    {
      id: 'p1_q4',
      pertanyaan: 'Santriwati sedang mengetik di aplikasi catatan dan ingin segera kembali ke tampilan Desktop Windows tanpa menutup aplikasinya. Tindakan pintasan yang tepat adalah...',
      pilihan: [
        'Menekan kombinasi tombol Win + D',
        'Menekan kombinasi tombol Alt + F4',
        'Menekan tombol daya (Power) pada komputer',
        'Mencabut kabel keyboard'
      ],
      kunci: 0,
      penjelasan: 'Tombol Windows (Win) + D berfungsi meminimalkan sementara semua jendela dan menampilkan Desktop secara instan tanpa menutup aplikasi yang sedang bekerja.'
    }
  ],

  // Pertemuan 2: Jari Sakti dan Mouse (Kendali Mouse, Touchpad, Home Row, Ergonomi)
  2: [
    {
      id: 'p2_q1',
      pertanyaan: 'Apakah mengklik kanan mouse pada sebuah file akan langsung menghapus berkas tersebut?',
      pilihan: [
        'Ya, klik kanan adalah jalan pintas otomatis untuk membuang berkas ke tong sampah',
        'Tidak, klik kanan berfungsi memunculkan menu konteks (pilihan aksi seperti Buka, Salin, Ganti Nama, atau Hapus)',
        'Ya, tetapi hanya jika dilakukan dua kali secara cepat',
        'Tidak, klik kanan hanya berfungsi mematikan monitor komputer'
      ],
      kunci: 1,
      penjelasan: 'Klik kanan tidak otomatis menghapus berkas. Klik kanan membuka menu konteks yang menyediakan berbagai pilihan tindakan sesuai objek yang dipilih.'
    },
    {
      id: 'p2_q2',
      pertanyaan: 'Pada baris pangkal (Home Row) keyboard, mengapa tombol F dan J memiliki tonjolan kecil timbul di permukaannya?',
      pilihan: [
        'Sebagai hiasan estetika dari pabrik keyboard',
        'Sebagai tombol rahasia untuk menyalakan lampu latar keyboard',
        'Sebagai panduan taktil posisi jari telunjuk agar santri dapat memposisikan jemari tanpa perlu menunduk melihat keyboard',
        'Sebagai penanda bahwa tombol tersebut tidak boleh ditekan keras'
      ],
      kunci: 2,
      penjelasan: 'Tonjolan taktil pada tombol F (telunjuk kiri) dan J (telunjuk kanan) membantu jari kembali ke baris pangkal (Home Row) dengan tepat saat melatih keahlian mengetik 10 jari.'
    },
    {
      id: 'p2_q3',
      pertanyaan: 'Bagaimana pengaruh tindakan seret-lepas (drag and drop) berkas menggunakan mouse?',
      pilihan: [
        'Pasti selalu memindahkan (move) berkas dalam semua keadaan',
        'Pasti selalu membuat salinan (copy) tanpa memindahkan file asli',
        'Hasilnya bergantung pada konteks: menyeret di dalam drive yang sama biasanya memindahkan, sedangkan antar-drive berbeda umumnya menyalin',
        'Seret-lepas otomatis mengubah format berkas menjadi arsip ZIP'
      ],
      kunci: 2,
      penjelasan: 'Efek drag and drop bergantung pada konteks lokasi. Di dalam drive yang sama, berkas umumnya dipindahkan (Move), sedangkan menyeret ke drive atau media penyimpanan berbeda (misal ke USB flashdisk) biasanya membuat salinan (Copy).'
    },
    {
      id: 'p2_q4',
      pertanyaan: 'Saat melatih keterampilan mengetik, mengapa prinsip ketelitian (itqan) dan kenyamanan posisi tubuh harus didahulukan sebelum mengejar kecepatan (WPM tinggi)?',
      pilihan: [
        'Karena mengetik cepat selalu dilarang dalam sistem komputer',
        'Karena pembentukan memori otot yang tepat mencegah kebiasaan salah ketik, mengurangi kelelahan pergelangan tangan, dan menghemat waktu perbaikan',
        'Karena komputer sekolah akan macet jika mendeteksi ketukan lebih dari 20 kata per menit',
        'Karena kecepatan mengetik tidak ada gunanya dalam kehidupan sehari-hari'
      ],
      kunci: 1,
      penjelasan: 'Membangun memori otot yang akurat dan menjaga postur ergonomis jauh lebih utama bagi pemula. Mengetik cepat tetapi penuh kesalahan ketik justru membuang banyak waktu untuk menghapus dan memperbaiki.'
    }
  ],

  // Pertemuan 3: Rumah Berkas (Folder, Path, Ekstensi, Aturan Simpan)
  3: [
    {
      id: 'p3_q1',
      pertanyaan: 'Apakah mengubah akhiran nama file dari "laporan.docx" menjadi "laporan.pdf" otomatis mengubah format dokumen tersebut menjadi berkas PDF asli?',
      pilihan: [
        'Ya, Windows otomatis mengonversi struktur internal dokumen hanya dengan mengubah teks ekstensinya',
        'Tidak, mengganti ekstensi hanya mengubah label nama berkas dan justru dapat membuat aplikasi gagal membuka isinya; konversi format harus melalui fitur Save As atau Ekspor aplikasi',
        'Ya, asalkan komputer terhubung ke internet saat nama diubah',
        'Tidak, karena format PDF hanya dapat dibuat oleh komputer kantor'
      ],
      kunci: 1,
      penjelasan: 'Mengubah ekstensi secara manual tidak mengonversi struktur isi file. Konversi format berkas yang benar harus dilakukan melalui menu Simpan Sebagai (Save As) atau Ekspor pada aplikasi pengolah kata.'
    },
    {
      id: 'p3_q2',
      pertanyaan: 'Karakter manakah berikut ini yang DILARANG digunakan pada penamaan berkas atau folder di sistem operasi Windows?',
      pilihan: [
        'Huruf kapital dan angka (contoh: A-Z, 0-9)',
        'Tanda garis bawah (_) dan tanda hubung (-)',
        'Karakter khusus direktori sistem seperti garis miring (/ \\), titik dua (:), tanda bintang (*), tanda tanya (?), dan tanda kurung siku (< > |)',
        'Tanda spasi di antara kata'
      ],
      kunci: 2,
      penjelasan: 'Windows melarang 9 karakter khusus: \\ / : * ? " < > | karena simbol-simbol ini digunakan oleh sistem operasi untuk perintah path direktori dan pencarian.'
    },
    {
      id: 'p3_q3',
      pertanyaan: 'Banyak petunjuk menyebutkan "simpanlah file di Drive D:". Apakah semua komputer atau laptop pasti memiliki Drive D: dan apakah menyimpan di Documents pada Drive C: otomatis salah?',
      pilihan: [
        'Ya, semua komputer di dunia wajib memiliki Drive D: tanpa kecuali',
        'Tidak; Drive D: tidak selalu tersedia di semua perangkat, dan folder Documents di Drive C: adalah lokasi kerja pengguna yang sah asalkan bukan disimpan di folder sistem Windows dan data penting dicadangkan',
        'Ya, menyimpan file tugas di Drive C: pasti merusak sistem operasi seketika',
        'Tidak, karena huruf drive di komputer hanya boleh menggunakan huruf A dan B'
      ],
      kunci: 1,
      penjelasan: 'Tidak semua laptop memiliki partisi Drive D:. Folder Documents pada Drive C: (C:\\Users\\Nama\\Documents) adalah lokasi penyimpanan pengguna yang normal. Yang harus dihindari adalah menyimpan file sembarangan di folder inti sistem seperti C:\\Windows.'
    },
    {
      id: 'p3_q4',
      pertanyaan: 'Apakah fitur "Sort by" (mengurutkan tampilan berkas berdasarkan Tanggal atau Ukuran) di File Explorer akan memindahkan lokasi fisik berkas ke folder lain?',
      pilihan: [
        'Ya, berkas yang diurutkan akan terkirim ke folder arsip khusus',
        'Tidak, mengurutkan hanya mengatur urutan tampilan visual pada layar tanpa mengubah lokasi atau isi berkas',
        'Ya, berkas yang berada di urutan terbawah otomatis terhapus',
        'Tidak, tetapi nama berkas akan berganti menjadi nomor urut 1, 2, 3'
      ],
      kunci: 1,
      penjelasan: 'Mengurutkan berkas (sorting) hanya mengubah susunan visual di jendela File Explorer untuk memudahkan pencarian; lokasi fisik dan isi berkas sama sekali tidak berubah.'
    }
  ]
};

// Bank Soal Pertemuan 4: Evaluasi Modul (10 Soal Lengkap Berbasis Skenario, 5 Acak per Percobaan)
const BANK_SOAL_EVALUASI = [
  {
    id: 'eval_1',
    pertanyaan: 'Kamu ingin memiliki salinan tugas di flashdisk dan tetap mempertahankan berkas asli di laptop. Operasi manakah yang paling tepat?',
    pilihan: [
      'Gunakan perintah Cut (Ctrl+X) lalu Paste di flashdisk',
      'Gunakan perintah Copy (Ctrl+C) lalu Paste di flashdisk',
      'Gunakan perintah Delete lalu buka flashdisk',
      'Gunakan perintah Rename berkas di laptop'
    ],
    kunci: 1,
    penjelasan: 'Perintah Copy (Salin) menduplikasi berkas sehingga berkas asli tetap aman di laptop dan salinan baru tercipta di flashdisk. Jika memakai Cut, berkas asli di laptop akan berpindah.'
  },
  {
    id: 'eval_2',
    pertanyaan: 'Apakah tombol pintasan Batal (Ctrl + Z) di Windows dapat membatalkan semua kesalahan yang pernah dilakukan pengguna?',
    pilihan: [
      'Ya, Ctrl + Z adalah tombol ajaib yang bisa memulihkan file apa pun kapan saja',
      'Tidak, Ctrl + Z memiliki batas tindakan; tidak semua operasi sistem dapat dibatalkan, terutama jika aplikasi sudah ditutup atau file dipindahkan secara permanen',
      'Ya, asalkan komputer dalam keadaan menyala selama 24 jam',
      'Tidak, karena Ctrl + Z hanya berfungsi untuk mengecilkan ukuran layar'
    ],
    kunci: 1,
    penjelasan: 'Ctrl + Z (Undo) sangat berguna namun memiliki batas. Tidak semua aksi file explorer atau aplikasi dapat dibatalkan lewat Ctrl+Z. Pengguna tetap harus teliti dan memeriksa lokasi serta nama file.'
  },
  {
    id: 'eval_3',
    pertanyaan: 'Mengapa kita dilarang keras menyimpan tugas atau mengutak-atik berkas di dalam folder "C:\\Windows"?',
    pilihan: [
      'Karena folder Windows hanya bisa dibuka pada malam hari',
      'Karena folder tersebut memuat file sistem operasi inti; mengubah atau menghapus isinya dapat membuat Windows gagal berjalan (booting error)',
      'Karena folder Windows otomatis mengubah semua dokumen menjadi foto',
      'Karena kapasitas folder Windows dibatasi hanya untuk 1 berkas'
    ],
    kunci: 1,
    penjelasan: 'Folder C:\\Windows berisi berkas-berkas vital sistem operasi. Mengutak-atik isinya sangat berisiko merusak sistem komputer.'
  },
  {
    id: 'eval_4',
    pertanyaan: 'Saat menghapus file latihan yang tersimpan di dalam flashdisk (USB drive), apakah file tersebut akan masuk ke Recycle Bin laptop dan dapat dipulihkan kapan saja?',
    pilihan: [
      'Ya, semua file yang dihapus dari perangkat apa pun pasti masuk ke Recycle Bin',
      'Tidak, file yang dihapus dari USB flashdisk umumnya dihapus permanen secara langsung dan tidak ditampung di Recycle Bin laptop',
      'Ya, tetapi hanya jika ukuran flashdisk di atas 64 GB',
      'Tidak, karena flashdisk tidak bisa dihubungkan ke komputer Windows'
    ],
    kunci: 1,
    penjelasan: 'Perhatian penting: berkas yang dihapus dari media eksternal (seperti flashdisk USB) umumnya langsung dihapus secara permanen oleh Windows tanpa melalui Recycle Bin.'
  },
  {
    id: 'eval_5',
    pertanyaan: 'Saat kamu menyalin berkas ke sebuah folder, tiba-tiba muncul jendela peringatan: "The destination already has a file named...". Tindakan bijak apa yang harus diambil?',
    pilihan: [
      'Langsung klik "Replace the file in the destination" tanpa memeriksa apa pun',
      'Segera mematikan laptop dengan mencabut kabel listrik',
      'Periksa tanggal dan isi kedua berkas terlebih dahulu; jika berkas tujuan adalah file penting yang berbeda, pilih batalkan atau ganti nama agar file lama tidak tertimpa tanpa sengaja',
      'Menghapus seluruh folder tujuan'
    ],
    kunci: 2,
    penjelasan: 'Memilih Replace akan menimpa (overwrite) file yang ada. Sebelum menimpa, pastikan file tujuan memang versi usang yang ingin digantikan, bukan tugas lain yang memiliki nama serupa.'
  },
  {
    id: 'eval_6',
    pertanyaan: 'Manakah di antara pilihan berikut yang merupakan contoh penamaan berkas tugas yang rapi, tertib, dan mencerminkan adab keilmuan?',
    pilihan: [
      'tugas_baru_banget_fix_final_bismillah.docx',
      'Tugas1_Modul1_Fatimah_Kelas7_2026-10-28.docx',
      'dokumen_tanpa_judul(1)(2).docx',
      'asdfghjkl_selesai.docx'
    ],
    kunci: 1,
    penjelasan: 'Nama file yang rapi memuat identitas tugas, materi modul, nama santri, kelas, dan tanggal (format ISO YYYY-MM-DD), memudahkan pencarian tanpa perlu membuka isi berkas satu per satu.'
  },
  {
    id: 'eval_7',
    pertanyaan: 'Mengapa prosedur "Safely Remove / Eject" sangat disarankan sebelum mencabut flashdisk dari port USB laptop?',
    pilihan: [
      'Supaya baterai laptop tidak terkuras habis',
      'Untuk memastikan proses tulis-baca cache berkas oleh sistem operasi telah tuntas sempurna sehingga file di flashdisk tidak korup/rusak',
      'Agar flashdisk otomatis memformat ulang dirinya',
      'Hanya sebagai formalitas tanpa alasan teknis'
    ],
    kunci: 1,
    penjelasan: 'Fitur Eject memberitahu sistem operasi untuk menyelesaikan seluruh proses penulisan cache yang tertunda ke flashdisk sebelum daya diputus, mencegah file rusak (corrupt).'
  },
  {
    id: 'eval_8',
    pertanyaan: 'Jika santriwati tidak sengaja menekan tombol Delete pada file latihan di folder Dokumen komputer laptop, langkah pertama yang paling tepat untuk menyelamatkannya adalah...',
    pilihan: [
      'Membeli laptop baru di toko komputer',
      'Membuka Recycle Bin di Desktop, klik kanan pada file yang terhapus, lalu pilih perintah "Restore"',
      'Menginstal ulang sistem operasi Windows',
      'Mematikan paksa komputer dengan menekan tombol power lama-lama'
    ],
    kunci: 1,
    penjelasan: 'Berkas yang dihapus biasa dari harddisk/SSD lokal laptop akan ditampung di Recycle Bin. Berkas dapat dikembalikan ke lokasi asalnya dengan memilih opsi Restore.'
  },
  {
    id: 'eval_9',
    pertanyaan: 'Apakah keberadaan ekstensi file seperti ".docx" atau ".pdf" menjamin bahwa berkas tersebut pasti aman dan bebas dari virus berbahaya?',
    pilihan: [
      'Ya, ekstensi adalah sertifikat keamanan resmi dari sistem operasi',
      'Tidak, ekstensi hanya penanda asosiasi format aplikasi; berkas mencurigakan tetap bisa membahayakan, sehingga jangan membuka berkas tak dikenal dari sumber yang meragukan',
      'Ya, virus hanya bisa masuk lewat file berekstensi .jpg',
      'Tidak, karena semua file di komputer pada dasarnya adalah virus'
    ],
    kunci: 1,
    penjelasan: 'Ekstensi berkas bukan jaminan keamanan. Nama berkas bisa disamarkan atau mengandung program berbahaya. Santriwati harus berhati-hati dan tidak membuka lampiran mencurigakan.'
  },
  {
    id: 'eval_10',
    pertanyaan: 'Setelah seluruh kegiatan praktikum di laboratorium komputer selesai, bagaimana SOP mematikan perangkat yang benar dan menjaga adab fasilitas bersama?',
    pilihan: [
      'Langsung mencabut stopkontak listrik saat dokumen masih terbuka di layar',
      'Menekan tombol power casing selama 10 detik hingga mati mendadak',
      'Simpan semua pekerjaan, tutup aplikasi, klik Start -> Power -> Shut Down, tunggu komputer padam sempurna, lalu rapikan kursi dan meja lab',
      'Membiarkan komputer tetap menyala dan langsung meninggalkan ruangan'
    ],
    kunci: 2,
    penjelasan: 'Prosedur Shut Down resmi memastikan seluruh sistem dan berkas ditutup rapi tanpa risiko korupsi data. Menjaga kebersihan dan merapikan meja/kursi lab adalah cermin adab santri penuntut ilmu.'
  }
];

module.exports = {
  BANK_SOAL_MINI,
  BANK_SOAL_EVALUASI
};
