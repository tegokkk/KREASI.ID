# Instrumen Pengujian dan Telaah KREASI.ID

Dokumen ini disusun berdasarkan Lampiran Gambar 2–5 pada proposal sumber ([UTS_TeknologiBK_RESTYNA RAHMAYANTI_KREASI.ID_REVISI.pdf](../UTS_TeknologiBK_RESTYNA%20RAHMAYANTI_KREASI.ID_REVISI.pdf)) untuk memenuhi kebutuhan tahap evaluasi internal dan persiapan uji pengguna (`REL-02`).

---

## 1. Checklist Uji Fungsi Media Interaktif KREASI.ID (Lampiran Gambar 2)

**Tujuan:** Memeriksa fungsi media interaktif KREASI.ID sebelum digunakan oleh peserta didik.  
**Status pemeriksaan internal:** Terverifikasi pada prototipe React + Express (`http://localhost:3001`) menggunakan Chrome dan Microsoft Edge desktop serta simulasi viewport 360, 390, 768, dan 1440 px pada 2026-11-19.

| No. | Aspek yang Diperiksa                                                                | Ya  | Tidak | Catatan                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------- | --- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Halaman beranda KREASI.ID dapat dibuka.                                             | [x] | [ ]   | Terbuka di `/` dengan hero, 6 kartu kegiatan, panel bantuan, dan footer.                                                                           |
| 2   | Semua menu mengarah ke halaman atau fitur yang tepat.                               | [x] | [ ]   | Menu desktop, dropdown 6 kegiatan, drawer ponsel, kartu, dan footer mengarah ke rute yang sesuai.                                                  |
| 3   | Materi dapat dibaca dengan jelas melalui telepon genggam.                           | [x] | [ ]   | Diuji pada lebar 360 px dan 390 px tanpa gulir horizontal (`scrollWidth <= innerWidth`).                                                           |
| 4   | Tombol kembali, lanjut, dan navigasi lainnya berfungsi dengan baik.                 | [x] | [ ]   | Alur penuh Beranda → Langkah 1–6 → Beranda serta akses langsung tiap rute berfungsi.                                                               |
| 5   | Fitur self-check/tes potensi diri dapat diakses dan digunakan sesuai petunjuk.      | [x] | [ ]   | Mendukung pilihan jamak, melewati pertanyaan, Catatanku (kosong/sebagian/lengkap), ubah, dan hapus jawaban.                                        |
| 6   | Kuis dapat dikerjakan dan menampilkan respons atau umpan balik yang sesuai.         | [x] | [ ]   | Kuis lokal 6 soal menghitung skor (0/6, 4/6, 6/6), pembahasan, pengulangan, dan latihan cadangan; mode Google Forms siap via `/api/public-config`. |
| 7   | Fitur refleksi dan action plan dapat dibuka dan digunakan sesuai petunjuk.          | [x] | [ ]   | Refleksi dapat diisi/dilewati/dihapus; Action Plan memvalidasi 5 isian wajib, fokus error, evaluasi opsional, dan ringkasan siap salin.            |
| 8   | Formulir tidak meminta data identitas atau informasi pribadi yang tidak diperlukan. | [x] | [ ]   | Tidak ada kolom nama, email, nomor HP, login, `localStorage`, `sessionStorage`, atau pengiriman jawaban pribadi ke server.                         |
| 9   | Petunjuk penggunaan dan bagian bantuan mudah ditemukan.                             | [x] | [ ]   | Tersedia di Beranda, Header (`Tentang KREASI.ID`, `Kontak dan Bantuan`), Footer, dan tautan utilitas di setiap halaman kegiatan.                   |
| 10  | Tautan berfungsi dan informasi mengenai batasan media ditampilkan dengan jelas.     | [x] | [ ]   | Penjelasan batasan (bukan tes psikologis/diagnosis/penentu bakat, bukan pengganti guru BK) tampil di Self-check, Kuis, dan Tentang.                |

**Catatan Pemeriksaan:**

- **Bagian yang perlu diperbaiki (dari pemeriksaan internal):** Tidak ada cacat alur inti yang menghalangi penggunaan prototipe. Perlu pengujian langsung pada perangkat fisik Android Chrome dan iPhone Safari (`QA-03`).
- **Tanggal pemeriksaan:** 2026-11-19
- **Nama atau kode pemeriksa:** Pemeriksaan otomatis internal (Chrome & Edge)

---

## 2. Lembar Telaah Konten KREASI.ID (Lampiran Gambar 3 — Untuk Guru BK)

**Tujuan:** Meninjau kesesuaian materi dan bahasa dalam media interaktif KREASI.ID sebelum digunakan peserta didik (`PRE-06` & `REL-01`).

