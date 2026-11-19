---
version: alpha
name: KREASI.ID
description: Sistem desain website pengembangan potensi diri untuk peserta didik SMP.
colors:
  primary: "#304BE4"
  primary-hover: "#2337B7"
  on-primary: "#FFFAEE"
  secondary: "#FF7EA1"
  tertiary: "#A2EFE3"
  canvas: "#FFFAEE"
  surface: "#FFFFFF"
  ink: "#241831"
  muted: "#594D63"
  divider: "#E4DAE1"
  error: "#A22A46"
  error-surface: "#FFF0F4"
  success: "#176050"
  activity-blue: "#E8EDFF"
  activity-yellow: "#FFF1C5"
  activity-green: "#E5F4D8"
  activity-lilac: "#F0E8FF"
  activity-pink: "#FFE6EE"
typography:
  headline-display:
    fontFamily: Bricolage Grotesque
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.035em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 44px
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
  title-md:
    fontFamily: Bricolage Grotesque
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  label-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.25
  label-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.3
  headline-display-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: 800
    lineHeight: 1.12
  headline-md-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
rounded:
  input: 12px
  card: 20px
  hero-mobile: 24px
  hero: 32px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section-mobile: 40px
  section-desktop: 64px
  container: 1200px
  reading: 720px
  touch: 44px
components:
  hero:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.hero}"
    padding: "{spacing.xl}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: 20px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-on-hero:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.ink}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: 20px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 48px
    padding: 20px
  content-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  activity-card-self-check:
    backgroundColor: "{colors.activity-blue}"
    textColor: "{colors.ink}"
  activity-card-kenali-potensi:
    backgroundColor: "{colors.activity-yellow}"
    textColor: "{colors.ink}"
  activity-card-mengembangkan-potensi:
    backgroundColor: "{colors.activity-green}"
    textColor: "{colors.ink}"
  activity-card-kuis:
    backgroundColor: "{colors.activity-lilac}"
    textColor: "{colors.ink}"
  activity-card-refleksi:
    backgroundColor: "{colors.activity-pink}"
    textColor: "{colors.ink}"
  activity-card-action-plan:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.ink}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.input}"
    height: 48px
    padding: 12px
  field-selected:
    backgroundColor: "{colors.activity-blue}"
    textColor: "{colors.ink}"
  field-error:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error}"
  personal-note:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "{spacing.md}"
  success-message:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.success}"
  supporting-text:
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
  separator:
    backgroundColor: "{colors.divider}"
    height: 1px
---

# KREASI.ID — Design System & UI Brief

## Overview

KREASI.ID membantu siswa SMP kelas VII–IX mengenali minat dan kemampuan, mencoba cara mengembangkannya, serta memilih satu langkah nyata. Pengalaman terasa seperti membuka buku kegiatan sekolah yang dipandu dengan ramah. Desain mendukung sesi mandiri dan bimbingan klasikal bersama guru BK.

- **Referensi 1 · palet krem, pink, mint.** Pertahankan ketiga warna aslinya. Ambil bentuk membulat dan tekstur titik cetak yang halus untuk detail ilustrasi.
- **Referensi 2 · landing page biru.** Ambil hero kobalt dengan sudut besar, judul tebal di kiri, ilustrasi di kanan, tombol kapsul, ruang kosong yang lega, dan ritme kartu yang teratur.
- **Penerapan di KREASI.ID.** Gunakan header krem dan hero biru kobalt sebagai tafsir visual baru atas usulan header biru tua di PRD §5. Buat ilustrasi orisinal berupa dua siswa SMP Indonesia dengan buku catatan dan kertas latihan. Tambahkan satu pita mint sebagai aksen arah, satu bidang pink kecil, dan tekstur titik lokal pada ilustrasi. Gunakan gaya ilustrasi editorial 2D dengan pakaian sekolah wajar, tanpa logo sekolah atau teks di dalam gambar.

