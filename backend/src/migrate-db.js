import './config.js';
import { Pool } from 'pg';
import { readDatabaseConfig } from './database-config.js';
import { migratePostgres } from './migrations.js';

try {
  const config = readDatabaseConfig({ databaseUrl: process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL });
  if (config.dialect !== 'postgres') throw new Error('Isi DATABASE_MIGRATION_URL atau DATABASE_URL PostgreSQL terlebih dahulu.');
  const url = new URL(config.pool.connectionString);
  if (url.hostname.endsWith('.pooler.supabase.com') && url.port === '6543') throw new Error('Migrasi memerlukan Direct atau Session pooler (port 5432), bukan Transaction pooler (6543).');
  const pool = new Pool({ ...config.pool, max: 1 });
  try {
    await migratePostgres(pool, config.schema);
    console.log('Migrasi PostgreSQL KREASI.ID selesai.');
  } finally { await pool.end(); }
} catch (error) {
  console.error('Migrasi gagal:', error.code || (error.message.includes('DATABASE_') || error.message.includes('Migrasi') || error.message.includes('Checksum') ? error.message : 'Periksa koneksi, sertifikat TLS, dan izin database.'));
  process.exitCode = 1;
}
