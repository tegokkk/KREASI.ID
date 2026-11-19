# Struktur Proyek KREASI.ID

Dokumen ini menjadi acuan struktur kode dan tech stack pembangunan KREASI.ID. Proyek menggunakan JavaScript untuk frontend dan backend, dengan dua folder utama `frontend/` dan `backend/` dalam satu repositori.

Kebutuhan fitur mengacu pada [PRD.md](PRD.md) dan tampilan mengacu pada [design.md](design.md). Untuk implementasi ini, website menggunakan React sebagai platform utama. Rancangan teknis Google Sites pada dokumen sebelumnya dialihkan ke halaman dan komponen React. Google Forms tetap dapat menjadi integrasi kuis.

## 1. Tech stack

| Bagian            | Teknologi yang digunakan                                 | Tanggung jawab                                                                          |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Bahasa            | JavaScript ES Modules                                    | Kode `.js` dan komponen React `.jsx`.                                                   |
| Frontend          | React dan React DOM                                      | Menampilkan halaman, komponen, formulir, dan rangkuman aktivitas.                       |
| Build frontend    | Vite dan `@vitejs/plugin-react`                          | Server pengembangan, pemrosesan JSX, dan build produksi.                                |
| Routing           | React Router, paket `react-router`                       | Navigasi halaman melalui `BrowserRouter`, `Routes`, `Route`, dan `Link`.                |
| Styling           | CSS Modules dan CSS custom properties                    | Gaya per komponen serta token global dari `design.md`.                                  |
| State             | `useState` dan `useReducer` sesuai kompleksitas formulir | Menampung pilihan, isian sementara, hasil kuis lokal, dan status validasi.              |
| Komunikasi API    | Fetch API bawaan browser                                 | Mengambil konfigurasi publik dari backend.                                              |
| Runtime backend   | Node.js 24 LTS                                           | Menjalankan aplikasi server JavaScript.                                                 |
| Framework backend | Express 5                                                | Endpoint API dan penyajian hasil build frontend.                                        |
| Pengelolaan paket | npm workspaces                                           | Mengelola paket `backend` dan `frontend` dengan satu lockfile di root.                  |
| Konten aplikasi   | Modul JavaScript                                         | Materi, pertanyaan, contoh, dan pembahasan yang ditelaah guru BK.                       |
| Integrasi kuis    | Google Forms atau kuis lokal                             | Formulir eksternal saat tersedia, dengan latihan dan kuis lokal sebagai jalur cadangan. |

Versi dependensi yang kompatibel ditetapkan saat inisialisasi proyek dan dicatat dalam `package-lock.json`. Pilih template Vite `react` untuk JavaScript. Gunakan `"type": "module"` pada paket frontend dan backend.

## 2. Struktur folder utama

Struktur berikut merupakan rancangan kode yang akan dibuat saat implementasi.

```text
KREASI.ID/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── health.routes.js
│   │   │   ├── public-config.routes.js
│   │   │   ├── access.routes.js
│   │   │   └── journey.routes.js
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── create-superadmin.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── PageLayout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── FormField.jsx
│   │   │   │   └── InfoPanel.jsx
│   │   │   └── navigation/
│   │   │       ├── ActivityCard.jsx
│   │   │       ├── StepIndicator.jsx
│   │   │       └── ActivityNavigation.jsx
│   │   ├── content/
│   │   │   ├── activities.js
│   │   │   ├── learning-materials.js
│   │   │   └── help.js
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── AuthProvider.jsx
│   │   │   │   ├── AuthPage.jsx
│   │   │   │   ├── VerificationPage.jsx
│   │   │   │   ├── SuperadminPage.jsx
│   │   │   │   └── AccountMenu.jsx
│   │   │   ├── journey/
│   │   │   │   ├── JourneyProvider.jsx
│   │   │   │   ├── JourneySection.jsx
│   │   │   │   └── RequireStepAccess.jsx
│   │   │   ├── self-check/
│   │   │   │   ├── SelfCheckForm.jsx
│   │   │   │   ├── SelfCheckSummary.jsx
│   │   │   │   └── questions.js
│   │   │   ├── quiz/
│   │   │   │   ├── QuizForm.jsx
│   │   │   │   ├── QuizResult.jsx
│   │   │   │   ├── QuizPractice.jsx
│   │   │   │   └── questions.js
│   │   │   ├── reflection/
│   │   │   │   ├── ReflectionForm.jsx
│   │   │   │   └── questions.js
│   │   │   └── action-plan/
│   │   │       ├── ActionPlanForm.jsx
│   │   │       ├── ActionPlanSummary.jsx
│   │   │       └── template.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── SelfCheckPage.jsx
│   │   │   ├── RecognizePotentialPage.jsx
│   │   │   ├── DevelopPotentialPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── ReflectionPage.jsx
│   │   │   ├── ActionPlanPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── TipsPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── journey.js
│   │   │   └── public-config.js
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── package.json
├── package-lock.json
├── PRD.md
├── design.md
└── structure.md
```

