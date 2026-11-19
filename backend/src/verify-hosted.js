// Dedicated fixtures in kreasi_preview only; never writes to the production schema.
import fs from 'node:fs';
import http from 'node:http';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';
import { createRateLimitKey } from '@better-auth/core/utils/ip';
import { createAuthService } from './auth.js';
import { createApp } from './app.js';
import { JOURNEY_STEPS } from './domain/journey.js';

const values = dotenv.parse(fs.readFileSync(new URL('../.env.preview.local', import.meta.url)));
if (values.DATABASE_SCHEMA !== 'kreasi_preview') throw new Error('Hosted fixtures may only use kreasi_preview.');
const settings = { databaseUrl: values.DATABASE_URL, schema: values.DATABASE_SCHEMA,
  secret: values.BETTER_AUTH_SECRET, baseURL: 'http://localhost:3001', origins: ['http://localhost:5173'], env: { NODE_ENV: 'test' } };
const services = [], servers = [], ids = [];
const token = randomBytes(8).toString('hex');
const password = randomBytes(24).toString('base64url');
const ipBytes = randomBytes(2);
const ip = `198.18.${ipBytes[0]}.${ipBytes[1]}`;
let success = false;
try {
  for (let index = 0; index < 2; index += 1) {
    const service = await createAuthService(settings); services.push(service);
    await service.repo.checkReady();
    const server = http.createServer(createApp({ authService: service, vercel: true, serveFrontend: false,
      getPublicConfig: () => ({ quiz: { mode: 'local' }, support: {} }) }));
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve)); servers.push(server);
  }
  const admin = await services[0].auth.api.signUpEmail({ body: { name: 'Hosted Test Admin', email: `audit-admin-${token}@example.test`, password } });
  ids.push(admin.user.id); await services[0].repo.promoteSuperadmin(admin.user.id);
  const studentJar = { cookie: '' }, adminJar = { cookie: '' };
  function request(index, jar) {
    return async (path, body) => {
      const response = await fetch(`http://127.0.0.1:${servers[index].address().port}${path}`, {
        method: body ? 'POST' : 'GET', headers: { Origin: 'http://localhost:5173', 'x-vercel-forwarded-for': ip,
          Cookie: jar.cookie, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) jar.cookie = cookies.map((cookie) => cookie.split(';')[0]).join('; ');
      return { status: response.status, data: await response.json() };
    };
  }
  const studentA = request(0, studentJar), studentB = request(1, studentJar);
  const adminA = request(0, adminJar), adminB = request(1, adminJar);
  const signup = await studentA('/api/auth/sign-up/email', { name: 'Hosted Test Student', email: `audit-student-${token}@example.test`, password });
  if (signup.data.user?.id) ids.push(signup.data.user.id);
  assert.equal(signup.status, 200);
  const studentId = signup.data.user.id;
  assert.equal((await studentB('/api/journey')).status, 403);
  assert.equal((await adminA('/api/auth/sign-in/email', { email: `audit-admin-${token}@example.test`, password })).status, 200);
  const decisions = await Promise.all([adminA(`/api/admin/users/${studentId}/review`, { decision: 'approved' }), adminB(`/api/admin/users/${studentId}/review`, { decision: 'approved' })]);
  assert.deepEqual(decisions.map((result) => result.status).sort(), [200, 409]);
  assert.equal((await studentB('/api/journey/steps/kuis', { action: 'complete' })).status, 403);
  for (const [index, step] of JOURNEY_STEPS.entries()) assert.equal((await (index % 2 ? studentA : studentB)(`/api/journey/steps/${step.id}`, { action: 'complete' })).status, 200);
  const cold = await createAuthService(settings); services.push(cold);
  assert.equal((await cold.repo.getProgress(studentId)).length, 6);
  assert.ok(await cold.auth.api.getSession({ headers: new Headers({ Cookie: studentJar.cookie }) }));
  assert.equal((await studentA('/api/auth/sign-out', {})).status, 200);
  assert.equal((await studentB('/api/journey')).status, 401);
  success = true;
  console.log('Hosted PostgreSQL: signup, approval race, step access, six steps, cold service and logout PASS.');
} catch (error) {
  console.error('Hosted verification failed:', error.code || error.name); process.exitCode = 1;
} finally {
  for (const server of servers) await new Promise((resolve) => server.close(resolve));
  if (services[0] && ids.length) {
    const pool = services[0].db;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM kreasi_preview.account_reviews WHERE user_id = ANY($1::text[]) OR admin_id = ANY($1::text[])', [ids]);
      await client.query('DELETE FROM kreasi_preview."user" WHERE id = ANY($1::text[])', [ids]);
      const keys = ['/sign-up/email', '/sign-in/email', '/sign-out'].map((path) => createRateLimitKey(ip, path));
      await client.query('DELETE FROM kreasi_preview."rateLimit" WHERE key = ANY($1::text[])', [keys]);
      await client.query('COMMIT');
      const remaining = await pool.query('SELECT count(*) FROM kreasi_preview."user" WHERE id = ANY($1::text[])', [ids]);
      assert.equal(remaining.rows[0].count, '0');
      console.log('Hosted fixture cleanup PASS; existing accounts preserved.');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {}); process.exitCode = 1;
      console.error('Hosted fixture cleanup failed:', error.code || error.name);
    } finally { client.release(); }
  }
  for (const service of services) await service.close();
}
if (!success) process.exitCode = 1;