Nama menu, urutan kegiatan, dan perilaku produk mengacu pada [PRD KREASI.ID](PRD.md). Nama merek ditulis **KREASI.ID**, dengan kepanjangan **Kenali, Refleksikan, Eksplorasi, dan Aktualisasikan Potensi Diri** pada halaman Tentang.

## Colors

| Warna                                       | Peran                                                                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Krem `#FFFAEE`                              | Latar utama, header, dan teks di atas hero kobalt.                                                                               |
| Pink `#FF7EA1`                              | Aksen merek pada bentuk, ilustrasi, dan detail kecil. Pasangkan dengan tinta gelap jika bidang pink memuat tulisan.              |
| Mint `#A2EFE3`                              | Tombol utama pada hero, panel catatan pribadi, dan kartu Action Plan. Pasangkan dengan tinta gelap.                              |
| Kobalt `#304BE4`                            | Hero, tombol utama di halaman dalam, tautan, dan pilihan aktif. Krem di atas kobalt memiliki rasio 6,20:1.                       |
| Tinta `#241831` dan sekunder `#594D63`      | Judul, isi, label, dan petunjuk pada bidang terang. Tinta di atas pink dan mint masing-masing memiliki rasio 7,00:1 dan 12,79:1. |
| Putih `#FFFFFF`                             | Panel baca, pertanyaan, dan isian. Gunakan garis `#81778E` sebagai batas input dan `divider` sebagai pembagi dekoratif.          |
| Merah tua `#A22A46` dan hijau tua `#176050` | Pesan kesalahan dan penanda berhasil yang disertai label atau ikon.                                                              |

Gunakan kartu pastel dan teks tinta gelap di keenam kartu. Judul dan ikon membawa makna kartu. Pink terang dan mint berfungsi sebagai bidang atau aksen, dengan teks utama tetap mencapai kontras **4,5:1**. Batas kontrol dan indikator fokus ditargetkan minimal **3:1** terhadap warna yang bersebelahan. Gunakan kobalt untuk outline fokus 2 px pada bidang terang dan krem untuk fokus di hero, dengan jarak 3 px dari kontrol.

## Typography

Bricolage Grotesque memberi bentuk yang ekspresif pada judul. DM Sans menjaga isian, materi, dan petunjuk mudah dibaca. Gunakan system sans-serif sebagai fallback.

| Elemen              | Desktop                       | Ponsel                        |
| ------------------- | ----------------------------- | ----------------------------- |
| Judul hero          | 64 px, 800, tinggi baris 1,04 | 40 px, 800, tinggi baris 1,05 |
| Judul halaman       | 44 px, 750, tinggi baris 1,12 | 32 px, 750, tinggi baris 1,12 |
| Judul bagian        | 28 px, 700                    | 24 px, 700                    |
| Judul kartu         | 22 px, 700                    | 22 px, 700                    |
| Isi dan label utama | 16 px                         | 16 px                         |
| Petunjuk singkat    | 14 px                         | 14 px                         |

Ratakan teks ke kiri, batasi panjang baris materi sekitar 60–70 karakter, dan biarkan judul membungkus alami di lebar 360 px. Gunakan satu H1 per halaman, lalu H2 untuk bagian. Pengantar hero boleh memakai 18 px pada desktop.

## Layout

| Lebar layar     | Grid beranda                                       | Struktur halaman                                                                                                                                  |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 360–767 px      | Satu kolom, tepi 16 px, jarak antarkartu 12–16 px. | Wordmark dan tombol **Menu** di header. Hero menempatkan judul, pengantar, dan tombol sebelum ilustrasi. Formulir dan navigasi tersusun vertikal. |
| 768–1023 px     | Dua kolom, tepi 24 px, jarak 16 px.                | Hero dua kolom jika judul dan tombol tetap muat. Gunakan menu ringkas jika label navigasi mulai membungkus.                                       |
| 1024 px ke atas | Tiga kolom × dua baris, jarak 20–24 px.            | Kanvas maksimal 1.200 px dengan tepi minimal 32 px. Hero 60% teks dan 40% ilustrasi. Materi serta formulir berada dalam kolom maksimal 720 px.    |

