import { test, expect } from '@playwright/test';

const password = 'Browser-Test-Only-123!';

async function login(page, identifier, { student = false, legacyEmail = false } = {}) {
  await page.goto('/login');
  if (student) await page.getByRole('button', { name: 'Login Siswa', exact: true }).click();
  if (legacyEmail) await page.getByRole('link', { name: 'Masuk dengan email akun lama' }).click();
  await page.getByLabel(student && !legacyEmail ? 'NISN' : 'Email', { exact: true }).fill(identifier);
  await page.getByLabel('Kata sandi', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
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

test('login switches between staff and student panels on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');

  const intro = page.getByRole('region', { name: 'Tentang KREASI.ID' });
  const form = page.locator('#auth-form-panel');
  const studentLogin = page.getByRole('button', { name: 'Login Siswa', exact: true });
  const staffLogin = page.getByRole('button', { name: 'Login Guru BK & Superadmin', exact: true });
  const introPosition = async () => (await intro.boundingBox()).x - (await form.boundingBox()).x;

  await expect(studentLogin).toBeVisible();
  await expect.poll(introPosition).toBeLessThan(0);
  await expect(intro).toHaveCSS('transition-property', 'transform');
  await page.getByLabel('Kata sandi', { exact: true }).fill('Isian-sebelumnya');
  await studentLogin.focus();
  await studentLogin.press('Enter');
  await expect(page.getByRole('heading', { name: 'Masuk sebagai siswa' })).toBeVisible();
  await expect(page.getByLabel('Kata sandi', { exact: true })).toHaveValue('');
  await expect.poll(introPosition).toBeGreaterThan(0);

  await staffLogin.click();
  await expect(page.getByRole('heading', { name: 'Selamat datang kembali' })).toBeVisible();
  await expect.poll(introPosition).toBeLessThan(0);

  await page.setViewportSize({ width: 820, height: 1180 });
  await studentLogin.click();
  await expect.poll(introPosition).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(intro).toHaveCSS('transition-property', 'none');

  await page.setViewportSize({ width: 320, height: 740 });
  await staffLogin.click();
  await expect(form.locator('div').first()).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await studentLogin.click();
  await expect(page.getByRole('heading', { name: 'Masuk sebagai siswa' })).toBeVisible();
  await expect(form.locator('div').first()).toHaveCSS('animation-duration', '0.22s');
  await expect(page.getByLabel('NISN')).toHaveAttribute('inputmode', 'numeric');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.getByRole('link', { name: 'Daftar sekarang' }).click();
  await expect(page.getByRole('heading', { name: 'Daftar akun siswa' })).toBeVisible();
  await page.getByRole('link', { name: 'Login Siswa' }).click();
  await expect(page.getByRole('heading', { name: 'Masuk sebagai siswa' })).toBeVisible();
  await expect(staffLogin).toBeVisible();
});

