import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { createAuthService } from '../src/auth.js';

test('superadmin and bk can manage learning materials and students see scoped materials', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-materials-'));
  const service = await createAuthService({
    databasePath: path.join(directory, 'test.sqlite'),
    secret: 'test-only-secret-with-more-than-thirty-two-characters',
    baseURL: 'http://localhost:3001',
    origins: ['http://localhost:5173'],
  });
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
    return async (route, { method = 'GET', body, origin = 'http://localhost:5173' } = {}) => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
        method,
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

  const admin = client();
  const bk = client();
  const studentA = client();
  const studentB = client();

  const adminReg = await admin('/api/auth/sign-up/email', {
    method: 'POST',
    body: { name: 'Superadmin KREASI', email: 'admin@example.test', password: 'AdminPassword123!' },
  });
  assert.equal(adminReg.status, 200);
  await service.repo.promoteSuperadmin(adminReg.data.user.id);

  // Register BK (SMPN 1), Student A (SMPN 1), Student B (SMPN 2)
  assert.equal((await bk('/api/auth/sign-up/bk', {
    method: 'POST',
    body: { name: 'Bu Sari BK', email: 'bk1@example.test', password: 'Password123!', school: 'SMPN 1 Nusantara' },
  })).status, 200);
  assert.equal((await studentA('/api/auth/sign-up/siswa', {
    method: 'POST',
    body: { name: 'Siswa Satu', nisn: '1234567890', school: 'SMPN 1 Nusantara', password: 'Password123!' },
  })).status, 200);
  assert.equal((await studentB('/api/auth/sign-up/siswa', {
    method: 'POST',
    body: { name: 'Siswa Dua', nisn: '0987654321', school: 'SMPN 2 Merdeka', password: 'Password123!' },
  })).status, 200);

  // Approve all three accounts
  const pending = (await admin('/api/admin/users?status=pending')).data.users;
  for (const user of pending) {
    assert.equal((await admin(`/api/admin/users/${user.id}/review`, {
      method: 'POST',
      body: { decision: 'approved', role: user.role === 'bk' ? 'bk' : null },
    })).status, 200);
  }

  // Student cannot create materials
  assert.equal((await studentA('/api/materials', {
    method: 'POST',
    body: { title: 'Coba', category: 'umum', content: 'Tidak boleh' },
  })).status, 403);

  // Reject unsafe URL
  assert.equal((await admin('/api/materials', {
    method: 'POST',
    body: { title: 'Materi XSS', category: 'umum', content: 'Isi', resourceUrl: 'javascript:alert(1)' },
  })).status, 400);

  // Superadmin creates a global material for kenali-potensi
  const globalRes = await admin('/api/materials', {
    method: 'POST',
    body: {
      title: 'Panduan Mengenali Minat',
      category: 'kenali-potensi',
      summary: 'Ringkasan singkat minat',
      content: 'Paragraf pertama.\n\nParagraf kedua.',
      resourceUrl: 'https://example.com/panduan',
    },
  });
  assert.equal(globalRes.status, 201);
  assert.equal(globalRes.data.material.school, null);

  // Guru BK creates a material (forced to SMPN 1 Nusantara even if another school is sent)
  const bkRes = await bk('/api/materials', {
    method: 'POST',
    body: {
      title: 'Info Ekskul SMPN 1',
      category: 'mengembangkan-potensi',
      summary: 'Daftar ekskul semester ini',
      content: 'Ikuti ekskul sesuai potensimu.',
      school: 'SMPN 2 Merdeka',
    },
  });
  assert.equal(bkRes.status, 201);
  assert.equal(bkRes.data.material.school, 'SMPN 1 Nusantara');
  assert.equal(bkRes.data.material.authorRole, 'bk');

  // Student A (SMPN 1) sees both global and SMPN 1 material
  const studentAMaterials = (await studentA('/api/materials')).data.materials;
  assert.equal(studentAMaterials.length, 2);
  assert.equal((await studentA('/api/materials?category=kenali-potensi')).data.materials.length, 1);

  // Student B (SMPN 2) sees only the global material
  const studentBMaterials = (await studentB('/api/materials')).data.materials;
  assert.equal(studentBMaterials.length, 1);
  assert.equal(studentBMaterials[0].title, 'Panduan Mengenali Minat');

  // Guru BK cannot delete Superadmin's global material
  assert.equal((await bk(`/api/materials/${globalRes.data.material.id}`, { method: 'DELETE' })).status, 404);

  // Guru BK can delete own school's material
  assert.equal((await bk(`/api/materials/${bkRes.data.material.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await studentA('/api/materials')).data.materials.length, 1);
});
