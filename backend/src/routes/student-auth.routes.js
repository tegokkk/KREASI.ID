import { Router, json } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { studentEmail, validNisn } from '../domain/student-credentials.js';

const trim = (value) => typeof value === 'string' ? value.trim() : '';
const messages = new Map([
  ['INVALID_EMAIL_OR_PASSWORD', 'NISN atau kata sandi tidak sesuai.'],
  ['USER_ALREADY_EXISTS', 'NISN sudah terdaftar. Silakan masuk.'],
  ['USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', 'NISN sudah terdaftar. Silakan masuk.'],
]);

export function createStudentAuthRouter(auth) {
  const router = Router();
  const parseJson = json({ limit: '16kb' });

  function handle(register, staff = false) {
    return async (req, res) => {
      if (!req.is('application/json')) return res.status(415).json({ error: 'Gunakan format JSON.' });
      const { nisn: rawNisn, email: rawEmail, name: rawName, school: rawSchool, password } = req.body ?? {};
      const email = trim(rawEmail).toLowerCase();
      const nisn = trim(rawNisn);
      const name = trim(rawName);
      const school = trim(rawSchool);
      if (staff && (!email || email.length > 254 || email.endsWith('.invalid'))) return res.status(400).json({ code: 'INVALID_EMAIL' });
      if (!staff && !validNisn(nisn)) return res.status(400).json({ error: 'NISN harus terdiri dari 10 angka.' });
      if (typeof password !== 'string' || !password || password.length > 128) {
        return res.status(400).json({ error: 'Masukkan kata sandi yang valid.' });
      }
      if (register && (name.length < 2 || name.length > 100 || !school || school.length > 150)) {
        return res.status(400).json({ error: 'Isi nama (2–100 karakter) dan sekolah (maksimal 150 karakter).' });
      }

      // Use the existing credential endpoints so student and email attempts share their rate limits.
      const endpoint = register ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';
      const headers = fromNodeHeaders(req.headers);
      headers.delete('content-length');
      headers.delete('content-encoding');
      const body = { email: staff ? email : studentEmail(nisn), password };
      if (register) Object.assign(body, staff ? { name, staffSchool: school } : { name, studentNisn: nisn, studentSchool: school });
      const response = await auth.handler(new Request(new URL(endpoint, auth.options.baseURL), {
        method: 'POST', headers, body: JSON.stringify(body),
      }));
      for (const cookie of response.headers.getSetCookie()) res.append('Set-Cookie', cookie);
      if (response.ok) return res.json({ ok: true });
      const retryAfter = response.headers.get('retry-after');
      if (retryAfter) res.set('Retry-After', retryAfter);
      const { code } = await response.json().catch(() => ({}));
      const error = staff ? undefined : messages.get(code);
      return res.status(response.status).json(error ? { error } : { code });
    };
  }

  router.post('/sign-up/siswa', parseJson, handle(true));
  router.post('/sign-up/bk', parseJson, handle(true, true));
  router.post('/sign-in/siswa', parseJson, handle(false));
  return router;
}
