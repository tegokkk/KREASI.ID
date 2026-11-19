import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

for (const reuse of [false, true]) test(reuse
  ? 'frontend dev command recovers when a reused backend stops after startup'
  : 'frontend dev command starts a missing backend before serving proxied account requests', { timeout: 60000 }, async (t) => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-dev-test-'));
  const apiPort = await freePort();
  let webPort = await freePort();
  while (webPort === apiPort) webPort = await freePort();
  let borrowed;
  if (reuse) {
    borrowed = http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(req.url === '/api/ready'
        ? { status: 'ready', capabilities: ['journey-v1'] }
        : req.url === '/api/health' ? { status: 'ok' } : { user: null }));
    });
    await new Promise((resolve) => borrowed.listen(apiPort, '127.0.0.1', resolve));
    t.after(async () => {
      borrowed.closeAllConnections();
      if (borrowed.listening) await new Promise((resolve) => borrowed.close(resolve));
    });
  }
  let logs = '';
  // Same working directory and Node command as `cd frontend; npm run dev`.
  const child = spawn(process.execPath, ['../scripts/dev.mjs'], {
    cwd: path.join(root, 'frontend'), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development', VERCEL: '', DATABASE_URL: '',
      AUTH_DATABASE_PATH: path.join(directory, 'accounts.sqlite'),
      BETTER_AUTH_SECRET: 'dev-test-only-secret-with-at-least-thirty-two-characters',
      BETTER_AUTH_URL: `http://localhost:${apiPort}`,
      AUTH_TRUSTED_ORIGINS: `http://localhost:${apiPort},http://localhost:${webPort}`,
      PORT: String(apiPort), KREASI_WEB_PORT: String(webPort) },
  });
  child.stdout.on('data', (chunk) => { logs += chunk; });
  child.stderr.on('data', (chunk) => { logs += chunk; });
  t.after(async () => {
    if (child.exitCode === null && !child.signalCode) {
      const exited = new Promise((resolve) => child.once('exit', resolve));
      if (process.platform === 'win32') {
        const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        await new Promise((resolve) => killer.once('exit', resolve));
      } else {
        child.kill('SIGTERM');
      }
      await exited;
    }
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('kreasi-dev-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  let response;
  const deadline = Date.now() + 35000;
  while (Date.now() < deadline) {
    assert.equal(child.exitCode, null, `Dev launcher stopped unexpectedly: ${logs}`);
    try {
      response = await fetch(`http://localhost:${webPort}/api/access/me`, { signal: AbortSignal.timeout(1000) });
      if (response.status === 200) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.equal(response?.status, 200, logs);
  assert.deepEqual(await response.json(), { user: null });
  if (reuse) {
    assert.match(logs, /Memakai backend KREASI.ID yang sudah berjalan/);
    borrowed.closeAllConnections();
    await new Promise((resolve) => borrowed.close(resolve));
    // A cold start under parallel test load can outlast the proxy's bounded wait.
    // In that case require an honest 503, then verify automatic recovery without restarting Vite.
    let recovered;
    const recoveryDeadline = Date.now() + 30000;
    do {
      recovered = await fetch(`http://localhost:${webPort}/api/access/me`, { signal: AbortSignal.timeout(12000) });
      if (recovered.status === 200) break;
      assert.equal(recovered.status, 503, logs);
      assert.match((await recovered.json()).error, /Backend sedang dimulai ulang/);
      await new Promise((resolve) => setTimeout(resolve, 200));
    } while (Date.now() < recoveryDeadline);
    assert.equal(recovered.status, 200, logs);
    assert.deepEqual(await recovered.json(), { user: null });
    assert.match(logs, /Backend tidak lagi berjalan. Menjalankan ulang/);
  }
  const readiness = await fetch(`http://localhost:${webPort}/api/ready`);
  assert.equal((await readiness.json()).status, 'ready');
  if (!reuse) assert.ok(logs.indexOf('Backend siap.') < logs.indexOf('Menjalankan frontend'));
  assert.doesNotMatch(logs, /http proxy error|EADDRINUSE/);
});
