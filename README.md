# KREASI.ID

## Menjalankan pengembangan lokal

Dari folder utama:

```powershell
npm install
npm run dev
```

Perintah `npm run dev` juga bisa dijalankan dari folder `frontend`. Backend dan frontend dijalankan bersama. Buka `http://localhost:5173` setelah terminal menampilkan URL Vite.

Launcher menunggu API siap sebelum membuka frontend. Backend yang sudah berjalan dan sehat digunakan kembali; proses lain tidak dihentikan. `Ctrl+C` menghentikan proses yang dibuat launcher. Jika Vite lama masih berjalan di terminal, hentikan dulu dengan `Ctrl+C` sebelum menjalankan ulang perintah di atas.

Saat backend restart, proxy pengembangan menunggu maksimal 8 detik. Request baca yang terputus dicoba kembali; pengiriman form/login tidak diulang setelah diteruskan. Jika backend yang dipakai bersama berhenti, launcher menunggu jeda 3 detik lalu menjalankan backend pengganti. Watcher backend yang masih hidup tetap menangani restart dan menampilkan error kode/konfigurasi di terminal.

Jika backend tetap tidak tersedia, API memberikan HTTP 503 dengan pesan yang jelas. Periksa pesan backend pada terminal untuk masalah konfigurasi atau database. Hasil build dan pengujian di `dist`/`dist-e2e` diabaikan watcher Vite agar tidak memuat ulang halaman pengembangan.

Untuk menjalankan kedua layanan secara terpisah, gunakan dua terminal dari root:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Konfigurasi lokal berada di `backend/.env.local`. Jangan masukkan kredensial ke repository. Panduan deployment tersedia di [docs/deploy-vercel.md](docs/deploy-vercel.md).
