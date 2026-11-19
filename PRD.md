# PRD KREASI.ID

**Kenali, Refleksikan, Eksplorasi, dan Aktualisasikan Potensi Diri**  
**Versi** 1.0 · **Tanggal** 19 November 2026 · **Status** Rancangan untuk ditelaah sebelum pembangunan  
**Produk** Website pendukung layanan Bimbingan dan Konseling (BK) untuk peserta didik SMP  
**Sumber utama** Proposal revisi Restyna Rahmayanti (2026), dirujuk menurut nomor halaman tercetak.

**Pembaruan implementasi atas permintaan pemilik proyek** menambahkan pendaftaran, login, dan persetujuan akun oleh superadmin. Website menggunakan React dan Express sesuai `structure.md`. Pendaftar berstatus `pending`, lalu superadmin memberi keputusan `approved` atau `rejected`. Semua halaman kegiatan memerlukan sesi akun yang disetujui. Nama, email, hash kata sandi, sesi, status, riwayat peninjauan, serta metadata progres disimpan di PostgreSQL Supabase pada produksi Vercel. SQLite tetap tersedia untuk pengembangan lokal tanpa `DATABASE_URL`. Jawaban aktivitas tetap bersifat sementara di peramban.

## 1. Analisis proposal

Peserta didik SMP membutuhkan cara yang mudah dipahami untuk mengenali minat dan kemampuan, mencoba pengalaman baru, lalu menentukan langkah pengembangan yang bisa dilakukan dalam keseharian. Guru BK membutuhkan media yang dapat dipakai dalam layanan klasikal dan dibuka kembali secara mandiri oleh siswa. Nilai utama KREASI.ID ada pada rangkaian aktivitas dari pengenalan diri hingga rencana tindakan, dengan pendampingan guru BK bila diperlukan.

| Temuan proposal                                                                                                                          | Implikasi bagi website                                                                                                                                                                                               | Sumber                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Siswa perlu menghubungkan minat dan pengalaman dengan tindakan yang terjangkau.                                                          | Mulai dari pengalaman sehari-hari, berikan contoh lintas bidang, dan akhiri dengan satu rencana yang dapat dipantau.                                                                                                 | Bab I (hlm. 1–5) dan §3.4 (hlm. 23–25)                                |
| Pendekatan humanistik menghargai pengalaman dan pilihan masing-masing siswa.                                                             | Self-check membantu siswa merangkum jawabannya sendiri. Kuis menilai pemahaman materi. Hasil aktivitas bebas dari peringkat antarsiswa, kategori bakat tetap, dan keputusan otomatis tentang pendidikan atau karier. | §2.1.2–2.1.5 (hlm. 7–9) dan §2.5 (hlm. 19–20)                         |
| Enam kegiatan disusun bertahap, dengan materi yang bisa diulang.                                                                         | Sediakan alur terpandu dari beranda dan akses langsung ke setiap menu.                                                                                                                                               | §2.2.5 (hlm. 14) dan §3.4 (hlm. 23–25)                                |
| Google Sites menjadi platform utama. Google Forms direncanakan untuk beberapa aktivitas, sementara refleksi dianjurkan bersifat pribadi. | Gunakan Google Sites untuk halaman dan navigasi. Rancangan ini mengusulkan Google Forms untuk kuis dan umpan balik uji coba, dengan aktivitas personal dikerjakan di peramban atau buku catatan.                     | §1.6 (hlm. 4–5), §2.2.2–2.2.3 (hlm. 10–13), dan §2.5 (hlm. 19–20)     |
| Luaran proposal berupa prototipe dan evaluasi awal kelayakan.                                                                            | Penerimaan produk didasarkan pada fungsi, telaah konten, kemudahan penggunaan, dan privasi. Instrumen lampiran masih berupa rancangan dan belum menghasilkan data uji.                                               | §3.1–3.3 (hlm. 21–23), §3.5–3.8 (hlm. 25–27), dan Lampiran Gambar 2–5 |

Jumlah soal, label tombol, perilaku penyimpanan, target uji, serta pengelompokan halaman pendukung di bawah merupakan keputusan rancangan awal. Validasi dilakukan bersama pemilik produk dan guru BK pada tahap perancangan.

## 2. Pengguna, tujuan, dan lingkup

