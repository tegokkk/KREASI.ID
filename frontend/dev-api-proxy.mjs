import http from 'node:http';
import https from 'node:https';

const connectionErrors = new Set(['ECONNREFUSED', 'ECONNRESET', 'EPIPE', 'ETIMEDOUT']);

// Development only: node --watch can briefly close the API listener during a restart.
export function createDevApiProxy(target, { waitMs = 8000, retryMs = 150 } = {}) {
  const origin = new URL(target);
  const transport = origin.protocol === 'https:' ? https : http;
  return (req, res, next) => {
    if (!/^\/api(?:\/|\?|$)/.test(req.url)) return next();
    const controller = new AbortController();
    const deadline = Date.now() + waitMs;
    res.once('close', () => controller.abort());
    const canRetry = ['GET', 'HEAD'].includes(req.method)
      && !req.headers['transfer-encoding'] && !Number(req.headers['content-length']);
    const pause = () => new Promise((resolve) => {
      const timer = setTimeout(done, Math.min(retryMs, Math.max(0, deadline - Date.now())));
      function done() {
        clearTimeout(timer);
        controller.signal.removeEventListener('abort', done);
        resolve();
      }
      controller.signal.addEventListener('abort', done, { once: true });
    });
    async function healthy() {
      try {
        const health = await fetch(new URL('/api/health', origin), {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(Math.max(1, Math.min(500, deadline - Date.now())))]),
        });
        const data = await health.json();
        return health.ok && data?.status === 'ok';
      } catch { return false; }
    }
    function forward() {
      return new Promise((resolve, reject) => {
        let receivedHeaders = false;
        const upstream = transport.request(new URL(req.url, origin), {
          method: req.method,
          headers: { ...req.headers, host: origin.host },
          signal: controller.signal,
        }, (response) => {
          receivedHeaders = true;
          res.writeHead(response.statusCode, response.headers);
          response.on('error', () => res.destroy());
          response.pipe(res);
          resolve(false);
        });
        upstream.on('error', (error) => {
          if (controller.signal.aborted || receivedHeaders) return resolve(false);
          if (connectionErrors.has(error.code)) return resolve(canRetry);
          reject(error);
        });
        // Never replay a submitted form, login, or other write after forwarding it.
        if (canRetry) upstream.end();
        else req.pipe(upstream);
      });
    }
    async function handle() {
      do {
        if (controller.signal.aborted) return;
        if (await healthy()) {
          const retry = await forward();
          if (!retry) {
            if (!res.headersSent && !controller.signal.aborted) unavailable();
            return;
          }
        }
        if (Date.now() < deadline) await pause();
      } while (Date.now() < deadline);
      if (!controller.signal.aborted) unavailable();
    }
    function unavailable() {
      res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '2' });
      res.end(JSON.stringify({ error: 'Backend sedang dimulai ulang atau belum tersedia. Tunggu sebentar, lalu coba lagi.' }));
    }
    handle().catch(next);
  };
}

export function devApiProxy(target) {
  return {
    name: 'kreasi-dev-api-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(createDevApiProxy(target));
    },
  };
}
