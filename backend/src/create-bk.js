import './config.js';
import { randomBytes } from 'node:crypto';
import { createAuthService } from './auth.js';

const name = process.env.BK_NAME?.trim() ?? '';
const email = process.env.BK_EMAIL?.trim().toLowerCase() ?? '';
const school = process.env.BK_SCHOOL?.trim() ?? '';

if (name.length < 2 || name.length > 100 || !email || !school || school.length > 150) {
  throw new Error('Isi BK_NAME (2–100 karakter), BK_EMAIL, dan BK_SCHOOL (maksimal 150 karakter).');
}

const generatedPassword = !process.env.BK_PASSWORD;
const password = process.env.BK_PASSWORD || randomBytes(18).toString('base64url');
const service = await createAuthService({ bkAccount: { email, school } });
try {
  await service.repo.checkReady();
  if (await service.repo.findAccountByEmail(email)) throw new Error('Email sudah terdaftar. Gunakan email lain untuk akun Guru BK baru.');
  await service.auth.api.signUpEmail({ body: { name, email, password } });
  console.log(`Akun Guru BK dibuat untuk ${email}.`);
  if (generatedPassword) console.log(`Kata sandi: ${password}\nSimpan kredensial ini di tempat pribadi.`);
} finally {
  await service.close();
}
