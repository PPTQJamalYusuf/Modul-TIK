# Tambahan Materi Modul 1: Benang Merah "Misi Admin Lab" dan Panduan Windows 10/11

**Sifat dokumen:** tambahan murni untuk *Materi_Lab_Komputer_Modul_1.md*. Tidak mengubah isi materi, autentikasi, progres, XP, atau leaderboard yang sudah ada.
**Penempatan:** Bagian 1 dan 2 sebagai kartu tambahan di akhir tiap sesi; Bagian 3 sebagai tab/accordion "Beda Windows 10 dan 11"; Bagian 4 sebagai label di materi.

---

## 1. Benang merah: Biodata Komputerku

**Ide:** satu berkas kecil milik santri dibawa dari Sesi 1 sampai Sesi 4, sehingga keempat sesi terasa sebagai satu cerita: *kenali komputermu → ketik datanya → simpan di rumah yang benar → rawat dengan operasi berkas.*

**Aturan keamanan (tetap sejalan dengan naskah utama):** Berkas Biodata Komputer hanya berisi nama, kelas, dan data identitas komputer lab. Jangan menulis kata sandi atau data pribadi santri. Penghapusan hanya dilatih pada **salinan** berkas yang diberi tanda "boleh dihapus" atau pada berkas dummy, bukan pada berkas milik orang lain.

**Format Biodata Komputer (teks polos, `.txt`):**

```text
BIODATA KOMPUTERKU
Nama Santri       : 
Kelas / Halaqah   : 
Nama Perangkat    : 
Otak (Prosesor)   : 
Meja Kerja (RAM)  : 
Sistem Operasi    : 
Lemari Simpan (C:): (ditambah di Sesi 3)
```

| Sesi | Misi santri | Hasil (artefak) | Kalimat jembatan ke sesi berikutnya |
|---|---|---|---|
| 1 Sahabat Komputer | Buka **Settings > System > About** (atau klik kanan tombol Start lalu pilih **System**). Catat nama perangkat, prosesor, RAM terpasang, dan versi Windows. | 4 data identitas komputer tercatat (di kertas atau lisan ke guru). | "Kamu sudah menemukan biodata komputermu. Sekarang kita latih jari agar bisa mengetik data itu dengan teliti." |
| 2 Jari Sakti dan Mouse | Buka Notepad (klik Start, ketik *Notepad*). Ketik Biodata Komputer memakai latihan Home Row dan Shift untuk huruf kapital. Simpan sementara di Desktop dengan nama `biodata_komputer.txt`. | `biodata_komputer.txt` di Desktop. | "Biodata komputermu sudah jadi, tetapi masih tergeletak di Desktop. Ke mana sebaiknya disimpan supaya mudah ditemukan lagi?" |
| 3 Rumah Berkas | Buat folder `TIK\Modul_1` di lokasi yang ditentukan guru. Simpan ulang dengan **Save As** memakai nama sesuai aturan, misalnya `Biodata_Komputer_Aisyah_Kelas7.txt`. Tambahkan baris kapasitas drive C: dengan melihat **This PC** atau **Settings > System > Storage**. Cari berkas lewat sebagian nama. | Berkas Biodata Komputer lengkap di folder yang benar. | "Biodata komputermu sudah punya rumah. Sekarang kita belajar merawatnya: menyalin, mengganti nama, dan menghapus dengan aman." |
| 4 Operasi Berkas | Pada proyek **Tugas TIK Rapi**, berkas Biodata Komputer dipakai sebagai satu berkas tambahan: salin ke subfolder `Dokumen`, ganti nama sesuai aturan kelas, cari lewat sebagian nama, lalu hapus dan pulihkan **salinan** yang ditandai boleh dihapus. | Struktur folder rapi berisi Biodata Komputer dan berkas dummy. | Penutup modul: tampilkan peta konsep di bawah dan 3 pertanyaan refleksi. |

**Peta konsep penutup Sesi 4:**
`Komputer (hardware + software + data + pengguna)` → `Alur input-proses-output-penyimpanan` → `Sistem operasi dan navigasi` → `Mengendalikan komputer (mouse, keyboard)` → `Berkas, folder, path` → `Operasi berkas yang aman`.

**Refleksi penutup (3 pertanyaan):**
1. Bagian Biodata Komputer mana yang paling membantumu memahami cara kerja komputer?
2. Kebiasaan apa yang akan kamu lakukan sebelum menekan Delete atau Cut?
3. Jika berkas Biodata Komputermu "hilang", langkah pertama apa yang kamu lakukan?

---

## 2. Review pembuka dan pengecekan awal (tanpa nilai)

**Review pembuka 3 menit** (dibacakan guru atau ditampilkan sebagai kartu; tidak memengaruhi XP):

| Sesi | Pertanyaan review |
|---|---|
| 2 | Sebutkan satu perbedaan RAM dan SSD. Apa yang kamu catat di Biodata Komputer kemarin? |
| 3 | Mengapa kita mengetik dengan teliti dulu sebelum cepat? Di mana berkas Biodata Komputermu sekarang? |
| 4 | Di mana berkas Biodata Komputermu disimpan, dan apa isi path lengkapnya? |

