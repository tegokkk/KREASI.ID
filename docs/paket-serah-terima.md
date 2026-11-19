# Paket Serah Terima & Panduan Pengelola KREASI.ID

Dokumen ini merangkum arsitektur implementasi, cara menjalankan, keputusan konfigurasi kuis lokal, aset yang tersedia, hasil pemeriksaan internal, serta bagian yang masih menunggu keputusan sekolah (`REL-09`).

---

## 1. Status Prototipe Saat Ini

**Pembaruan DEP-01–DEP-04, 19 November 2026:** backend produksi sudah mendukung PostgreSQL Supabase; schema pengembangan/Preview/Production dan initial import akun dummy telah disiapkan. Adapter serta routing Vercel tersedia dan file environment privat sudah dibuat. Deployment dan pengujian URL Vercel dilakukan sendiri oleh pemilik proyek. Ikuti [panduan deploy mandiri](deploy-vercel.md) dan [laporan audit terbaru](audit-deploy-vercel.md).

- **Status:** Prototipe siap ditelaah secara internal (**prototipe untuk penelaahan internal** sesuai PRD §8).
- **Platform:** Aplikasi web JavaScript ES Modules dengan frontend React + Vite + React Router (`frontend/`) dan backend Node.js 24 LTS + Express 5 (`backend/`).
- **Perjalanan enam langkah berurutan:** Untuk siswa berstatus `approved`, Beranda menampilkan `Perjalanan Potensimu` (`Self-check` → `Kenali Potensi` → `Mengembangkan Potensi` → `Kuis` → `Refleksi` → `Action Plan`) yang dikunci secara berurutan pada frontend dan backend (`GET/POST /api/journey/*`). Progres (`completed` atau `skipped`) disimpan per akun di tabel `user_journey_progress` PostgreSQL pada produksi. SQLite tetap didukung untuk pengembangan tanpa `DATABASE_URL`. Isian pribadi Self-check, Refleksi, dan Action Plan tetap sementara di browser.
- **Keputusan Kuis (`QUIZ-06` – `QUIZ-09`):** Untuk tahap saat ini, website menggunakan **kuis lokal di peramban** (`QUIZ_MODE=local`) sebagai jalur utama sekaligus jalur cadangan sesuai FR-05 PRD, karena belum ada akun pengelola Google Forms sekolah dan keputusan masa simpan final yang ditetapkan. Dukungan Google Forms (tautan tab baru + pemberitahuan privasi & masa simpan) sudah tersedia di kode dan dapat diaktifkan kapan saja melalui variabel lingkungan backend.

---

## 2. Daftar Berkas & Aset Utama

| Bagian                         | Lokasi                                                                                                                                                                                                                                  | Keterangan                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Konten materi, tips, & tentang | [learning-materials.js](../frontend/src/content/learning-materials.js)                                                                                                                                                                  | Materi Kenali Potensi, Mengembangkan Potensi, Tips, dan Tentang/Privasi untuk ditelaah guru BK.            |
| Daftar 6 kegiatan              | [activities.js](../frontend/src/content/activities.js)                                                                                                                                                                                  | Urutan langkah, deskripsi kartu, warna, dan rute.                                                          |
| Pertanyaan Self-check          | [questions.js](../frontend/src/features/self-check/questions.js)                                                                                                                                                                        | 5 kelompok pertanyaan pilihan jamak dengan opsi _Belum tahu_ / _Lainnya_.                                  |
| Bank soal Kuis & Cadangan      | [questions.js](../frontend/src/features/quiz/questions.js)                                                                                                                                                                              | 6 soal pilihan ganda + kunci + pembahasan + 3 soal latihan cadangan.                                       |
| Pertanyaan Refleksi            | [questions.js](../frontend/src/features/reflection/questions.js)                                                                                                                                                                        | 6 pertanyaan refleksi opsional.                                                                            |
| Template & contoh Action Plan  | [template.js](../frontend/src/features/action-plan/template.js)                                                                                                                                                                         | 5 isian wajib + 1 evaluasi opsional + contoh lengkap.                                                      |
| Teks Bantuan & Kontak          | [help.js](../frontend/src/content/help.js)                                                                                                                                                                                              | Panduan menemui guru BK dan solusi kendala teknis.                                                         |
| Backend perjalanan berurutan   | [journey.routes.js](../backend/src/routes/journey.routes.js), [auth.js](../backend/src/auth.js)                                                                                                                                         | API `/api/journey` & tabel `user_journey_progress` (hanya status langkah; jawaban pribadi tidak disimpan). |
| Frontend perjalanan berurutan  | [JourneyProvider.jsx](../frontend/src/features/journey/JourneyProvider.jsx), [JourneySection.jsx](../frontend/src/features/journey/JourneySection.jsx), [RequireStepAccess.jsx](../frontend/src/features/journey/RequireStepAccess.jsx) | Panel `Perjalanan Potensimu`, penjaga rute berurutan, dan sinkronisasi status ke menu `Kegiatan`.          |
| Konfigurasi backend            | [config.js](../backend/src/config.js), [.env.example](../backend/.env.example)                                                                                                                                                          | Validasi `PORT`, `QUIZ_MODE`, `QUIZ_FORM_URL`, `QUIZ_RETENTION_DAYS`, `BK_CONTACT_URL`.                    |
| Aset gambar                    | [logo-kreasi.png](../frontend/src/assets/images/logo-kreasi.png), [hero-students.jpg](../frontend/src/assets/images/hero-students.jpg), [favicon.png](../frontend/public/favicon.png)                                                   | Versi terkompresi dari `Logo KREASI.ID.png` dan ilustrasi hasil Stitch.                                    |
| Instrumen evaluasi ADDIE       | [instrumen-pengujian-dan-telaah.md](instrumen-pengujian-dan-telaah.md)                                                                                                                                                                  | Checklist uji fungsi, lembar telaah guru BK, lembar observasi, dan umpan balik siswa.                      |

