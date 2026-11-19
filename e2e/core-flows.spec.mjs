import { test, expect } from '@playwright/test';

const password = 'Browser-Test-Only-123!';

async function login(page, email) {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Kata sandi', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

test('public pages stay public, contact works, and mobile/tablet/desktop fit the viewport', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/tentang', '/tips', '/kontak']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : path + '$'}`));
    }
  }
  await expect(page.getByRole('link', { name: 'Hubungi Guru BK', exact: true })).toHaveAttribute('href', 'mailto:bk@example.test');
  await page.goto('/self-check');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Selamat datang kembali' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('signup, pending approval, superadmin review, six activities, and progress after login', async ({ page, browser }) => {
  test.setTimeout(90000);
  const personalText = 'PRIVATE_BROWSER_ONLY_ACTION_8419';
  const postedBodies = [];
  page.on('request', (request) => { if (request.method() === 'POST') postedBodies.push(request.postData() || ''); });
  await page.goto('/daftar');
  await page.getByLabel('Nama', { exact: true }).fill('Siswa Alur');
  await page.getByLabel('Email', { exact: true }).fill('flow@example.test');
  await page.getByLabel('Kata sandi', { exact: true }).fill(password);
  await page.getByLabel('Konfirmasi kata sandi', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Daftar Akun', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Menunggu verifikasi' })).toBeVisible();
  expect((await page.request.get('/api/journey')).status()).toBe(403);
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, 'admin@example.test');
  await expect(admin).toHaveURL(/\/superadmin$/);
  await admin.getByRole('button', { name: 'Setujui', exact: true }).click();
  await admin.getByLabel('Catatan untuk pengguna', { exact: false }).fill('Silakan mulai kegiatan.');
  await admin.getByRole('button', { name: 'Konfirmasi Persetujuan', exact: true }).click();
  await expect(admin.getByRole('status').filter({ hasText: 'telah disetujui' })).toBeVisible();
  await adminContext.close();
  await page.getByRole('button', { name: 'Periksa Status', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/kuis');
  await expect(page.getByRole('heading', { name: 'Kuis belum dapat dibuka' })).toBeVisible();
  await page.goto('/self-check');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Lihat Catatanku', exact: true }).click();
  await page.getByRole('button', { name: 'Selesai & Lanjut ke Kenali Potensi', exact: true }).click();
  await expect(page).toHaveURL(/\/kenali-potensi$/);
  await page.getByRole('button', { name: 'Selesai Membaca & Lanjut ke Mengembangkan Potensi', exact: true }).click();
  await expect(page).toHaveURL(/\/mengembangkan-potensi$/);
  await page.getByRole('button', { name: 'Selesai Membaca & Lanjut ke Kuis', exact: true }).click();
  await expect(page).toHaveURL(/\/kuis$/);
  const nextQuiz = page.getByRole('button', { name: 'Selesai & Lanjut ke Refleksi', exact: true });
  await expect(nextQuiz).toBeDisabled();
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByRole('alert').filter({ hasText: 'Masih ada 6 soal' })).toBeVisible();
  for (const group of await page.locator('form fieldset').all()) await group.getByRole('radio').first().check();
  await page.locator('form button[type="submit"]').click();
  await expect(nextQuiz).toBeEnabled();
  await nextQuiz.click();
  await expect(page).toHaveURL(/\/refleksi$/);
  await page.getByRole('textbox').first().fill(personalText);
  await page.getByRole('button', { name: 'Lanjut ke Action Plan', exact: true }).click();
  await expect(page).toHaveURL(/\/action-plan$/);
  const finish = page.getByRole('button', { name: 'Selesai & Kembali ke Perjalanan', exact: true });
  await expect(finish).toBeDisabled();
  await page.getByRole('button', { name: 'Lihat Rencanaku', exact: true }).click();
  await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible();
  for (const input of await page.locator('form [required]').all()) await input.fill(personalText);
  await page.getByRole('button', { name: 'Lihat Rencanaku', exact: true }).click();
  await expect(finish).toBeEnabled();
  await page.locator('#plan-potensi').fill('');
  await expect(finish).toBeDisabled();
  await page.locator('#plan-potensi').fill(personalText);
  await page.getByRole('button', { name: 'Lihat Rencanaku', exact: true }).click();
  await finish.click();
  await expect(page.getByText('Perjalanan tuntas!', { exact: true })).toBeVisible();
  expect(postedBodies.join('')).not.toContain(personalText);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain(personalText);
  expect((await (await page.request.get('/api/journey')).json()).summary.completedCount).toBe(6);
  const freshContext = await browser.newContext();
  const fresh = await freshContext.newPage();
  await login(fresh, 'flow@example.test');
  await expect(fresh.getByText('Perjalanan tuntas!', { exact: true })).toBeVisible();
  await fresh.goto('/action-plan');
  await expect(fresh.locator('#plan-potensi')).toHaveValue('');
  await freshContext.close();
});

