import './config.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import { readDatabaseConfig } from './database-config.js';
import { importSqlite } from './sqlite-import.js';

const config = readDatabaseConfig({ databaseUrl: process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL });
if (config.dialect !== 'postgres') throw new Error('Target import harus PostgreSQL.');
const pool = new Pool({ ...config.pool, max: 1 });
try {
  const sourcePath = process.env.IMPORT_SQLITE_PATH || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/accounts.sqlite');
  const counts = await importSqlite({ sourcePath, pool, schema: config.schema });
  console.log('Import selesai; source tetap utuh dan pengguna perlu login ulang.', JSON.stringify(counts));
} catch (error) {
  console.error('Import dibatalkan:', error.code || (error.message.startsWith('Target import') ? error.message : 'Periksa target database, schema dan source. Tidak ada data target yang ditimpa.'));
  process.exitCode = 1;
} finally { await pool.end(); }
