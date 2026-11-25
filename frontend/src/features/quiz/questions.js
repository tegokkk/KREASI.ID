export const QUIZ_PROFILES = {
  a: {
    id: 'a',
    label: 'Potensi Akademik & Berpikir Kritis',
    shortLabel: 'Akademik & Analitis',
    summary:
      'Kamu cenderung menyukai kegiatan membaca, memahami hal baru, menganalisis masalah, dan menyusun solusi secara terstruktur.',
    suggestion:
      'Kamu bisa melatih potensi ini melalui kelompok belajar, karya ilmiah remaja, menulis catatan terstruktur, atau mengikuti lomba akademik.',
  },
  b: {
    id: 'b',
    label: 'Potensi Kreativitas & Berkarya',
    shortLabel: 'Kreatif & Berkarya',
    summary:
      'Kamu cenderung senang memunculkan ide-ide baru, mencoba cara yang berbeda, dan mengekspresikan diri lewat karya.',
    suggestion:
      'Kamu bisa melatih potensi ini melalui kegiatan seni, menggambar, desain, mading sekolah, kerajinan, atau proyek kreatif lainnya.',
  },
  c: {
    id: 'c',
    label: 'Potensi Praktik & Keterampilan Fisik',
    shortLabel: 'Praktik & Fisik',
    summary:
      'Kamu cenderung belajar paling optimal dengan langsung mempraktikkan tugas dan melakukan aktivitas fisik atau keterampilan nyata.',
    suggestion:
      'Kamu bisa melatih potensi ini melalui ekstrakurikuler olahraga, pramuka, praktik laboratorium, keterampilan tangan, atau kegiatan lapangan.',
  },
  d: {
    id: 'd',
    label: 'Potensi Sosial, Komunikasi & Kepemimpinan',
    shortLabel: 'Sosial & Kepemimpinan',
    summary:
      'Kamu cenderung nyaman berinteraksi, berdiskusi, membantu teman, dan mengatur kerja sama dalam sebuah kelompok.',
    suggestion:
      'Kamu bisa melatih potensi ini melalui OSIS, PMR, diskusi kelas, presentasi kelompok, atau membantu mengoordinasikan kegiatan sekolah.',
  },
};

export const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    topic: 'Minat Waktu Luang',
    prompt: 'Kegiatan apa yang paling kamu sukai ketika memiliki waktu luang?',
    options: [
      { id: 'a', text: 'Membaca, menulis, atau mempelajari hal baru' },
      { id: 'b', text: 'Menggambar, membuat kerajinan, atau berkreasi' },
      { id: 'c', text: 'Berolahraga atau melakukan aktivitas fisik' },
      { id: 'd', text: 'Berkumpul, berbicara, dan membantu orang lain' },
    ],
  },
  {
    id: 'q2',
    number: 2,
    topic: 'Menghadapi Tantangan',
    prompt: 'Ketika mendapatkan tugas atau tantangan baru, apa yang biasanya kamu lakukan?',
    options: [
      { id: 'a', text: 'Menganalisis dan mencari cara terbaik untuk menyelesaikannya' },
      { id: 'b', text: 'Mencoba ide atau cara yang berbeda' },
      { id: 'c', text: 'Langsung mempraktikkannya' },
      { id: 'd', text: 'Berdiskusi dan bekerja sama dengan orang lain' },
    ],
  },
  {
    id: 'q3',
    number: 3,
    topic: 'Kemampuan Sehari-hari',
    prompt: 'Kemampuan apa yang paling sering kamu gunakan dalam kegiatan sehari-hari?',
    options: [
      { id: 'a', text: 'Berpikir, memahami, dan memecahkan masalah' },
      { id: 'b', text: 'Menciptakan ide atau menghasilkan karya' },
      { id: 'c', text: 'Melakukan kegiatan praktik dan keterampilan fisik' },
      { id: 'd', text: 'Berkomunikasi dan bekerja sama' },
    ],
  },
  {
    id: 'q4',
    number: 4,
    topic: 'Peran dalam Kelompok',
    prompt: 'Dalam kegiatan kelompok, peran apa yang paling nyaman kamu lakukan?',
    options: [
      { id: 'a', text: 'Menyusun rencana dan mencari solusi' },
      { id: 'b', text: 'Memberikan ide-ide kreatif' },
      { id: 'c', text: 'Mengerjakan tugas secara langsung' },
      { id: 'd', text: 'Mengatur kerja sama dan membantu teman' },
    ],
  },
  {
    id: 'q5',
    number: 5,
    topic: 'Pengembangan Diri',
    prompt: 'Kemampuan apa yang paling ingin kamu kembangkan dalam dirimu?',
    options: [
      { id: 'a', text: 'Kemampuan akademik dan berpikir kritis' },
      { id: 'b', text: 'Kreativitas dan keterampilan berkarya' },
      { id: 'c', text: 'Keterampilan praktik, olahraga, atau aktivitas fisik' },
      { id: 'd', text: 'Komunikasi, kepemimpinan, dan kerja sama' },
    ],
  },
];

export function summarizeQuizResult(questions, answers) {
  const counts = { a: 0, b: 0, c: 0, d: 0 };
  for (const question of questions) {
    const choice = answers[question.id];
    if (choice && Object.hasOwn(counts, choice)) {
      counts[choice] += 1;
    }
  }

  const maxCount = Math.max(...Object.values(counts));
  const topIds = Object.keys(counts).filter((id) => counts[id] === maxCount && maxCount > 0);
  const topProfiles = topIds.map((id) => QUIZ_PROFILES[id]);

  let headline = 'Kecenderungan potensi belum terpilih';
  if (topProfiles.length === 1) {
    headline = `${topProfiles[0].label} (${maxCount} dari ${questions.length} pilihan)`;
  } else if (topProfiles.length > 1) {
    headline = `Kombinasi ${topProfiles.map((profile) => profile.shortLabel).join(' & ')} (${maxCount} pilihan masing-masing)`;
  }

  return {
    counts,
    maxCount,
    topProfiles,
    headline,
  };
}
