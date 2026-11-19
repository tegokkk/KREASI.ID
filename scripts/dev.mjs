import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../backend/src/config.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendPort = loadConfig().port;
const webPort = Number(process.env.KREASI_WEB_PORT || 5173);
const api = `http://127.0.0.1:${backendPort}`;
const children = new Set();
let stopping = false;
let ownedBackend;
let monitor;
let checking = false;
let missingSince;

async function backendReady() {
  try {
    const response = await fetch(`${api}/api/ready`, { signal: AbortSignal.timeout(2000) });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.status === 'ready' && data.capabilities?.includes('journey-v1')) return true;
    throw new Error(`Port ${backendPort} merespons, tetapi API KREASI.ID belum siap (HTTP ${response.status}). Periksa terminal backend dan database.`);
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') return false;
    throw error;
  }
}

function start(args, cwd, env = process.env, { backend = false } = {}) {
  const child = spawn(process.execPath, args, { cwd, env, stdio: 'inherit', windowsHide: true });
  children.add(child);
  child.on('error', (error) => { console.error('Proses development gagal:', error.code || error.name); shutdown(1); });
  child.on('exit', (code) => {
    children.delete(child);
    if (backend) {
      if (ownedBackend === child) ownedBackend = undefined;
      if (!stopping) console.log(`[dev] Proses backend berhenti (kode ${code ?? 'signal'}). Memeriksa pemulihan…`);
    } else if (!stopping) shutdown(code || 0);
  });
  return child;
}

function startBackend() {
  ownedBackend = start(['--watch', 'src/server.js'], path.join(root, 'backend'), process.env, { backend: true });
}

function portOpen() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port: backendPort });
    const done = (open) => { socket.destroy(); resolve(open); };
    socket.setTimeout(500, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

async function superviseBackend() {
  if (stopping || checking) return;
  checking = true;
  try {
    if (await portOpen()) missingSince = undefined;
    else {
      missingSince ??= Date.now();
      // Give another terminal's watcher time to restart; never replace a live owned watcher.
      if (!ownedBackend && Date.now() - missingSince >= 3000 && !stopping) {
        console.log('[dev] Backend tidak lagi berjalan. Menjalankan ulang backend untuk frontend…');
        startBackend();
        missingSince = undefined;
      }
    }
  } finally { checking = false; }
}

async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  clearInterval(monitor);
  await Promise.all([...children].map((child) => new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode) return resolve();
    child.once('exit', resolve);
    if (process.platform === 'win32') {
      // Stop only processes started here, including the child of node --watch.
      const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      killer.once('error', () => { child.kill(); resolve(); });
    } else child.kill('SIGTERM');
  })));
  process.exit(code);
}

process.once('SIGINT', () => shutdown());
process.once('SIGTERM', () => shutdown());

try {
  if (!Number.isInteger(webPort) || webPort < 1 || webPort > 65535 || webPort === backendPort) {
    throw new Error('KREASI_WEB_PORT harus berupa port valid yang berbeda dari port backend.');
  }
  if (await backendReady()) {
    console.log(`[dev] Memakai backend KREASI.ID yang sudah berjalan: ${api}`);
  } else {
    console.log(`[dev] Menjalankan backend di ${api} dan menunggu kesiapan database…`);
    startBackend();
    const deadline = Date.now() + 30000;
    while (!(await backendReady())) {
      if (Date.now() >= deadline) throw new Error('Backend belum siap setelah 30 detik. Periksa error konfigurasi/koneksi database pada log di atas.');
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    console.log('[dev] Backend siap.');
  }
  const requireFrontend = createRequire(new URL('../frontend/package.json', import.meta.url));
  const vite = path.join(path.dirname(requireFrontend.resolve('vite/package.json')), 'bin/vite.js');
  console.log(`[dev] Menjalankan frontend di http://localhost:${webPort}. Ctrl+C menghentikan proses yang dimulai perintah ini.`);
  start([vite, '--port', String(webPort), '--strictPort'], path.join(root, 'frontend'), {
    ...process.env, KREASI_API_TARGET: api,
  });
  monitor = setInterval(() => superviseBackend().catch((error) => {
    console.error('[dev] Pemeriksaan backend gagal:', error.code || error.name);
  }), 500);
} catch (error) {
  console.error(`[dev] ${error.message}`);
  await shutdown(1);
}
