import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('bootstrap generates a valid password when example environment leaves it empty', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-bootstrap-test-'));
  t.after(() => {
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('kreasi-bootstrap-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const databasePath = path.join(directory, 'accounts.sqlite');
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../src/create-superadmin.js', import.meta.url))], {
    encoding: 'utf8',
    timeout: 30000,
    env: { ...process.env, NODE_ENV: 'test', VERCEL: '', AUTH_DATABASE_PATH: databasePath,
      BETTER_AUTH_URL: 'http://localhost:3001', AUTH_TRUSTED_ORIGINS: 'http://localhost:3001',
      BETTER_AUTH_SECRET: 'bootstrap-test-only-secret-with-thirty-two-characters',
      SUPERADMIN_EMAIL: 'bootstrap@example.test', SUPERADMIN_PASSWORD: '' },
  });
  assert.equal(result.status, 0, 'Bootstrap must succeed without an explicit password.');
  assert.ok(result.stdout.match(/Kata sandi: (\S+)/)?.[1].length >= 12);
  const database = new DatabaseSync(databasePath);
  try {
    const user = database.prepare('SELECT role, status FROM user WHERE email = ?').get('bootstrap@example.test');
    assert.deepEqual({ ...user }, { role: 'superadmin', status: 'approved' });
  } finally { database.close(); }
});
