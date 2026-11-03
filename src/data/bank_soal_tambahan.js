'use strict';

/*
 * TAMBAHAN BANK SOAL — Lab Komputer: Modul 1 (aditif, tidak mengubah soal lama)
 *
 * Cara pakai: simpan sebagai src/data/bank_soal_tambahan.js, lalu di src/data/bank_soal.js
 * tepat di atas `module.exports` tambahkan:
 *
 *   const { TAMBAHAN_MINI, TAMBAHAN_EVALUASI } = require('./bank_soal_tambahan');
 *   BANK_SOAL_MINI[2].push(...TAMBAHAN_MINI[2]);
 *   BANK_SOAL_MINI[3].push(...TAMBAHAN_MINI[3]);
 *   BANK_SOAL_EVALUASI.push(...TAMBAHAN_EVALUASI);
 *
 * Catatan perilaku server (src/routes/santri.js):
 * - Mini kuis P1-P3 menampilkan SEMUA soal di bank sesi itu (tidak diacak/dibatasi).
 *   Setelah tambahan: P2 = 4 + 3 = 7 soal, P3 = 4 + 3 = 7 soal.
 * - XP kuis flat (30 XP bila skor >= 60), jadi jumlah soal tidak mengubah aturan XP.
 * - Evaluasi P4 mengacak lalu mengambil 5 soal; setelah tambahan: 10 + 4 = 14 soal di bank.
 * - Soal "review" (kode _r) menguji sesi sebelumnya dan ikut dihitung dalam skor sesi ini.
 * Semua ID baru unik; kunci = indeks jawaban benar (mulai dari 0).
 */

const TAMBAHAN_MINI = {
  2: [
    {
      id: 'p2_q5',
      pertanyaan: 'Gerakan touchpad di laptopmu tidak sama dengan contoh di layar (misalnya dua jari tidak menggulir). Sikap yang paling tepat adalah...',
      pilihan: [
        'Menyimpulkan bahwa kamu gagal belajar komputer dan berhenti berlatih',
        'Mencabut baterai laptop lalu menyalakannya lagi berkali-kali',
        'Memahami bahwa gestur touchpad bisa berbeda antartipe perangkat, lalu meminta guru memeriksa jenis perangkat dan pengaturannya',
        'Menekan semua tombol keyboard secara acak sampai touchpad bekerja'
      ],
      kunci: 2,
      penjelasan: 'Tidak semua touchpad memakai gestur yang sama. Perbedaan itu bukan kesalahanmu. Periksa tipe perangkat dan pengaturannya bersama guru, dan gunakan mouse atau tombol touchpad sebagai alternatif sementara.'
    },
    {
      id: 'p2_q6',
      pertanyaan: 'Kamu sedang mengetik di Notepad dan ingin berpindah ke File Explorer tanpa menutup Notepad. Tindakan manakah yang paling tepat?',
      pilihan: [
        'Menekan Alt + F4 supaya Notepad hilang dari layar',
        'Menekan Alt + Tab lalu memilih jendela File Explorer',
        'Menekan Ctrl + Z beberapa kali sampai File Explorer muncul',
        'Mematikan laptop lalu menyalakannya kembali'
      ],
      kunci: 1,
      penjelasan: 'Alt + Tab berpindah antarjendela yang sedang terbuka tanpa menutupnya. Alt + F4 justru menutup jendela, sedangkan Ctrl + Z hanya membatalkan perubahan terakhir pada aplikasi, bukan berpindah jendela.'
    },
    {
      id: 'p2_r1',
      pertanyaan: 'REVIEW SESI 1 — Di Biodata Komputer kamu mencatat RAM 8 GB. Manakah gambaran yang paling sesuai tentang fungsi RAM?',
      pilihan: [
        'Lemari arsip tempat tugas disimpan permanen dan dijamin aman selamanya',
        'Meja kerja sementara untuk program yang sedang berjalan; isinya umumnya hilang saat komputer dimatikan',
        'Chip yang mengolah semua instruksi program',
        'Layar yang menampilkan hasil pekerjaan'
      ],
      kunci: 1,
      penjelasan: 'RAM adalah memori kerja sementara. Tugas yang ingin dipertahankan harus disimpan sebagai berkas di SSD/HDD. Chip pemroses adalah CPU, dan tampilan hasil adalah tugas monitor (output).'
    }
  ],
  3: [
    {
      id: 'p3_q5',
      pertanyaan: 'Kamu menyimpan berkas Biodata Komputer lewat Save As, tetapi lupa memeriksa folder tujuan. Sekarang berkasnya tidak kelihatan di folder TIK. Langkah paling masuk akal adalah...',
      pilihan: [
        'Menyimpulkan berkas hilang dan membuat ulang tanpa mencari',
        'Menghapus folder TIK supaya komputer menampilkan ulang berkasnya',
        'Mengetik sebagian nama berkas (misalnya "Biodata") di kotak pencarian File Explorer, lalu melihat lokasi dan tanggal hasilnya',
        'Mengganti ekstensi berkas menjadi .pdf agar lebih mudah dicari'
      ],
      kunci: 2,
      penjelasan: 'Pencarian berdasarkan sebagian nama adalah cara paling cepat dan aman. Setelah ditemukan, periksa lokasi lengkapnya. Lain kali, selalu periksa folder tujuan pada jendela Save As sebelum menekan Simpan.'
    },
    {
      id: 'p3_q6',
      pertanyaan: 'Perhatikan alamat berikut: D:\\Data_Santri\\TIK\\Modul_1\\Biodata_Komputer_Aisyah.txt. Bagian manakah yang merupakan NAMA BERKAS lengkap?',
      pilihan: [
        'D:',
        'Data_Santri\\TIK',
        'Modul_1',
        'Biodata_Komputer_Aisyah.txt'
      ],
      kunci: 3,
      penjelasan: 'D: adalah drive, sedangkan Data_Santri, TIK, dan Modul_1 adalah folder. Bagian terakhir, Biodata_Komputer_Aisyah.txt, adalah berkas; ekstensi .txt menunjukkan jenisnya (teks polos).'
    },
    {
      id: 'p3_r1',
      pertanyaan: 'REVIEW SESI 2 — Saat mengetik data Biodata Komputer, mengapa ketelitian didahulukan sebelum kecepatan?',
      pilihan: [
        'Karena komputer akan rusak bila kita mengetik cepat',
        'Karena angka atau nama yang salah ketik membuat data tidak akurat, sedangkan kecepatan bisa meningkat bertahap lewat latihan',
        'Karena hanya orang yang mengetik lambat yang dianggap mahir',
        'Karena tombol Home Row hanya boleh ditekan satu kali per menit'
      ],
      kunci: 1,
      penjelasan: 'Salah ketik pada data penting (misalnya kapasitas RAM) bisa menyesatkan. Ketepatan, posisi jari, dan kenyamanan dibangun dulu; kecepatan menyusul seiring latihan.'
    }
  ]
};

