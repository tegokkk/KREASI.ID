import assert from 'node:assert/strict';
import test from 'node:test';
import { readDatabaseConfig } from '../src/database-config.js';
import { clientIp } from '../src/client-ip.js';

test('hosted database is mandatory in production; remote TLS cannot be disabled by URL options', () => {
  assert.throws(() => readDatabaseConfig({}, { NODE_ENV: 'production' }), /DATABASE_URL/);
  assert.throws(() => readDatabaseConfig({ databasePath: ':memory:' }, { VERCEL: '1' }), /DATABASE_URL/);
  assert.throws(() => readDatabaseConfig({}, { DATABASE_URL: 'https://project.supabase.co' }), /connection string SQL/);
  const config = readDatabaseConfig({}, { DATABASE_URL: 'postgresql://user:password@db.example/postgres?sslmode=no-verify&ssl=false' });
  assert.equal(config.pool.ssl.rejectUnauthorized, true);
  assert.equal(new URL(config.pool.connectionString).searchParams.has('sslmode'), false);
  assert.equal(new URL(config.pool.connectionString).searchParams.has('ssl'), false);
  assert.equal(config.schema, 'kreasi');
  assert.equal(config.pool.max, 3);
  assert.throws(() => readDatabaseConfig({ schema: 'public' }, { DATABASE_URL: 'postgresql://user:password@db.example/postgres' }), /schema aplikasi/);
  assert.equal(readDatabaseConfig({ databasePath: ':memory:' }, { DATABASE_URL: 'postgresql://user:password@db.example/postgres' }).dialect, 'sqlite');
});

test('client IP trusts platform header only inside Vercel, never arbitrary forwarded headers', () => {
  const req = { socket: { remoteAddress: '::ffff:127.0.0.1' }, headers: {
    'x-vercel-forwarded-for': '203.0.113.1', 'x-forwarded-for': '198.51.100.2', 'x-kreasi-client-ip': '192.0.2.3',
  } };
  assert.equal(clientIp(req), '127.0.0.1');
  assert.equal(clientIp(req, { vercel: true }), '203.0.113.1');
  req.headers['x-vercel-forwarded-for'] = '203.0.113.1, 203.0.113.2';
  assert.equal(clientIp(req, { vercel: true }), null);
  req.headers['x-vercel-forwarded-for'] = '2001:0DB8:0:0:0:0:0:1';
  assert.equal(clientIp(req, { vercel: true }), '2001:db8::1');
});
