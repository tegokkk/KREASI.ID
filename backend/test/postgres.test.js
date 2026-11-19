import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { getMigrations } from 'better-auth/db/migration';
import { createAuthService } from '../src/auth.js';
import { createApp } from '../src/app.js';
import { JOURNEY_STEPS } from '../src/domain/journey.js';
import { startTestPostgres } from './helpers/postgres.js';
import { createVercelHandler } from '../src/vercel-handler.js';
import { importSqlite } from '../src/sqlite-import.js';
import { SCHEMA_VERSION } from '../src/migrations.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('PostgreSQL supports independent API instances, atomic writes, shared limits and cold starts', { timeout: 90000 }, async (t) => {
  const database = await startTestPostgres();
  const services = [];
  const servers = [];
  t.after(async () => {
    for (const server of servers) await new Promise((resolve) => server.close(resolve));
    for (const service of services) await service.close();
    await database.close();
  });
  const options = { databaseUrl: database.url, schema: 'kreasi_test', secret: 'test-postgres-secret-with-over-thirty-two-characters',
    baseURL: 'http://localhost:3001', origins: ['http://localhost:5173'] };
  const first = await createAuthService({ ...options, migrate: true }); services.push(first);
  const second = await createAuthService(options); services.push(second);
  const restarted = await createAuthService({ ...options, migrate: true }); services.push(restarted);

  function client(server, jar = { cookie: '' }) {
    return async (route, body, headers = {}) => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
        method: body ? 'POST' : 'GET', headers: { Origin: 'http://localhost:5173',
          'x-vercel-forwarded-for': '203.0.113.10', Cookie: jar.cookie,
          ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) jar.cookie = cookies.map((cookie) => cookie.split(';')[0]).join('; ');
      return { status: response.status, data: await response.json(), headers: response.headers };
    };
  }
  for (const service of [first, second, restarted]) {
    const server = http.createServer(createApp({ authService: service, vercel: true, getPublicConfig: () => ({ quiz: { mode: 'local' }, support: {} }) }));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve)); servers.push(server);
  }
  const studentJar = { cookie: '' }, adminJar = { cookie: '' };
  const studentA = client(servers[0], studentJar), studentB = client(servers[1], studentJar);
  const adminA = client(servers[0], adminJar), adminB = client(servers[1], adminJar);
  const password = 'Postgres-Test-Only-123!';
  let studentId, adminId;

  await t.test('explicit versioned schema matches Better Auth and migrations are idempotent', async () => {
    await first.repo.checkReady();
    const migration = await getMigrations(first.auth.options);
    assert.equal(migration.toBeCreated.length, 0);
    assert.equal(migration.toBeAdded.length, 0);
    assert.equal(Number((await first.db.query('SELECT count(*) FROM kreasi_test.schema_migrations')).rows[0].count), SCHEMA_VERSION);
    const policies = await first.db.query("SELECT bool_and(c.relrowsecurity) AS secured FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='kreasi_test' AND c.relkind='r'");
    assert.equal(policies.rows[0].secured, true);
    await first.db.query('CREATE ROLE kreasi_browser_probe NOLOGIN');
    assert.equal((await first.db.query("SELECT has_schema_privilege('kreasi_browser_probe','kreasi_test','USAGE') AS allowed")).rows[0].allowed, false);
  });
  await t.test('NISN registration and login work across instances', async () => {
    const jar = { cookie: '' };
    const register = client(servers[0], jar);
    const login = client(servers[1], jar);
    const headers = { 'x-vercel-forwarded-for': '203.0.113.51' };
    const profile = { name: 'Siswa NISN', nisn: '0123456789', school: ' SMP Uji ', password };
    assert.equal((await register('/api/auth/sign-up/siswa', { ...profile, nisn: '123456789' }, headers)).status, 400);
    assert.equal((await register('/api/auth/sign-up/siswa', profile, { ...headers, Origin: 'https://untrusted.example' })).status, 403);
    assert.equal((await register('/api/auth/sign-up/siswa', { ...profile, status: 'approved', role: 'superadmin' }, headers)).status, 200);
    const { user } = (await login('/api/access/me')).data;
    assert.deepEqual([user.nisn, user.school, user.email, user.role, user.status], ['0123456789', 'SMP Uji', null, 'user', 'pending']);
    const duplicate = await register('/api/auth/sign-up/siswa', profile, headers);
    assert.equal(duplicate.status, 422);
    assert.match(duplicate.data.error, /NISN sudah terdaftar/);
    assert.equal((await register('/api/auth/sign-out', {}, headers)).status, 200);
    assert.equal((await login('/api/auth/sign-in/siswa', { nisn: profile.nisn, password: 'incorrect' }, headers)).status, 401);
    assert.equal((await login('/api/auth/sign-in/siswa', { nisn: profile.nisn, password }, headers)).status, 200);
    assert.equal((await register('/api/access/me')).data.user.id, user.id);
  });
  await t.test('sessions and approval are shared; concurrent reviews commit exactly once', async () => {
    const result = await studentA('/api/auth/sign-up/email', { name: 'Siswa PG', email: 'student@example.test', password, role: 'superadmin', status: 'approved' });
    assert.equal(result.status, 200); studentId = result.data.user.id;
    assert.equal(result.data.user.role, 'user'); assert.equal(result.data.user.status, 'pending');
    assert.equal((await studentB('/api/journey')).status, 403);
    const admin = await adminA('/api/auth/sign-up/email', { name: 'Admin PG', email: 'admin@example.test', password });
    assert.equal(admin.status, 200); adminId = admin.data.user.id;
    await first.repo.promoteSuperadmin(adminId);
    const reviews = await Promise.all([adminA(`/api/admin/users/${studentId}/review`, { decision: 'approved', note: 'PG approved' }),
      adminB(`/api/admin/users/${studentId}/review`, { decision: 'approved' })]);
    assert.deepEqual(reviews.map((result) => result.status).sort(), [200, 409]);
    assert.equal((await first.db.query('SELECT count(*) FROM kreasi_test.account_reviews')).rows[0].count, '1');
    assert.equal((await studentB('/api/access/me')).data.user.status, 'approved');
    assert.equal((await studentB('/api/admin/users')).status, 403);
    assert.equal((await adminB('/api/admin/users?status=approved')).data.counts.approved, 1);
  });
  await t.test('progress locks, skip rules, monotonic completion, and two-instance writes work', async () => {
    assert.equal((await studentB('/api/journey/steps/kuis', { action: 'complete' })).status, 403);
    assert.equal((await studentA('/api/journey/steps/self-check', { action: 'skip' })).status, 200);
    const race = await Promise.all([studentA('/api/journey/steps/self-check', { action: 'complete' }), studentB('/api/journey/steps/self-check', { action: 'skip' })]);
    assert.ok(race.every((result) => result.status === 200));
    const before = (await studentB('/api/journey')).data.steps[0].completedAt;
    await studentA('/api/journey/steps/self-check', { action: 'complete' });
    assert.equal((await studentB('/api/journey')).data.steps[0].completedAt, before);
    assert.equal((await studentB('/api/journey/steps/kenali-potensi', { action: 'skip' })).status, 400);
    for (const [index, step] of JOURNEY_STEPS.slice(1).entries()) {
      const result = await (index % 2 ? studentA : studentB)(`/api/journey/steps/${step.id}`, { action: 'complete' });
      assert.equal(result.status, 200);
    }
    assert.equal((await studentA('/api/journey')).data.summary.completedCount, 6);
    assert.equal((await client(servers[2], studentJar)('/api/journey')).data.summary.completedCount, 6);
    const cold = await createAuthService(options); services.push(cold);
    assert.equal((await cold.repo.getProgress(studentId)).length, 6);
    assert.ok(await cold.auth.api.getSession({ headers: new Headers({ Cookie: studentJar.cookie }) }));
  });
  await t.test('account administration and shared recaps enforce completion, roles, and school scope', async () => {
    const bkAccount = { email: 'bk@example.test', school: 'smp asal' };
    const provisioning = await createAuthService({ ...options, bkAccount });
    services.push(provisioning);
    await provisioning.auth.api.signUpEmail({ body: { name: 'Guru BK Uji', email: bkAccount.email, password } });

    const headers = { 'x-vercel-forwarded-for': '203.0.113.61' };
    const bk = client(servers[1]);
    assert.equal((await bk('/api/auth/sign-in/email', { email: bkAccount.email, password }, headers)).status, 200);
    assert.equal((await bk('/api/admin/users')).status, 403);

    const recaps = '/api/staff/recaps';
    const fixtureIds = [];
    const submitted = { share: true, answers: [{ id: 'refleksi', answers: [{ question: 'Uji rekap', answer: 'Contoh jawaban siswa' }] }] };
    for (const [index, school, skipReflection] of [[1, 'SMP Asal', false], [2, 'SMP Lain', false], [3, 'SMP Asal', true]]) {
      const fixture = client(servers[0]);
      const name = `Siswa Riwayat ${index}`;
      const registration = await fixture('/api/auth/sign-up/siswa', { name, nisn: `001234560${index}`, school, password }, headers);
      assert.equal(registration.status, 200);
      const { user } = (await fixture('/api/access/me')).data;
      fixtureIds.push(user.id);
      await first.repo.reviewAccount({ userId: user.id, adminId, decision: 'approved', note: '' });
      for (const step of JOURNEY_STEPS) {
        const action = skipReflection && step.id === 'refleksi' ? 'skip' : 'complete';
        assert.equal((await first.repo.recordProgress({ userId: user.id, stepId: step.id, action })).allowed, true);
      }
      const send = await fetch(`http://127.0.0.1:${servers[0].address().port}/api/journey/recap`, {
        method: 'PUT', headers: { Origin: 'http://localhost:5173', Cookie: registration.headers.getSetCookie().map((value) => value.split(';')[0]).join('; '), 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(submitted),
      });
      assert.equal(send.status, skipReflection ? 409 : 200);
    }

    const history = '/api/staff/student-history';
    assert.equal((await client(servers[0])(history)).status, 401);
    assert.equal((await studentA(history)).status, 403);
    const adminHistory = await adminB(history);
    assert.equal(adminHistory.status, 200);
    assert.deepEqual(adminHistory.data.students.map(({ name }) => name).sort(), ['Siswa PG', 'Siswa Riwayat 1', 'Siswa Riwayat 2']);
    assert.equal((await bk(history)).status, 403);
    const bkHistory = await bk(`${recaps}?school=SMP%20Lain`);
    assert.equal(bkHistory.status, 200);
    assert.deepEqual(bkHistory.data.students.map(({ name }) => name), ['Siswa Riwayat 1']);
    assert.equal((await bk(`${recaps}/${fixtureIds[1]}`)).status, 404);
    assert.deepEqual((await bk(`${recaps}/${fixtureIds[0]}`)).data.recap.answers, submitted.answers);
    assert.equal((await studentA(recaps)).status, 403);
    assert.equal((await bk(`${recaps}?page=2`)).data.students.length, 0);

    const applicant = client(servers[1]);
    assert.equal((await applicant('/api/auth/sign-up/bk', { name: 'Pendaftar BK', email: 'aplicant@example.test', school: 'SMP Asal', password, role: 'superadmin' }, headers)).status, 200);
    const pending = (await applicant('/api/access/me')).data.user;
    assert.deepEqual([pending.role, pending.status], ['bk', 'pending']);
    assert.equal((await applicant(recaps)).status, 403);
    assert.equal((await adminA(`/api/admin/users/${pending.id}/review`, { decision: 'approved', role: 'admin' })).status, 200);
    assert.equal((await applicant(recaps)).data.students.length, 2);
    assert.equal((await applicant('/api/admin/users')).status, 403);
    assert.equal((await adminA(`/api/admin/users/${fixtureIds[2]}/make-admin`, {})).data.user.role, 'admin');
    const deleteUrl = `http://127.0.0.1:${servers[0].address().port}/api/admin/users/`;
    const deleteAsAdmin = (id) => fetch(deleteUrl + id, { method: 'DELETE', headers: { Origin: 'http://localhost:5173', Cookie: adminJar.cookie, ...headers } });
    assert.equal((await deleteAsAdmin(adminId)).status, 404);
    assert.equal((await deleteAsAdmin(fixtureIds[0])).status, 200);
    assert.equal((await bk(`${recaps}/${fixtureIds[0]}`)).status, 404);
    assert.equal((await first.repo.getProgress(fixtureIds[0])).length, 0);
    assert.equal(await first.repo.getAccount(fixtureIds[0]), undefined);
  });
  await t.test('audit failure rolls back the approval instead of leaving a partial decision', async () => {
    const account = await first.auth.api.signUpEmail({ body: { name: 'Rollback PG', email: 'rollback@example.test', password } });
    await assert.rejects(first.repo.reviewAccount({ userId: account.user.id, adminId: 'missing-admin', decision: 'approved', note: '' }), { code: '23503' });
    assert.equal((await second.repo.getAccount(account.user.id)).status, 'pending');
  });
  await t.test('per-IP rate limits persist across instances and ignore spoofed alternate headers', async () => {
    let result;
    for (let index = 0; index < 9; index += 1) {
      result = await (index % 2 ? studentA : studentB)('/api/auth/sign-in/email', { email: 'student@example.test', password: 'Wrong-Password-123!' },
        { 'x-vercel-forwarded-for': '203.0.113.80', 'x-forwarded-for': `198.51.100.${index + 1}`, 'x-kreasi-client-ip': `192.0.2.${index + 1}` });
      if (result.status === 429) break;
    }
    assert.equal(result.status, 429);
    const other = await studentB('/api/auth/sign-in/email', { email: 'student@example.test', password }, { 'x-vercel-forwarded-for': '203.0.113.81' });
    assert.equal(other.status, 200);
  });
  await t.test('production sets Secure HttpOnly SameSite cookies and logout revokes sessions', async () => {
    const production = await createAuthService({ databaseUrl: database.url, schema: options.schema,
      env: { NODE_ENV: 'production', DATABASE_URL: database.url, BETTER_AUTH_URL: 'https://kreasi.example',
        AUTH_TRUSTED_ORIGINS: 'https://kreasi.example', BETTER_AUTH_SECRET: options.secret } });
    services.push(production);
    const response = await production.auth.api.signInEmail({ body: { email: 'student@example.test', password }, asResponse: true });
    const cookie = response.headers.getSetCookie().find((value) => value.includes('session_token='));
    assert.match(cookie, /; Secure/i); assert.match(cookie, /; HttpOnly/i); assert.match(cookie, /SameSite=Lax/i);
    assert.equal((await studentA('/api/auth/sign-out', {})).status, 200);
    assert.equal((await studentB('/api/journey')).status, 401);
  });
  await t.test('Vercel handler reuses one initialization, preserves API paths, and recovers after a failed cold start', async () => {
    let attempts = 0;
    const env = { VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_URL: 'kreasi-preview.vercel.app',
      DATABASE_URL: database.url, DATABASE_SCHEMA: options.schema, BETTER_AUTH_SECRET: options.secret };
    const handler = createVercelHandler({ env, createService: async (settings) => {
      attempts += 1;
      if (attempts === 1) throw new Error('simulated unavailable database');
      const service = await createAuthService(settings); services.push(service); return service;
    } });
    const server = http.createServer(handler);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve)); servers.push(server);
    const request = client(server);
    assert.equal((await request('/api/ready')).status, 503);
    const requests = await Promise.all([request('/api/ready'), request('/api/ready'), request('/api/not-found')]);
    assert.deepEqual(requests.map((result) => result.status), [200, 200, 404]);
    assert.equal(attempts, 2);
    assert.equal((await request('/api/journey')).status, 401);
    assert.equal((await request('/api/ready', undefined, { 'x-vercel-forwarded-for': 'invalid' })).status, 503);
  });
  await t.test('SQLite import preserves password hashes and metadata, rejects nonempty targets, and rolls back invalid rows', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-import-test-'));
    const sourcePath = path.join(directory, 'source.sqlite');
    const sqlite = await createAuthService({ databasePath: sourcePath, secret: options.secret, env: { NODE_ENV: 'test' } });
    try {
      const admin = await sqlite.auth.api.signUpEmail({ body: { name: 'Legacy Admin', email: 'legacy-admin@example.test', password } });
      await sqlite.repo.promoteSuperadmin(admin.user.id);
      const student = await sqlite.auth.api.signUpEmail({ body: { name: 'Legacy Student', email: 'legacy-student@example.test', password } });
      await sqlite.repo.reviewAccount({ userId: student.user.id, adminId: admin.user.id, decision: 'approved', note: 'Legacy note' });
      await sqlite.repo.recordProgress({ userId: student.user.id, stepId: 'self-check', action: 'skip' });
      const target = await createAuthService({ ...options, schema: 'kreasi_import', migrate: true }); services.push(target);
      const counts = await importSqlite({ sourcePath, pool: target.db, schema: 'kreasi_import' });
      assert.deepEqual(counts, { user: 2, account: 2, account_reviews: 1, user_journey_progress: 1, student_recaps: 0 });
      assert.ok(await target.auth.api.signInEmail({ body: { email: 'legacy-student@example.test', password } }));
      assert.equal((await target.repo.getAccount(student.user.id)).reviewNote, 'Legacy note');
      assert.equal((await target.repo.getProgress(student.user.id))[0].status, 'skipped');
      await assert.rejects(importSqlite({ sourcePath, pool: target.db, schema: 'kreasi_import' }), /harus kosong/);
      const invalidTarget = await createAuthService({ ...options, schema: 'kreasi_import_invalid', migrate: true }); services.push(invalidTarget);
      sqlite.db.prepare('UPDATE user SET role = ? WHERE id = ?').run('invalid-role', student.user.id);
      await assert.rejects(importSqlite({ sourcePath, pool: invalidTarget.db, schema: 'kreasi_import_invalid' }), { code: '23514' });
      assert.equal((await invalidTarget.db.query('SELECT count(*) FROM kreasi_import_invalid."user"')).rows[0].count, '0');
    } finally {
      await sqlite.close();
      assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
      assert.ok(path.basename(directory).startsWith('kreasi-import-test-'));
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
