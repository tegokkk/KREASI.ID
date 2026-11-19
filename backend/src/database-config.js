export function readDatabaseConfig(options = {}, env = process.env) {
  const production = env.NODE_ENV === 'production' || env.VERCEL === '1';
  const connectionString = options.databaseUrl ?? (options.databasePath && !production ? '' : env.DATABASE_URL);
  if (!connectionString) {
    if (production) throw new Error('DATABASE_URL PostgreSQL wajib diisi di produksi; SQLite hanya untuk pengembangan lokal.');
    return { dialect: 'sqlite' };
  }
  let url;
  try { url = new URL(connectionString); } catch { throw new Error('DATABASE_URL harus berupa connection string PostgreSQL.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.password || url.pathname.length < 2) {
    throw new Error('DATABASE_URL harus berisi protokol PostgreSQL, host, database, user, dan password. URL HTTPS Supabase bukan connection string SQL.');
  }
  const schema = options.schema ?? env.DATABASE_SCHEMA ?? 'kreasi';
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema) || ['public', 'auth', 'storage', 'pg_catalog', 'information_schema'].includes(schema)) {
    throw new Error('DATABASE_SCHEMA harus berupa schema aplikasi khusus, misalnya kreasi.');
  }
  const max = Number(options.poolMax ?? env.DATABASE_POOL_MAX ?? 3);
  if (!Number.isInteger(max) || max < 1 || max > 10) throw new Error('DATABASE_POOL_MAX harus antara 1 dan 10.');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const supabase = url.hostname.endsWith('.pooler.supabase.com') || url.hostname.endsWith('.supabase.co');
  const ca = env.DATABASE_SSL_CA ? env.DATABASE_SSL_CA.replace(/\\n/g, '\n')
    : supabase ? [...rootCertificates, fs.readFileSync(new URL('../certs/supabase-root-2021.crt', import.meta.url), 'utf8')] : undefined;
  // Do not allow pg's URL parser to replace certificate verification settings.
  for (const key of ['ssl', 'sslmode', 'sslcert', 'sslkey', 'sslrootcert', 'sslpassword', 'uselibpqcompat']) url.searchParams.delete(key);
  return {
    dialect: 'postgres', schema,
    pool: {
      connectionString: url.toString(),
      ssl: local ? false : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
      max, min: 0, connectionTimeoutMillis: 5000, idleTimeoutMillis: 5000,
      maxLifetimeSeconds: 300, statement_timeout: 10000, query_timeout: 12000,
      application_name: 'kreasi-id', allowExitOnIdle: true,
    },
  };
}
import fs from 'node:fs';
import { rootCertificates } from 'node:tls';