| Pengguna                            | Kebutuhan dan peran                                                                                                                                                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Peserta didik SMP kelas VII–IX      | Membuka materi di ponsel atau komputer, mengikuti kegiatan dengan petunjuk singkat, dan membawa pulang rencana yang bisa dicoba. Dapat menjawab secara pribadi dan menentukan sendiri hal yang ingin dibahas dengan guru BK. |
| Guru BK                             | Memperkenalkan media dalam kelas, memandu diskusi tanpa mewajibkan siswa membagikan jawaban pribadi, menelaah konten, dan mendampingi tindak lanjut.                                                                         |
| Pemilik produk dan pengelola teknis | Menyiapkan akun dan hak akses, memperbarui situs dan kuis, mengendalikan respons yang dikumpulkan, serta mendokumentasikan pengujian dan revisi. Peran dapat dirangkap sesuai penugasan sekolah.                             |

Setelah mengikuti alur, siswa diharapkan dapat menyebutkan satu minat atau kemampuan yang ingin dieksplorasi, menjelaskan satu cara melatihnya, dan menyusun satu rencana dengan langkah, target waktu, dan cara memantau kemajuan. Capaian ini menjadi sasaran desain dan dinilai sebagai bagian dari uji coba terbatas.

**Lingkup prototipe** mencakup beranda, keenam menu, informasi penggunaan dan bantuan, kuis dengan umpan balik, sarana menyimpan rencana secara mandiri, serta paket pengujian ADDIE. Beranda dan materi dapat digunakan dalam sesi mandiri maupun layanan klasikal.

**Di luar lingkup prototipe** mencakup tes psikologis terstandar, diagnosis, penjurusan otomatis, konseling melalui chat, pelacakan kemajuan lintas perangkat, dashboard jawaban siswa untuk guru, serta domain kustom. KREASI.ID adalah nama produk. Alamat rilis website React ditetapkan oleh pengelola.

## 3. Struktur website dan navigasi

Nama halaman di bawah menjadi acuan pembuatan halaman di Google Sites. Judul dan tautan final mengikuti alamat yang diterbitkan.

| Halaman atau tautan   | Isi utama                                                                                 | Tindakan pengguna                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Beranda               | Identitas KREASI.ID, pengantar, petunjuk singkat, enam kartu kegiatan, dan akses bantuan. | **Mulai Self-check** atau buka salah satu kartu.                                                                             |
| Tentang KREASI.ID     | Tujuan, sasaran, cara menggunakan website, peran guru BK, dan penjelasan privasi singkat. | Kembali ke beranda atau mulai kegiatan.                                                                                      |
| Menu                  | Grup navigasi menuju enam halaman inti. Keenam kartu beranda menuju halaman yang sama.    | Pilih atau ulangi kegiatan.                                                                                                  |
| Self-check            | Pertanyaan pengenalan diri, petunjuk, dan rangkuman pribadi.                              | **Lihat Catatanku**, lalu **Lanjut ke Kenali Potensi**.                                                                      |
| Kenali Potensi        | Pemahaman dasar, perbedaan istilah, dan contoh potensi.                                   | **Lanjut ke Mengembangkan Potensi**.                                                                                         |
| Mengembangkan Potensi | Latihan bertahap, contoh kegiatan, serta cara menghadapi hambatan dan mencari dukungan.   | **Lanjut ke Kuis**.                                                                                                          |
| Kuis                  | Petunjuk, kuis pemahaman, dan cara melihat hasil.                                         | **Buka Kuis**, lalu kembali ke halaman kuis dan pilih **Lanjut ke Refleksi**.                                                |
| Refleksi              | Panduan merefleksikan pengalaman dengan pertanyaan berpemandu.                            | Tulis secara pribadi atau langsung **Lanjut ke Action Plan**.                                                                |
| Action Plan           | Contoh rencana, isian rencana, dan panduan meninjau kembali hasil latihan.                | **Lihat Rencanaku**, salin ke catatan pribadi, atau kembali ke beranda.                                                      |
| Tips                  | Kumpulan ringkas cara memulai latihan dan menghadapi hambatan sehari-hari.                | Lanjut ke materi Mengembangkan Potensi atau Action Plan.                                                                     |
| Kontak dan Bantuan    | Cara mendapatkan pendampingan guru BK dan langkah saat tautan atau aktivitas bermasalah.  | Hubungi guru BK melalui kanal sekolah yang disetujui. Jika kanal belum ditetapkan, arahkan siswa menemui guru BK di sekolah. |

**Alur terpandu**

```text
Beranda → Self-check → Kenali Potensi → Mengembangkan Potensi
        → Kuis → Refleksi → Action Plan → Coba langkah dan tinjau kembali
```

