import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { createAccessControl } from './routes/access.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createJourneyRouter } from './routes/journey.routes.js';
import { createPublicConfigRouter } from './routes/public-config.routes.js';
import { clientIp } from './client-ip.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDistDir = path.resolve(__dirname, '../../frontend/dist');

export function createApp({ getPublicConfig, authService, distDir = defaultDistDir, vercel = false, serveFrontend = true }) {
  const app = express();
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    const ip = clientIp(req, { vercel });
    delete req.headers['x-kreasi-client-ip'];
    if (!ip && vercel) return res.status(503).set('Cache-Control', 'no-store').json({ error: 'Identitas koneksi tepercaya tidak tersedia.' });
    if (ip) req.headers['x-kreasi-client-ip'] = ip;
    next();
  });

  app.use('/api/health', createHealthRouter());
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.get('/api/ready', async (_req, res) => {
    try {
      if (!authService) throw new Error('Auth service unavailable');
      await authService.repo.checkReady();
      res.json({ status: 'ready', capabilities: ['accounts', 'journey-v1'] });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });
  if (authService) app.all('/api/auth/*splat', toNodeHandler(authService.auth));
  app.use(express.json({ limit: '16kb' }));
  const access = createAccessControl(authService);
  app.use('/api/access', access.accessRouter);
  app.use('/api/admin', access.adminRouter);
  app.use('/api/journey', access.requireApproved, createJourneyRouter(authService));
  app.get('/api/support', (_req, res) => {
    res.json({ support: getPublicConfig().support });
  });
  app.use('/api/public-config', access.requireApproved, createPublicConfigRouter(getPublicConfig));

  // Unmatched API endpoints always return JSON 404 before static/SPA handlers.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
  });

  const indexHtmlPath = path.join(distDir, 'index.html');
  const hasFrontendBuild = serveFrontend && fs.existsSync(indexHtmlPath);

  if (hasFrontendBuild) {
    app.use(
      express.static(distDir, {
        index: false,
        maxAge: '1h',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
        },
      })
    );

    // Missing static assets under /assets/ or file-like paths return 404 instead of index.html.
    app.get('/assets/{*splat}', (_req, res) => {
      res.status(404).type('text/plain').send('Aset tidak ditemukan.');
    });

    app.get('/{*splat}', (req, res, next) => {
      if (path.extname(req.path)) {
        res.status(404).type('text/plain').send('Berkas tidak ditemukan.');
        return;
      }
      res.sendFile(indexHtmlPath, (err) => {
        if (err) {
          next(err);
        }
      });
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({
        name: 'KREASI.ID API',
        status: 'ok',
        message: 'Build frontend belum tersedia. Jalankan npm run build --workspace=frontend.',
      });
    });
  }

  app.use((err, req, res, _next) => {
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
      return res.status(err.status).json({ error: 'Format atau ukuran permintaan tidak valid.' });
    }
    console.error('Permintaan gagal diproses:', err.name);
    if (req.path.startsWith('/api')) {
      res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
      return;
    }
    res.status(500).type('text/plain').send('Terjadi kesalahan pada server.');
  });

  return app;
}
