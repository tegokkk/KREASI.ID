# Tasklist Pembangunan KREASI.ID

Checklist ini mengikuti [PRD.md](PRD.md), [design.md](design.md), dan [structure.md](structure.md). Implementasi menggunakan JavaScript, React, Vite, CSS Modules, Node.js, dan Express dengan folder utama `frontend/` dan `backend/`.

Centang tugas setelah hasilnya diperiksa. Untuk tugas bersyarat, catat apakah diterapkan beserta alasannya. Simpan bukti pemeriksaan dan temuan pada catatan di akhir dokumen. Urutan tahap mengikuti kebutuhan pengerjaan, dengan konten dan backend dapat dikerjakan bersamaan setelah fondasi siap.

## 0. Bahan yang tersedia

- [x] DOC-01 — Dokumen kebutuhan produk tersedia dalam `PRD.md`.
- [x] DOC-02 — Sistem desain dan spesifikasi layar tersedia dalam `design.md`.
- [x] DOC-03 — Struktur folder dan tech stack tersedia dalam `structure.md`.
- [x] DOC-04 — Ekspor Stitch tersedia di `stitch_desain_website_kreasi.id_bk/`, mencakup HTML dan gambar layar desktop serta beranda ponsel.
- [x] DOC-05 — Aset logo tersedia dalam `Logo KREASI.ID.png`.

Ketersediaan bahan menjadi titik awal. Kesesuaian seluruh desain, konten, dan aset diperiksa pada tahap berikutnya.

## 1. Persiapan desain dan konten

**Hasil tahap** berupa daftar layar, konten, dan aset yang siap diterjemahkan ke React.

- [x] PRE-01 — Tinjau ekspor Stitch terhadap `design.md`. Catat penyesuaian tata letak, warna, tipografi, dan komponen yang diperlukan.
- [x] PRE-02 — Petakan layar ekspor ke sepuluh rute pada `structure.md`, lalu identifikasi keadaan kosong, hasil, validasi, menu terbuka, dan versi ponsel yang perlu dilengkapi.
- [x] PRE-03 — Tinjau logo, ilustrasi, dan sumber font. Siapkan aset dengan ukuran dan format yang sesuai untuk website.
- [x] PRE-04 — Siapkan materi Kenali Potensi, Mengembangkan Potensi, Tentang, Tips, dan Bantuan dalam bahasa Indonesia sesuai usia SMP.
- [x] PRE-05 — Siapkan lima kelompok pertanyaan Self-check, enam soal kuis dengan kunci dan pembahasan, enam pertanyaan Refleksi, dan contoh Action Plan.
- [ ] PRE-06 — Minta telaah guru BK terhadap istilah, contoh, pertanyaan, pembahasan, dan petunjuk privasi. Catat revisi yang perlu diterapkan.

## 2. Fondasi proyek

**Ketergantungan** pada struktur yang ditetapkan dalam `structure.md`.

- [x] SET-01 — Buat folder `frontend/` dan `backend/` beserta paket JavaScript ES Modules masing-masing.
- [x] SET-02 — Atur npm workspaces di root dengan `private: true` dan satu `package-lock.json`.
- [x] SET-03 — Inisialisasi React dengan template Vite `react`, lalu pasang React Router.
- [x] SET-04 — Pasang Express dan siapkan `config.js`, `app.js`, `server.js`, serta folder rute backend.
- [x] SET-05 — Siapkan script pengembangan frontend dan backend, build frontend, dan start produksi sesuai `structure.md`.
- [x] SET-06 — Tambahkan `.gitignore` untuk dependensi, build, dan konfigurasi lingkungan lokal. Buat `backend/.env.example`.
- [x] SET-07 — Atur frontend pada port 5173, backend pada port 3001, dan proxy `/api` pada Vite. Periksa keduanya berjalan dari workspace root.

## 3. Sistem desain dan kerangka frontend

**Ketergantungan** pada tahap 1 dan 2.