const TAMBAHAN_EVALUASI = [
  {
    id: 'eval_11',
    pertanyaan: 'Kamu menyalin berkas Biodata Komputer ke subfolder Dokumen, sehingga ada dua salinan di dua lokasi. Kemudian kamu mengedit salah satunya. Apa yang terjadi pada salinan yang satu lagi?',
    pilihan: [
      'Ikut berubah otomatis karena namanya sama',
      'Terhapus otomatis oleh Windows',
      'Tidak berubah, karena salinan adalah berkas terpisah; tanggal modifikasi membantu mengenali mana yang terbaru',
      'Berubah menjadi shortcut'
    ],
    kunci: 2,
    penjelasan: 'Hasil Copy adalah berkas baru yang berdiri sendiri. Perubahan pada satu salinan tidak mengubah salinan lain, jadi periksa tanggal modifikasi dan isi bila perlu menentukan versi terbaru.'
  },
  {
    id: 'eval_12',
    pertanyaan: 'Temanmu memakai Windows 11 dan tidak menemukan tab Home dengan tombol bertuliskan "Rename" seperti di Windows 10. Cara mana yang berlaku di kedua versi untuk mengganti nama berkas?',
    pilihan: [
      'Pilih berkas lalu tekan F2, ketik nama baru, tekan Enter',
      'Menghapus berkas lalu membuat ulang dari awal',
      'Menutup File Explorer dan mengganti nama lewat Control Panel',
      'Mengganti nama hanya bisa dilakukan di Windows 10'
    ],
    kunci: 0,
    penjelasan: 'Letak tombol di File Explorer berbeda antara Windows 10 dan 11, tetapi pintasan F2 bekerja di keduanya. Memahami fungsi lebih penting daripada menghafal letak tombol.'
  },
  {
    id: 'eval_13',
    pertanyaan: 'Kamu hanya ingat kata "Biodata" dari nama sebuah berkas tugas. Cara paling efisien untuk menemukannya adalah...',
    pilihan: [
      'Membuka seluruh folder satu per satu tanpa batas waktu',
      'Membuat ulang berkasnya dari awal',
      'Mengetik "Biodata" di kotak pencarian File Explorer dari folder induk yang masuk akal, lalu memeriksa lokasi dan tanggal hasilnya',
      'Menghapus semua berkas lain agar hanya tersisa satu'
    ],
    kunci: 2,
    penjelasan: 'Pencarian berdasarkan sebagian nama, dimulai dari folder induk yang masuk akal, menghemat waktu. Jangan menghapus berkas lain hanya untuk mempermudah pencarian.'
  },
  {
    id: 'eval_14',
    pertanyaan: 'Setelah menata berkas pada proyek "Tugas TIK Rapi", apa bukti paling kuat bahwa hasilmu sudah benar?',
    pilihan: [
      'Merasa yakin tanpa membuka kembali foldernya',
      'Membuka kembali struktur folder, memeriksa nama dan lokasi tiap berkas, lalu berhasil menemukan satu berkas lewat pencarian',
      'Menutup semua jendela dengan cepat sebelum teman selesai',
      'Menghapus semua berkas yang namanya mirip'
    ],
    kunci: 1,
    penjelasan: 'Verifikasi berarti memeriksa hasil secara langsung: struktur folder, nama, lokasi, dan kemampuan menemukan kembali berkas. Kecepatan bukan ukuran utama.'
  }
];

module.exports = {
  TAMBAHAN_MINI,
  TAMBAHAN_EVALUASI
};