Gunakan frame **1440 px desktop** dan **390 px ponsel** untuk generasi pertama. Uji tambahan pada 360 px, 768 px, dan zoom 200%. Jarak antarseksi sekitar 64 px pada desktop dan 40 px pada ponsel.

**Kerangka beranda**  
Header → hero → **Pilih kegiatan** → enam kartu → **Butuh bantuan?** → footer.

**Kerangka halaman inti**  
Header → **Langkah N dari 6** → judul dan petunjuk → materi atau kegiatan → navigasi sebelumnya dan berikutnya → footer.

Urutan langkah menunjukkan posisi halaman. Pengguna bisa masuk langsung melalui kartu atau menu tanpa membuka langkah sebelumnya. Pada ponsel, letakkan tindakan utama setelah isi dan tempatkan tautan kembali di bawahnya. Pertahankan penempatan fokus berdasarkan urutan baca. Footer ringkas memuat **Tentang KREASI.ID**, **Kontak dan Bantuan**, dan tautan **Privasi** menuju bagian privasi di halaman Tentang.

## Elevation & Depth

Bangun hierarki dengan bidang kobalt, kanvas krem, kartu pastel, dan panel putih. Kartu biasa datar dengan garis tipis jika batasnya perlu diperjelas. Panel menu yang terbuka boleh memakai bayangan ringan, misalnya offset 0 × 8 px, blur 24 px, tinta dengan opasitas 10%. Tekstur titik berada di ilustrasi dan sudut hero, di luar area judul, tombol, dan isian.

## Shapes

Hero memakai radius 32 px pada desktop dan 24 px di ponsel. Kartu memakai 20 px. Input, area teks, dan panel info memakai 12 px. Tombol berlabel boleh berbentuk kapsul. Gunakan keluarga ikon garis membulat dengan ketebalan yang konsisten. Ikon aksi berdampingan dengan label yang jelas.

## Motion & Micro-interaction

Implementasi bersama menggunakan transisi keadaan 160 ms, pembukaan panel 220 ms, dan pergeseran indikator navbar 320 ms. Tombol utama setinggi 48 px memakai teks 16 px. Tombol ringkas setinggi minimal 44 px memakai teks 14 px. Hover tombol mengangkat permukaan 2 px, sedangkan tekanan mengembalikannya dengan skala 0,98. Preferensi pengurangan gerak meniadakan perpindahan tombol. Ringkasan hasil muncul di halaman yang sama dan dapat ditemukan pengguna pembaca layar.

Navbar desktop memakai panel membulat dengan indikator notch kobalt yang mengikuti halaman aktif. Kegiatan membuka daftar enam aktivitas. Navbar ponsel memakai menu yang dapat dibuka dengan penanda halaman aktif dan tombol Masuk. Judul halaman memakai skala 32/44 px, judul bagian 24/28 px, isi 16 px, dan teks pendukung 14 px. Kolom baca selebar maksimal 720 px dipusatkan pada kanvas.

## Voice & Content Strategy

Gunakan bahasa Indonesia yang hangat, langsung, dan sesuai usia SMP. Sapa siswa dengan **kamu**. Gunakan nama menu dari PRD, kalimat pendek, dan label tombol yang menyatakan tindakan. Materi menggunakan contoh sekolah atau rumah yang mudah dicoba.

