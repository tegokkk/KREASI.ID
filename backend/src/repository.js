import { buildJourneyState, JOURNEY_STEPS } from './domain/journey.js';
import { SCHEMA_VERSION } from './migrations.js';

export const ACCOUNT_FIELDS = 'id, name, CASE WHEN nisn IS NULL THEN email END AS email, nisn, school, role, status, "reviewNote", "createdAt"';
const PAGE_SIZE = 20;

function countsFromRows(rows) {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const row of rows) if (Object.hasOwn(counts, row.status)) counts[row.status] = Number(row.count);
  return counts;
}

function progressResult(rows, stepId) {
  const journey = buildJourneyState(rows);
  const index = JOURNEY_STEPS.findIndex((step) => step.id === stepId);
  return { allowed: journey.steps[index].accessible, step: journey.steps[index], journey,
    nextStepId: JOURNEY_STEPS[index + 1]?.id ?? null };
}

export function createRepository(database, { dialect, schema }) {
  const table = (name) => dialect === 'postgres' ? `"${schema}"."${name}"` : `"${name}"`;
  function sqliteStatement(sql, params) {
    const values = [];
    const text = sql.replace(/\$(\d+)/g, (_match, index) => { values.push(params[Number(index) - 1]); return '?'; });
    return { statement: database.prepare(text), values };
  }
  const all = dialect === 'sqlite'
    ? (sql, params = []) => { const { statement, values } = sqliteStatement(sql, params); return statement.all(...values); }
    : async (sql, params = []) => (await database.query(sql, params)).rows;
  const one = dialect === 'sqlite'
    ? (sql, params = []) => { const { statement, values } = sqliteStatement(sql, params); return statement.get(...values); }
    : async (sql, params = []) => (await all(sql, params))[0];
  const run = (sql, params = []) => { const { statement, values } = sqliteStatement(sql, params); return statement.run(...values); };
  const accountSql = `SELECT ${ACCOUNT_FIELDS} FROM ${table('user')} WHERE id = $1`;
  const countsSql = `SELECT status, COUNT(*) AS count FROM ${table('user')} WHERE role = 'user' GROUP BY status`;
  const progressSql = `SELECT step_id, status, completed_at, updated_at FROM ${table('user_journey_progress')} WHERE user_id = $1`;
  const reviewSql = `UPDATE ${table('user')} SET status = $1, "reviewNote" = $2, "updatedAt" = $3
    WHERE id = $4 AND role = 'user' AND status = 'pending' RETURNING ${ACCOUNT_FIELDS}`;
  const auditSql = `INSERT INTO ${table('account_reviews')} (user_id, admin_id, decision, note, created_at) VALUES ($1, $2, $3, $4, $5)`;
  const completeSql = `INSERT INTO ${table('user_journey_progress')} (user_id, step_id, status, completed_at, updated_at)
    VALUES ($1, $2, 'completed', $3, $3) ON CONFLICT(user_id, step_id) DO UPDATE SET
    status = 'completed', completed_at = COALESCE(${table('user_journey_progress')}.completed_at, excluded.completed_at), updated_at = excluded.updated_at`;
  const skipSql = `INSERT INTO ${table('user_journey_progress')} (user_id, step_id, status, completed_at, updated_at)
    VALUES ($1, $2, 'skipped', NULL, $3) ON CONFLICT(user_id, step_id) DO NOTHING`;

  async function pgTransaction(work) {
    const client = await database.connect();
    try {
      await client.query('BEGIN');
      await client.query("SET LOCAL lock_timeout = '5s'; SET LOCAL idle_in_transaction_session_timeout = '10s'");
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  }
  function sqliteTransaction(work) {
    database.exec('BEGIN IMMEDIATE');
    try {
      // No await inside this callback: SQLite shares a synchronous connection with auth.
      const result = work();
      if (result?.then) throw new Error('SQLite transaction callbacks must be synchronous.');
      database.exec('COMMIT');
      return result;
    } catch (error) {
      if (database.isTransaction) database.exec('ROLLBACK');
      throw error;
    }
  }

  return {
    dialect, schema, table, all, one,
    getAccount: (id) => one(accountSql, [id]),
    findAccountByEmail: (email) => one(`SELECT id, role FROM ${table('user')} WHERE email = $1`, [email]),
    async promoteSuperadmin(id) {
      const sql = `UPDATE ${table('user')} SET role = 'superadmin', status = 'approved' WHERE id = $1`;
      if (dialect === 'sqlite') run(sql, [id]); else await database.query(sql, [id]);
    },
    getProgress: (id) => all(progressSql, [id]),
    async listCompletedStudents({ page, school }) {
      const stepIds = JOURNEY_STEPS.map((step) => step.id);
      const stepParams = stepIds.map((_, index) => `$${index + 1}`).join(', ');
      const count = `$${stepIds.length + 1}`;
      const scope = `$${stepIds.length + 2}`;
      const limit = `$${stepIds.length + 3}`;
      const offset = `$${stepIds.length + 4}`;
      const rows = await all(`WITH finished AS (
        SELECT p.user_id, MAX(p.completed_at) AS finished_at
        FROM ${table('user_journey_progress')} p
        JOIN ${table('user')} u ON u.id = p.user_id
        WHERE u.role = 'user' AND u.status = 'approved' AND p.status = 'completed'
          AND p.step_id IN (${stepParams})
          AND (CAST(${scope} AS TEXT) IS NULL OR LOWER(TRIM(u.school)) = LOWER(TRIM(${scope})))
        GROUP BY p.user_id
        HAVING COUNT(*) = ${count}
        ORDER BY finished_at DESC NULLS LAST, p.user_id DESC
        LIMIT ${limit} OFFSET ${offset}
      )
      SELECT u.id, u.name, u.nisn, u.school, f.finished_at, p.step_id, p.completed_at
      FROM finished f
      JOIN ${table('user')} u ON u.id = f.user_id
      JOIN ${table('user_journey_progress')} p ON p.user_id = f.user_id AND p.step_id IN (${stepParams})
      ORDER BY f.finished_at DESC NULLS LAST, u.id DESC`,
      [...stepIds, stepIds.length, school, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE]);

      const students = new Map();
      for (const { id, name, nisn, school, finished_at, step_id, completed_at } of rows) {
        if (!students.has(id)) students.set(id, { id, name, nisn, school, finishedAt: finished_at, dates: new Map() });
        students.get(id).dates.set(step_id, completed_at);
      }
      return {
        page,
        hasMore: students.size > PAGE_SIZE,
        students: [...students.values()].slice(0, PAGE_SIZE).map(({ dates, ...student }) => ({
          ...student,
          steps: JOURNEY_STEPS.map(({ id, title }) => ({ id, title, completedAt: dates.get(id) ?? null })),
        })),
      };
    },
    async listAccounts(status, requestedPage) {
      const counts = countsFromRows(await all(countsSql));
      const total = counts[status];
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      const page = Math.min(requestedPage, totalPages);
      const users = await all(`SELECT ${ACCOUNT_FIELDS} FROM ${table('user')}
        WHERE role = 'user' AND status = $1 ORDER BY "createdAt" DESC, id DESC LIMIT $2 OFFSET $3`,
      [status, PAGE_SIZE, (page - 1) * PAGE_SIZE]);
      return { users, total, counts, page, pageSize: PAGE_SIZE, totalPages };
    },
    async checkReady() {
      await one(`SELECT id FROM ${table('user')} LIMIT 1`);
      await one(`SELECT step_id, status FROM ${table('user_journey_progress')} LIMIT 1`);
      if (dialect === 'postgres') {
        const version = await one(`SELECT version FROM ${table('schema_migrations')} WHERE version = $1`, [SCHEMA_VERSION]);
        if (!version) throw new Error('Migrasi database belum dijalankan.');
      }
    },
    reviewAccount({ userId, adminId, decision, note }) {
      const now = new Date();
      if (dialect === 'sqlite') return sqliteTransaction(() => {
        const account = one(`SELECT id, role FROM ${table('user')} WHERE id = $1`, [userId]);
        if (!account || account.role !== 'user') return { kind: 'not-found' };
        const user = one(reviewSql, [decision, note, now.getTime(), userId]);
        if (!user) return { kind: 'conflict' };
        run(auditSql, [userId, adminId, decision, note, now.toISOString()]);
        return { kind: 'reviewed', user, counts: countsFromRows(all(countsSql)) };
      });
      return pgTransaction(async (client) => {
        const account = (await client.query(`SELECT id, role FROM ${table('user')} WHERE id = $1`, [userId])).rows[0];
        if (!account || account.role !== 'user') return { kind: 'not-found' };
        // PostgreSQL locks and rechecks the pending predicate after waiting for another reviewer.
        const user = (await client.query(reviewSql, [decision, note, now, userId])).rows[0];
        if (!user) return { kind: 'conflict' };
        await client.query(auditSql, [userId, adminId, decision, note, now.toISOString()]);
        return { kind: 'reviewed', user, counts: countsFromRows((await client.query(countsSql)).rows) };
      });
    },
    recordProgress({ userId, stepId, action }) {
      const now = new Date().toISOString();
      if (dialect === 'sqlite') return sqliteTransaction(() => {
        const rows = all(progressSql, [userId]);
        const before = progressResult(rows, stepId);
        if (!before.allowed) return before;
        const saved = rows.find((row) => row.step_id === stepId);
        if (saved?.status !== 'completed') run(action === 'complete' ? completeSql : skipSql, [userId, stepId, now]);
        return progressResult(all(progressSql, [userId]), stepId);
      });
      return pgTransaction(async (client) => {
        // Lock one existing parent row: serializes every step action for this user across instances.
        await client.query(`SELECT id FROM ${table('user')} WHERE id = $1 FOR UPDATE`, [userId]);
        const rows = (await client.query(progressSql, [userId])).rows;
        const before = progressResult(rows, stepId);
        if (!before.allowed) return before;
        const saved = rows.find((row) => row.step_id === stepId);
        if (saved?.status !== 'completed') await client.query(action === 'complete' ? completeSql : skipSql, [userId, stepId, now]);
        return progressResult((await client.query(progressSql, [userId])).rows, stepId);
      });
    },
  };
}
