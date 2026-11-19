# Panduan deploy mandiri KREASI.ID ke Vercel

Pembaruan 19 November 2026. Deployment dilakukan sendiri oleh pemilik proyek sesuai arahan terakhir. Kode, database hosted, dan file environment sudah disiapkan; URL Vercel belum diterbitkan atau diuji oleh agen.

## Yang sudah tersedia

- Frontend React/Vite di `frontend/`, API Express di `backend/`, adapter Vercel di `api/index.js`.
- `vercel.json`: build `npm run build`, output `frontend/dist`, API Node.js, region `bom1` dekat database Mumbai, routing API sebelum fallback SPA, dan 404 untuk aset yang hilang.
- PostgreSQL Supabase proyek `xcpjdfwhtwhwcuuiicwq`; koneksi runtime Transaction pooler dan migrasi Session pooler telah diverifikasi dengan TLS serta pemeriksaan hostname.
- Schema terpisah dalam **satu proyek/cluster**: `kreasi_development`, `kreasi_preview`, dan `kreasi`. Ini isolasi logical schema, bukan tiga database fisik.
- Masing-masing schema berisi satu akun superadmin dummy dari SQLite lama dan metadata progresnya. Tidak ada jawaban kegiatan yang dipindahkan. Kredensial dummy sebelumnya tetap berlaku; sesi lama tidak disalin sehingga perlu login ulang.
- File SQLite asal tetap ada sebagai salinan sumber. Tabel auth/progres hosted memakai RLS dan akses schema ditolak untuk role Supabase `anon`/`authenticated`.

## 1. Periksa sebelum deploy

Jalankan dari root proyek dengan Node.js 24:

```powershell
npm ci
npm test
npm run build
npm run deploy:check
```

Tes browser opsional untuk mengulang seluruh alur UI:

```powershell
npm run test:e2e
```

Jika Chrome belum tersedia, gunakan Chromium Playwright:

```powershell
npx playwright install chromium
$env:BROWSER_CHANNEL = 'chromium'
npm run test:e2e
```

## 2. Buat/import proyek Vercel dari root repository

Root Directory harus `./`, bukan hanya `frontend` atau `backend`.

| Pengaturan | Nilai |
| --- | --- |
| Framework Preset | Vite |
| Node.js | 24.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `frontend/dist` |

Konfigurasi yang sama sudah ada di repository. Sertakan folder `api`, `backend`, `frontend`, file root `package.json`, `package-lock.json`, dan `vercel.json`. `.vercelignore` mengecualikan kredensial lokal, SQLite, hasil tes, dan proposal dari upload deployment.

