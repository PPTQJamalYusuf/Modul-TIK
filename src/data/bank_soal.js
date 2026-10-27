'use strict';

// ----------------------------------------------------------------------------
// BANK SOAL KUIS (KUNCI DAN PENJELASAN HANYA DISIMPAN DI SERVER)
// ----------------------------------------------------------------------------
const BANK_SOAL_MINI = {
  // Pertemuan 1: Kenal Perangkat & Navigasi Desktop
  1: [
    {
      id: 'p1_q1',
      pertanyaan: 'Manakah urutan siklus kerja komputer yang benar?',
      pilihan: [
        'Output -> Input -> Proses -> Penyimpanan',
        'Input -> Proses -> Output -> Penyimpanan',
        'Penyimpanan -> Output -> Input -> Proses',
        'Proses -> Input -> Penyimpanan -> Output'
      ],
      kunci: 1,
      penjelasan: 'Komputer menerima data (Input), mengolah data (Proses), menampilkan hasil (Output), dan menyimpannya (Penyimpanan).'
    },
    {
      id: 'p1_q2',
      pertanyaan: 'Komponen hardware apa yang bertugas menyimpan file dan sistem operasi secara permanen walaupun komputer dimatikan?',
      pilihan: [
        'RAM (Memory)',
        'Processor (CPU)',
        'Storage (SSD/Harddisk)',
        'Monitor'
      ],
      kunci: 2,
      penjelasan: 'Storage (SSD atau Harddisk) bersifat permanen (non-volatile), sedangkan RAM bersifat sementara.'
    },
    {
      id: 'p1_q3',
      pertanyaan: 'Shortcut keyboard yang digunakan untuk langsung kembali ke tampilan Desktop di Windows adalah...',
      pilihan: [
        'Ctrl + D',
        'Win + D',
        'Alt + F4',
        'Shift + Esc'
      ],
      kunci: 1,
      penjelasan: 'Tombol Windows (Win) + D berguna untuk meminimalkan semua jendela dan langsung menampilkan Desktop.'
    }
  ],

  // Pertemuan 2: Mouse & Home Row Keyboard
  2: [
    {
      id: 'p2_q1',
      pertanyaan: 'Tombol mouse yang paling sering digunakan untuk memilih ikon, menekan tombol, atau mengklik link adalah...',
      pilihan: [
        'Klik Kanan',
        'Scroll Wheel',
        'Klik Kiri',
        'Double Klik Kanan'
      ],
      kunci: 2,
      penjelasan: 'Klik kiri adalah tombol primer untuk memilih dan mengeksekusi aksi standar di komputer.'
    },
    {
      id: 'p2_q2',
      pertanyaan: 'Pada deretan tombol Home Row keyboard, tombol mana yang memiliki tonjolan kecil penanda posisi jari telunjuk?',
      pilihan: [
        'A dan L',
        'S dan K',
        'D dan J',
        'F dan J'
      ],
      kunci: 3,
      penjelasan: 'Tombol F (jari telunjuk kiri) dan J (jari telunjuk kanan) memiliki tonjolan taktil untuk mengetik 10 jari tanpa melihat.'
    },
    {
      id: 'p2_q3',
      pertanyaan: 'Istilah WPM dalam latihan mengetik merupakan singkatan dari...',
      pilihan: [
        'Words Per Minute (Kata per menit)',
        'Windows Program Manager',
        'Wireless Power Meter',
        'Web Page Module'
      ],
      kunci: 0,
      penjelasan: 'WPM adalah standar internasional pengukuran kecepatan mengetik: (Jumlah karakter / 5) / Waktu dalam menit.'
    }
  ],

  // Pertemuan 3: Folder dan Format File
  3: [
    {
      id: 'p3_q1',
      pertanyaan: 'Format file dokumen berikut yang paling tepat digunakan agar tata letak tidak berubah saat dibuka di berbagai perangkat adalah...',
      pilihan: [
        '.txt',
        '.pdf',
        '.docx',
        '.jpg'
      ],
      kunci: 1,
      penjelasan: 'Format PDF (Portable Document Format) mempertahankan format dan tata letak asli di semua jenis perangkat.'
    },
    {
      id: 'p3_q2',
      pertanyaan: 'Di antara karakter berikut, manakah karakter yang DILARANG digunakan pada penamaan file di sistem Windows?',
      pilihan: [
        'Titik (.) dan Garis Bawah (_)',
        'Tanda Hubung (-) dan Spasi',
        'Tanda Titik Dua (:) dan Garis Miring (/)',
        'Angka (0-9) dan Huruf Kapital'
      ],
      kunci: 2,
      penjelasan: 'Windows melarang 9 karakter khusus: \\ / : * ? " < > | karena digunakan untuk fungsi sistem direktori.'
    },
    {
      id: 'p3_q3',
      pertanyaan: 'Di manakah file sistem utama Windows dan folder instalasi program biasanya berada?',
      pilihan: [
        'Drive C:',
        'Drive D:',
        'Recycle Bin',
        'Network Drive'
      ],
      kunci: 0,
      penjelasan: 'Drive C: adalah drive partisi sistem utama (System Drive) tempat sistem operasi Windows dan Program Files berada.'
    }
  ]
};

