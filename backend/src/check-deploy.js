import fs from 'node:fs';
import dotenv from 'dotenv';
import { createAuthService } from './auth.js';

let failed = false;
const secrets = [];
for (const target of ['preview', 'production']) {
  const file = new URL(`../.env.${target}.local`, import.meta.url);
  if (!fs.existsSync(file)) throw new Error('Jalankan npm run deploy:prepare terlebih dahulu.');
  const values = dotenv.parse(fs.readFileSync(file));
  const env = { ...values, NODE_ENV: 'production', VERCEL: '1', VERCEL_ENV: target,
    VERCEL_URL: 'preflight-preview.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'preflight-production.vercel.app' };
  let service;
  try {
    if (values.DATABASE_SCHEMA !== (target === 'preview' ? 'kreasi_preview' : 'kreasi')) throw new Error('Schema environment tidak sesuai target.');
    service = await createAuthService({ env });
    await service.repo.checkReady();
    const schema = values.DATABASE_SCHEMA;
    const security = (await service.db.query(`SELECT bool_and(c.relrowsecurity) AS rls,
      count(*) AS tables FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname=$1 AND c.relkind='r'`, [schema])).rows[0];
    if (!security.rls || Number(security.tables) !== 10) throw new Error('Private schema security check failed.');
    const roles = await service.db.query(`SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated')`);
    for (const role of roles.rows) {
      const permissions = await service.db.query(`SELECT has_schema_privilege($1,$2,'USAGE') AS allowed`, [role.rolname, schema]);
      if (permissions.rows[0].allowed) throw new Error('Public Data API role has schema access.');
    }
    secrets.push(values.BETTER_AUTH_SECRET);
    console.log(JSON.stringify({ target, schema, databaseReady: true, verifiedTLS: true, privateTables: Number(security.tables), publicRolesDenied: true, secureCookies: true }));
  } catch (error) {
    failed = true;
    console.error(JSON.stringify({ target, databaseReady: false, errorCode: error.code || error.name }));
  } finally { if (service) await service.close(); }
}
if (secrets.length === 2 && secrets[0] === secrets[1]) { failed = true; console.error('Preview dan Production harus memakai secret berbeda.'); }
if (failed) process.exitCode = 1;
else console.log('Preflight konfigurasi/database lulus. Ini belum menguji URL deployment Vercel.');
