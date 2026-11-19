import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../frontend/dist');

async function request(server, reqPath) {
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}${reqPath}`;
  const res = await fetch(url);
  const body = await res.text();
  return { status: res.status, headers: res.headers, body };
}

test('loadConfig falls back to local quiz when google-forms lacks valid URL', () => {
  const cfg = loadConfig({
    PORT: '4000',
    QUIZ_MODE: 'google-forms',
    QUIZ_FORM_URL: '',
    QUIZ_RETENTION_DAYS: '14',
    BK_CONTACT_URL: 'javascript:alert(1)',
  });

  assert.equal(cfg.port, 4000);
  assert.equal(cfg.publicConfig.quiz.mode, 'local');
  assert.equal(cfg.publicConfig.quiz.formUrl, null);
  assert.equal(cfg.publicConfig.quiz.retentionDays, 14);
  assert.equal(cfg.publicConfig.support.contactUrl, null);
});

test('loadConfig keeps google-forms mode and contactUrl when valid', () => {
  const cfg = loadConfig({
    QUIZ_MODE: 'google-forms',
    QUIZ_FORM_URL: 'https://docs.google.com/forms/d/e/test/viewform',
    QUIZ_RETENTION_DAYS: '30',
    BK_CONTACT_URL: 'https://example.sch.id/bk',
  });

  assert.equal(cfg.publicConfig.quiz.mode, 'google-forms');
  assert.equal(
    cfg.publicConfig.quiz.formUrl,
    'https://docs.google.com/forms/d/e/test/viewform'
  );
  assert.equal(cfg.publicConfig.support.contactUrl, 'https://example.sch.id/bk');
});

test('API endpoints, static assets 404, and SPA fallback work together', async (t) => {
  const cfg = loadConfig({});
  const app = createApp({
    getPublicConfig: () => cfg.publicConfig,
    distDir,
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const health = await request(server, '/api/health');
  assert.equal(health.status, 200);
  assert.deepEqual(JSON.parse(health.body), { status: 'ok' });

  const pub = await request(server, '/api/public-config');
  assert.equal(pub.status, 401);
  assert.equal(pub.headers.get('cache-control'), 'no-store');
  assert.match(JSON.parse(pub.body).error, /masuk/);

  const support = await request(server, '/api/support');
  assert.equal(support.status, 200);
  assert.deepEqual(JSON.parse(support.body), { support: { contactUrl: null } });
  assert.equal(support.headers.get('cache-control'), 'no-store');

  const readiness = await request(server, '/api/ready');
  assert.equal(readiness.status, 503);
  assert.deepEqual(JSON.parse(readiness.body), { status: 'unavailable' });

  const api404 = await request(server, '/api/tidak-ada');
  assert.equal(api404.status, 404);
  assert.match(api404.headers.get('content-type'), /application\/json/);

  const asset404 = await request(server, '/assets/tidak-ada.js');
  assert.equal(asset404.status, 404);

  const file404 = await request(server, '/tidak-ada.png');
  assert.equal(file404.status, 404);

  const spaRoute = await request(server, '/self-check');
  assert.equal(spaRoute.status, 200);
  assert.match(spaRoute.headers.get('content-type'), /text\/html/);
  assert.match(spaRoute.body, /<div id="root"><\/div>/);
  const index = await request(server, '/index.html');
  assert.equal(index.headers.get('cache-control'), 'no-cache');
});
