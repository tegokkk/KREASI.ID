import { createApp } from './app.js';
import { createAuthService } from './auth.js';
import { loadConfig } from './config.js';

export function createVercelHandler({ createService = createAuthService, env = process.env } = {}) {
  let appPromise;
  return async (req, res) => {
    if (!appPromise) {
      appPromise = (async () => {
        const service = await createService({ env });
        try {
          await service.repo.checkReady();
          const config = loadConfig(env);
          return createApp({ authService: service, getPublicConfig: () => config.publicConfig,
            vercel: env.VERCEL === '1', serveFrontend: false });
        } catch (error) { await service.close(); throw error; }
      })();
      appPromise.catch(() => { appPromise = undefined; }); // A failed cold start can recover on the next request.
    }
    try {
      const app = await appPromise;
      return app(req, res);
    } catch (error) {
      console.error('KREASI API initialization failed:', error.code || error.name);
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ error: 'Layanan belum siap. Periksa konfigurasi dan migrasi database.' }));
    }
  };
}

export default createVercelHandler();