- [x] UI-01 — Terjemahkan warna, ukuran teks, radius, dan jarak pada `design.md` ke `tokens.css` serta gaya dasar ke `global.css`.
- [x] UI-02 — Implementasikan font judul dan isi, logo, favicon, serta ilustrasi yang sudah ditinjau.
- [x] UI-03 — Buat Header, Footer, dan PageLayout dengan navigasi desktop, halaman aktif, serta menu ponsel yang dapat dibuka dan ditutup.
- [x] UI-04 — Buat Button, FormField, dan InfoPanel beserta keadaan fokus, dipilih, kesalahan, dan nonaktif bila diperlukan.
- [x] UI-05 — Buat ActivityCard, StepIndicator, dan ActivityNavigation dengan nama tujuan halaman yang jelas.
- [x] UI-06 — Pasang sepuluh rute pada App dan halaman NotFound untuk URL lain. Atur judul dokumen, hierarki heading, dan fokus ketika berpindah halaman.
- [x] UI-07 — Terapkan grid tiga kolom desktop, dua kolom tablet, dan satu kolom ponsel. Pastikan formulir tetap nyaman dibaca dalam satu kolom.

## 4. Backend dan konfigurasi publik

**Ketergantungan** pada tahap 2. Dapat berjalan bersamaan dengan tahap 3.

- [x] API-01 — Implementasikan `GET /api/health` dengan respons status server.
- [x] API-02 — Implementasikan `GET /api/public-config` untuk mode kuis, URL formulir, masa simpan respons, dan URL kontak BK.
- [x] API-03 — Validasi `PORT`, `QUIZ_MODE`, `QUIZ_FORM_URL`, `QUIZ_RETENTION_DAYS`, dan `BK_CONTACT_URL`. Hanya keluarkan konfigurasi yang memang ditujukan untuk browser.
- [x] API-04 — Tentukan nilai cadangan saat konfigurasi eksternal belum lengkap, yaitu kuis lokal dan petunjuk menemui guru BK di sekolah.
- [x] API-05 — Buat layanan fetch frontend yang menangani konfigurasi berhasil, respons tidak valid, kegagalan jaringan, dan waktu tunggu yang habis.
- [x] API-06 — Tambahkan penanganan error API dan respons 404 JSON untuk endpoint yang tidak ditemukan.

## 5. Beranda, materi, dan halaman pendukung

**Ketergantungan** pada tahap 1 dan 3. Mengacu pada FR-01, FR-03, dan FR-04.

- [x] PAGE-01 — Bangun Beranda dengan hero, tombol Mulai Self-check, enam kartu sesuai urutan, panel bantuan, dan footer.
- [x] PAGE-02 — Bangun Kenali Potensi dengan lima topik dari PRD, contoh konkret, dan navigasi menuju kegiatan sebelum serta sesudahnya.
- [x] PAGE-03 — Bangun Mengembangkan Potensi dengan manfaat latihan, pengalaman baru, kegiatan akademik/nonakademik, hambatan, dan dukungan.
- [x] PAGE-04 — Bangun Tentang KREASI.ID dengan kepanjangan nama, sasaran, tujuan, cara penggunaan, peran guru BK, dan bagian privasi yang dapat ditautkan.
- [x] PAGE-05 — Bangun Tips dengan kegiatan sederhana yang dapat dilakukan di rumah atau sekolah.
- [x] PAGE-06 — Bangun Kontak dan Bantuan yang menjelaskan jalur pendampingan, kuis bermasalah, serta cara menyalin rencana.
- [x] PAGE-07 — Hubungkan seluruh menu, kartu, tombol mulai, bantuan, privasi, dan navigasi antarhalaman. Periksa semua tujuan tautan.

## 6. Self-check dan Refleksi

**Ketergantungan** pada tahap 1 dan 3. Mengacu pada FR-02 dan FR-06.

- [x] ACT-01 — Bangun lima kelompok checkbox Self-check, pilihan yang sesuai per pertanyaan, dan opsi Belum tahu atau Lainnya.
- [x] ACT-02 — Izinkan pertanyaan dilewati. Tampilkan kondisi semua kosong dan rangkuman Catatanku untuk jawaban sebagian maupun lengkap.
- [x] ACT-03 — Tambahkan Ubah Jawaban dan Hapus Jawaban. Rangkuman menampilkan pilihan siswa sesuai kelompok pertanyaan.
- [x] ACT-04 — Bangun enam area teks opsional Refleksi dengan petunjuk catatan pribadi dan Hapus Jawaban.
- [x] ACT-05 — Izinkan siswa lanjut dari Refleksi kosong dan sediakan alternatif menjawab melalui buku catatan.
- [x] ACT-06 — Kelola jawaban pribadi sebagai state sementara per halaman. Kosongkan state saat halaman ditinggalkan, dimuat ulang, atau dipulihkan dari riwayat peramban.
- [x] ACT-07 — Pastikan pertanyaan dan petunjuk tetap tersedia sebagai teks saat komponen aktivitas mengalami kegagalan.

## 7. Kuis pemahaman