---

## 3. Cara Menjalankan & Membangun

Dari direktori root `KREASI.ID/`:

```bash
# 1. Pasang seluruh dependensi workspace
npm install

# 2. Mode pengembangan (jalankan di 2 terminal terpisah)
npm run dev --workspace=backend   # Port 3001
npm run dev --workspace=frontend  # Port 5173 (proxy /api -> 3001)

# 3. Mode produksi (satu origin)
npm run build --workspace=frontend
npm start --workspace=backend     # Port 3001 melayani API & frontend/dist/

# 4. Uji unit & API backend
node --test backend/test/*.test.js
```

---

## 4. Konfigurasi Lingkungan Produksi (`backend/.env`)

Salin `backend/.env.example` menjadi `backend/.env` saat akan mengaktifkan konfigurasi sekolah:

| Variabel              | Default / Cadangan | Penjelasan                                                                                                                                                |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                | `3001`             | Port server HTTP Express.                                                                                                                                 |
| `QUIZ_MODE`           | `local`            | Gunakan `local` untuk kuis langsung di browser, atau `google-forms` bila Google Forms sekolah sudah siap.                                                 |
| `QUIZ_FORM_URL`       | _(kosong)_         | URL responden Google Forms (`https://...`). Jika kosong/tidak valid, server otomatis kembali ke `local`.                                                  |
| `QUIZ_RETENTION_DAYS` | `30`               | Usulan masa simpan respons Google Forms (hari) yang ditampilkan pada pemberitahuan privasi sebelum membuka tautan.                                        |
| `BK_CONTACT_URL`      | _(kosong)_         | Tautan kanal BK sekolah terverifikasi (`https://...`, `mailto:...`, `tel:...`). Jika kosong, halaman Kontak mengarahkan siswa menemui guru BK di sekolah. |

### Checklist Jika Mengaktifkan Google Forms di Masa Depan

1. Pastikan kuis memiliki 6 soal pilihan ganda (2 soal mengenali potensi, 2 pentingnya mengembangkan potensi, 2 langkah pengembangan) dengan kunci, bobot 1 poin per soal, dan pembahasan.
2. Aktifkan rilis nilai dan pembahasan segera setelah pengiriman (_Immediately after each submission_).
3. **Nonaktifkan** pengumpulan alamat email, pembatasan 1 respons yang memaksa login, akses ringkasan respons oleh responden lain, dan tautan edit respons.
4. Uji tautan responden pada jendela peramban tanpa login (_incognito_) untuk memastikan siswa bisa membuka, mengisi, mengirim, dan melihat hasil individu saja.
5. Tetapkan pengelola data serta jadwalkan penghapusan respons mentah paling lambat sesuai `QUIZ_RETENTION_DAYS` yang disetujui sekolah.

---

## 5. Daftar Pengelola & Keputusan yang Belum Ditetapkan

| Peran / Keputusan                                                         | Penanggung Jawab         | Status                             |
| ------------------------------------------------------------------------- | ------------------------ | ---------------------------------- |
| Penelaah konten & bahasa SMP (lembar `PRE-06` / `REL-01`)                 | Guru BK sekolah          | Belum ditetapkan / menunggu telaah |
| Pemilik produk & pengelola teknis rilis produksi (`REL-07`)               | Pemilik proyek & sekolah | Belum ditetapkan                   |
| Izin uji terbatas & jadwal observasi siswa (`REL-03` – `REL-05`)          | Pihak sekolah & guru BK  | Belum tersedia                     |
| Hosting, domain/URL rilis, dan verifikasi kanal `BK_CONTACT_URL`          | Pemilik proyek & sekolah | Belum ditetapkan                   |
| Pengujian fisik pada perangkat Android Chrome dan iPhone Safari (`QA-03`) | Tim pengembang / penguji | Belum tersedia di lingkungan uji   |
