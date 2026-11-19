import { DatabaseSync } from 'node:sqlite';

const TABLES = ['user', 'account', 'account_reviews', 'user_journey_progress'];
const DATES = new Set(['createdAt', 'updatedAt', 'accessTokenExpiresAt', 'refreshTokenExpiresAt']);

export async function importSqlite({ sourcePath, pool, schema }) {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error('Schema import tidak valid.');
  const source = new DatabaseSync(sourcePath, { readOnly: true });
  const rows = {};
  try {
    source.exec('BEGIN'); // One consistent WAL snapshot, without modifying the source.
    for (const table of TABLES) rows[table] = source.prepare(`SELECT * FROM "${table}"`).all();
    source.exec('COMMIT');
  } finally { source.close(); }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`kreasi:import:${schema}`]);
    const existing = await client.query(`SELECT count(*) AS count FROM "${schema}"."user"`);
    if (Number(existing.rows[0].count) !== 0) throw new Error('Target import harus kosong. Data yang sudah ada tidak akan ditimpa.');
    for (const table of TABLES) for (const row of rows[table]) {
      const columns = Object.keys(row);
      const values = columns.map((column) => {
        const value = row[column];
        if (column === 'emailVerified') return Boolean(value);
        if (DATES.has(column) && value !== null) return new Date(typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value);
        return value;
      });
      // Columns are constrained by the known SQLite schema, never by a request body.
      if (columns.some((column) => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column))) throw new Error('Kolom source tidak valid.');
      await client.query(`INSERT INTO "${schema}"."${table}" (${columns.map((column) => `"${column}"`).join(',')})
        VALUES (${columns.map((_column, index) => `$${index + 1}`).join(',')})`, values);
    }
    await client.query(`SELECT setval(pg_get_serial_sequence($1, 'id'),
      GREATEST(COALESCE((SELECT max(id) FROM "${schema}".account_reviews),0),1),
      EXISTS(SELECT 1 FROM "${schema}".account_reviews))`, [`${schema}.account_reviews`]);
    const counts = Object.fromEntries(TABLES.map((table) => [table, rows[table].length]));
    for (const table of TABLES) {
      const result = await client.query(`SELECT count(*) AS count FROM "${schema}"."${table}"`);
      if (Number(result.rows[0].count) !== counts[table]) throw new Error('Jumlah baris import tidak sesuai.');
    }
    await client.query('COMMIT');
    // Browser sessions, reset/verification tokens and local rate limits are deliberately not copied.
    return counts;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { client.release(); }
}