**Ketergantungan** pada tahap 1, 3, dan 4. Mengacu pada FR-05.

- [x] QUIZ-01 — Bangun halaman pengantar enam soal, tujuan kuis, tautan kembali ke materi, dan tombol menuju Refleksi.
- [x] QUIZ-02 — Implementasikan kuis lokal dengan satu jawaban per soal, enam soal wajib, serta pesan untuk soal yang belum dijawab.
- [x] QUIZ-03 — Hitung jumlah jawaban benar, tampilkan pembahasan, dan tambahkan Ulangi Kuis yang mengosongkan percobaan sebelumnya.
- [x] QUIZ-04 — Buat latihan cadangan yang selalu dapat diakses, dengan kontrol Lihat Pembahasan per soal.
- [x] QUIZ-05 — Hubungkan mode kuis ke konfigurasi publik. Gunakan kuis lokal ketika konfigurasi Google Forms belum lengkap atau gagal diambil.
- [ ] QUIZ-06 — Jika Google Forms dipakai, konfigurasi enam soal, kunci, poin, pembahasan, dan hasil individu segera setelah pengiriman.
- [ ] QUIZ-07 — Jika Google Forms dipakai, nonaktifkan pengumpulan email, pembatasan satu respons yang memerlukan login, ringkasan respons publik, dan tautan edit respons. Uji akses sebagai siswa.
- [ ] QUIZ-08 — Jika Google Forms dipakai, tetapkan pengelola dan masa simpan, lalu tampilkan pemberitahuan data sebelum siswa membuka formulir di tab baru.
- [ ] QUIZ-09 — Periksa alur siswa kembali dari Forms ke KREASI.ID dan tetap dapat menggunakan latihan cadangan ketika formulir ditutup atau gagal dibuka.

## 8. Action Plan

**Ketergantungan** pada tahap 1 dan 3. Mengacu pada FR-07.

- [x] PLAN-01 — Bangun lima isian wajib untuk kemampuan, tujuan, kegiatan, target waktu, serta cara memantau, ditambah evaluasi opsional.
- [x] PLAN-02 — Tampilkan satu contoh rencana lengkap serta template enam bagian yang dapat dipakai di catatan pribadi.
- [x] PLAN-03 — Validasi isian wajib termasuk jawaban yang hanya berisi spasi. Tampilkan error di dekat isian, pertahankan jawaban lain, dan arahkan fokus ke kesalahan pertama.
- [x] PLAN-04 — Buat Rencanaku sebagai ringkasan teks yang dapat dipilih dan disalin manual, dengan penjelasan evaluasi dapat diisi setelah mencoba.
- [x] PLAN-05 — Tambahkan Ubah Rencana dan Hapus Isian. Bentuk ulang ringkasan ketika siswa merevisi rencana.
- [x] PLAN-06 — Terapkan isian sementara serta pengosongan saat keluar dari halaman. Tampilkan petunjuk menyalin rencana sebelum keluar.
- [x] PLAN-07 — Lengkapi navigasi kembali ke Refleksi dan Beranda, serta keadaan ketika formulir gagal tampil.

## 9. Integrasi dan penyajian produksi

**Ketergantungan** pada tahap 4–8.

- [x] INT-01 — Periksa alur Beranda sampai Action Plan dan kembali ke Beranda, termasuk masuk langsung ke setiap kegiatan.
- [x] INT-02 — Periksa bahwa Refleksi dan Self-check dapat dilewati, serta jawaban aktivitas sebelumnya tidak terbawa ke isian halaman lain.
- [x] INT-03 — Jalankan build frontend dan perbaiki error yang menghalangi hasil produksi.
- [x] INT-04 — Atur Express untuk melayani `frontend/dist/` dari satu origin bersama API.
- [x] INT-05 — Tempatkan handler API sebelum aset dan fallback halaman React. Uji akses langsung serta muat ulang pada setiap rute frontend.
- [x] INT-06 — Pastikan URL API dan aset yang tidak ditemukan mengembalikan 404. Periksa tampilan halaman tidak ditemukan untuk URL aplikasi lain.

## 10. Pemeriksaan kualitas

**Ketergantungan** pada tahap 9. Bukti hasil dicatat sesuai instrumen pengujian PRD.

