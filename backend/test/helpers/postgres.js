import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export async function startTestPostgres() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-pg-test-'));
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const password = randomBytes(24).toString('hex');
  const server = new EmbeddedPostgres({ databaseDir: directory, port, user: 'postgres', password,
    authMethod: 'scram-sha-256', persistent: true, autoRehydrateSymlinks: true,
    postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} });
  if (process.platform === 'win32') {
    const { pg_ctl } = await import('@embedded-postgres/windows-x64');
    let stopped = false;
    // Graceful shutdown avoids orphaned PostgreSQL 18 worker pipes from taskkill /f.
    server.stop = async () => {
      if (stopped) return;
      stopped = true;
      await promisify(execFile)(pg_ctl, ['-D', directory, 'stop', '-m', 'fast', '-w', '-t', '10'], { windowsHide: true, timeout: 15000 });
    };
  }
  try { await server.initialise(); await server.start(); }
  catch (error) { await server.stop().catch(() => {}); throw error; }
  return {
    url: `postgresql://postgres:${password}@127.0.0.1:${port}/postgres`,
    async close() {
      await server.stop();
      if (path.dirname(directory) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith('kreasi-pg-test-')) throw new Error('Unexpected test directory.');
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
}