- Setiap halaman inti menyediakan tautan **Sebelumnya** dan **Lanjut** dengan nama tujuan yang jelas. Self-check kembali ke beranda. Action Plan menyediakan tombol **Kembali ke Beranda**. Menu tetap dapat diakses tanpa menyelesaikan kegiatan lain.
- Tautan kuis membuka halaman responden Google Forms di tab baru dan diberi label yang menjelaskan perpindahan tersebut. Halaman Kuis tetap memuat petunjuk melihat hasil dan tombol menuju Refleksi.
- Langkah pada halaman menunjukkan posisi di alur, misalnya **Kuis · Langkah 4 dari 6**. Akses langsung ke sebuah halaman tetap menampilkan petunjuk dan konteks yang dibutuhkan.
- Penggunaan klasikal dimulai dari penjelasan guru BK, dilanjutkan kegiatan individual, lalu pembahasan sukarela tentang contoh atau rencana yang ingin siswa bagikan. Siswa dapat meninjau rencananya setelah mencoba langkah pertama.

## 4. Persyaratan fungsional dan kriteria penerimaan

Semua persyaratan FR berikut diperlukan untuk prototipe. Materi, pertanyaan, dan umpan balik final menjadi bagian dari telaah guru BK.

### FR-01 · Beranda, navigasi, dan bantuan

- Beranda menjelaskan tujuan dalam satu paragraf pendek dan menyajikan tombol **Mulai Self-check** serta enam kartu dalam urutan proposal. Kartu memuat judul, ikon pendukung, dan satu kalimat yang menjelaskan kegiatannya.
- Menu utama mengikuti arah Lampiran Gambar 1, yaitu Beranda, Tentang KREASI.ID, Menu, Tips, dan Kontak dan Bantuan. Tautan bantuan dan privasi dapat ditemukan dari halaman aktivitas.
- **Diterima jika** tombol mulai membuka Self-check, keenam kartu dan item menu membuka tujuan yang benar, tautan navigasi sebelumnya/lanjut berfungsi, dan pengguna dapat kembali ke beranda atau menemukan bantuan dari setiap halaman inti.

### FR-02 · Self-check

- Gunakan lima pertanyaan ringan dengan pilihan jamak seperti _membaca dan mencari tahu_, _berkarya_, _berolahraga_, _membantu teman_, atau _bekerja sama_. Kelima pertanyaan mencakup kegiatan yang disukai, kemampuan yang dirasa dimiliki, hal yang menarik perhatian, pengalaman yang menyenangkan, dan bidang yang ingin dicoba. Pilihan dibuat sesuai konteks pertanyaan dan mencakup **Belum tahu** atau **Lainnya** tanpa kolom identitas. Siswa boleh melewati pertanyaan.
- **Lihat Catatanku** mengelompokkan pilihan siswa di bawah pertanyaan asal dan memberi ajakan memilih satu hal untuk dipikirkan lagi. Saat semua pertanyaan kosong, tampilkan ajakan memilih jawaban atau langsung membaca materi. Sediakan **Ubah Jawaban** dan **Hapus Jawaban**. Pertanyaan juga tersedia sebagai teks di halaman agar dapat ditinjau tanpa komponen interaktif.
- **Diterima jika** variasi pilihan, jawaban sebagian, dan kondisi kosong menghasilkan tampilan yang sesuai. Rangkuman memuat pilihan siswa sendiri tanpa skor, peringkat, penetapan tipe bakat, atau pengiriman jawaban.

### FR-03 · Kenali Potensi

- Materi mencakup pengertian potensi diri, perbedaan minat, bakat, kemampuan, dan potensi, ragam akademik dan nonakademik, cara mengenalinya lewat kegiatan sehari-hari, serta pentingnya eksplorasi pada masa remaja.
- Gunakan contoh konkret, misalnya siswa yang senang menjelaskan pelajaran kepada teman dapat mencoba melatih komunikasi melalui presentasi kelompok. Susun materi menjadi bagian pendek dengan contoh dan pertanyaan pemantik.
- **Diterima jika** kelima topik tampil sebagai teks yang dapat dibaca di ponsel dan diperiksa oleh guru BK, dan pengguna dapat lanjut ke Mengembangkan Potensi atau kembali ke Self-check.

### FR-04 · Mengembangkan Potensi

