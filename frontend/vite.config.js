import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { devApiProxy } from './dev-api-proxy.mjs';

export default defineConfig({
  plugins: [react(), devApiProxy(process.env.KREASI_API_TARGET || 'http://127.0.0.1:3001')],
  server: {
    port: 5173,
    strictPort: true,
    watch: { ignored: ['**/dist/**', '**/dist-e2e/**', '**/test-results/**', '**/playwright-report/**'] },
  },
});
