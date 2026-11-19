# Audit aplikasi dan kesiapan deploy KREASI.ID

Tanggal: 19 November 2026. Target hosting: Vercel. Lingkup: kode frontend/backend, autentikasi dan persetujuan akun, enam kegiatan, privasi isian, penyimpanan, dependensi, build, dan jalur produksi.

## Keputusan rilis

**Kode dan database sudah disiapkan untuk tahap deploy mandiri ke Vercel.** Backend produksi memakai PostgreSQL Supabase, adapter/routing Vercel tersedia, dan environment Preview/Production telah dibuat sebagai file privat. Pemilik proyek memilih melakukan deployment sendiri; penerapan environment dan verifikasi URL HTTPS Vercel tetap menjadi tahap berikutnya.

Audit mencakup tes lokal serta API yang terhubung langsung ke Supabase. Belum dilakukan deployment Vercel, uji domain sebenarnya, atau uji backup/restore. Panduan tindakan pemilik proyek tersedia di [deploy-vercel.md](deploy-vercel.md).

## Penyelesaian DEP-01–DEP-04

| ID | Hasil implementasi dan verifikasi | Batas verifikasi |
| --- | --- | --- |
| DEP-01 | PostgreSQL wajib di produksi/Vercel. Better Auth, akun, sesi baru, rate limit, peninjauan, dan progres memakai database bersama. Migrasi SQL versioned/checksum/advisory lock telah diterapkan pada Supabase `xcpjdfwhtwhwcuuiicwq`. Akun dummy, hash password, dan metadata progres dari SQLite tersalin melalui transaksi; source tidak diubah. | Tiga schema dalam satu cluster: `kreasi_development`, `kreasi_preview`, `kreasi`. Sesi/token lokal tidak disalin; pengguna login ulang. |
| DEP-02 | `api/index.js`, lazy initialization yang pulih setelah kegagalan, dan `vercel.json` tersedia. Konfigurasi lolos schema resmi Vercel dan validator routing; tes handler mempertahankan path API/JSON 404. | Perilaku routing pada URL Vercel sebenarnya diuji pemilik setelah deploy. |
| DEP-03 | File privat `backend/.env.preview.local` dan `.env.production.local` sudah berisi koneksi, schema terpisah, dan secret acak berbeda. Origin HTTPS berasal dari system env Vercel atau override eksplisit; cookie produksi Secure/HttpOnly/SameSite. `deploy:check` lulus pada kedua schema hosted. | File belum dimasukkan ke environment proyek Vercel karena pemilik memilih deploy sendiri. Konektor menolak pembuatan proyek (403), CLI belum login; tidak ada proyek/deployment baru yang dibuat. |
| DEP-04 | IP hanya memakai `x-vercel-forwarded-for` ketika adapter berjalan di Vercel. Header IP alternatif dari pengguna ditimpa/diabaikan. IP tidak valid ditolak, tanpa mengaktifkan `trust proxy=true`. Tes dua IP dan dua instance memastikan bucket terpisah serta limit bersama dalam PostgreSQL. | Tes memakai header platform pada server uji; jalur proxy Vercel sebenarnya masih memerlukan smoke check setelah deploy. |

Seluruh tabel pada tiga schema memakai RLS, dan role Data API `anon`/`authenticated` tidak memiliki USAGE schema. Koneksi Supabase memverifikasi CA serta hostname; sertifikat Supabase Root 2021 dibundel. Schema Preview hanya berisi akun dummy, bukan respons siswa. Provider sesuai koneksi yang diberikan pemilik; tidak dibuat layanan database berbayar baru.

