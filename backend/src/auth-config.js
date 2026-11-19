const LOCAL_ORIGINS = 'http://localhost:5173,http://localhost:3001,http://127.0.0.1:5173,http://127.0.0.1:3001';

function parseOrigin(value, label, production) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label} harus berupa URL origin yang valid.`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password
    || url.pathname !== '/' || url.search || url.hash || (production && url.protocol !== 'https:')) {
    throw new Error(`${label} harus berupa origin ${production ? 'HTTPS' : 'HTTP/HTTPS'} tanpa path atau kredensial.`);
  }
  return url.origin;
}

export function readAuthConfig(options = {}, env = process.env) {
  const production = env.NODE_ENV === 'production' || env.VERCEL === '1';
  const previewURL = env.VERCEL === '1' && env.VERCEL_ENV === 'preview' && env.VERCEL_URL
    ? `https://${env.VERCEL_URL}` : undefined;
  const productionURL = env.VERCEL === '1' && env.VERCEL_ENV === 'production' && env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;
  const rawBaseURL = options.baseURL ?? env.BETTER_AUTH_URL ?? previewURL ?? productionURL;
  const rawOrigins = options.origins ?? env.AUTH_TRUSTED_ORIGINS ?? (previewURL || productionURL ? rawBaseURL : undefined);
  const secret = options.secret ?? env.BETTER_AUTH_SECRET;
  if (production && (!rawBaseURL || !rawOrigins || !secret)) {
    throw new Error('BETTER_AUTH_URL, AUTH_TRUSTED_ORIGINS, dan BETTER_AUTH_SECRET wajib diisi di produksi.');
  }
  if (secret && (typeof secret !== 'string' || secret.trim().length < 32)) {
    throw new Error('BETTER_AUTH_SECRET harus berisi minimal 32 karakter.');
  }
  const baseURL = parseOrigin(rawBaseURL || 'http://localhost:3001', 'BETTER_AUTH_URL', production);
  const originValues = Array.isArray(rawOrigins) ? rawOrigins : (rawOrigins ?? LOCAL_ORIGINS).split(',');
  const origins = [...new Set(originValues.map((value) => parseOrigin(String(value).trim(), 'AUTH_TRUSTED_ORIGINS', production)))];
  if (production && !origins.includes(baseURL)) throw new Error('AUTH_TRUSTED_ORIGINS harus mencakup origin BETTER_AUTH_URL.');
  return { baseURL, origins, secret, production };
}
