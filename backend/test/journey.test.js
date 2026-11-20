import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { createAuthService } from '../src/auth.js';

test('journey progress enforces sequential access, skip/revisit rules, concurrency, and persistence', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kreasi-journey-'));
  const options = {
    databasePath: path.join(directory, 'test.sqlite'),
    secret: 'test-only-secret-with-more-than-thirty-two-characters',
    baseURL: 'http://localhost:3001',
    origins: ['http://localhost:5173'],
  };
  const service = await createAuthService(options);
  const app = createApp({ authService: service, getPublicConfig: () => ({ quiz: { mode: 'local' } }) });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    service.db.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });

  function client() {
    let cookies = '';
    return async (route, body, origin = 'http://localhost:5173') => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          Origin: origin,
          ...(cookies ? { Cookie: cookies } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const setCookies = response.headers.getSetCookie();
      if (setCookies.length) cookies = setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      return { status: response.status, data: await response.json() };
    };
  }

  const guest = client();
  assert.equal((await guest('/api/journey')).status, 401);

  const student = client();
  const reg = await student('/api/auth/sign-up/email', {
    name: 'Siswa Perjalanan',
    email: 'perjalanan@example.test',
    password: 'Siswa-Password-123',
  });
  assert.equal(reg.status, 200);
  const userId = reg.data.user.id;

  // Pending user cannot access journey endpoints
  assert.equal((await student('/api/journey')).status, 403);

  // Approve student
  service.db.prepare("UPDATE user SET status = 'approved' WHERE id = ?").run(userId);

  // Initial journey: step 1 active, steps 2-6 locked
  const initial = await student('/api/journey');
  assert.equal(initial.status, 200);
  assert.equal(initial.data.summary.completedCount, 0);
  assert.equal(initial.data.summary.skippedCount, 0);
  assert.equal(initial.data.summary.currentStepId, 'self-check');
  assert.equal(initial.data.steps[0].status, 'active');
  assert.equal(initial.data.steps[1].status, 'locked');

  // Direct access or completion of locked steps is denied with 403
  assert.equal((await student('/api/journey/steps/kenali-potensi/access')).status, 403);
  assert.equal((await student('/api/journey/steps/kuis', { action: 'complete' })).status, 403);

  // Skip self-check -> unlocks kenali-potensi, counts separated, ignores unknown payload
  const skipSc = await student('/api/journey/steps/self-check', {
    action: 'skip',
    reflectionText: 'should never be stored',
    answers: [{ question: 'Should not save on skip', answer: 'ignored' }],
  });
  assert.equal(skipSc.status, 200);
  assert.equal(skipSc.data.step.status, 'skipped');
  assert.equal(skipSc.data.nextStepId, 'kenali-potensi');
  assert.equal(skipSc.data.journey.summary.completedCount, 0);
  assert.equal(skipSc.data.journey.summary.skippedCount, 1);
  assert.equal(skipSc.data.journey.summary.currentStepId, 'kenali-potensi');
  assert.equal(skipSc.data.recap, null);

  // Malformed answers rejected cleanly with 400
  const invalidAnswers = await student('/api/journey/steps/self-check', {
    action: 'complete',
    answers: [{ question: '', answer: 'Kosong' }],
  });
  assert.equal(invalidAnswers.status, 400);

  // Cannot skip non-skippable step
  const badSkip = await student('/api/journey/steps/kenali-potensi', { action: 'skip' });
  assert.equal(badSkip.status, 400);

  // Complete kenali-potensi, mengembangkan-potensi, kuis (with 7 answer rows: score + 6 items)
  assert.equal((await student('/api/journey/steps/kenali-potensi', { action: 'complete' })).status, 200);
  assert.equal((await student('/api/journey/steps/mengembangkan-potensi', { action: 'complete' })).status, 200);
  const quizAnswers = [
    { question: 'Skor Kuis Pemahaman', answer: '6 dari 6 soal benar' },
    { question: 'Soal 1', answer: 'Minat dan kemampuan (Benar)' },
  ];
  const quizRes = await student('/api/journey/steps/kuis', { action: 'complete', answers: quizAnswers });
  assert.equal(quizRes.status, 200);
  assert.deepEqual(quizRes.data.recap.answers, [{ id: 'kuis', answers: quizAnswers }]);

  // Skip refleksi -> unlocks action-plan
  const skipRef = await student('/api/journey/steps/refleksi', { action: 'skip' });
  assert.equal(skipRef.status, 200);
  assert.equal(skipRef.data.journey.summary.completedCount, 3);
  assert.equal(skipRef.data.journey.summary.skippedCount, 2);

  // Revisit skipped self-check and complete concurrently with skip -> stays completed & preserves completed_at and merges self-check answers
  const scAnswers = [{ question: 'Kegiatan favorit', answer: 'Membaca dan mencari tahu hal baru' }];
  const concurrent = await Promise.all([
    student('/api/journey/steps/self-check', { action: 'complete', answers: scAnswers }),
    student('/api/journey/steps/self-check', { action: 'skip' }),
  ]);
  assert.deepEqual(
    concurrent.map((r) => r.status).sort(),
    [200, 200]
  );
  const afterConcurrent = await student('/api/journey');
  const scStep = afterConcurrent.data.steps.find((s) => s.id === 'self-check');
  assert.equal(scStep.status, 'completed');
  assert.ok(scStep.completedAt);
  const firstCompletedAt = scStep.completedAt;

  // Revisiting completed step with empty array keeps saved answers intact
  const repeat = await student('/api/journey/steps/self-check', { action: 'complete', answers: [] });
  assert.equal(repeat.data.step.completedAt, firstCompletedAt);
  assert.equal(repeat.data.recap.answers.length, 2);
  assert.deepEqual(repeat.data.recap.answers.map((s) => s.id), ['self-check', 'kuis']);

  // Complete action-plan & skipped refleksi
  assert.equal((await student('/api/journey/steps/action-plan', { action: 'complete' })).status, 200);
  const finalRes = await student('/api/journey/steps/refleksi', {
    action: 'complete',
    answers: [{ question: 'Potensi yang disadari', answer: 'Menulis catatan belajar' }],
  });
  assert.equal(finalRes.data.journey.summary.completedCount, 6);
  assert.equal(finalRes.data.journey.summary.skippedCount, 0);
  assert.equal(finalRes.data.journey.summary.isAllCompleted, true);
  assert.deepEqual(finalRes.data.recap.answers.map((s) => s.id), ['self-check', 'kuis', 'refleksi']);

  // Verify GET /api/journey/recap and DB persistence across reopen
  const recapFetch = await student('/api/journey/recap');
  assert.equal(recapFetch.status, 200);
  assert.deepEqual(recapFetch.data.recap.answers.map((s) => s.id), ['self-check', 'kuis', 'refleksi']);

  const columns = service.db.prepare('PRAGMA table_info(user_journey_progress)').all().map((c) => c.name);
  assert.deepEqual(columns, ['user_id', 'step_id', 'status', 'completed_at', 'updated_at']);

  const reopened = await createAuthService(options);
  const persistedCount = reopened.db
    .prepare("SELECT COUNT(*) AS total FROM user_journey_progress WHERE user_id = ? AND status = 'completed'")
    .get(userId).total;
  assert.equal(persistedCount, 6);
  const persistedRecap = await reopened.repo.getRecap(userId);
  assert.deepEqual(persistedRecap.answers.map((s) => s.id), ['self-check', 'kuis', 'refleksi']);
  reopened.db.close();
});
