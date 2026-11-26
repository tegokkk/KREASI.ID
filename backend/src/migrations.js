import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

export const SCHEMA_VERSION = 5;

export async function migratePostgres(pool, schema) {
  const directory = new URL('../../supabase/migrations/', import.meta.url);
  const files = (await fs.readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
  if (!files.length) throw new Error('Migrasi SQL tidak ditemukan.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`kreasi:migrate:${schema}`]);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await client.query(`CREATE TABLE IF NOT EXISTS "${schema}".schema_migrations (
      version INTEGER PRIMARY KEY, name TEXT NOT NULL, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    for (const [index, file] of files.entries()) {
      const source = await fs.readFile(new URL(file, directory), 'utf8');
      const checksum = createHash('sha256').update(source).digest('hex');
      const previous = (await client.query(`SELECT checksum FROM "${schema}".schema_migrations WHERE version = $1`, [index + 1])).rows[0];
      if (previous) {
        if (previous.checksum !== checksum) throw new Error(`Checksum migrasi ${file} berubah; buat migrasi baru.`);
        continue;
      }
      await client.query(source.replaceAll('__KREASI_SCHEMA__', schema));
      await client.query(`INSERT INTO "${schema}".schema_migrations(version, name, checksum) VALUES ($1, $2, $3)`, [index + 1, file, checksum]);
    }
    await client.query(`ALTER TABLE "${schema}".schema_migrations ENABLE ROW LEVEL SECURITY`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}

export function migrateSqlite(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS account_reviews (
      id INTEGER PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id), admin_id TEXT NOT NULL REFERENCES user(id),
      decision TEXT NOT NULL CHECK(decision IN ('approved', 'rejected')), note TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS user_journey_progress (
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      step_id TEXT NOT NULL CHECK(step_id IN ('self-check','kenali-potensi','mengembangkan-potensi','kuis','refleksi','action-plan')),
      status TEXT NOT NULL CHECK(status IN ('completed', 'skipped')), completed_at TEXT, updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, step_id));
    CREATE INDEX IF NOT EXISTS account_reviews_user_idx ON account_reviews(user_id);
    CREATE INDEX IF NOT EXISTS account_reviews_admin_idx ON account_reviews(admin_id);
    CREATE INDEX IF NOT EXISTS user_status_created_idx ON user(role, status, createdAt DESC, id DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS user_nisn_unique ON user(nisn) WHERE nisn IS NOT NULL;
    CREATE TABLE IF NOT EXISTS student_recaps (
      user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
      answers TEXT NOT NULL, submitted_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS student_recaps_submitted_idx ON student_recaps(submitted_at DESC, user_id DESC);
    CREATE TABLE IF NOT EXISTS learning_materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('kenali-potensi', 'mengembangkan-potensi', 'umum')),
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      resource_url TEXT,
      school TEXT,
      author_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL CHECK(author_role IN ('superadmin', 'admin', 'bk')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS learning_materials_created_idx ON learning_materials(created_at DESC, id DESC);
  `);
}
