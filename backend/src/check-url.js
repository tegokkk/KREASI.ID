// Read-only smoke checks for the user's actual deployment, after deployment.
const rawURL = process.argv[2];
if (!rawURL) throw new Error('Gunakan: npm run deploy:check-url -- https://domain-anda.vercel.app');
const origin = new URL(rawURL);
if (origin.protocol !== 'https:' || origin.username || origin.password) throw new Error('Gunakan URL HTTPS deployment tanpa kredensial.');
const cases = [
  ['/', 200, 'text/html'], ['/self-check', 200, 'text/html'], ['/superadmin', 200, 'text/html'],
  ['/api/ready', 200, 'application/json'], ['/api/journey', 401, 'application/json'],
  ['/api/admin/users', 401, 'application/json'], ['/api/not-a-real-endpoint', 404, 'application/json'],
  ['/assets/not-a-real-file.js', 404, null],
];
let failed = false;
for (const [path, status, type] of cases) {
  try {
    const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15000), redirect: 'manual',
      headers: process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET } : {} });
    const ok = response.status === status && (!type || response.headers.get('content-type')?.includes(type));
    if (path === '/api/ready' && ok) {
      const data = await response.json();
      if (data.status !== 'ready' || !data.capabilities?.includes('journey-v1')) throw new Error('Readiness payload tidak valid.');
    }
    console.log(`${ok ? 'PASS' : 'FAIL'} ${path}: ${response.status}`);
    if (!ok) failed = true;
  } catch { console.error(`FAIL ${path}: request gagal atau respons tidak sesuai.`); failed = true; }
}
if (failed) process.exitCode = 1;
