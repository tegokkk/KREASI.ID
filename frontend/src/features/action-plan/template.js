export const ACTION_PLAN_FIELDS = [
  {
    id: 'potensi',
    label: 'Potensi atau kemampuan',
    required: true,
    multiline: false,
    helperText: 'Satu kemampuan atau minat yang ingin kamu latih.',
    placeholder: 'Contoh: Berbicara di depan kelompok',
    emptyError: 'Tulis satu potensi atau kemampuan yang ingin kamu latih.',
  },
  {
    id: 'tujuan',
    label: 'Tujuan',
    required: true,
    multiline: false,
    helperText: 'Hasil nyata yang bisa kamu amati.',
    placeholder: 'Contoh: Menjelaskan satu topik selama dua menit',
    emptyError: 'Tulis hasil yang ingin kamu capai, misalnya menjelaskan satu topik dalam dua menit.',
  },
  {
    id: 'langkah',
    label: 'Langkah atau kegiatan',
    required: true,
    multiline: true,
    helperText: 'Minimal satu langkah konkret yang mudah kamu mulai.',
    placeholder: 'Contoh: Latihan bersama teman dua kali dalam sepekan',
    emptyError: 'Tulis minimal satu langkah atau kegiatan konkret yang akan kamu coba.',
  },
  {
    id: 'targetWaktu',
    label: 'Target waktu',
    required: true,
    multiline: false,
    helperText: 'Tanggal atau jangka waktu yang jelas.',
    placeholder: 'Contoh: Dalam dua minggu sejak mulai latihan',
    emptyError: 'Tulis target waktu atau periode latihan yang jelas.',
  },
  {
    id: 'caraMemantau',
    label: 'Cara memantau',
    required: true,
    multiline: true,
    helperText: 'Indikator sederhana untuk mengecek kemajuanmu.',
    placeholder: 'Contoh: Catat durasi latihan dan satu masukan setiap kali latihan',
    emptyError: 'Tulis cara sederhana untuk memantau kemajuan latihanmu.',
  },
  {
    id: 'evaluasi',
    label: 'Evaluasi setelah mencoba',
    required: false,
    multiline: true,
    helperText: 'Boleh dikosongkan dulu. Isi kembali setelah kamu mempraktikkan rencanamu.',
    placeholder: 'Contoh: Sudah mencapai dua menit. Latihan berikutnya fokus pada tempo.',
    emptyError: '',
  },
];

export const ACTION_PLAN_EXAMPLE = {
  potensi: 'Berbicara di depan kelompok',
  tujuan: 'Menjelaskan satu topik selama dua menit',
  langkah: 'Latihan bersama teman dua kali dalam sepekan',
  targetWaktu: 'Dalam dua minggu sejak mulai latihan',
  caraMemantau: 'Catat durasi latihan dan satu masukan setiap kali latihan',
  evaluasi: 'Sudah mencapai dua menit. Latihan berikutnya fokus pada tempo.',
};

export const INITIAL_ACTION_PLAN_VALUES = {
  potensi: '',
  tujuan: '',
  langkah: '',
  targetWaktu: '',
  caraMemantau: '',
  evaluasi: '',
};

export function formatActionPlanText(plan) {
  const evaluasiText = plan.evaluasi?.trim()
    ? plan.evaluasi.trim()
    : 'Diisi setelah mencoba';

  return [
    'RENCANAKU — KREASI.ID',
    `1. Potensi atau kemampuan: ${plan.potensi.trim()}`,
    `2. Tujuan: ${plan.tujuan.trim()}`,
    `3. Langkah atau kegiatan: ${plan.langkah.trim()}`,
    `4. Target waktu: ${plan.targetWaktu.trim()}`,
    `5. Cara memantau: ${plan.caraMemantau.trim()}`,
    `6. Evaluasi setelah mencoba: ${evaluasiText}`,
  ].join('\n');
}