- [x] QA-01 — Cocokkan tampilan desktop dan ponsel dengan hasil Stitch yang ditelaah serta token pada `design.md`.
- [x] QA-02 — Uji lebar 360, 390, 768, dan 1440 px, termasuk pembungkusan judul, tombol, menu, serta formulir.
- [ ] QA-03 — Uji Android Chrome, komputer Chrome atau Edge, dan iPhone Safari bila tersedia. Catat perangkat serta lingkungan yang belum teruji.
- [x] QA-04 — Periksa papan ketik, urutan dan indikator fokus, label isian, pembacaan ringkasan/error, teks alternatif, zoom 200%, dan target sentuh minimal 44 px.
- [x] QA-05 — Periksa kontras teks minimal 4,5:1 dan penanda keadaan yang dapat dipahami melalui teks atau ikon.
- [x] QA-06 — Uji Self-check kosong/sebagian/lengkap, pengubahan dan penghapusan jawaban, serta Refleksi yang dilewati.
- [x] QA-07 — Uji kuis dengan semua jawaban benar, semua salah, dan campuran. Periksa skor, pembahasan, pengulangan, dan jalur cadangan.
- [x] QA-08 — Uji Action Plan dengan isian kosong, spasi, jawaban lengkap, evaluasi kosong, perubahan, penghapusan, serta penyalinan ringkasan.
- [x] QA-09 — Periksa lewat alat pengembang bahwa jawaban pribadi tidak muncul di URL, penyimpanan browser, permintaan API, atau log. Uji tombol kembali dan perangkat bersama.
- [x] QA-10 — Uji konfigurasi backend gagal dimuat, Google Forms tidak tersedia, dan koneksi lambat. Pastikan petunjuk dan aktivitas cadangan dapat ditemukan.
- [x] QA-11 — Ukur tampilan judul dan tombol mulai dengan cache kosong pada simulasi jaringan PRD. Sasaran awal lima detik. Catat kondisi pengukuran dan optimalkan aset jika diperlukan.
- [x] QA-12 — Rangkum hasil untuk FR-01 sampai FR-07. Selesaikan masalah yang menghalangi kegiatan inti atau membuka data pribadi sebelum tautan dibagikan.

## 11. Telaah, uji pengguna, dan rilis

**Ketergantungan** pada tahap 10. Pelibatan siswa mengikuti izin dan pendampingan dalam PRD.

- [ ] REL-01 — Dapatkan hasil telaah akhir konten dari guru BK dan pemeriksaan konfigurasi data dari pengelola.
- [x] REL-02 — Siapkan checklist fungsi, lembar telaah konten, observasi, dan umpan balik berdasarkan instrumen lampiran proposal.
- [ ] REL-03 — Tetapkan peserta, perangkat sasaran, dan izin uji terbatas bersama sekolah. Jika izin belum tersedia, catat status prototipe untuk penelaahan internal.
- [ ] REL-04 — Bila diizinkan, lakukan uji terbatas dan catat siswa yang selesai mandiri, selesai dengan bantuan, atau belum selesai. Kumpulkan masukan tentang tampilan, petunjuk, materi, dan navigasi.
- [ ] REL-05 — Evaluasi sasaran awal PRD, yaitu minimal 80% peserta dapat membuka kuis, melihat hasil, dan menyusun contoh rencana tanpa bantuan navigasi. Laporkan jumlah peserta serta batas kondisi uji.
- [ ] REL-06 — Revisi temuan dan uji ulang bagian yang berubah. Catat uji siswa yang masih tertunda atau perangkat yang belum tersedia.
- [ ] REL-07 — Tentukan hosting, URL rilis, konfigurasi lingkungan produksi, dan penanggung jawab. Publikasikan sesuai arahan pemilik proyek.
- [ ] REL-08 — Periksa ulang alur inti, rute langsung, kontak, konfigurasi kuis, dan akses formulir pada URL rilis.
- [x] REL-09 — Serahkan kode, aset, instruksi menjalankan/build, daftar pengelola, hasil pemeriksaan, serta catatan revisi dan keterbatasan yang masih terbuka.
- [ ] REL-10 — Jika respons riil dikumpulkan, laksanakan masa simpan yang disetujui dan dokumentasikan penghapusan data sesuai PRD.

## Catatan pengerjaan dan hasil pemeriksaan

Isi catatan saat pekerjaan berlangsung. Tugas dinyatakan selesai ketika hasil yang disebutkan sudah tersedia dan diperiksa. Untuk tugas Google Forms yang tidak diterapkan, cantumkan keputusan memakai kuis lokal pada catatan.