| Momen                         | Teks UI                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero                          | **Kenali potensi, mulai langkahmu.** / “KREASI.ID membantumu mengenali minat, mencoba cara melatih kemampuan, dan membuat rencana sederhana.” / **Mulai Self-check** |
| Self-check, belum ada pilihan | “Pilih kegiatan yang cocok denganmu, atau lanjut membaca materi jika kamu belum yakin.”                                                                              |
| Refleksi, pemberitahuan       | “Kamu boleh menulis di sini atau di buku catatan. Isian di halaman ini bersifat sementara dan akan hilang saat kamu keluar.”                                         |
| Kuis, sebelum membuka tautan  | “Kuis ini membantumu mengecek pemahaman materi. Google Forms akan terbuka di tab baru.”                                                                              |
| Action Plan, petunjuk         | “Salin rencanamu ke buku atau catatan pribadi sebelum keluar jika ingin membacanya kembali.”                                                                         |
| Action Plan, tujuan kosong    | “Tulis hasil yang ingin kamu capai, misalnya menjelaskan satu topik dalam dua menit.”                                                                                |
| Bantuan                       | “Kalau kamu butuh teman berdiskusi tentang rencanamu, temui guru BK di sekolah.”                                                                                     |

Judul dan tombol mengikuti penamaan produk. Isi utama selalu tampil sebagai teks antarmuka. Pada mockup, gunakan jawaban contoh tanpa identitas, seperti “Latihan presentasi bareng teman”. Penjelasan masa simpan kuis memakai angka rancangan 30 hari khusus sebagai contoh desain sampai pengelola menyetujui angka final.

## Components

| Komponen                         | Anatomi dan perilaku                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header                           | Wordmark **KREASI.ID** menuju Beranda. Pada desktop, tampilkan **Beranda**, **Tentang KREASI.ID**, **Menu**, **Tips**, dan **Kontak dan Bantuan**. **Menu** membuka daftar enam kegiatan. Pada ponsel, satu tombol **Menu** membuka panel vertikal dengan seluruh navigasi dan enam tautan di bawah label **Kegiatan**. Tunjukkan halaman aktif melalui teks tebal dan garis bawah. |
| Tombol dan tautan                | Tombol primer kobalt, tombol hero mint, tombol sekunder outline kobalt, dan tautan teks bergaris bawah. Kontrol minimal 44 × 44 px termasuk menu, ikon tutup, dan pilihan. Gunakan 48 px untuk tombol utama. Sediakan keadaan default, hover, fokus, aktif, dan nonaktif jika memang tidak tersedia.                                                                                |
| Kartu kegiatan                   | Satu tautan mencakup kartu dengan ikon 24 px, judul, deskripsi singkat, dan panah. Desktop menggunakan tata letak vertikal di dalam kartu. Ponsel menempatkan ikon di kiri, judul dan deskripsi di tengah, dan panah di kanan.                                                                                                                                                      |
| Penanda langkah                  | Teks **Langkah N dari 6** di atas H1, dengan enam segmen tipis opsional. Segmen menandai posisi saat ini. Label teks tetap sumber informasi utama tanpa memerlukan penyimpanan kemajuan.                                                                                                                                                                                            |
| Pilihan dan isian                | Checkbox untuk pilihan jamak Self-check dan radio untuk kuis lokal. Satu baris penuh dapat dipilih. Label selalu di atas area teks. Input teks tinggi minimal 48 px. Area teks minimal 104 px. Gunakan placeholder hanya untuk contoh.                                                                                                                                              |
| Info, umpan balik, dan kesalahan | Info privasi berwarna mint atau biru pucat dengan ikon dan teks. Pesan error memakai garis merah tua dan teks langsung di bawah isian. Status hasil dijelaskan dalam teks tanpa mengandalkan simbol atau warna saja.                                                                                                                                                                |
| Rangkuman aktivitas              | Panel putih berjudul **Catatanku** atau **Rencanaku**. Tampilkan label dan isi sebagai teks yang dapat dipilih. Aksi **Ubah Jawaban** atau **Ubah Rencana** kembali ke isian. Aksi hapus tersedia sebagai tautan berlabel dengan konfirmasi singkat ketika ada isi.                                                                                                                 |
| Jalur cadangan                   | Bagian teks bawaan halaman tetap menampilkan prompt Self-check/Refleksi, template Action Plan, dan latihan kuis. Posisikan instruksi alternatif dekat aktivitas, sehingga tetap dapat ditemukan saat sematan gagal atau Google Forms tidak bisa diakses.                                                                                                                            |

