export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    topic: 'Cara Mengenali Potensi',
    prompt: 'Apa perbedaan utama antara "minat" dan "kemampuan"?',
    options: [
      {
        id: 'a',
        text: 'Minat adalah rasa suka dan ketertarikan, sedangkan kemampuan adalah keterampilan nyata yang sudah dilatih.',
      },
      {
        id: 'b',
        text: 'Minat hanya dimiliki orang dewasa, sedangkan kemampuan hanya dinilai dari ujian tulis.',
      },
      {
        id: 'c',
        text: 'Minat dan kemampuan artinya sama persis dan tidak perlu dibedakan.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Minat berasal dari rasa senang dan ingin tahu terhadap suatu hal, sedangkan kemampuan adalah keterampilan yang bisa kamu lakukan karena belajar dan berlatih.',
  },
  {
    id: 'q2',
    number: 2,
    topic: 'Cara Mengenali Potensi',
    prompt:
      'Rani sering dimintai tolong teman sebangkunya untuk menjelaskan pelajaran karena bahasanya mudah dipahami. Kebiasaan ini menunjukkan tanda awal potensi di bidang apa?',
    options: [
      {
        id: 'a',
        text: 'Potensi olahraga dan ketangkasan fisik semata.',
      },
      {
        id: 'b',
        text: 'Potensi komunikasi dan menyampaikan ide, yang bisa dilatih lewat presentasi kelompok.',
      },
      {
        id: 'c',
        text: 'Potensi yang tidak perlu dilatih karena hanya cocok untuk nilai rapor.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Kebiasaan menjelaskan pelajaran ke teman adalah petunjuk adanya kemampuan komunikasi dan empati. Cara melatihnya bisa dimulai dari presentasi kelompok di kelas.',
  },
  {
    id: 'q3',
    number: 3,
    topic: 'Pentingnya Mengembangkan Potensi',
    prompt: 'Mengapa masa SMP menjadi waktu yang baik untuk mulai mengeksplorasi potensi diri?',
    options: [
      {
        id: 'a',
        text: 'Karena siswa SMP harus bersaing mencari peringkat tertinggi di setiap bidang.',
      },
      {
        id: 'b',
        text: 'Karena masa SMP memberi ruang aman untuk mencoba berbagai kegiatan tanpa tekanan harus langsung sempurna.',
      },
      {
        id: 'c',
        text: 'Karena potensi hanya bisa berkembang di masa SMP dan berhenti setelah lulus.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Pada masa SMP, kamu punya kesempatan luas mencoba kegiatan akademik dan nonakademik untuk mengenal minat serta memilih aktivitas sekolah dengan lebih percaya diri.',
  },
  {
    id: 'q4',
    number: 4,
    topic: 'Pentingnya Mengembangkan Potensi',
    prompt: 'Manfaat apa yang paling terasa ketika kamu rutin melatih potensimu?',
    options: [
      {
        id: 'a',
        text: 'Kamu menjadi lebih percaya diri melihat kemajuan usahamu dan terlatih mengatur waktu.',
      },
      {
        id: 'b',
        text: 'Kamu tidak perlu lagi bekerja sama atau meminta masukan dari orang lain.',
      },
      {
        id: 'c',
        text: 'Kamu dijamin tidak akan pernah menemui hambatan saat belajar.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Melatih potensi membantu menumbuhkan rasa percaya diri, tanggung jawab mengelola waktu, serta memperluas pengalaman bekerja sama.',
  },
  {
    id: 'q5',
    number: 5,
    topic: 'Langkah Pengembangan Potensi',
    prompt:
      'Manakah langkah awal paling realistis untuk melatih kemampuan menjelaskan materi di depan teman?',
    options: [
      {
        id: 'a',
        text: 'Langsung berpidato selama satu jam penuh di hadapan seluruh warga sekolah.',
      },
      {
        id: 'b',
        text: 'Berlatih menjelaskan satu topik selama lima menit bersama satu atau dua teman.',
      },
      {
        id: 'c',
        text: 'Menunggu sampai merasa sempurna dulu baru berani berbicara.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Mulai dari latihan singkat agar kamu bisa mencoba, mendapat masukan ramah, dan memperbaiki langkah berikutnya.',
  },
  {
    id: 'q6',
    number: 6,
    topic: 'Langkah Pengembangan Potensi',
    prompt:
      'Ketika muncul rasa malu atau khawatir hasil latihan awalmu belum rapi, sikap apa yang membantu potensimu tetap berkembang?',
    options: [
      {
        id: 'a',
        text: 'Berhenti mencoba agar tidak terlihat salah di depan teman.',
      },
      {
        id: 'b',
        text: 'Membandingkan karya pertamamu dengan hasil orang yang sudah berlatih bertahun-tahun.',
      },
      {
        id: 'c',
        text: 'Menganggap kekeliruan sebagai bahan belajar dan meminta dukungan teman, keluarga, atau guru BK.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Rasa ragu saat baru memulai itu wajar. Menjadikan kesalahan sebagai bahan evaluasi dan meminta dukungan orang terdekat membuatmu tetap bertumbuh.',
  },
];

export const BACKUP_PRACTICE_QUESTIONS = [
  {
    id: 'bp1',
    topic: 'Cara Mengenali Potensi',
    question:
      'Kalau kamu senang menggambar atau membuat poster saat waktu luang, langkah sederhana apa yang menandakan kamu mulai mengenali potensimu?',
    options: [
      'A. Mencatat bahwa kamu tertarik pada seni visual dan mencoba menggambar satu objek di rumah.',
      'B. Berhenti menggambar karena merasa belum seindah ilustrator profesional.',
    ],
    answerLabel: 'Pilihan A tepat.',
    explanation:
      'Mengamati kegiatan yang membuatmu betah lalu mencobanya secara bertahap adalah cara sehat mengenali dan melatih minat seni visual.',
  },
  {
    id: 'bp2',
    topic: 'Pentingnya Mengembangkan Potensi',
    question:
      'Apakah hasil kuis atau tes minat berarti bakatmu sudah tetap dan tidak bisa berubah lagi?',
    options: [
      'A. Ya, hasil latihan menentukan bakat selamanya.',
      'B. Tidak, potensi terus berkembang seiring latihan, pengalaman baru, dan dukungan sekitar.',
    ],
    answerLabel: 'Pilihan B tepat.',
    explanation:
      'Kuis hanya mengecek pemahaman materi, bukan menentukan bakat tetap atau jurusan masa depanmu.',
  },
  {
    id: 'bp3',
    topic: 'Langkah Pengembangan Potensi',
    question:
      'Saat ingin memulai kebiasaan latihan 15 menit setelah pulang sekolah, apa yang bisa dilakukan agar lebih konsisten?',
    options: [
      'A. Menentukan jadwal kecil yang jelas, mencatat kemajuan, dan mengajak teman atau guru BK berdiskusi bila menemui hambatan.',
      'B. Memaksakan latihan 4 jam sekaligus di akhir bulan.',
    ],
    answerLabel: 'Pilihan A tepat.',
    explanation:
      'Mulai dari latihan singkat agar kamu bisa mencoba, mendapat masukan, dan memperbaiki langkah berikutnya.',
  },
];