| Tanggal    | ID tugas                                                                                           | Hasil atau bukti pemeriksaan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Kendala dan tindak lanjut                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-11-19 | PRE-01..PRE-05                                                                                     | Penyelarasan ekspor Stitch dengan `PRD.md` dan `design.md` selesai (penghapusan ikon profil/login, penggunaan teks navigasi & privasi PRD, penghapusan penyimpanan persisten, dan penambahan rute cadangan/404). Aset logo (107 KB), favicon (12 KB), dan ilustrasi hero (95 KB) dioptimalkan; font `Bricolage Grotesque` dan `DM Sans` dibundel lokal via `@fontsource`.                                                                                                                                                                                                                                                                          | `PRE-06` menunggu telaah langsung dari guru BK.                                                                                                                                                                                |
| 2026-11-19 | SET-01..SET-07, API-01..API-06                                                                     | Workspace npm `frontend` + `backend` (ES Modules) siap. Uji unit & API (`node --test backend/test/app.test.js`): 3/3 lulus (`GET /api/health`, `GET /api/public-config`, fallback lokal, 404 `/api/*` & `/assets/*`, fallback SPA).                                                                                                                                                                                                                                                                                                                                                                                                                | Konfigurasi default memakai `QUIZ_MODE=local` dan arahan menemui guru BK di sekolah sampai URL eksternal ditetapkan di `.env`.                                                                                                 |
| 2026-11-19 | UI-01..UI-07, PAGE-01..PAGE-07, ACT-01..ACT-07, QUIZ-01..QUIZ-05, PLAN-01..PLAN-07, INT-01..INT-06 | Build produksi Vite (`npm run build --workspace=frontend`) berhasil tanpa error (`dist/index.js` 362 kB / gzip 111.8 kB, `dist/index.css` 42.3 kB / gzip 7.4 kB).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `QUIZ-06`–`QUIZ-09` memakai kuis lokal sebagai mode utama sementara karena belum ada akun/URL Google Forms sekolah yang ditetapkan; UI untuk mode Google Forms dan pemberitahuan data tetap sudah tersedia dan diuji via mock. |
| 2026-11-19 | QA-01..QA-02, QA-03 (parsial), QA-04..QA-12                                                        | Uji otomatis pada **Google Chrome** dan **Microsoft Edge** desktop (`http://localhost:3001`) masing-masing lulus 17/17 pemeriksaan: lebar 360/390/768/1440 px tanpa gulir horizontal, menu desktop & ponsel + tombol Escape, alur Self-check–Action Plan, validasi spasi Action Plan & fokus error, kuis lokal 4/6, 6/6, 0/6 & latihan cadangan, 0 key `localStorage`/`sessionStorage`, 0 transmisi jawaban pribadi, fallback saat `/api/public-config` gagal, dan simulasi jaringan 1,5 Mbps / 750 kbps / latensi 150 ms cache kosong (Chrome 2.896 ms, Edge 2.711 ms < 5.000 ms).                                                                | `QA-03` untuk perangkat fisik Android Chrome dan iPhone Safari belum diuji (baru diuji pada Chrome dan Edge desktop Windows + viewport 360/390/768 px).                                                                        |
| 2026-11-19 | REL-02, REL-09                                                                                     | Disusun `docs/instrumen-pengujian-dan-telaah.md` (Checklist Uji Fungsi Lampiran 2 terisi hasil internal, serta Lembar Telaah Guru BK, Observasi, dan Umpan Balik Lampiran 3–5) dan `docs/paket-serah-terima.md` (status prototipe untuk penelaahan internal, keputusan kuis lokal, panduan jalankan/build/env, serta daftar keterbatasan terbuka).                                                                                                                                                                                                                                                                                                 | `REL-01`, `REL-03`–`REL-08`, dan `REL-10` menunggu telaah guru BK, izin sekolah untuk uji siswa terbatas, serta arahan hosting & URL rilis.                                                                                    |
| 2026-11-19 | Alur Berurutan 6 Kegiatan (`Perjalanan Potensimu`)                                                 | Diimplementasikan pembukaan langkah berurutan pada backend (`/api/journey/*` dan tabel SQLite `user_journey_progress` untuk status `completed`/`skipped` tanpa menyimpan jawaban pribadi) dan frontend (`JourneyProvider`, `JourneySection`, `RequireStepAccess`, peningkatan `NotchNav` `Kegiatan`, `ActivityCard`, `StepIndicator`, serta penautan 6 halaman kegiatan). Uji backend (`node --test backend/test/*.test.js`): 6/6 lulus (`app`, `auth`, `journey`); build Vite produksi lulus; E2E Chrome terisolasi (`verify-journey.mjs`) lulus seluruh skenario pada lebar 360/390/768/1024/1440 px tanpa error konsol maupun gulir horizontal. | `PRE-06`, `QUIZ-06`–`09`, `QA-03` (perangkat fisik Android Chrome & iPhone Safari), `REL-01`, `REL-03`–`08`, dan `REL-10` tetap terbuka menunggu telaah/izin sekolah & lingkungan rilis.                                       |
| 2026-11-20 | Rekapitulasi Jawaban Siswa (Dashboard Siswa, Staff / Admin / Superadmin / Guru BK)                | Jawaban kegiatan (Self-check, Kuis + skor pemahaman, Refleksi, Action Plan) otomatis terakumulasi dan tersimpan saat langkah diselesaikan (`POST /api/journey/steps/:stepId` dengan upsert ke `student_recaps`). Dashboard Siswa (`JourneySection`) menampilkan panel "Rekap Jawabanmu" dengan accordion rincian kegiatan dan navigasi ke `/rekap`. Menu staf (`/rekap-siswa` & `/riwayat-siswa`) menyertakan badge kegiatan terjawab, tautan langsung "Lihat Jawaban", dan kartu detail jawaban (`StaffRecapPage`). Unit/integrasi test 33/33 lulus, Playwright E2E 6/6 lulus, preflight deploy lulus. | Siap untuk deploy. Pengujian perangkat fisik nyata tetap disarankan sebelum rilis massal ke siswa. |