## Do's and Don'ts

- Prioritaskan satu tindakan utama per area keputusan. Pada beranda, tindakan utama adalah **Mulai Self-check**. Pada formulir, tindakan utamanya adalah melihat hasil, dengan tombol antarhalaman berjarak jelas.
- Pakai latar, ikon, dan ritme kartu dari referensi untuk kebutuhan siswa. Nilai kuis ditampilkan sebagai umpan balik belajar. Self-check dan refleksi berfokus pada pilihan dan catatan pribadi.
- Lindungi perhatian pengguna dengan dekorasi terbatas pada hero dan ilustrasi. Hindari ticker, carousel otomatis, badge dekoratif, latar gradasi neon, dan judul berulang.
- Ruang lingkup UI adalah media BK dengan pendaftaran, login, status verifikasi, dan panel persetujuan superadmin. Terapkan palet dan tipografi yang sama pada alur akun.
- Gunakan panel konten yang dapat direkonstruksi sebagai blok Google Sites. Tampilkan Google Forms sebagai tujuan tautan eksternal dengan petunjuk kembali dan latihan cadangan.

## Rancangan layar

### Beranda

Mulai dengan header krem. Di bawahnya, isi panel kobalt dengan judul dalam maksimal tiga baris, pengantar, dan tombol mint di kiri. Ilustrasi siswa berada di kanan. Pada ponsel, judul dan tombol terlihat sebelum ilustrasi. Jaga gambar agar tidak menutupi teks atau melewati tepi layar. Tampilkan keenam kartu di bawah judul **Pilih kegiatan**.

| Langkah | Judul kartu           | Deskripsi kartu                                    | Warna        | Ikon           |
| ------- | --------------------- | -------------------------------------------------- | ------------ | -------------- |
| 1       | Self-check            | Kenali kegiatan dan kemampuan yang menarik buatmu. | Biru pucat   | Kompas         |
| 2       | Kenali Potensi        | Pahami cara mengenali minat dan kemampuanmu.       | Kuning pucat | Lampu ide      |
| 3       | Mengembangkan Potensi | Temukan langkah untuk melatih kemampuanmu.         | Hijau pucat  | Tunas          |
| 4       | Kuis                  | Cek pemahamanmu tentang materi.                    | Lilac pucat  | Daftar periksa |
| 5       | Refleksi              | Pikirkan hal yang ingin kamu coba atau pelajari.   | Pink pucat   | Buku terbuka   |
| 6       | Action Plan           | Susun langkah yang bisa kamu mulai.                | Mint         | Target         |

Setelah kartu, gunakan satu panel bantuan dengan teks singkat dan tautan **Kontak dan Bantuan**. Bagian ini menutup halaman tanpa mengulang ajakan pada hero.

### Langkah 1 · Self-check

Setelah H1 dan instruksi **“Kamu boleh memilih lebih dari satu jawaban atau melewati pertanyaan”**, tampilkan lima kelompok checkbox dalam satu halaman. Gunakan beberapa pilihan yang sesuai per pertanyaan dan sertakan **Belum tahu** atau **Lainnya** tanpa meminta keterangan identitas.

1. Kegiatan apa yang paling kamu sukai?
2. Kemampuan apa yang kamu rasa sudah kamu punya?
3. Aktivitas apa yang membuatmu tertarik?
4. Pengalaman apa yang terasa menyenangkan bagimu?
5. Kegiatan atau bidang apa yang ingin kamu coba?