- Materi mencakup manfaat pengembangan potensi, latihan bertahap, pengalaman baru, pilihan kegiatan akademik dan nonakademik, cara menghadapi hambatan, serta dukungan keluarga, teman, dan sekolah.
- Untuk tiap contoh, tampilkan kegiatan, langkah pertama, hambatan yang mungkin muncul, dan pilihan dukungan. Contoh mencakup kegiatan yang bisa dilakukan dengan fasilitas sederhana, seperti latihan menjelaskan satu topik selama lima menit bersama teman.
- **Diterima jika** keenam topik tersedia, contoh memuat pilihan yang realistis di sekolah atau rumah, dan tombol berikutnya membuka Kuis.

### FR-05 · Kuis pemahaman

- Rancangan awal memakai enam soal pilihan ganda. Alokasikan dua soal masing-masing untuk cara mengenali potensi, pentingnya mengembangkan potensi, dan langkah pengembangan. Setiap soal memiliki satu jawaban benar, bobot satu poin, dan pembahasan singkat berbasis materi. Pengiriman berhasil setelah semua soal wajib terisi.
- Tampilkan total jawaban benar dan pembahasan segera setelah pengiriman melalui tampilan hasil individu Google Forms. Siswa dapat kembali ke materi, mengulang kuis, atau lanjut ke Refleksi. Nilai hanya menunjukkan pemahaman materi pada percobaan tersebut.
- Sediakan latihan cadangan di halaman Kuis berupa soal setara dengan pembahasan yang bisa dibuka satu per satu jika Forms tidak dapat diakses. Apabila aturan akun sekolah atau hasil uji melarang Forms, gunakan kuis interaktif yang menghitung nilai di peramban dengan bank soal dan kriteria hasil yang sama.
- **Diterima jika** pengisian lengkap menghasilkan skor yang sesuai kunci untuk kasus semua benar, semua salah, dan campuran. Pembahasan bisa ditemukan, siswa bisa mencoba ulang, dan jalur cadangan tetap dapat digunakan saat Forms ditutup atau gagal dimuat.

### FR-06 · Refleksi pribadi

- Sediakan enam pertanyaan berpemandu tentang potensi yang mulai disadari, kegiatan yang disukai, kemampuan yang ingin dilatih, pengalaman baru, hambatan, dan dukungan yang dibutuhkan. Setiap isian bersifat opsional.
- Siswa dapat menulis sementara di halaman, memakai buku catatan, atau melewati aktivitas. Teks pengantar menjelaskan bahwa jawaban bersifat pribadi dan siswa dapat memilih sendiri hal yang ingin dibicarakan dengan guru BK. Tampilkan pertanyaan di halaman utama secara langsung dan sediakan **Hapus Jawaban** pada isian interaktif.
- **Diterima jika** siswa dapat mengisi sebagian atau langsung lanjut, seluruh isian bisa dikosongkan, tidak ada jawaban yang terkirim atau terbawa ke halaman berikutnya, dan opsi buku catatan tetap tersedia saat komponen interaktif gagal.

### FR-07 · Action Plan

| Isian                    | Aturan                                                                 | Contoh                                                         |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Potensi atau kemampuan   | Wajib, satu kemampuan yang ingin dilatih.                              | Berbicara di depan kelompok.                                   |
| Tujuan                   | Wajib, hasil yang bisa diamati.                                        | Menjelaskan satu topik selama dua menit.                       |
| Langkah atau kegiatan    | Wajib, minimal satu langkah konkret.                                   | Latihan bersama teman dua kali dalam sepekan.                  |
| Target waktu             | Wajib, tanggal atau periode yang jelas.                                | Dalam dua minggu sejak mulai latihan.                          |
| Cara memantau            | Wajib, indikator sederhana.                                            | Catat durasi latihan dan satu masukan setiap kali latihan.     |
| Evaluasi setelah mencoba | Opsional pada rencana awal. Siswa meninjaunya kembali setelah praktik. | Sudah mencapai dua menit. Latihan berikutnya fokus pada tempo. |

- **Lihat Rencanaku** memvalidasi lima isian wajib, termasuk jawaban yang hanya berisi spasi, lalu menampilkan ringkasan yang bisa diseleksi dan disalin manual. Tampilkan pesan dekat isian yang perlu dilengkapi dan pertahankan isian lain ketika validasi gagal. Sediakan **Ubah Rencana** dan **Hapus Isian**.
- Template enam bagian dan satu contoh rencana lengkap tersedia sebagai teks. Anjurkan siswa menyalin rencana ke buku atau catatan di perangkat pribadi sebelum keluar agar dapat mengisinya kembali setelah mencoba.
- **Diterima jika** lima isian wajib menghasilkan ringkasan yang siap disalin, evaluasi boleh kosong, revisi langsung tercermin saat ringkasan dibentuk ulang, dan template tetap bisa digunakan saat komponen interaktif tidak tampil.