Rujukan perilaku platform: [request headers Vercel](https://vercel.com/docs/headers/request-headers), [environment sistem Vercel](https://vercel.com/docs/environment-variables/system-environment-variables), [koneksi Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Temuan audit awal — sebelum perbaikan di atas

Tabel berikut menyimpan akar masalah awal sebagai riwayat audit. Status terkini ada pada tabel penyelesaian, bukan pada rekomendasi awal ini.

| ID / prioritas | Akar masalah dan dampak | Tindakan yang diperlukan |
| --- | --- | --- |
| DEP-01 / P1 | `backend/src/auth.js` membuka `node:sqlite` dan menjalankan `mkdir`, WAL, serta migrasi pada file lokal. Instance Vercel tidak berbagi file dan `/tmp` tidak persisten. Akun dan progres tidak dapat dijamin bertahan atau konsisten antar-instance. | Migrasikan seluruh penyimpanan backend ke database hosted. Jangan memindahkan SQLite ke `/tmp` sebagai solusi produksi. |
| DEP-02 / P1 | Proxy `/api` di `frontend/vite.config.js` hanya berjalan pada server pengembangan. Belum ada konfigurasi produksi untuk menghubungkan build React, API Express, dan fallback SPA pada Vercel. | Tetapkan entrypoint API dan routing produksi. Dahulukan `/api/*` dan aset, kemudian fallback rute React. Uji deep link `/self-check` dan `/superadmin` serta JSON 404 untuk API yang tidak ada. |
| DEP-03 / P1 | URL produksi, secret produksi, database hosted, dan deployment preview belum tersedia dalam bukti audit ini. Konfigurasi lokal memakai localhost dan penyimpanan lokal. | Isi environment Preview/Production yang terpisah. Uji login, cookie Secure/HttpOnly/SameSite, Origin, persetujuan, logout, dan persistensi pada HTTPS yang sebenarnya. |
| DEP-04 / P2 | IP untuk rate limiter berasal dari `req.ip` dengan kebijakan proxy default Express. Di balik reverse proxy, ini berpotensi menjadi alamat proxy yang sama bagi semua pengguna. | Saat membuat adapter produksi, gunakan identitas IP dari proxy hosting yang tepercaya dan uji dua IP terpisah serta penolakan header IP palsu. Jangan mengaktifkan kepercayaan semua forwarded header tanpa batas. Belum diuji pada Vercel. |

Vercel mendokumentasikan filesystem Functions yang hanya dapat ditulis sementara di `/tmp`, dengan berkas terpisah per instance dan tidak bertahan setelah instance berhenti. Karena itu, SQLite berbasis file tidak dapat menjadi penyimpanan permanen aplikasi ini. [Dokumentasi filesystem Vercel Functions](https://vercel.com/docs/functions/runtimes#file-system-support).

Express didukung Vercel melalui ekspor aplikasi atau port listener pada entrypoint yang dikenali. Dukungan Express tersebut tetap memerlukan penataan deployment monorepo ini. Pada integrasi Express native, aset statis menggunakan direktori `public`, sedangkan `express.static()` tidak menjadi jalur penyajian aset. [Dokumentasi Express di Vercel](https://vercel.com/docs/frameworks/backend/express).

## Bug yang diperbaiki dan penguatan konfigurasi

| Area | Akar masalah | Perbaikan dan bukti |
| --- | --- | --- |
| Isian hilang saat koneksi terganggu | Gagal polling `/api/access/me` menghapus `user`, lalu route guard melepas halaman kegiatan. State formulir ikut hilang. | Kegagalan jaringan mempertahankan identitas terakhir dan formulir, disertai pemberitahuan koneksi. Respons sesi yang sah dengan `user: null` tetap mengakhiri akses. Reproduksi sebelum perbaikan: 0 checkbox tersisa; sesudah perbaikan: 35 checkbox tetap ada dan pilihan pertama tetap tercentang. API tetap memeriksa sesi di server. |
| Pergantian akun | Provider progres hanya bergantung pada boolean `approved`; pergantian dua akun yang sama-sama disetujui tidak menginisialisasi ulang data. | State perjalanan dan halaman diberi batas berdasarkan ID akun. Browser menguji perubahan sesi A ke B: pilihan pribadi dikosongkan dan progres B tetap milik B. |
| Respons akses terlambat | Pemeriksaan akses tidak dibatalkan saat berpindah langkah. State `allowed` dapat berasal dari langkah sebelumnya. | Pemeriksaan diberi key langkah, AbortController, dan nomor permintaan. Browser menguji respons Self-check yang ditahan saat navigasi ke Kuis yang terkunci. |
| Progres mundur akibat balapan request | Respons GET yang lebih lama dapat mengganti progres baru setelah penyelesaian langkah. | Mutasi memakai nomor permintaan; snapshot yang mengurangi status completed/skipped diabaikan. Diuji dengan snapshot yang datang terlambat. Berlaku pada kontrak saat ini yang tidak menyediakan reset progres. |
| API tampak berhasil padahal salah routing | JSON parse yang gagal diganti `{}`, termasuk bila hosting mengembalikan HTML SPA dengan HTTP 200. Request juga tidak memiliki batas waktu. | Pemeriksaan tipe/format JSON, batas waktu 10 detik, dukungan pembatalan, dan pelestarian status error. Tes menolak HTML, JSON rusak, timeout, serta pembatalan. |
| Kontak tidak muncul untuk pengunjung | Halaman Kontak publik memanggil `/api/public-config` yang memerlukan akun disetujui. | Endpoint `/api/support` publik hanya mengirim konfigurasi kontak. Konfigurasi kuis tetap terlindungi. Diuji tanpa login dan dengan penolakan URL `javascript:`. |
| Filter dashboard menampilkan baris lama | Daftar filter sebelumnya tetap terlihat dan bisa ditindak saat filter baru dimuat. | Baris dibersihkan saat filter berubah; loading menutupi daftar selama pemuatan, dengan `aria-busy`. Browser menahan request filter untuk menguji kondisi ini. |
| Ringkasan Action Plan tidak lagi cocok | Setelah ringkasan dibuat, mengedit/mengosongkan isian wajib tidak membatalkan snapshot yang sudah valid. | Mengubah isian membatalkan ringkasan. Penyelesaian baru aktif kembali setelah validasi dan ringkasan dibuat ulang. |
| Validasi native field wajib | `FormField` hanya memasang `aria-required`, tanpa atribut HTML `required`. | Atribut diteruskan ke input/textarea. Form yang menggunakan `noValidate` tetap memakai validasi aplikasi dan fokus pada isian bermasalah. |
| Bootstrap superadmin gagal dari contoh env | `SUPERADMIN_PASSWORD=` adalah string kosong sehingga operator `??` tidak menghasilkan kata sandi acak. | String kosong kini menghasilkan kata sandi acak. Tes menjalankan CLI dengan database sementara dan memastikan akun `approved`/`superadmin` terbentuk. |
| Cache respons akun/error dan HTML | Respons penolakan API belum seluruhnya diberi `no-store`; akses langsung `index.html` memakai cache satu jam. | Seluruh API akun/konfigurasi/error memakai `no-store`; HTML langsung memakai `no-cache`. Aset tetap dapat di-cache. |
| Salah konfigurasi produksi sulit diketahui | Default localhost dapat ikut terpakai, sebelum validasi konfigurasi selesai file sudah dibuat. | Validasi origin HTTPS produksi, secret minimal 32 karakter, trusted origins, serta database hosted wajib dilakukan sebelum membuka penyimpanan. Tidak ada fallback SQLite atau pembuatan secret file pada produksi. |
| Backend lama tampak sehat | `/api/health` hanya menandakan proses hidup; kejadian 404 sebelumnya berasal dari proses backend lama yang belum memuat route journey. | `/api/ready` memeriksa akses tabel akun/progres dan mengumumkan kapabilitas `accounts`, `journey-v1`; gagal dengan 503 jika belum siap. Dev backend memakai `node --watch`. |

Implementasi utama ada di `AuthProvider.jsx`, `JourneyProvider.jsx`, `RequireStepAccess.jsx`, `progress-snapshot.js`, layanan request frontend, `auth-config.js`, `app.js`, `SuperadminPage.jsx`, dan `ActionPlanPage.jsx`.

Node.js dipatok ke `24.x` pada paket root dan backend agar runtime `node:sqlite` yang diuji tidak bergantung pada default hosting yang berubah. Vercel mendukung pemilihan major melalui `engines.node`. [Versi Node.js di Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Hasil verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Build Vite produksi | Berhasil. |
| `npm test` | 26/26 lulus, termasuk PostgreSQL nyata terisolasi: dua instance, peninjauan/progres bersamaan, rollback, rate limit, cookie, cold start, dan import SQLite. |
| `npm run test:e2e` | 5/5 lulus pada Chrome; waktu suite browser akhir 36,5 detik. |
| `npm run test:hosted` | Lulus: API lokal terhubung ke Supabase Preview, signup/pending, review bersamaan, enam langkah, pembacaan dari service baru, logout. Fixture dibersihkan; akun lama dipertahankan. |
| `npm run deploy:check` | Preview dan Production lulus: koneksi TLS, readiness, versi migrasi, delapan tabel privat, role publik ditolak, dan secret terpisah. |
| Konfigurasi Vercel | Lulus schema resmi dan validator route. |
| Kredensial pada build frontend | 3 artefak HTML/JS/CSS dipindai terhadap koneksi, password database, dan secret auth yang terkonfigurasi; 0 kebocoran ditemukan. |
| `npm audit --json` | 0 kerentanan terlapor; bukan jaminan seluruh kode bebas celah. |
| Database lokal, pemeriksaan read-only | `PRAGMA quick_check`: `ok`; `foreign_key_check`: 0 pelanggaran. |
| Deployment / domain HTTPS Vercel | Belum dijalankan; dilakukan mandiri oleh pemilik. Database hosted telah diuji terpisah. |

Tes backend meliputi penolakan tamu dan akun pending/rejected, perlindungan role/status dari input pengguna, izin superadmin, peninjauan bersamaan, paginasi dan jumlah akun, Origin, pembatasan percobaan login, logout, urutan kegiatan, skip yang diizinkan, idempotensi, serta pembukaan kembali file database.

Tes browser memakai **build produksi** yang disajikan Express dengan database **in-memory khusus tes**. Output build berada di `frontend/dist-e2e` agar tidak berebut berkas dengan build lain di `frontend/dist`. Database akun proyek tidak digunakan. Skenario: halaman publik, kontak, pendaftaran, status pending, persetujuan melalui UI superadmin, langkah terkunci, enam kegiatan, validasi kuis, validasi/edit Action Plan, progres setelah login ulang, gangguan jaringan, pergantian akun, logout, filter superadmin, dan respons akses terlambat. Lebar viewport yang diperiksa: 360, 768, dan 1440 piksel. Emulasi viewport bukan pengganti pengujian perangkat fisik atau Safari.

Pemeriksaan privasi browser mengamati payload POST selama alur contoh: tulisan Refleksi dan Action Plan tidak ikut terkirim, dan tidak tersimpan di localStorage/sessionStorage. Server hanya menyimpan metadata progres. Ini tidak menguji isi Google Forms eksternal.

## Batasan fungsional yang perlu diketahui

1. **Selesai adalah pernyataan pengguna.** API progres menegakkan urutan dan identitas akun, tetapi menerima aksi `complete` tanpa bukti pengguna membaca materi atau mengirim kuis. Pemanggilan API berurutan dapat menandai semua kegiatan selesai. Cocok sebagai pencatat eksplorasi; belum cocok sebagai bukti penilaian atau sertifikasi. Jika bukti pengerjaan diwajibkan, perlu kontrak penyelesaian server untuk aktivitas yang relevan.
2. **Google Forms memakai konfirmasi pengguna.** Checkbox tidak memverifikasi pengiriman ke Forms. Belum tersedia URL/akun Forms sekolah untuk pengujian nyata; mode lokal adalah jalur yang diuji menyeluruh. Pengaturan pengumpulan email, skor, serta retensi Forms harus diperiksa pada layanan tersebut sebelum diaktifkan.
3. **Isian pribadi tidak dipulihkan dari database.** Reload, meninggalkan kegiatan, logout, atau perubahan akun mengosongkan isian. Progres completed/skipped tetap tersimpan. Ini perilaku privasi yang disengaja; UI mengingatkan pengguna menyalin rencana.
4. **Pemulihan kata sandi mandiri belum tersedia.** Tentukan prosedur pengelola sebelum rilis luas dan siapkan admin produksi yang terkelola. Akun dummy lokal bukan konfigurasi akun produksi.
5. **Rilis ke siswa masih memerlukan telaah konten dan uji perangkat.** Item telaah guru BK dan pengujian Android/iPhone fisik dalam TASKLIST tetap terbuka. Bagian Google Sites pada PRD merupakan rancangan awal; panduan deployment aktif harus mengikuti React/Express serta keputusan Vercel terbaru.

## Langkah berikutnya

Implementasi DEP-01–DEP-04 dan migrasi hosted sudah dikerjakan. Pemilik menjalankan tahap deployment dan pemeriksaan URL sesuai [panduan deploy mandiri](deploy-vercel.md). Perintah `deploy:check-url` tersedia untuk memeriksa routing dan akses tanpa login pada URL yang sebenarnya. Backup/restore, pemantauan/rollback deployment, dan uji perangkat fisik tetap merupakan pemeriksaan operasional sebelum rilis luas.

## Menjalankan ulang pemeriksaan

Dari folder root dengan Node.js 24:

```powershell
npm ci
npm test
npm run test:e2e
npm audit
```

Tes browser memakai Chrome terpasang secara default. Jika tidak tersedia, pasang Chromium Playwright dan pilih channel tersebut:

```powershell
npx playwright install chromium
$env:BROWSER_CHANNEL = 'chromium'
npm run test:e2e
```

`playwright.config.mjs` menyalakan server tes pada `127.0.0.1:4107`, tanpa memakai port/server pengembangan. Trace hanya disimpan untuk kegagalan di `test-results/` yang diabaikan Git. Data dan kredensial fixture hanya untuk tes.
