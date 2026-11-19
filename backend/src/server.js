import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createAuthService } from './auth.js';

const config = loadConfig();
const authService = await createAuthService();
await authService.repo.checkReady();
const app = createApp({
  getPublicConfig: () => config.publicConfig,
  authService,
});

const server = app.listen(config.port, () => {
  console.log(`Server KREASI.ID berjalan di http://localhost:${config.port}`);
});

async function shutdown() {
  server.close(async () => { await authService.close(); process.exit(0); });
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