### FR-08 · Akun dan verifikasi superadmin

Pendaftar mengisi nama, email unik, dan kata sandi minimal 12 karakter. Akun baru memiliki peran pengguna dan status menunggu. Pengguna masuk untuk melihat status. Superadmin memeriksa daftar akun per status dan memberi keputusan setujui atau tolak dengan catatan opsional. Keputusan disimpan bersama identitas peninjau dan waktu peninjauan. Dua peninjauan bersamaan menghasilkan satu keputusan.

**Diterima jika** pengunjung langsung melihat animasi dan Beranda, dapat membuka Tentang, Tips, serta Kontak, dan menemukan tombol Masuk untuk membuka formulir login. Akses kegiatan memeriksa sesi serta persetujuan akun. Akun menunggu atau ditolak tertahan saat membuka kegiatan, sedangkan akun yang disetujui dapat melanjutkan. Pengguna biasa tertahan dari API serta panel superadmin. Logout mengakhiri sesi di server. Hak akses dan status ditetapkan oleh server.

## 5. Desain visual, konten, dan aksesibilitas

- Gunakan Lampiran Gambar 1 sebagai acuan komposisi. Beranda dimulai dari header biru tua, judul dan pengantar, ilustrasi siswa SMP dalam konteks sekolah, tombol mulai, lalu enam kartu. Tampilkan teks judul, petunjuk, dan tombol sebagai elemen halaman yang dapat dibaca dan ditekan. Gunakan ilustrasi dengan izin yang jelas.
- Pertahankan pembeda visual antarkartu dari lampiran melalui aksen biru, kuning, hijau, ungu, koral, dan teal. Nama dan ikon membantu identifikasi tanpa mengandalkan warna. Gunakan kisi dua sampai tiga kolom pada layar lebar sesuai kemampuan Google Sites. Pada ponsel, susun vertikal dengan urutan yang sama.
- Halaman materi dimulai dengan judul dan tujuan singkat, diikuti materi, contoh, dan navigasi. Halaman aktivitas diawali tujuan dan petunjuk, diikuti isian, hasil atau langkah berikutnya, serta bantuan. Gunakan bahasa Indonesia yang akrab, ringkas, sopan, dan bebas dari perbandingan antarsiswa.
- Target tampilan dapat dibaca pada lebar 360–1440 piksel tanpa gulir horizontal. Gunakan ukuran teks isi sekitar 16 piksel, kontras minimal 4,5:1 untuk teks biasa, serta target sentuh sekitar 44 × 44 piksel untuk tombol utama jika dapat diatur. Uji zoom 200%, urutan fokus, indikator fokus, label setiap isian, pembacaan pesan kesalahan, dan teks alternatif untuk ilustrasi yang menyampaikan informasi.
- Gunakan gambar terkompresi, prioritaskan konten teks, dan hindari video putar otomatis. Uji beranda dan alur utama di ponsel kelas menengah pada jaringan lambat. Sasaran awal adalah judul dan tombol mulai tampak dalam lima detik pada simulasi unduh 1,5 Mbps, unggah 750 kbps, dan latensi 150 ms dengan cache kosong. Catat hasil aktual serta kondisi pengukuran.

## 6. Rancangan teknis dan privasi

### Komponen dan integrasi

| Komponen          | Implementasi yang direncanakan                                                                                                                                                                                                                                                                                                               | Pemeriksaan awal                                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Sites      | Halaman, kartu, menu, konten, petunjuk, template, dan tautan dikelola melalui editor.                                                                                                                                                                                                                                                        | Uji situs yang sudah diterbitkan, termasuk izin pembaca, bukan hanya pratinjau editor.                                                                                                                         |
| Aktivitas pribadi | Self-check, Refleksi, dan Action Plan menggunakan sematan HTML/CSS/JavaScript ringan. Data hanya berada dalam memori komponen selama halaman terbuka. Render ringkasan sebagai teks. Matikan pengisian otomatis pada isian pribadi dan kosongkan isian serta ringkasan saat siswa menghapusnya atau halaman dipulihkan setelah ditinggalkan. | Uji sematan sejak tahap perancangan di ponsel. Periksa fokus, gulir, keadaan isian setelah muat ulang atau tombol kembali, dan kondisi ketika sematan diblokir. Template berbasis teks menjadi jalur cadangan. |
| Google Forms      | Kuis sebagai Google Forms Quiz. Formulir umpan balik uji pengguna terpisah dari kuis. Formulir menggunakan tautan responden pada halaman yang relevan.                                                                                                                                                                                       | Uji pembukaan, penyelesaian, hasil kuis, dan akses responden pada sesi tanpa login jika kebijakan akun mengizinkan.                                                                                            |

