import './config.js';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';
import { readDatabaseConfig } from './database-config.js';

const database = readDatabaseConfig();
if (database.dialect !== 'postgres') throw new Error('Isi DATABASE_URL PostgreSQL di backend/.env.local terlebih dahulu.');
for (const [target, schema] of [['preview', 'kreasi_preview'], ['production', 'kreasi']]) {
  const file = new URL(`../.env.${target}.local`, import.meta.url);
  const previous = fs.existsSync(file) ? dotenv.parse(fs.readFileSync(file)) : {};
  const values = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_SCHEMA: schema,
    DATABASE_POOL_MAX: '3',
    BETTER_AUTH_SECRET: previous.BETTER_AUTH_SECRET || randomBytes(48).toString('hex'),
    QUIZ_MODE: process.env.QUIZ_MODE || 'local',
    QUIZ_RETENTION_DAYS: process.env.QUIZ_RETENTION_DAYS || '30',
    ...(process.env.QUIZ_FORM_URL ? { QUIZ_FORM_URL: process.env.QUIZ_FORM_URL } : {}),
    ...(process.env.BK_CONTACT_URL ? { BK_CONTACT_URL: process.env.BK_CONTACT_URL } : {}),
    ...(previous.BETTER_AUTH_URL ? { BETTER_AUTH_URL: previous.BETTER_AUTH_URL } : {}),
    ...(previous.AUTH_TRUSTED_ORIGINS ? { AUTH_TRUSTED_ORIGINS: previous.AUTH_TRUSTED_ORIGINS } : {}),
  };
  const content = `# PRIVATE: import only into the ${target} environment on Vercel. Never commit this file.\n`
    + '# Origin is derived from Vercel system variables unless explicitly overridden.\n'
    + Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n';
  fs.writeFileSync(file, content, { mode: 0o600 });
  console.log(`Prepared backend/.env.${target}.local (${Object.keys(values).join(', ')}). Values are not printed.`);
}
