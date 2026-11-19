import './config.js';
import { randomBytes } from 'node:crypto';
import { createAuthService } from './auth.js';

const email = (process.env.SUPERADMIN_EMAIL ?? 'superadmin@kreasi.id').trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD || randomBytes(18).toString('base64url');
const service = await createAuthService();
try {
  const existing = await service.repo.findAccountByEmail(email);
  if (existing) throw new Error('Email sudah terdaftar. Gunakan email lain untuk membuat akun superadmin baru.');
  const result = await service.auth.api.signUpEmail({
    body: { name: 'Superadmin KREASI.ID', email, password },
  });
  await service.repo.promoteSuperadmin(result.user.id);
  console.log(`Akun superadmin dibuat.\nEmail: ${email}\nKata sandi: ${password}\nSimpan kredensial ini di tempat pribadi.`);
} finally {
  await service.close();
}
