import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createAuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';

test('account approval enforces sessions, roles, decisions, and persistence', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-auth-'));
  const options = {
    databasePath: path.join(directory, 'test.sqlite'),
    secret: 'test-only-secret-with-more-than-thirty-two-characters',
    baseURL: 'http://localhost:3001',
    origins: ['http://localhost:5173'],
  };
  const service = await createAuthService(options);
  const app = createApp({ authService: service, getPublicConfig: () => ({ quiz: { mode: 'local' } }) });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    service.db.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  function client() {
    let cookies = '';
    return async (route, body, origin = 'http://localhost:5173') => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          Origin: origin,
          ...(cookies ? { Cookie: cookies } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const setCookies = response.headers.getSetCookie();
      if (setCookies.length) cookies = setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      return { status: response.status, data: await response.json() };
    };
  }

  const guest = client();
  assert.equal((await guest('/api/public-config')).status, 401);
  assert.equal((await guest('/api/admin/users')).status, 401);

  const user = client();
  const registration = await user('/api/auth/sign-up/email', {
    name: 'Siswa Uji', email: 'siswa@example.test', password: 'Siswa-Password-123',
    role: 'superadmin', status: 'approved',
  });
  assert.equal(registration.status, 200);
  const account = (await user('/api/access/me')).data.user;
  assert.equal(account.role, 'user');
  assert.equal(account.status, 'pending');
  assert.equal((await user('/api/public-config')).status, 403);
  assert.equal((await user('/api/admin/users')).status, 403);
  const duplicate = await guest('/api/auth/sign-up/email', { name: 'Duplikat', email: 'siswa@example.test', password: 'Siswa-Password-123' });
  assert.ok(duplicate.status >= 400);
  const invalidLogin = await guest('/api/auth/sign-in/email', { email: 'siswa@example.test', password: 'wrong-password' });
  assert.equal(invalidLogin.status, 401);

  const admin = client();
  const adminRegistration = await admin('/api/auth/sign-up/email', { name: 'Superadmin Uji', email: 'admin@example.test', password: 'Admin-Password-123' });
  assert.equal(adminRegistration.status, 200);
  service.db.prepare("UPDATE user SET role = 'superadmin', status = 'approved' WHERE id = ?").run(adminRegistration.data.user.id);
  assert.equal((await admin('/api/admin/users')).data.total, 1);
  const reviewURL = `/api/admin/users/${account.id}/review`;
  assert.equal((await admin(reviewURL, { decision: 'approved' }, 'https://untrusted.example')).status, 403);
  const decisions = await Promise.all([
    admin(reviewURL, { decision: 'approved', note: 'Silakan mulai.' }),
    admin(reviewURL, { decision: 'approved' }),
  ]);
  assert.deepEqual(decisions.map((result) => result.status).sort(), [200, 409]);
  assert.equal((await user('/api/access/me')).data.user.status, 'approved');
  assert.equal((await user('/api/public-config')).status, 200);
  assert.equal((await user('/api/admin/users')).status, 403);
  await user('/api/auth/update-user', { role: 'superadmin', status: 'approved' });
  assert.equal((await user('/api/access/me')).data.user.role, 'user');
  assert.equal(service.db.prepare('SELECT COUNT(*) AS total FROM account_reviews').get().total, 1);

  const rejected = client();
  const second = await rejected('/api/auth/sign-up/email', { name: 'Siswa Kedua', email: 'ditolak@example.test', password: 'Siswa-Password-123' });
  assert.equal((await admin(`/api/admin/users/${second.data.user.id}/review`, { decision: 'rejected', note: 'Hubungi pengelola sekolah.' })).status, 200);
  assert.equal((await rejected('/api/access/me')).data.user.status, 'rejected');
  assert.equal((await rejected('/api/public-config')).status, 403);

  const secondConnection = await createAuthService(options);
  assert.equal(secondConnection.db.prepare('SELECT status FROM user WHERE id = ?').get(account.id).status, 'approved');
  secondConnection.db.close();
  assert.equal((await user('/api/auth/sign-out', {})).status, 200);
  assert.equal((await user('/api/access/me')).data.user, null);
  assert.equal((await user('/api/public-config')).status, 401);
  let limited;
  for (let attempt = 0; attempt < 9; attempt += 1) {
    limited = await guest('/api/auth/sign-in/email', { email: 'missing@example.test', password: 'wrong-password' });
    if (limited.status === 429) break;
  }
  assert.equal(limited.status, 429);
});

test('superadmin user listing returns counts, paginates, and clamps empty last page after review', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-admin-page-'));
  const options = {
    databasePath: path.join(directory, 'test.sqlite'),
    secret: 'test-only-secret-with-more-than-thirty-two-characters',
    baseURL: 'http://localhost:3001',
    origins: ['http://localhost:5173'],
  };
  const service = await createAuthService(options);
  const app = createApp({ authService: service, getPublicConfig: () => ({ quiz: { mode: 'local' } }) });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    service.db.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  let cookies = '';
  async function adminCall(route, body) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        Origin: 'http://localhost:5173',
        ...(cookies ? { Cookie: cookies } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) cookies = setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
    return { status: response.status, data: await response.json() };
  }

  const adminReg = await adminCall('/api/auth/sign-up/email', {
    name: 'Admin Pagination',
    email: 'admin-page@example.test',
    password: 'Admin-Password-123',
  });
  assert.equal(adminReg.status, 200);
  service.db
    .prepare("UPDATE user SET role = 'superadmin', status = 'approved' WHERE id = ?")
    .run(adminReg.data.user.id);

  const now = Date.now();
  const insertUser = service.db.prepare(
    'INSERT INTO user (id, name, email, emailVerified, role, status, reviewNote, createdAt, updatedAt) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?)'
  );
  for (let i = 1; i <= 21; i += 1) {
    insertUser.run(
      `pending-${i}`,
      `Siswa Pending ${i}`,
      `pending-${i}@example.test`,
      'user',
      'pending',
      '',
      now + i,
      now + i
    );
  }
  insertUser.run('approved-1', 'Siswa Disetujui', 'approved-1@example.test', 'user', 'approved', 'Oke', now, now);
  insertUser.run('rejected-1', 'Siswa Ditolak', 'rejected-1@example.test', 'user', 'rejected', 'Lengkapi nama', now, now);

  const page2 = await adminCall('/api/admin/users?status=pending&page=2');
  assert.equal(page2.status, 200);
  assert.deepEqual(page2.data.counts, { pending: 21, approved: 1, rejected: 1 });
  assert.equal(page2.data.page, 2);
  assert.equal(page2.data.pageSize, 20);
  assert.equal(page2.data.totalPages, 2);
  assert.equal(page2.data.users.length, 1);

  const lastPendingId = page2.data.users[0].id;
  const reviewRes = await adminCall(`/api/admin/users/${lastPendingId}/review`, {
    decision: 'rejected',
    note: 'Nama belum lengkap',
  });
  assert.equal(reviewRes.status, 200);
  assert.deepEqual(reviewRes.data.counts, { pending: 20, approved: 1, rejected: 2 });

  const clamped = await adminCall('/api/admin/users?status=pending&page=2');
  assert.equal(clamped.status, 200);
  assert.equal(clamped.data.page, 1);
  assert.equal(clamped.data.totalPages, 1);
  assert.equal(clamped.data.users.length, 20);
  assert.deepEqual(clamped.data.counts, { pending: 20, approved: 1, rejected: 2 });
});
