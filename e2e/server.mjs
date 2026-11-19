// Isolated browser-test data. This never opens backend/data/accounts.sqlite.
import { createApp } from '../backend/src/app.js';
import { createAuthService } from '../backend/src/auth.js';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL('../frontend/dist-e2e/', import.meta.url));
if (!fs.existsSync(fileURLToPath(new URL('../frontend/dist-e2e/index.html', import.meta.url)))) {
  throw new Error('Build browser-test belum tersedia. Jalankan npm run test:e2e.');
}

const origin = 'http://127.0.0.1:4107';
const service = await createAuthService({
  databasePath: ':memory:',
  baseURL: origin,
  origins: [origin],
  secret: 'browser-tests-only-secret-more-than-thirty-two-characters',
});
for (const [name, email, role] of [
  ['Admin Test', 'admin@example.test', 'superadmin'],
  ['Siswa A', 'student-a@example.test', 'user'],
  ['Siswa B', 'student-b@example.test', 'user'],
]) {
  const result = await service.auth.api.signUpEmail({ body: { name, email, password: 'Browser-Test-Only-123!' } });
  service.db.prepare("UPDATE user SET status = 'approved', role = ? WHERE id = ?").run(role, result.user.id);
}
const app = createApp({
  distDir,
  authService: service,
  getPublicConfig: () => ({ quiz: { mode: 'local', formUrl: null, retentionDays: 30 }, support: { contactUrl: 'mailto:bk@example.test' } }),
});
const server = app.listen(4107, '127.0.0.1');
function shutdown() {
  server.close(() => { service.db.close(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