test('signup, pending approval, superadmin review, six activities, and progress after login', async ({ page, browser }) => {
  test.setTimeout(115000);
  const personalText = 'PRIVATE_BROWSER_ONLY_ACTION_8419';
  const nisn = '0012345678';
  const school = 'SMP Uji Alur';
  await page.goto('/daftar');
  await page.getByLabel('Nama', { exact: true }).fill('Siswa Alur');
  await page.getByLabel('NISN', { exact: true }).fill(nisn);
  await page.getByLabel('Sekolah', { exact: true }).fill(school);
  await page.getByLabel('Kata sandi', { exact: true }).fill(password);
  await expect(page.locator('form input')).toHaveCount(4);
  await page.getByRole('button', { name: 'Daftar Akun', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Menunggu verifikasi' })).toBeVisible();
  expect((await page.request.get('/api/journey')).status()).toBe(403);
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, 'admin@example.test');
  await expect(admin).toHaveURL(/\/superadmin$/);
  await expect(admin.getByRole('cell', { name: `NISN ${nisn} ${school}`, exact: true })).toBeVisible();
  await admin.getByRole('button', { name: 'Setujui', exact: true }).click();
  await admin.getByLabel('Catatan untuk pengguna', { exact: false }).fill('Silakan mulai kegiatan.');
  await admin.getByRole('button', { name: 'Konfirmasi Persetujuan', exact: true }).click();
  await expect(admin.getByRole('status').filter({ hasText: 'telah disetujui' })).toBeVisible();
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
  await expect(page.getByRole('alert').filter({ hasText: 'Masih ada 5 soal' })).toBeVisible();
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
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain(personalText);
  expect((await (await page.request.get('/api/journey')).json()).summary.completedCount).toBe(6);
  expect((await page.request.get('/api/staff/student-history')).status()).toBe(403);

  // Dashboard siswa otomatis menampilkan Rekap Jawabanmu tanpa perlu kirim manual
  const studentRecapSection = page.getByRole('region', { name: 'Rekap Jawabanmu' });
  await expect(studentRecapSection).toBeVisible();
  await expect(studentRecapSection.getByText('4 dari 4 kegiatan terekam')).toBeVisible();
  await expect(studentRecapSection.getByText('Langkah 4', { exact: true })).toBeVisible();
  await expect(studentRecapSection.getByText('Langkah 6', { exact: true })).toBeVisible();

  const dashboardMenu = admin.getByRole('navigation', { name: 'Menu dashboard' });
  await dashboardMenu.getByRole('link', { name: 'Riwayat Siswa' }).click();
  const history = admin.getByRole('region', { name: 'Siswa yang sudah tuntas' });
  await expect(history.getByRole('heading', { name: 'Siswa Alur', exact: true })).toBeVisible();
  await expect(history.getByRole('link', { name: 'Lihat Jawaban' })).toBeVisible();
  await history.getByText('Rincian langkah', { exact: true }).click();
  await expect(history.getByText('Action Plan', { exact: true })).toBeVisible();

  // Superadmin dashboard Rekap Jawaban Siswa langsung terisi otomatis
  await dashboardMenu.getByRole('link', { name: 'Rekap Jawaban Siswa' }).click();
  await expect(admin.getByText('4/4 kegiatan dijawab')).toBeVisible();
  await admin.getByRole('link', { name: 'Lihat Jawaban' }).click();
  await expect(admin.getByRole('region', { name: 'Kuis' }).getByText(/Hasil Kecenderungan Potensi/i)).toBeVisible();
  await expect(admin.getByRole('region', { name: 'Refleksi' }).getByText(personalText, { exact: true })).toBeVisible();
  await expect(admin.getByRole('region', { name: 'Action Plan' }).getByText(personalText, { exact: true }).first()).toBeVisible();

  // Siswa dapat meninjau & memperbarui pilihan di /rekap (mis. menghapus bagian Action Plan)
  await page.getByRole('link', { name: 'Buka Rekap Lengkap' }).click();
  await expect(page).toHaveURL(/\/rekap$/);
  await expect(page.getByRole('heading', { name: 'Rekap Jawaban', exact: true })).toBeVisible();
  await page.getByLabel('Bagikan Action Plan').uncheck();
  await page.getByRole('button', { name: 'Simpan Pilihan Rekap' }).click();
  await expect(page.getByText('Rekap jawaban sudah diperbarui.', { exact: true })).toBeVisible();
  await admin.reload();
  await expect(admin.getByRole('region', { name: 'Refleksi' }).getByText(personalText, { exact: true })).toBeVisible();
  await expect(admin.getByRole('region', { name: 'Action Plan' }).getByText(personalText, { exact: true })).toHaveCount(0);

  const bkContext = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const bk = await bkContext.newPage();
  await bk.goto('/login');
  await bk.getByRole('link', { name: 'Daftar akun Guru BK' }).click();
  await bk.getByLabel('Nama', { exact: true }).fill('Guru BK Baru');
  await bk.getByLabel('Email', { exact: true }).fill('bk-new@example.test');
  await bk.getByLabel('Sekolah', { exact: true }).fill(school);
  await bk.getByLabel('Kata sandi', { exact: true }).fill(password);
  await bk.getByRole('button', { name: 'Daftar Akun' }).click();
  await expect(bk).toHaveURL(/\/verifikasi$/);
  expect((await bk.request.get('/api/staff/recaps')).status()).toBe(403);
  await admin.goto('/superadmin');
  await admin.getByRole('button', { name: 'Setujui', exact: true }).click();
  await expect(admin.getByLabel('Setujui sebagai')).toHaveValue('bk');
  await admin.getByRole('button', { name: 'Konfirmasi Persetujuan' }).click();
  await expect(admin.getByRole('status').filter({ hasText: 'telah disetujui' })).toBeVisible();
  await bk.getByRole('button', { name: 'Periksa Status' }).click();
  await expect(bk).toHaveURL(/\/rekap-siswa$/);
  await expect(bk.getByRole('heading', { name: 'Siswa Alur', exact: true })).toBeVisible();
  await expect.poll(() => bk.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await bk.getByRole('button', { name: 'Buka menu navigasi' }).click();
  const mobileMenu = bk.getByRole('navigation', { name: 'Menu dashboard' });
  await expect(mobileMenu.getByRole('link', { name: 'Rekap Jawaban Siswa', exact: true })).toBeVisible();
  await expect(mobileMenu.getByRole('link', { name: 'Verifikasi Akun', exact: true })).toHaveCount(0);
  expect((await bk.request.get('/api/admin/users')).status()).toBe(403);
  expect((await bk.request.get('/api/staff/student-history')).status()).toBe(403);
  await bk.getByRole('button', { name: 'Tutup menu navigasi' }).first().click();
  await bk.getByRole('link', { name: 'Lihat Jawaban' }).click();
  await expect(bk.getByRole('region', { name: 'Refleksi' }).getByText(personalText)).toBeVisible();

  await admin.getByRole('button', { name: /^Disetujui/ }).click();
  const bkRow = admin.getByRole('row').filter({ hasText: 'Guru BK Baru' });
  await bkRow.getByRole('button', { name: 'Jadikan Admin' }).click();
  await admin.getByRole('button', { name: 'Konfirmasi Admin' }).click();
  await expect(admin.getByRole('status').filter({ hasText: 'sudah menjadi Admin' })).toBeVisible();
  await bk.goto('/rekap-siswa');
  await bk.getByRole('button', { name: 'Buka menu navigasi' }).click();
  await expect(bk.getByRole('navigation', { name: 'Menu dashboard' }).getByRole('link', { name: 'Riwayat Siswa' })).toBeVisible();

  await bkRow.getByRole('button', { name: 'Hapus Akun', exact: true }).click();
  await admin.getByRole('button', { name: 'Hapus Akun Permanen', exact: true }).click();
  await expect(admin.getByRole('status').filter({ hasText: 'telah dihapus' })).toBeVisible();
  await bk.reload();
  await expect(bk).toHaveURL(/\/login$/);
  await bkContext.close();
  await adminContext.close();

  const freshContext = await browser.newContext();
  const fresh = await freshContext.newPage();
  await login(fresh, nisn, { student: true });
  await expect(fresh.getByText('Perjalanan tuntas!', { exact: true })).toBeVisible();
  await expect(fresh.getByRole('region', { name: 'Rekap Jawabanmu' }).getByText('3 dari 4 kegiatan terekam')).toBeVisible();
  await fresh.goto('/action-plan');
  await expect(fresh.locator('#plan-potensi')).toHaveValue('');
  await freshContext.close();

  await page.getByRole('button', { name: 'Hapus Rekap' }).click();
  await expect(page.getByText('Rekap sudah dihapus dari penyimpanan akun dan dashboard staf.')).toBeVisible();
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
  await login(page, 'student-a@example.test', { student: true, legacyEmail: true });
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
