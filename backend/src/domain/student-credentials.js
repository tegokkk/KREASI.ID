import { createHash } from 'node:crypto';
import { APIError } from 'better-auth/api';

const studentDomain = '@siswa.kreasi.invalid';
export const validNisn = (value) => typeof value === 'string' && /^[0-9]{10}$/.test(value);
export const studentEmail = (nisn) => createHash('sha256').update(nisn).digest('hex') + studentDomain;

export function studentAccountFields(email, body) {
  if (!email.endsWith(studentDomain)) return {};
  const { studentNisn: nisn, studentSchool: school } = body ?? {};
  if (!validNisn(nisn) || email !== studentEmail(nisn) || typeof school !== 'string' || !school.trim() || school.length > 150) {
    throw new APIError('BAD_REQUEST', { message: 'Lengkapi pendaftaran dengan NISN dan sekolah.' });
  }
  return { nisn, school: school.trim() };
}