**Lihat Catatanku** membuka rangkuman berdasarkan kelompok yang dijawab dan ajakan memilih satu hal untuk dicoba. Keadaan kosong menggunakan teks pada tabel konten. Sediakan **Ubah Jawaban**, **Hapus Jawaban**, **Kembali ke Beranda**, dan **Lanjut ke Kenali Potensi**. Jika komponen gagal tampil, pengguna masih dapat membaca kelima pertanyaan dalam teks halaman.

### Langkah 2 · Kenali Potensi

Gunakan urutan **Apa itu potensi diri?**, **Minat, bakat, kemampuan, dan potensi**, **Ragam potensi**, **Cara mengenalinya**, lalu **Mengapa mulai sekarang?**. Empat istilah mendapat definisi pendek dan masing-masing satu contoh. Pertahankan materi sebagai teks yang mengalir satu kolom. Sorot satu contoh dalam panel kuning pucat. Contoh UI: “Kalau kamu senang menjelaskan pelajaran ke teman, coba latih cara menyampaikan ide lewat presentasi kelompok.” Gunakan **Kembali ke Self-check** dan **Lanjut ke Mengembangkan Potensi**.

### Langkah 3 · Mengembangkan Potensi

Gunakan satu pengantar manfaat, lalu bagian **Berlatih bertahap**, **Coba kegiatan baru**, **Pilih kegiatan akademik atau nonakademik**, **Hadapi hambatan**, dan **Minta dukungan**. Tampilkan dua contoh sederhana, misalnya menjelaskan satu topik kepada teman dan berlatih menggambar satu objek yang ada di rumah. Setiap contoh memuat kegiatan, langkah pertama, hambatan, dan sumber dukungan. Gunakan **Kembali ke Kenali Potensi** dan **Lanjut ke Kuis**.

### Langkah 4 · Kuis

Pada halaman **Kuis Pemahaman Materi**, tampilkan pengantar enam soal dan arahan untuk membuka nilai serta pembahasan setelah mengirim jawaban. Di dekat CTA, tampilkan pemberitahuan bahwa jawaban, nilai, dan waktu pengiriman dapat diakses pengelola yang ditugaskan, beserta masa simpan yang disepakati.

- **Buka Kuis** adalah tautan eksternal dengan keterangan “Terbuka di tab baru”. Di Forms siswa mengerjakan soal, mengirim, dan melihat skor individu serta pembahasan. Setelah itu siswa kembali ke tab KREASI.ID. Tampilan hasil sebagai bagian dari UI KREASI.ID hanya digunakan bila kuis berjalan lokal.
- Bagian **Latihan cadangan** selalu dapat dibuka. Buat soal singkat dengan kontrol **Lihat Pembahasan** pada tiap soal. Contoh pembahasan: “Mulai dari latihan singkat agar kamu bisa mencoba, mendapat masukan, dan memperbaiki langkah berikutnya.”
- Jika kuis lokal dipilih, desain enam soal radio wajib dengan satu jawaban per soal, pesan jika ada yang terlewat, dan ringkasan **4 dari 6 jawaban benar** sebagai contoh hasil. Tampilkan pembahasan serta **Ulangi Kuis**.
- Akhiri dengan **Kembali ke Mengembangkan Potensi** dan **Lanjut ke Refleksi**, termasuk ketika siswa memakai latihan cadangan.

### Langkah 5 · Refleksi

Tampilkan pemberitahuan privasi di atas enam area teks opsional. Sertakan alternatif **Tulis di buku catatan** melalui petunjuk dan pertanyaan teks yang tetap terbaca di halaman.

1. Potensi apa yang mulai kamu kenali?
2. Kegiatan apa yang paling kamu sukai?
3. Kemampuan apa yang ingin kamu latih?
4. Pengalaman baru apa yang kamu dapatkan?
5. Hambatan apa yang mungkin kamu hadapi?
6. Dukungan apa yang kamu butuhkan?