**Pengecekan awal Sesi 1** (lisan atau angkat tangan, **tanpa nilai**, tujuannya agar guru tahu level kelas):
1. Siapa yang pernah memakai laptop atau komputer sendiri? Seberapa sering?
2. Siapa yang pernah membuat atau memindahkan berkas sendiri?
3. Siapa yang pernah kehilangan tugas di komputer?
4. Satu hal tentang komputer yang masih kamu bingungkan?

Soal review tertulis juga tersedia di `bank_soal_tambahan.js` (kode `p2_r1` dan `p3_r1`).

---

## 3. Panduan Windows 10 vs 11

> **Catatan verifikasi:** tampilan dapat berbeda menurut versi pembaruan Windows. Guru perlu mencocokkan tabel ini dengan laptop lab sebelum dipakai di kelas. Pintasan keyboard bekerja sama di kedua versi.

| Aksi | Windows 10 | Windows 11 | Sama di keduanya |
|---|---|---|---|
| Membuka Settings | Start > ikon roda gigi | Start > Settings | `Windows + I` |
| Melihat spesifikasi | Settings > System > About | Settings > System > About | Klik kanan Start > System |
| Menampilkan ekstensi file | File Explorer > tab **View** > centang **File name extensions** | File Explorer > **View** > **Show** > **File name extensions** | Konsep sama: nama lengkap tampil dengan akhiran seperti `.txt` |
| Membuat folder baru | Tab **Home** > **New folder** | Tombol **New** > **Folder** | `Ctrl + Shift + N` |
| Mengganti nama | Tab **Home** > **Rename** | Ikon Rename di bilah perintah atas | `F2` |
| Copy / Cut / Paste | Tombol di tab **Home** | Ikon di bilah perintah atas (tanpa teks) | `Ctrl + C`, `Ctrl + X`, `Ctrl + V` |
| Menghapus | Tab **Home** > **Delete** | Ikon tempat sampah di bilah perintah | `Delete` |
| Memulihkan dari Recycle Bin | Pilih berkas > tab **Recycle Bin Tools** > **Restore the selected items** | Pilih berkas > tombol **Restore the selected items** di bilah perintah | Klik kanan berkas > **Restore** |
| Menu klik kanan | Menu lengkap langsung tampil | Menu lebih ringkas; pilih **Show more options** untuk menu lengkap | `Shift + F10` membuka menu lengkap |
| Tampilan Details | Tab **View** > **Details** | Tombol **View** > **Details** | — |
| Melepas USB dengan aman | Ikon USB di area notifikasi (mungkin di panah ^) > **Eject** | Sama; atau File Explorer > **This PC** > klik kanan drive > **Eject** | Tunggu pesan aman dilepas |
| Mengunci layar | — | — | `Windows + L` |
| Berpindah jendela | — | — | `Alt + Tab`, `Windows + D` |

**Tip kelas campuran:** ajarkan pintasan keyboard lebih dulu (berlaku di keduanya), lalu minta santri mencocokkan letak tombol di versi Windows masing-masing. Jika ada tombol yang tidak ditemukan, santri bertanya ke guru atau teman sebangku, bukan mencoba menekan tombol acak.

---

## 4. Peta "Inti 40 menit" vs "Pengayaan"

Hanya pelabelan, tidak ada materi yang dihapus. Pengayaan boleh dilewati bila waktu habis dan dikerjakan sebagai latihan mandiri atau di pertemuan penguatan.

| Sesi | INTI (wajib dalam 40 menit) | PENGAYAAN (opsional) |
|---|---|---|
| 1 | Alur input-proses-output-penyimpanan; komponen utama; RAM vs SSD; fungsi sistem operasi; navigasi jendela dasar; Misi 1 Biodata Komputerku | Perangkat pendukung dunia kerja (printer, scanner, proyektor, dll.); detail etika lab; Windows + L |
| 2 | Klik, klik ganda, klik kanan, seret-lepas; Home Row; pintasan dasar (`Windows + E`, `Alt + Tab`, `Ctrl + C/V`); Misi 2 Biodata Komputerku | Postur dan ergonomi detail; pintasan tambahan; game level sulit |
| 3 | File vs folder vs drive; path; ekstensi; aturan penamaan; Save As; pencarian; Misi 3 Biodata Komputerku | Kapasitas dan satuan file; drive C:, D:, dan USB; backup dan keamanan berkas |
| 4 | Copy vs Cut; Rename; Delete dan Restore; proyek Tugas TIK Rapi (langkah 1-8) | Konflik nama berkas; batas Ctrl + Z; mematikan komputer; proyek langkah 9-11 (penjelasan lisan) |

---

## 5. Catatan implementasi untuk coding agent

- Tambahkan konten di atas sebagai **kartu baru**; jangan menghapus atau menulis ulang kartu yang sudah ada.
- Jangan mengubah autentikasi, progres, XP, leaderboard, database, atau kontrol pertemuan.
- Misi Biodata Komputerku dilakukan di laptop asli santri (Notepad/File Explorer); aplikasi hanya menampilkan instruksi dan, jika sudah ada fitur checklist praktik, mencatat konfirmasi santri. Aplikasi tidak boleh membaca atau mengubah berkas lokal santri.
- Gunakan data dummy untuk semua simulasi penghapusan dan konflik nama.
- Tampilkan tabel Windows 10/11 sebagai tab atau accordion agar layar tidak panjang.
- Setelah perubahan, jalankan aplikasi dan uji tiap sesi; laporkan hanya tes yang benar-benar dijalankan.
