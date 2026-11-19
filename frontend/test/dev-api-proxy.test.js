import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { createDevApiProxy } from '../dev-api-proxy.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function listen(server, port = 0) {
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return `http://127.0.0.1:${server.address().port}`;
}
async function close(server) {
  server.closeAllConnections();
  if (server.listening) await new Promise((resolve) => server.close(resolve));
}
async function fixture(t, handler, options) {
  const backend = http.createServer((req, res) => {
    if (req.url === '/api/health') {
      res.setHeader('Content-Type', 'application/json');
      return res.end('{"status":"ok"}');
    }
    handler(req, res);
  });
  const target = await listen(backend);
  const middleware = createDevApiProxy(target, { waitMs: 1500, retryMs: 30, ...options });
  const frontend = http.createServer((req, res) => middleware(req, res, () => {
    res.end('public page');
  }));
  const url = await listen(frontend);
  t.after(async () => { await close(frontend); await close(backend); });
  return { backend, target, url };
}

test('dev proxy waits through a restart and preserves auth cookies and request data', async (t) => {
  let received;
  const { backend, target, url } = await fixture(t, async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    received = { url: req.url, method: req.method, body, cookie: req.headers.cookie, origin: req.headers.origin };
    res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': ['session=abc; HttpOnly; Path=/', 'other=xyz; Path=/'] });
    res.end('{"user":null}');
  });
  const port = Number(new URL(target).port);
  await close(backend);
  const pending = fetch(`${url}/api/access/me`);
  await sleep(200);
  await listen(backend, port);
  const response = await pending;
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { user: null });
  assert.equal(response.headers.getSetCookie().length, 2);
  const write = await fetch(`${url}/api/auth/example?return=home`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'session=abc', Origin: url }, body: '{"example":true}',
  });
  assert.equal(write.status, 200);
  await write.text();
  assert.deepEqual(received, { url: '/api/auth/example?return=home', method: 'POST', body: '{"example":true}', cookie: 'session=abc', origin: url });
  assert.equal(await (await fetch(`${url}/kontak`)).text(), 'public page');
});

test('dev proxy retries disconnected reads but never replays a submitted write', async (t) => {
  let reads = 0;
  let writes = 0;
  const { url } = await fixture(t, (req, res) => {
    if (req.method === 'POST') { writes++; req.socket.destroy(); return; }
    reads++;
    if (reads === 1) { req.socket.destroy(); return; }
    res.end('recovered');
  });
  assert.equal(await (await fetch(`${url}/api/access/me`)).text(), 'recovered');
  assert.equal(reads, 2);
  const write = await fetch(`${url}/api/action`, { method: 'POST', body: 'one submission' });
  assert.equal(write.status, 503);
  await write.text();
  assert.equal(writes, 1);
});

test('dev proxy returns an explicit 503 during prolonged downtime and preserves genuine upstream errors', async (t) => {
  const { backend, target, url } = await fixture(t, (_req, res) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end('{"message":"database error"}');
  }, { waitMs: 250 });
  const realError = await fetch(`${url}/api/access/me`);
  assert.equal(realError.status, 500);
  assert.deepEqual(await realError.json(), { message: 'database error' });
  await close(backend);
  const unavailable = await fetch(`${url}/api/access/me`);
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get('cache-control'), 'no-store');
  assert.match((await unavailable.json()).error, /Backend sedang dimulai ulang/);
  await listen(backend, Number(new URL(target).port));
});