Sediakan **Hapus Jawaban**, **Kembali ke Kuis**, dan **Lanjut ke Action Plan**. Siswa boleh lanjut dari keadaan kosong. Saat berpindah, tulisan tetap pribadi dan isian Action Plan dimulai kosong.

### Langkah 6 · Action Plan

Gunakan judul **Action Plan** dan pengantar **“Susun satu rencana kecil yang bisa kamu mulai.”** Tampilkan bagian **Lihat Contoh Rencana** dan petunjuk menyalin rencana untuk disimpan sendiri. Tempatkan form dalam satu kolom.

| Label                    | Kontrol             | Contoh isi                                    |
| ------------------------ | ------------------- | --------------------------------------------- |
| Potensi atau kemampuan   | Input teks, wajib   | Berbicara di depan kelompok                   |
| Tujuan                   | Input teks, wajib   | Menjelaskan satu topik selama dua menit       |
| Langkah atau kegiatan    | Area teks, wajib    | Latihan bersama teman dua kali sepekan        |
| Target waktu             | Input teks, wajib   | Dalam dua minggu sejak mulai                  |
| Cara memantau            | Area teks, wajib    | Catat durasi latihan dan satu masukan         |
| Evaluasi setelah mencoba | Area teks, opsional | Latihan berikutnya, aku mau memperbaiki tempo |

**Lihat Rencanaku** membuka panel berisi label dan jawaban yang bisa disalin manual. Jika isian wajib masih kosong, tampilkan pesan pada tiap isian yang perlu dilengkapi, pindahkan fokus ke isian pertama yang bermasalah, dan pertahankan jawaban lain. Rangkuman boleh menampilkan status “Diisi setelah mencoba” pada evaluasi yang kosong. Tawarkan **Ubah Rencana** dan **Hapus Isian**. Template teks enam bagian tetap dapat digunakan jika sematan gagal. Akhiri dengan **Kembali ke Refleksi** dan **Kembali ke Beranda**.

### Halaman pendukung

| Halaman            | Komposisi                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tentang KREASI.ID  | Judul dan kepanjangan nama, tujuan dan sasaran, cara menggunakan media, peran guru BK, lalu bagian **Privasi**. Akhiri dengan **Mulai Self-check**.                                                                                                                          |
| Tips               | Tiga bagian singkat tentang memulai dari latihan kecil, mencoba hal baru, dan meminta masukan. Akhiri dengan tautan **Mengembangkan Potensi** dan **Action Plan**.                                                                                                           |
| Kontak dan Bantuan | Utamakan **Bicara dengan guru BK**. Jika kanal sekolah sudah ditetapkan, tampilkan tautannya dengan label jelas. Jika belum, arahkan pengguna menemui guru BK di sekolah. Sertakan bantuan untuk kuis yang gagal dibuka, sematan kosong, dan cara menyimpan salinan rencana. |

## Cara menggunakan di Google Stitch

Gunakan file ini sebagai aturan desain dan kedua gambar sebagai konteks visual. Tambahkan gambar pertama untuk palet dan gambar kedua untuk komposisi. Mulai dari prompt A, lalu lanjutkan dengan prompt B dan C di proyek yang sama agar layar berikutnya memakai header dan komponen yang sama. Google Stitch mendukung penggunaan dokumen DESIGN.md untuk membawa aturan desain ke proyek. [Panduan Google Labs](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/) · [Spesifikasi format](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md).

### Prompt A · Beranda