Google Sites menyediakan sematan kode dan pengaturan akses situs terbit. Pastikan konfigurasi situs, tautan, dan formulir cocok dengan kelompok sasaran menggunakan akun pengelola yang sebenarnya. Jika akun sekolah membatasi akses, tentukan lingkup pengguna yang diizinkan sebelum tautan disebarkan dan gunakan kuis lokal bila Google Forms memerlukan identitas di luar cakupan. [Panduan sematan Google Sites](https://support.google.com/sites/answer/90569?hl=en), [panduan publikasi Google Sites](https://support.google.com/sites/answer/6372880?hl=en).

Konfigurasi kuis mengaktifkan penilaian segera, tampilan pembahasan untuk jawaban individu, dan pesan konfirmasi yang mengarahkan siswa kembali ke website. Nonaktifkan pengumpulan email, pembatasan satu respons yang memerlukan login, akses ringkasan respons bagi responden, serta tautan edit respons. Gunakan publikasi responden yang sesuai izin sekolah. Uji bahwa membuka hasil kuis individu tidak membuka respons siswa lain. [Panduan kuis Google Forms](https://support.google.com/docs/answer/7032287?hl=en), [panduan pengaturan responden](https://support.google.com/docs/answer/2839588?hl=en).

### Data dan pengelolaan akses

| Data                                    | Lokasi dan akses                                                                                                                                                                                      | Retensi                                                                                                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pilihan Self-check dan tulisan Refleksi | Memori peramban selama aktivitas atau catatan yang dibuat sendiri oleh siswa. Aplikasi tidak menggunakan penyimpanan peramban, parameter URL, pengiriman jaringan, atau skrip analitik untuk jawaban. | Isian di halaman dihapus saat dikosongkan atau saat sesi halaman berakhir. Salinan pribadi dikelola oleh siswa.                                                              |
| Action Plan                             | Memori peramban ketika menyusun rencana. Salinan dibuat secara sadar oleh siswa di catatan pribadi.                                                                                                   | Sama dengan aktivitas pribadi. Sebelum siswa mengisi, jelaskan bahwa membuka ulang halaman akan memulai isian baru.                                                          |
| Kuis Google Forms                       | Jawaban pilihan ganda, skor, dan waktu pengiriman yang dicatat layanan. Akses respons bagi pengelola yang ditugaskan.                                                                                 | Jadwal usulan maksimal 30 hari sejak respons diterima, untuk disetujui sebelum formulir dibuka. Jika tidak disetujui, gunakan kuis lokal sampai ada keputusan.               |
| Umpan balik dan observasi uji coba      | Tanggapan tentang materi, alur, dan tampilan. Gunakan catatan berkode tanpa nama atau rincian pribadi.                                                                                                | Usulan tanggapan mentah dihapus paling lambat 30 hari setelah uji coba ditutup. Pertahankan rangkuman temuan yang tidak mengidentifikasi peserta sesuai kesepakatan sekolah. |

- Sebelum membuka Google Forms, jelaskan tujuan, data yang dikumpulkan, pihak yang dapat melihatnya, dan masa simpan. Gunakan pilihan tertutup untuk kuis dan pilihan tertutup serta komentar opsional untuk evaluasi. Pesan pada komentar mengingatkan agar siswa tidak menulis nama, alamat, nomor telepon, atau kisah pribadi yang sensitif.
- Pengelola yang ditugaskan memegang kepemilikan situs dan formulir, dengan hak editor yang diberikan sesuai kebutuhan. Pemeriksaan izin meliputi formulir dan salinan data jika dibuat. Hindari spreadsheet respons secara bawaan. Jika sekolah memerlukan ekspor, terapkan aturan akses dan penghapusan yang sama pada ekspor tersebut. Pengelola mencatat tanggal penghapusan dan menangani tanggapan yang tanpa sengaja memuat identitas sesuai prosedur sekolah.
- Periksa di peramban bahwa perubahan isian pribadi, pembuatan ringkasan, dan penghapusan tidak mengirim jawaban. Matikan integrasi analitik opsional di produk. Pada perangkat bersama, petunjuk meminta siswa menghapus isian sebelum menyerahkan perangkat.
- Jelaskan pada Self-check, Kuis, Tentang, dan Bantuan bahwa alat ini mendukung eksplorasi diri. Contoh teks untuk siswa pada Self-check adalah “Jawabanmu membantu kamu melihat hal yang menarik untuk dicoba. Hasil ini tidak menentukan bakatmu.” Kebutuhan pendampingan lebih lanjut diarahkan ke guru BK melalui jalur sekolah.

## 7. Rencana pembangunan dengan ADDIE

| Tahap             | Kegiatan dan luaran                                                                                                                                                                                                                   | Syarat melanjutkan                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1. Analysis       | Validasi kebutuhan siswa, perangkat yang tersedia, kondisi koneksi, cara guru BK memandu kegiatan, dan kebijakan izin sekolah. Jika akses lapangan terbatas, dokumentasikan kebutuhan dari proposal dan asumsi yang belum teruji.     | Pemilik produk dan penelaah BK disepakati. Target penggunaan diketahui dan rencana izin uji coba tersedia.               |
| 2. Design         | Finalisasi wireframe beranda dan tiap jenis halaman, bank soal beserta pembahasan, teks materi, isian rencana, pemberitahuan privasi, dan instrumen uji. Buat percobaan kecil sematan dan kuis untuk memeriksa perilaku situs terbit. | Guru BK menelaah rancangan konten. Pemilik produk menyetujui alur dan cara menyimpan respons.                            |
| 3. Development    | Bangun struktur dan konten Google Sites, sematkan tiga aktivitas pribadi, konfigurasi kuis dan formulir evaluasi, lalu kerjakan uji fungsi dan perbaikan internal dengan data contoh.                                                 | Semua jalur inti dan cadangan dapat dipakai pada lingkungan uji. Hak akses dan konten telah ditinjau.                    |
| 4. Implementation | Lakukan uji terbatas jika izin tersedia. Guru BK mendampingi, pengembang mencatat kendala perangkat/navigasi, dan siswa memberikan umpan balik sukarela.                                                                              | Catatan uji tersedia. Jika izin belum tersedia, dokumentasikan pemeriksaan internal dan tandai uji siswa masih tertunda. |
| 5. Evaluation     | Rangkum hasil secara deskriptif, perbaiki temuan, uji ulang halaman terdampak, dan siapkan serah terima.                                                                                                                              | Kriteria rilis internal terpenuhi. Status uji siswa dan hasil revisi tercantum dalam dokumentasi.                        |

Jadwal kalender mengikuti perkuliahan dan ketersediaan sekolah. Perancangan materi dapat berjalan bersamaan dengan pemeriksaan akses platform. Pengujian dengan siswa bergantung pada izin dan pendampingan. Paket serah terima berisi URL situs, daftar pemilik dan editor, sumber konten serta sematan yang dapat diperbarui, daftar tautan responden dan pengaturan data, instrumen, hasil pemeriksaan, dan catatan revisi.

## 8. Pengujian dan kriteria rilis

| Uji                                         | Kasus minimum                                                                                                                                                                                                                      | Bukti yang disimpan                                                                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uji fungsi · Lampiran Gambar 2              | Beranda, semua kartu dan menu, tombol mulai/kembali/lanjut, enam fitur, akses bantuan, tautan formulir, dan isi yang terbaca. Uji kondisi kosong, isian sebagian, nilai kuis, pengulangan, penghapusan, serta tautan yang ditutup. | Checklist dengan hasil, perangkat, tanggal, dan temuan.                                                                                                  |
| Telaah konten · Lampiran Gambar 3           | Kesesuaian tujuan, bahasa SMP, contoh realistis, hubungan soal dengan materi, ketepatan kunci, batas self-check, dan privasi pertanyaan refleksi.                                                                                  | Persetujuan penelaah BK dan daftar revisi.                                                                                                               |
| Uji aksesibilitas dan perangkat             | Ponsel Android Chrome, iPhone Safari jika tersedia, dan komputer Chrome atau Edge. Uji menu sempit, zoom, papan ketik, pembaca layar, sesi tanpa login, perangkat bersama, serta koneksi lambat.                                   | Matriks perangkat dan lingkungan aktual. Catat perangkat sasaran yang belum teruji.                                                                      |
| Uji privasi dan izin                        | Periksa tidak ada transmisi jawaban pribadi, akses editor terpisah dari akses siswa, email tidak dikumpulkan pada kuis, hasil responden lain tertutup, dan formulir evaluasi tidak meminta identitas.                              | Catatan pengujian dengan data contoh dan daftar pengelola yang berwenang.                                                                                |
| Uji pengguna terbatas · Lampiran Gambar 4–5 | Minta siswa menemukan kegiatan, mengikuti petunjuk, membaca hasil kuis, menemukan bantuan, dan menyusun rencana contoh. Kumpulkan masukan tentang bahasa, tampilan ponsel, navigasi, dan bagian yang membingungkan.                | Rekap jumlah peserta yang selesai mandiri, selesai dengan bantuan, atau tidak selesai. Catatan observasi dan saran dirangkum tanpa isi refleksi pribadi. |

**Ambang rilis internal**

- Seluruh kriteria FR-01 sampai FR-07 lulus pada perangkat utama yang disepakati. Guru BK menyetujui konten dan pengelola menyetujui konfigurasi akses serta data. Masalah yang menghalangi alur inti atau berisiko membuka data siswa harus diselesaikan sebelum tautan dibagikan.
- Jika uji pengguna diizinkan, sasaran awal usulan adalah minimal 80% peserta bisa membuka kuis, melihat hasil, dan menghasilkan contoh Action Plan dengan lima isian wajib tanpa bantuan navigasi. Laporkan jumlah peserta berhasil dan total peserta, perangkat, serta hambatan yang ditemukan. Bila sasaran belum tercapai, revisi bagian yang macet kemudian uji ulang bila memungkinkan.
- Jika uji pengguna belum diizinkan, luaran dapat dicatat sebagai **prototipe untuk penelaahan internal**, dengan status kelayakan penggunaan oleh siswa masih menunggu uji terbatas. Hasil evaluasi awal menilai kelayakan dan kemudahan penggunaan. Pembuktian dampak terhadap perkembangan potensi membutuhkan kajian lanjutan.

## 9. Risiko, mitigasi, dan keputusan yang diperlukan

| Risiko                                                                           | Mitigasi                                                                                                                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kebutuhan siswa belum tervalidasi di sekolah sasaran.                            | Tinjau materi dan keterjangkauan contoh bersama guru BK. Catat asumsi yang belum dapat diuji.                                                          |
| Akses lambat, sematan tidak dapat dimuat, atau Forms meminta izin.               | Pertahankan petunjuk dan template di Google Sites, tautan kuis langsung, serta latihan cadangan. Uji konfigurasi pada URL terbit dengan akses pembaca. |
| Siswa mengira nilai kuis menunjukkan tingkat bakat.                              | Gunakan judul **Kuis Pemahaman Materi**, berikan pembahasan, dan batasi hasil self-check pada rangkuman pilihan siswa.                                 |
| Jawaban pribadi terlihat pada perangkat bersama atau tertulis di kolom evaluasi. | Gunakan isian sementara, tombol hapus, petunjuk singkat di awal, dan akses respons terbatas.                                                           |
| Tautan, izin, atau pengelola berganti setelah rilis.                             | Catat pemilik dan lokasi materi. Setiap perubahan konten atau izin diikuti pemeriksaan ulang pada tautan terbit sebagai pembaca.                       |

| Keputusan                                                                                                                             | Penanggung jawab           | Batas keputusan                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| Tetapkan akun pemilik, pemirsa situs, URL terbit, dan kanal BK yang boleh ditampilkan.                                                | Pemilik produk dan sekolah | Sebelum konfigurasi situs terbit                           |
| Setujui contoh materi, bank soal, teks privasi, serta apakah kuis menggunakan Forms atau penilaian lokal berdasarkan hasil percobaan. | Guru BK dan pemilik produk | Sebelum pembangunan penuh                                  |
| Setujui masa simpan, pengelola respons, perangkat sasaran, izin, dan sasaran uji terbatas.                                            | Sekolah dan pemilik produk | Sebelum formulir menerima respons riil atau siswa diundang |

## Sumber

- Restyna Rahmayanti. _Proposal Pengembangan Teknologi Bimbingan dan Konseling KREASI.ID sebagai Media Pengembangan Potensi Diri Peserta Didik SMP_, revisi 2026. [Proposal sumber](UTS_TeknologiBK_RESTYNA%20RAHMAYANTI_KREASI.ID_REVISI.pdf).
- Acuan materi penelusuran minat dan bakat yang dirujuk proposal pada Bab I–II. [Pedoman Penelusuran Minat dan Bakat Jenjang SMP, Direktorat Sekolah Menengah Pertama](https://repositori.kemendikdasmen.go.id/26912/).