// Bank Soal Pertemuan 4: Evaluasi Modul (10 Soal Lengkap, 5 Soal Diacak per Percobaan)
const BANK_SOAL_EVALUASI = [
  {
    id: 'eval_1',
    pertanyaan: 'Apa perbedaan mendasar antara operasi "Copy" dan "Cut" saat mengelola file?',
    pilihan: [
      'Copy menghapus file asli, Cut menggandakannya',
      'Copy menggandakan file, Cut memindahkan file asli ke lokasi baru',
      'Copy hanya untuk folder, Cut hanya untuk file',
      'Tidak ada perbedaan, keduanya menghasilkan salinan yang sama'
    ],
    kunci: 1,
    penjelasan: 'Copy menduplikasi file asli (asli tetap ada), sedangkan Cut memindahkan file asli ke lokasi tujuan baru.'
  },
  {
    id: 'eval_2',
    pertanyaan: 'Shortcut keyboard yang digunakan untuk membatalkan tindakan terakhir (Undo) di Windows adalah...',
    pilihan: [
      'Ctrl + C',
      'Ctrl + V',
      'Ctrl + Z',
      'Ctrl + X'
    ],
    kunci: 2,
    penjelasan: 'Ctrl + Z adalah shortcut standar untuk Undo (membatalkan tindakan kesalahan yang baru saja dilakukan).'
  },
  {
    id: 'eval_3',
    pertanyaan: 'Mengapa kita sebaiknya TIDAK menyimpan file tugas pribadi di dalam folder sistem "Windows" di Drive C:?',
    pilihan: [
      'Folder Windows hanya boleh diakses oleh komputer server',
      'Beresiko merusak file sistem operasi jika file sistem terhapus atau tertimpa tanpa sengaja',
      'File akan otomatis terhapus setiap 24 jam',
      'Folder Windows tidak memiliki kapasitas penyimpanan'
    ],
    kunci: 1,
    penjelasan: 'Folder Windows memuat berkas inti OS. Mengutak-atik isinya dapat menyebabkan Windows gagal booting.'
  },
  {
    id: 'eval_4',
    pertanyaan: 'Di mana posisi jari jemari yang benar saat berada di baris Home Row keyboard?',
    pilihan: [
      'Kiri di Q-W-E-R dan Kanan di U-I-O-P',
      'Kiri di A-S-D-F dan Kanan di J-K-L-;',
      'Kiri di Z-X-C-V dan Kanan di M-,-.-/',
      'Semua jari bebas diletakkan di mana saja tanpa aturan'
    ],
    kunci: 1,
    penjelasan: 'Home Row adalah baris pangkal: Tangan kiri bertumpu pada A-S-D-F dan tangan kanan pada J-K-L-;'
  },
  {
    id: 'eval_5',
    pertanyaan: 'Folder manakah di Windows yang berfungsi sebagai penampung sementara file-file yang baru saja dihapus?',
    pilihan: [
      'Downloads',
      'Documents',
      'Recycle Bin',
      'Temp Data'
    ],
    kunci: 2,
    penjelasan: 'Recycle Bin menampung file terhapus sehingga dapat dikembalikan (Restore) jika penghapusan tidak disengaja.'
  },
  {
    id: 'eval_6',
    pertanyaan: 'Manakah ekstensi file berikut yang menandakan bahwa file tersebut adalah file gambar kompresi?',
    pilihan: [
      '.mp3',
      '.jpg atau .png',
      '.xlsx',
      '.exe'
    ],
    kunci: 1,
    penjelasan: '.jpg dan .png adalah format standar gambar diam digital.'
  },
  {
    id: 'eval_7',
    pertanyaan: 'Kombinasi tombol keyboard yang digunakan untuk memilih/menyeleksi SELURUH file di dalam folder sekaligus adalah...',
    pilihan: [
      'Ctrl + S',
      'Ctrl + A',
      'Ctrl + Shift + A',
      'Alt + A'
    ],
    kunci: 1,
    penjelasan: 'Ctrl + A (All) menyeleksi semua item sekaligus.'
  },
  {
    id: 'eval_8',
    pertanyaan: 'Mengapa kita disarankan menggunakan fitur "Safely Remove / Eject" sebelum mencabut flashdisk?',
    pilihan: [
      'Agar flashdisk tidak kehilangan daya baterai',
      'Mencegah kerusakan data karena proses tulis/baca file belum selesai sempurna',
      'Supaya flashdisk otomatis terformat',
      'Hanya sebagai formalitas tanpa fungsi teknis'
    ],
    kunci: 1,
    penjelasan: 'Safely Remove memastikan cache penulisan file telah selesai ditransfer ke flashdisk sebelum daya diputus.'
  },
  {
    id: 'eval_9',
    pertanyaan: 'Manakah contoh penamaan file yang baik, tertib, dan mencerminkan adab kerapian santri?',
    pilihan: [
      'tugasbaru_fix_banget_final.docx',
      'TugasTIK_Afifah_Kelas7_20261027.docx',
      'asdfghjk.txt',
      'tugas1(1)(2).pdf'
    ],
    kunci: 1,
    penjelasan: 'Nama file yang baik memuat topik tugas, nama pemilik, kelas, dan tanggal untuk memudahkan pencarian.'
  },
  {
    id: 'eval_10',
    pertanyaan: 'Langkah yang benar dan aman untuk mematikan komputer setelah selesai sesi praktikum adalah...',
    pilihan: [
      'Menekan tombol power pada CPU selama 10 detik',
      'Langsung mencabut kabel colokan listrik dari stopkontak',
      'Klik tombol Start -> pilih icon Power -> klik Shut Down dan tunggu hingga layar mati',
      'Menutup layar laptop secara mendadak saat aplikasi masih menyimpan data'
    ],
    kunci: 2,
    penjelasan: 'Prosedur Shut Down resmi memastikan seluruh program ditutup rapi dan berkas sistem tidak mengalami kerusakan (corrupt).'
  }
];

module.exports = {
  BANK_SOAL_MINI,
  BANK_SOAL_EVALUASI
};