test('superadmin adapts to screen sizes and hides stale rows while changing filters', async ({ page }) => {
  await login(page, 'admin@example.test');
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: 'Verifikasi Akun', exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: /^Disetujui/ }).click();
  await expect(page.getByText('student-a@example.test', { exact: true })).toBeVisible();
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  await page.route('**/api/admin/users?status=pending*', async (route) => { await held; await route.continue(); });
  try {
    await page.getByRole('button', { name: /^Menunggu Verifikasi/ }).click();
    await expect(page.getByText('student-a@example.test', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Memuat daftar akun…', { exact: true })).toBeVisible();
  } finally { release(); }
  await expect(page.getByText('Tidak ada akun yang menunggu verifikasi saat ini.', { exact: true })).toBeVisible();
});

test('a late access response cannot unlock a different activity after navigation', async ({ page }) => {
  await login(page, 'student-a@example.test');
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  await page.route('**/api/journey/steps/self-check/access', async (route) => {
    const response = await route.fetch();
    await held;
    await route.fulfill({ response }).catch(() => {}); // Navigation may cancel the old request.
  });
  try {
    await page.goto('/self-check');
    await expect(page.getByText('Memeriksa kesiapan langkah perjalananmu…', { exact: true })).toBeVisible();
    await page.evaluate(() => { history.pushState({}, '', '/kuis'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await expect(page.getByRole('heading', { name: 'Kuis belum dapat dibuka' })).toBeVisible();
  } finally { release(); }
  await expect(page.getByRole('heading', { name: 'Kuis belum dapat dibuka' })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(0);
});

test('network interruption preserves input, real logout clears access, account change clears private state', async ({ page }) => {
  await login(page, 'student-a@example.test');
  await page.goto('/self-check');
  await page.getByRole('checkbox').first().check();
  await page.route('**/api/access/me', (route) => route.abort());
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('Koneksi terputus.', { exact: false })).toBeVisible();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
  await page.unroute('**/api/access/me');
  await page.getByRole('button', { name: 'Coba Lagi', exact: true }).click();
  await expect(page.getByText('Koneksi terputus.', { exact: false })).toHaveCount(0);
  const origin = 'http://127.0.0.1:4107';
  await page.request.post('/api/journey/steps/self-check', { data: { action: 'complete' }, headers: { Origin: origin } });
  await page.request.post('/api/auth/sign-out', { data: {}, headers: { Origin: origin } });
  await page.request.post('/api/auth/sign-in/email', { data: { email: 'student-b@example.test', password }, headers: { Origin: origin } });
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('checkbox').first()).not.toBeChecked();
  await page.goto('/');
  await expect(page.getByText('0 dari 6 selesai', { exact: false })).toBeVisible();
  await page.request.post('/api/auth/sign-out', { data: {}, headers: { Origin: origin } });
  await page.goto('/self-check');
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get('/api/journey')).status()).toBe(401);
});