Repository tersedia di [tegokkk/KREASI.ID](https://github.com/tegokkk/KREASI.ID), dengan branch `main`. Import repository tersebut melalui dashboard Vercel menggunakan konfigurasi di atas. Sebagai alternatif, untuk jalur CLI, jalankan dari root:

```powershell
npx vercel@66.2.0 login
npx vercel@66.2.0 link --scope tegokkk1
npx vercel@66.2.0 project inspect --non-interactive --scope tegokkk1
```

Saat link, buat/pilih proyek KREASI.ID pada tim yang benar. Pastikan hasil inspect menunjuk proyek tersebut sebelum melanjutkan. Tahap link belum menerbitkan aplikasi.

## 3. Masukkan environment ke target yang sesuai

File berikut **sudah berisi nilai asli dan secret acak**, diabaikan Git serta upload Vercel:

| File lokal privat | Target di dashboard Vercel | Schema |
| --- | --- | --- |
| `backend/.env.preview.local` | Preview saja | `kreasi_preview` |
| `backend/.env.production.local` | Production saja | `kreasi` |

Buka file lokal tersebut di editor, lalu masukkan pasangan key/value ke Environment Variables proyek. Jika menyalin nilai satu per satu, jangan sertakan tanda kutip pembungkus dari format `.env`. Jangan masukkan file ini ke repository. Pilih target yang benar untuk masing-masing file; secret Preview dan Production berbeda.

Variabel yang sudah disiapkan: `DATABASE_URL`, `DATABASE_SCHEMA`, `DATABASE_POOL_MAX`, `BETTER_AUTH_SECRET`, `QUIZ_MODE`, `QUIZ_RETENTION_DAYS`. Kanal BK dan URL kuis eksternal ditambahkan jika memang sudah dikonfigurasi.

**Jangan tambahkan prefix `VITE_` pada koneksi database atau secret.** Keduanya hanya digunakan backend. `DATABASE_MIGRATION_URL` tidak diperlukan oleh Function yang melayani pengguna.

Origin autentikasi memakai environment sistem Vercel: Preview menggunakan `VERCEL_URL`, sedangkan Production menggunakan `VERCEL_PROJECT_PRODUCTION_URL`. Pastikan fitur expose System Environment Variables aktif pada proyek. Jika memakai domain utama pilihan sendiri, isi `BETTER_AUTH_URL=https://domain-utama` dan `AUTH_TRUSTED_ORIGINS=https://domain-utama` pada target terkait. Jangan menyalin nilai localhost dari `.env.example` ke Vercel.

Dasar konfigurasi: [system environment variables Vercel](https://vercel.com/docs/environment-variables/system-environment-variables), [koneksi PostgreSQL Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

Untuk memperbarui file privat dari koneksi lokal, jalankan:

```powershell
npm run deploy:prepare
npm run deploy:check
```

Perintah prepare mempertahankan secret yang sudah ada. Jika kata sandi database berubah, perbarui dulu `backend/.env.local`, lalu jalankan kembali dan perbarui nilai di dashboard.

## 4. Deploy Preview dan periksa URL sebenarnya

Jika menggunakan CLI, setelah environment terpasang di dashboard:

```powershell
npx vercel@66.2.0 deploy --environment preview --scope tegokkk1
```

Setelah Preview tersedia:

```powershell
npm run deploy:check-url -- https://URL-PREVIEW-ANDA.vercel.app
```

Pemeriksaan ini hanya membaca halaman/API. Hasil yang diharapkan: halaman root/deep link 200 HTML, readiness 200 JSON, API kegiatan/admin tanpa login 401 JSON, API tidak ada 404 JSON, dan aset tidak ada 404.

Jika Preview memakai Vercel Deployment Protection, gunakan automation bypass secret yang dibuat pengelola proyek melalui environment terminal `VERCEL_AUTOMATION_BYPASS_SECRET` saat menjalankan smoke check; tidak perlu mematikan proteksi. [Panduan akses otomatis Vercel](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation).

Lanjutkan uji melalui browser di URL HTTPS: Masuk, daftar akun, pending, setujui di superadmin, urutan enam kegiatan, refresh/progres, dan Keluar. Cookie harus Secure/HttpOnly/SameSite, dan akun yang logout tidak boleh mengakses API kegiatan.

## 5. Deploy Production

Setelah Preview lulus, lakukan deployment Production dengan environment Production. Ulangi smoke check dan uji login/logout pada domain utama. Data siswa di Production tidak memakai schema Preview.

```powershell
npx vercel@66.2.0 deploy --prod --scope tegokkk1
```

Sebelum rilis ke siswa, selesaikan telaah guru BK, uji perangkat fisik, prosedur pemulihan akun, serta backup/pemulihan database. Tahap tersebut belum dinyatakan lulus hanya berdasarkan build dan tes lokal.

## Migrasi berikutnya dan pemeliharaan

Migrasi **tidak dijalankan pada cold start atau build**. Runner menggunakan file SQL versioned di `supabase/migrations`, transaksi, checksum, dan advisory lock. Initial migration sudah diterapkan pada tiga schema di atas.

Untuk perubahan schema selanjutnya, buat migration baru melalui Supabase CLI, lalu gunakan runner aplikasi:

```powershell
npm run db:migrate
```

Perintah tersebut membaca `backend/.env.local`, termasuk `DATABASE_SCHEMA` dan `DATABASE_MIGRATION_URL`. Saat ini default lokal menunjuk `kreasi_development`. Targetkan Preview lalu Production secara eksplisit untuk perubahan berikutnya. Jangan menjalankan SQL bertoken `__KREASI_SCHEMA__` secara mentah melalui `supabase db push`: runner aplikasi mengganti token dengan nama schema yang telah divalidasi.

Import SQLite hanya untuk target kosong, memakai transaksi dan mempertahankan password hash:

```powershell
npm run db:import-sqlite
```

Initial import sudah selesai; menjalankan ulang pada target terisi akan dibatalkan. Sesi, token verifikasi, dan rate limit lokal tidak disalin. Akun harus login ulang setelah perpindahan penyimpanan.

Pengujian API terhadap Supabase Preview dapat diulang dengan:

```powershell
npm run test:hosted
```

Script hanya memakai schema `kreasi_preview`, membuat fixture sementara, lalu membersihkan akun fixture beserta relasinya. Akun yang sudah ada dipertahankan. Pengujian ini menguji API lokal→Supabase dan tidak menggantikan smoke check URL Vercel.

Jika `/api/ready` mengembalikan 503, periksa environment target, ketersediaan database, sertifikat CA, dan versi migrasi pada log Function. Jika API mengembalikan HTML, periksa Root Directory dan pastikan `vercel.json` ikut diterapkan. Jangan menonaktifkan verifikasi TLS atau mengganti PostgreSQL dengan file di `/tmp` untuk melewati kegagalan.