**Urutan mulai** adalah meninjau bahan Stitch dan konten, membuat fondasi proyek, lalu membangun komponen bersama. Setelah itu, implementasikan halaman dan API sebelum melakukan pemeriksaan alur produksi.

## Audit dan persiapan Vercel — 19 November 2026

- [x] AUD-01 — Telusuri auth, persetujuan akun, progres, privasi, frontend, backend, dan dependensi; catat akar masalah dalam `docs/audit-deploy-vercel.md`.
- [x] AUD-02 — Perbaiki kehilangan isian saat koneksi terganggu, isolasi akun, respons akses/progres terlambat, kontak publik, filter admin, validasi Action Plan/form, bootstrap password kosong, serta cache API/HTML.
- [x] AUD-03 — Tambahkan validasi konfigurasi produksi, runtime Node.js 24, readiness API, unit/integration test dan pengujian browser terisolasi.
- [x] AUD-04 — Verifikasi akhir: build produksi lulus, `npm test` 14/14, `npm run test:e2e` 5/5, audit dependensi 0 kerentanan terlapor, dan integritas SQLite lokal lulus. Hasil ini belum mencakup cloud Vercel atau perangkat fisik.
- [x] DEP-01 — PostgreSQL Supabase menjadi storage produksi wajib untuk auth, sesi, rate limit, review, dan progres. Migrasi versioned diterapkan pada schema `kreasi_development`, `kreasi_preview`, `kreasi`; akun/hash password/progres dummy diimpor tanpa mengubah SQLite asal. Sesi lokal tidak disalin.
- [x] DEP-02 — Entry API `api/index.js`, konfigurasi build/aset/SPA/API `vercel.json`, cold-start recovery, dan validasi konfigurasi resmi tersedia. Pengujian pada URL hosting masuk DEP-05.
- [x] DEP-03 — File environment privat Preview/Production disiapkan dengan schema terpisah dalam satu cluster, secret berbeda, origin HTTPS otomatis dari Vercel, dan akun dummy. Penerapan env ke dashboard Vercel dilakukan pemilik saat deploy mandiri (DEP-05).
- [x] DEP-04 — IP hanya dipercaya dari header platform pada adapter Vercel; header alternatif palsu diabaikan dan IP invalid ditolak. Dua IP, dua instance, atomic review/progres, cookie produksi, cold service, dan rollback diuji dengan PostgreSQL nyata.
- [x] AUD-05 — Hasil terbaru: `npm test` 26/26, browser 5/5, hosted API Supabase lulus beserta cleanup fixture, preflight dua environment lulus, dan validator config Vercel lulus. Panduan tersedia pada `docs/deploy-vercel.md`.
- [ ] DEP-05 — Pemilik membuat/import proyek Vercel dari root, memasukkan env pada target yang benar, deploy Preview/Production, lalu menjalankan smoke check dan alur browser HTTPS pada URL sebenarnya.
- [ ] DEP-06 — Sebelum rilis ke siswa: uji backup/restore, observabilitas/rollback deployment, perangkat fisik, telaah guru BK, dan prosedur pemulihan akun.