```text
Buat UI responsif KREASI.ID, website pendukung Bimbingan dan Konseling untuk siswa SMP Indonesia. Gunakan design.md sebagai aturan desain dan dua gambar terlampir sebagai konteks. Ambil cream #FFFAEE, pink #FF7EA1, dan mint #A2EFE3 dari gambar palet. Ambil susunan hero berbentuk panel besar, judul tebal, tombol kapsul, ruang kosong, dan ritme kartu dari gambar website. Terapkan kobalt #304BE4, tinta gelap #241831, judul Bricolage Grotesque, dan isi DM Sans. Buat desain orisinal berbahasa Indonesia.

Hasilkan frame Beranda desktop 1440 px dan ponsel 390 px. Buat header krem dan hero kobalt dengan judul “Kenali potensi, mulai langkahmu.”, pengantar, CTA mint “Mulai Self-check”, serta ilustrasi editorial dua siswa SMP Indonesia dengan buku catatan. Pada ponsel tampilkan CTA sebelum ilustrasi. Buat bagian “Pilih kegiatan” berisi enam kartu sesuai design.md, tiga kolom di desktop dan satu kolom di ponsel. Akhiri dengan bantuan guru BK dan footer. Gunakan hierarki tombol dan warna dari dokumen.
```

### Prompt B · Enam kegiatan

```text
Lanjutkan desain KREASI.ID dengan sistem dari Beranda dan design.md. Buat enam halaman dengan varian desktop 1440 px dan ponsel 390 px, berurutan Self-check, Kenali Potensi, Mengembangkan Potensi, Kuis, Refleksi, dan Action Plan. Pakai header, warna, tipografi, kartu, dan navigasi yang sama. Tampilkan teks “Langkah N dari 6” dan tombol sebelumnya/berikutnya dengan nama halaman tujuan. Hubungkan CTA dan kartu Beranda ke halaman yang tepat. Siswa boleh membuka halaman langsung melalui menu.

Gunakan lima kelompok checkbox Self-check, dua halaman materi yang mudah dipindai, halaman pengantar Kuis dengan tautan Google Forms di tab baru dan latihan cadangan, enam isian opsional Refleksi, serta enam isian Action Plan dengan lima wajib. Tambahkan keadaan Self-check sebelum memilih dan setelah menekan “Lihat Catatanku”. Untuk Action Plan, tunjukkan pesan validasi ketika isian wajib kosong dan panel “Rencanaku” yang siap disalin. Gunakan data contoh tanpa identitas. Ikuti teks privasi dan jalur cadangan per layar yang ditetapkan di design.md.
```

### Prompt C · Bantuan dan uji prototipe

```text
Buat Tentang KREASI.ID, Tips, dan Kontak dan Bantuan dalam varian desktop dan ponsel. Tambahkan keadaan Menu terbuka pada ponsel dan hubungkan setiap item navigasi. Ikuti design.md untuk penjelasan privasi dan teks pendampingan guru BK. Gunakan jalur menemui guru BK di sekolah untuk mockup yang belum punya kontak terverifikasi.

Tautkan alur Beranda → Self-check → Kenali Potensi → Mengembangkan Potensi → Kuis → Refleksi → Action Plan → Beranda. Periksa pembungkusan teks di 360 px, pola fokus dan error, keenam kartu, jalur melewati refleksi, latihan saat kuis tidak bisa dibuka, serta ringkasan Action Plan yang dapat disalin. Tampilkan perpindahan ke Google Forms sebagai tautan eksternal.
```

### Pemeriksaan sebelum serah terima

- Pastikan semua layar menggunakan sistem dari beranda, judul tidak terpotong pada 360 px, kartu terbaca, teks biasa mencapai kontras 4,5:1, dan tombol utama dapat dijangkau dengan papan ketik serta sentuhan.
- Pastikan gambar dan aksen visual dapat dipisahkan dari teks, tombol, dan kartu. Di Google Sites gunakan blok halaman untuk materi dan navigasi. Gunakan sematan untuk isian pribadi, serta tautan responden terpisah untuk Google Forms sesuai PRD.
- Simpan contoh jawaban hanya sebagai isi mockup. Untuk implementasi, terapkan isian pribadi sementara, alternatif teks, dan aturan akses serta masa simpan respons pada PRD.