| No. | Aspek yang Ditelaah                                                                                | Sesuai | Perlu Revisi | Catatan |
| --- | -------------------------------------------------------------------------------------------------- | ------ | ------------ | ------- |
| 1   | Materi sesuai dengan tujuan pengenalan dan pengembangan potensi diri.                              | [ ]    | [ ]          |         |
| 2   | Penjelasan tentang potensi diri mudah dipahami peserta didik SMP.                                  | [ ]    | [ ]          |         |
| 3   | Instruksi pada fitur self-check disampaikan dengan jelas.                                          | [ ]    | [ ]          |         |
| 4   | Materi memberikan contoh pengembangan potensi yang realistis.                                      | [ ]    | [ ]          |         |
| 5   | Pertanyaan kuis sesuai dengan materi yang disajikan.                                               | [ ]    | [ ]          |         |
| 6   | Pertanyaan refleksi tidak menghakimi atau memaksa peserta didik mengungkapkan informasi sensitif.  | [ ]    | [ ]          |         |
| 7   | Format action plan membantu peserta didik menyusun langkah pengembangan diri.                      | [ ]    | [ ]          |         |
| 8   | Bahasa yang digunakan konsisten, sopan, dan sesuai dengan sasaran pengguna.                        | [ ]    | [ ]          |         |
| 9   | Batasan media dijelaskan dengan jelas, termasuk bahwa self-check bukan tes psikologis profesional. | [ ]    | [ ]          |         |
| 10  | Sumber informasi dicantumkan secara tepat pada bagian yang diperlukan.                             | [ ]    | [ ]          |         |

**Saran perbaikan materi:**  
_(Diisi oleh penelaah guru BK)_

**Nama atau kode penelaah:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Tanggal telaah:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
_Keterangan: Lembar ini belum diisi dan belum menunjukkan hasil penilaian guru BK._

---

## 3. Lembar Observasi Penggunaan KREASI.ID (Lampiran Gambar 4 — Untuk Uji Terbatas)

**Tujuan:** Mencatat kendala penggunaan media ketika uji coba terbatas bersama peserta didik dilaksanakan (`REL-04`).

| No. | Aspek yang Diamati                                                     | Ya  | Tidak | Catatan |
| --- | ---------------------------------------------------------------------- | --- | ----- | ------- |
| 1   | Pengguna dapat membuka halaman beranda.                                | [ ] | [ ]   |         |
| 2   | Pengguna dapat menemukan menu yang dibutuhkan.                         | [ ] | [ ]   |         |
| 3   | Pengguna dapat mengikuti petunjuk penggunaan.                          | [ ] | [ ]   |         |
| 4   | Pengguna dapat membuka dan memahami materi.                            | [ ] | [ ]   |         |
| 5   | Pengguna dapat mengakses fitur self-check dan kuis.                    | [ ] | [ ]   |         |
| 6   | Pengguna dapat menemukan fitur refleksi dan action plan.               | [ ] | [ ]   |         |
| 7   | Terdapat kendala teknis atau tautan yang tidak berfungsi.              | [ ] | [ ]   |         |
| 8   | Pengguna memerlukan penjelasan tambahan untuk memahami fitur tertentu. | [ ] | [ ]   |         |

**Rekap ketuntasan (Sasaran awal PRD: minimal 80% selesai mandiri pada kuis & Action Plan):**

- Total peserta: \_\_\_\_ siswa
- Selesai mandiri: \_\_\_\_ siswa
- Selesai dengan bantuan navigasi: \_\_\_\_ siswa
- Belum selesai: \_\_\_\_ siswa
- Perangkat & jaringan yang digunakan: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Kendala yang ditemukan:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Bagian yang disarankan untuk diperbaiki:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Tanggal observasi:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Pengamat:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
_Keterangan: Lembar observasi ini baru diisi apabila izin uji coba terbatas di sekolah telah diperoleh._

---

## 4. Lembar Umpan Balik Pengguna KREASI.ID (Lampiran Gambar 5 — Tanpa Identitas)

**Tujuan:** Memperoleh masukan peserta didik mengenai tampilan, materi, dan kemudahan penggunaan (`REL-04`).  
**Catatan etika:** Pengguna tidak perlu mencantumkan nama atau informasi pribadi yang sensitif (alamat, nomor telepon, atau cerita pribadi sensitif). Jawaban hanya digunakan sebagai masukan pengembangan media KREASI.ID.

| No. | Pertanyaan Umpan Balik                                          | Jawaban / Skala / Catatan |
| --- | --------------------------------------------------------------- | ------------------------- |
| 1   | Apakah tujuan penggunaan KREASI.ID mudah dipahami?              |                           |
| 2   | Apakah menu dan navigasi website mudah digunakan?               |                           |
| 3   | Apakah materi membantu kamu mengenali potensi diri?             |                           |
| 4   | Apakah bahasa dalam materi mudah dipahami?                      |                           |
| 5   | Apakah tes potensi diri (Self-check) dan kuis mudah dikerjakan? |                           |
| 6   | Apakah kegiatan refleksi membantu kamu memahami potensi diri?   |                           |
| 7   | Apakah rencana pengembangan diri (Action Plan) mudah diisi?     |                           |
| 8   | Apakah tampilan website nyaman digunakan melalui ponsel?        |                           |
| 9   | Bagian mana yang masih membingungkan atau sulit digunakan?      |                           |
| 10  | Apa saran kamu untuk memperbaiki KREASI.ID?                     |                           |
