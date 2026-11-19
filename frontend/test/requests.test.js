import assert from 'node:assert/strict';
import test from 'node:test';
import { accountRequest, jsonRequest } from '../src/services/auth.js';
import { checkStepAccess } from '../src/services/journey.js';
import { fetchPublicConfig } from '../src/services/public-config.js';

test('API rejects HTML and malformed JSON instead of pretending a request succeeded', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('<html>SPA</html>', { headers: { 'Content-Type': 'text/html' } }));
  await assert.rejects(accountRequest('/api/journey'), /Respons API tidak valid/);
  fetch.mock.mockImplementation(async () => new Response('broken', { headers: { 'Content-Type': 'application/json' } }));
  await assert.rejects(accountRequest('/api/access/me'), SyntaxError);
});

test('API retains HTTP status and step guard receives locked response details', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ allowed: false, error: 'Langkah terkunci.' }, { status: 403 }));
  const result = await checkStepAccess('kuis');
  assert.equal(result.status, 403);
  assert.equal(result.data.allowed, false);
  await assert.rejects(accountRequest('/api/journey'), (error) => error.status === 403 && error.message === 'Langkah terkunci.');
});

test('API requests stop on timeout and on caller cancellation', async (t) => {
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(jsonRequest('/api/journey', { timeoutMs: 10 }), { name: 'TimeoutError' });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(jsonRequest('/api/journey', { signal: controller.signal }), { name: 'AbortError' });
  } finally { clearTimeout(keepAlive); }
});

test('public contact uses the unauthenticated support endpoint and filters unsafe links', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ support: { contactUrl: 'mailto:bk@example.sch.id' } }));
  const config = await fetchPublicConfig({ supportOnly: true });
  assert.equal(fetch.mock.calls[0].arguments[0], '/api/support');
  assert.equal(config.support.contactUrl, 'mailto:bk@example.sch.id');
  fetch.mock.mockImplementation(async () => Response.json({ support: { contactUrl: 'javascript:alert(1)' } }));
  assert.equal((await fetchPublicConfig({ supportOnly: true })).support.contactUrl, null);
});
