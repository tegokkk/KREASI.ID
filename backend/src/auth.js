import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { PostgresDialect } from 'kysely';
import { attachDatabasePool } from '@vercel/functions';
import { betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { APIError } from 'better-auth/api';
import { readAuthConfig } from './auth-config.js';
import { readDatabaseConfig } from './database-config.js';
import { createRepository } from './repository.js';
import { migratePostgres, migrateSqlite } from './migrations.js';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function createAuthService(options = {}) {
  const env = options.env ?? process.env;
  const authConfig = readAuthConfig(options, env);
  const databaseConfig = readDatabaseConfig(options, env);
  const { baseURL, origins } = authConfig;
  let { secret } = authConfig;
  if (!secret) {
    const secretPath = path.join(backendDir, 'data/auth-secret');
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    if (!fs.existsSync(secretPath)) fs.writeFileSync(secretPath, randomBytes(48).toString('hex'), { mode: 0o600 });
    secret = fs.readFileSync(secretPath, 'utf8').trim();
  }
  let db;
  let authDatabase;
  if (databaseConfig.dialect === 'postgres') {
    db = new Pool(databaseConfig.pool);
    // Only log a non-sensitive code: pg errors can otherwise contain connection details.
    db.on('error', (error) => console.error('Database pool error:', error.code || 'CONNECTION_ERROR'));
    if (env.VERCEL === '1') attachDatabasePool(db);
    authDatabase = { dialect: new PostgresDialect({ pool: db }), type: 'postgres', schemaName: databaseConfig.schema, transaction: true };
  } else {
    const databasePath = options.databasePath ?? (env.AUTH_DATABASE_PATH || path.join(backendDir, 'data/accounts.sqlite'));
    if (databasePath !== ':memory:') fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    const { DatabaseSync } = await import('node:sqlite');
    db = new DatabaseSync(databasePath, { timeout: 5000 });
    db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    authDatabase = db;
  }
  const close = () => databaseConfig.dialect === 'postgres' ? db.end() : db.close();
  const auth = betterAuth({
    appName: 'KREASI.ID',
    baseURL,
    secret,
    database: authDatabase,
    trustedOrigins: origins,
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    session: { expiresIn: 60 * 60 * 8, cookieCache: { enabled: false } },
    advanced: { useSecureCookies: authConfig.production, ipAddress: { ipAddressHeaders: ['x-kreasi-client-ip'] } },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'user', input: false },
        status: { type: 'string', defaultValue: 'pending', input: false },
        reviewNote: { type: 'string', defaultValue: '', input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const name = user.name.trim();
            if (name.length < 2 || name.length > 100) {
              throw new APIError('BAD_REQUEST', { message: 'Nama harus berisi 2 sampai 100 karakter.' });
            }
            return { data: { ...user, name, role: 'user', status: 'pending', reviewNote: '' } };
          },
        },
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      storage: 'database',
      customRules: {
        '/sign-in/email': { window: 60, max: 8 },
        '/sign-up/email': { window: 60, max: 5 },
      },
    },
  });
  try {
    if (databaseConfig.dialect === 'sqlite') {
      const { runMigrations } = await getMigrations(auth.options);
      await runMigrations();
      migrateSqlite(db);
    } else if (options.migrate === true) {
      await migratePostgres(db, databaseConfig.schema);
    }
  } catch (error) {
    await close();
    throw error;
  }
  const repo = createRepository(db, databaseConfig);
  return { auth, db, repo, origins, close, dialect: databaseConfig.dialect };
}