CSS khusus komponen ditempatkan berdampingan dengan komponen terkait, misalnya `Header.module.css` dan `SelfCheckForm.module.css`. Aset yang diimpor komponen berada di `src/assets/`. `public/` menampung berkas yang memerlukan alamat langsung, seperti favicon.

## 3. Pembagian tanggung jawab

| Lokasi                                   | Isi dan aturan penggunaan                                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/config.js`                  | Membaca variabel lingkungan, memvalidasi nilai, dan membentuk konfigurasi publik yang aman ditampilkan di browser.                     |
| `backend/src/routes/`                    | Handler endpoint pemeriksaan server, akses akun, peninjauan superadmin, perjalanan berurutan (`/api/journey`), dan konfigurasi publik. |
| `backend/src/app.js`                     | Menyusun middleware, rute API, penanganan error, dan penyajian build frontend di produksi.                                             |
| `backend/src/server.js`                  | Membuka koneksi HTTP pada port yang ditetapkan.                                                                                        |
| `frontend/src/components/`               | Komponen yang digunakan lintas halaman, termasuk tata letak dan navigasi.                                                              |
| `frontend/src/content/`                  | Materi pembelajaran, deskripsi enam kegiatan, contoh, serta teks bantuan.                                                              |
| `frontend/src/features/`                 | Komponen, state, pertanyaan, autentikasi/superadmin, penjaga akses & menu perjalanan (`journey/`), dan logika khusus setiap aktivitas. |
| `frontend/src/pages/`                    | Komposisi halaman yang menggabungkan materi dan komponen aktivitas.                                                                    |
| `frontend/src/services/journey.js`       | Mengambil progres perjalanan, memeriksa akses langkah, dan menyimpan penyelesaian/lewati langkah tanpa isi pribadi.                    |
| `frontend/src/services/public-config.js` | Mengambil konfigurasi dengan Fetch API dan menentukan konfigurasi cadangan ketika permintaan gagal.                                    |
| `frontend/src/styles/tokens.css`         | Variabel warna, tipografi, radius, dan jarak dari sistem desain.                                                                       |
| `frontend/src/styles/global.css`         | Gaya dasar dokumen, aksesibilitas, dan aturan responsif bersama.                                                                       |
| `frontend/src/App.jsx`                   | Pemetaan rute, kerangka bersama, dan halaman tidak ditemukan.                                                                          |
| `frontend/src/main.jsx`                  | Memasang aplikasi React dan `BrowserRouter`.                                                                                           |

State jawaban berada di komponen aktivitas dan dibersihkan ketika halaman aktivitas ditinggalkan atau sesi halaman dimulai ulang. Materi dapat dibaca kembali melalui navigasi. Siswa menyimpan rencana yang ingin dibawa pulang dengan menyalinnya ke catatan pribadi.

## 4. Rute halaman frontend

| URL                      | Komponen halaman             | Fungsi                                                          |
| ------------------------ | ---------------------------- | --------------------------------------------------------------- |
| `/`                      | `HomePage.jsx`               | Hero, tombol mulai, dan enam kartu kegiatan.                    |
| `/self-check`            | `SelfCheckPage.jsx`          | Lima kelompok pilihan dan rangkuman Catatanku.                  |
| `/kenali-potensi`        | `RecognizePotentialPage.jsx` | Materi mengenali minat, bakat, kemampuan, dan potensi.          |
| `/mengembangkan-potensi` | `DevelopPotentialPage.jsx`   | Materi latihan, eksplorasi, hambatan, dan dukungan.             |
| `/kuis`                  | `QuizPage.jsx`               | Tautan Google Forms, latihan cadangan, atau kuis lokal.         |
| `/refleksi`              | `ReflectionPage.jsx`         | Enam pertanyaan refleksi opsional.                              |
| `/action-plan`           | `ActionPlanPage.jsx`         | Lima isian wajib, evaluasi opsional, serta ringkasan Rencanaku. |
| `/tentang`               | `AboutPage.jsx`              | Tujuan, cara penggunaan, peran guru BK, dan privasi.            |
| `/tips`                  | `TipsPage.jsx`               | Saran memulai latihan dan meminta masukan.                      |
| `/kontak`                | `ContactPage.jsx`            | Kanal sekolah yang terverifikasi dan bantuan penggunaan.        |
| URL lain                 | `NotFoundPage.jsx`           | Petunjuk kembali ke Beranda.                                    |

Menu header dan menu perjalanan `Perjalanan Potensimu` menampilkan urutan enam kegiatan secara berurutan: `Self-check`, `Kenali Potensi`, `Mengembangkan Potensi`, `Kuis`, `Refleksi`, dan `Action Plan`. Bagi akun dengan status `approved`, pembukaan langkah dikunci secara berurutan pada frontend (`RequireStepAccess.jsx`) dan backend (`/api/journey`), termasuk saat pengguna membuka URL kegiatan secara langsung; langkah yang sudah dibuka/selesai/dilewati tetap dapat dikunjungi kembali (`Self-check` dan `Refleksi` dapat dilewati dengan tetap membuka langkah berikutnya).

## 5. API, konfigurasi, dan data

| Endpoint                 | Data respons                                                                | Tujuan                                                        |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `GET /api/health`        | `status`                                                                    | Memeriksa apakah server berjalan.                             |
| `GET /api/public-config` | `quiz.mode`, `quiz.formUrl`, `quiz.retentionDays`, dan `support.contactUrl` | Menentukan mode kuis serta informasi kontak yang ditampilkan. |

Variabel yang didokumentasikan di `backend/.env.example` meliputi `PORT`, `QUIZ_MODE`, `QUIZ_FORM_URL`, `QUIZ_RETENTION_DAYS`, dan `BK_CONTACT_URL`. Nilai `QUIZ_MODE` adalah `local` atau `google-forms`. Mode formulir memerlukan URL responden dan masa simpan yang sudah disetujui pengelola. Konfigurasi cadangan menggunakan kuis lokal dan petunjuk menemui guru BK di sekolah.

Materi dan bank soal dikelola dalam kode frontend. Self-check, Refleksi, dan Action Plan tetap diproses di browser dengan state sementara (jawaban pribadi tidak pernah dikirim atau disimpan ke server). Backend mengelola autentikasi, persetujuan akun, progres status langkah per pengguna (`user_journey_progress` dengan status `completed` atau `skipped`), dan konfigurasi kegiatan yang dibaca setelah akun disetujui. Respons kuis yang menggunakan Google Forms dikelola melalui layanan tersebut sesuai aturan privasi dalam PRD.

### Autentikasi dan persetujuan akun

Implementasi akun menggunakan Better Auth dengan PostgreSQL Supabase pada produksi, `pg` Pool dan Kysely PostgreSQL adapter. SQLite melalui `node:sqlite` tersedia untuk pengembangan lokal tanpa `DATABASE_URL`. `backend/src/auth.js` menyiapkan auth/koneksi, `repository.js` menangani transaksi dan query, dan `migrations.js` menjalankan migrasi versioned secara eksplisit dari `supabase/migrations/`. Migrasi PostgreSQL tidak dijalankan pada startup/cold start. `backend/src/routes/access.routes.js` mengelola identitas dan peninjauan superadmin; `create-superadmin.js` membuat admin melalui terminal.

Adapter Vercel berada di `api/index.js`, konfigurasi hosting di `vercel.json`, dan pemeriksaan IP platform di `backend/src/client-ip.js`. Frontend di CDN mengakses `/api` pada origin yang sama. File environment privat terpisah untuk Preview/Production, dengan schema dan secret berbeda. Lihat `docs/deploy-vercel.md`.

Komponen akun berada di `frontend/src/features/auth/`, mencakup AuthProvider, AuthPage, VerificationPage, SuperadminPage, dan AccountMenu beserta CSS Modules. Rute akun adalah `/login`, `/daftar`, `/verifikasi`, dan `/superadmin`. Halaman kegiatan memerlukan status `approved`, sedangkan `/superadmin` memerlukan peran `superadmin`.

Beranda dengan animasi, Tentang, Tips, dan Kontak adalah rute publik. Tombol Masuk tersedia pada navigasi desktop dan menu ponsel. Formulir akun menyediakan tautan Kembali ke Beranda.

- `/api/auth/*` menangani pendaftaran, login, dan logout dengan sesi cookie HttpOnly.
- `GET /api/access/me` mengembalikan identitas dan status terbaru.
- `GET /api/admin/users?status=pending&page=1` menampilkan daftar akun per status, 50 akun per halaman.
- `POST /api/admin/users/:id/review` memproses keputusan `approved` atau `rejected` dan catatan opsional dalam transaksi.
- `GET /api/journey` mengembalikan daftar enam langkah beserta status akses (`completed`, `skipped`, `active`, `locked`) dan ringkasan progres untuk akun `approved`.
- `GET /api/journey/steps/:stepId/access` memvalidasi apakah langkah sudah terbuka atau masih terkunci (`HTTP 403`) sesuai langkah sebelumnya.
- `POST /api/journey/steps/:stepId` mencatat `{ action: 'complete' | 'skip' }` ke tabel `user_journey_progress` secara atomik (tanpa menerima atau menyimpan jawaban pribadi Self-check, Refleksi, maupun Action Plan).
- `GET /api/public-config` memerlukan akun yang telah disetujui.

Database dan rahasia pengembangan berada di `backend/data/` yang diabaikan Git. Produksi menggunakan volume persisten, URL HTTPS, `BETTER_AUTH_SECRET`, dan daftar origin yang sesuai domain rilis. Jawaban pribadi siswa tetap dikelola sebagai state sementara.

## 6. Cara menjalankan setelah implementasi

Root `package.json` menetapkan `workspaces` ke `backend` dan `frontend`, dengan `private` bernilai `true`. Masing-masing paket memiliki dependensinya sendiri dan memakai satu `package-lock.json` di root.

| Perintah dari root                   | Hasil yang direncanakan                                         |
| ------------------------------------ | --------------------------------------------------------------- |
| `npm install`                        | Memasang dependensi kedua workspace.                            |
| `npm run dev`                        | Menjalankan backend dan frontend bersama; frontend menunggu API siap. |
| `npm run dev --workspace=backend`    | Menjalankan backend di port 3001 dengan mode pantau Node.js.    |
| `npm run dev --workspace=frontend`   | Menjalankan Vite di port 5173.                                  |
| `npm run build --workspace=frontend` | Menghasilkan build di `frontend/dist/`.                         |
| `npm start --workspace=backend`      | Menjalankan Express untuk API dan build frontend pada produksi. |

Frontend mengakses API melalui path relatif `/api`. Saat pengembangan, proxy Vite meneruskan permintaan ke backend. Pada Vercel, CDN melayani build frontend dan Function Node.js melayani API pada origin yang sama, sesuai `vercel.json`. Express tetap dapat melayani frontend/API saat dijalankan standalone. Rute API diproses sebelum fallback React; API dan aset yang tidak ditemukan menghasilkan 404.

Perintah `npm run dev` dari root maupun dari `frontend/` menjalankan `scripts/dev.mjs`. Launcher menggunakan kembali backend KREASI.ID yang sudah sehat atau menjalankannya dalam watch mode, menunggu `/api/ready`, lalu menjalankan Vite. Launcher memulihkan backend yang berhenti setelah jeda 3 detik, tanpa menggandakan watcher backend miliknya yang masih hidup. `npm run dev:frontend` dari root atau `npm run dev:ui` dari frontend hanya menjalankan UI dan memerlukan backend terpisah. Proxy lokal di `frontend/dev-api-proxy.mjs` memakai IPv4 `127.0.0.1`, menyesuaikan `PORT` backend saat memakai launcher, dan menunggu hingga 8 detik saat restart. Hanya GET/HEAD tanpa body yang dapat dicoba kembali setelah koneksi terputus; request tulis tidak dikirim ulang. Downtime berkepanjangan menghasilkan JSON HTTP 503. Plugin ini hanya aktif pada server pengembangan; hasil build/pengujian diabaikan watcher Vite.

Hasil UI dari Stitch diterjemahkan ke komponen React, CSS Modules, dan token desain yang telah ditetapkan. Pemeriksaan implementasi mencakup alur enam kegiatan, validasi Action Plan, pembukaan rute secara langsung, kuis lokal dan eksternal, serta pengosongan isian pribadi ketika pengguna berpindah halaman.

## 7. Referensi teknis

- React dan Vite untuk proyek JavaScript. [Panduan Vite](https://vite.dev/guide/)
- React Router untuk navigasi deklaratif. [Panduan React Router](https://reactrouter.com/start/modes)
- CSS Modules untuk gaya komponen. [Dokumentasi CSS Vite](https://vite.dev/guide/features.html#css-modules)
- Express untuk API dan penyajian aset. [Dokumentasi Express](https://expressjs.com/starter/static-files/)
- npm workspaces untuk pengelolaan paket. [Dokumentasi npm](https://docs.npmjs.com/cli/using-npm/workspaces/)
