import { Router } from 'express';
import { buildJourneyState, JOURNEY_STEPS } from '../domain/journey.js';

export { buildJourneyState, JOURNEY_STEPS } from '../domain/journey.js';
const STEP_INDEX_BY_ID = new Map(JOURNEY_STEPS.map((step, index) => [step.id, index]));
const ANSWER_STEPS = new Set(['self-check', 'kuis', 'refleksi', 'action-plan']);

function validateRecap(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > ANSWER_STEPS.size) return null;
  const seen = new Set();
  const recap = [];
  for (const section of value) {
    if (!ANSWER_STEPS.has(section?.id) || seen.has(section.id) || !Array.isArray(section.answers) || !section.answers.length || section.answers.length > 6) return null;
    seen.add(section.id);
    const answers = [];
    for (const entry of section.answers) {
      if (typeof entry?.question !== 'string' || typeof entry.answer !== 'string') return null;
      const question = entry.question.trim();
      const answer = entry.answer.trim();
      if (!question || question.length > 500 || !answer || answer.length > 1200) return null;
      answers.push({ question, answer });
    }
    recap.push({ id: section.id, answers });
  }
  return recap;
}

export function createJourneyRouter(service) {
  const router = Router();
  router.get('/', async (req, res, next) => {
    try { res.json(buildJourneyState(await service.repo.getProgress(req.account.id))); }
    catch (error) { next(error); }
  });
  router.use('/recap', (req, res, next) => {
    if (req.account.role !== 'user') return res.status(403).json({ error: 'Rekap pribadi hanya tersedia untuk akun siswa.' });
    if (req.method !== 'GET' && !service.origins.includes(req.get('origin'))) return res.status(403).json({ error: 'Permintaan rekap tidak diizinkan.' });
    next();
  });
  router.get('/recap', async (req, res, next) => {
    try { res.json({ recap: await service.repo.getRecap(req.account.id) }); }
    catch (error) { next(error); }
  });
  router.put('/recap', async (req, res, next) => {
    const answers = req.is('application/json') && req.body?.share === true && validateRecap(req.body.answers);
    if (!answers) return res.status(400).json({ error: 'Pilih jawaban yang valid dan konfirmasi pengiriman rekap.' });
    try {
      const recap = await service.repo.saveRecap(req.account.id, answers);
      return recap ? res.json({ recap }) : res.status(409).json({ error: 'Selesaikan keenam langkah sebelum mengirim rekap.' });
    } catch (error) { next(error); }
  });
  router.delete('/recap', async (req, res, next) => {
    try { await service.repo.removeRecap(req.account.id); res.json({ recap: null }); }
    catch (error) { next(error); }
  });
  router.get('/steps/:stepId/access', async (req, res, next) => {
    const index = STEP_INDEX_BY_ID.get(req.params.stepId);
    if (index === undefined) return res.status(404).json({ error: 'Langkah kegiatan tidak ditemukan.' });
    try {
      const journey = buildJourneyState(await service.repo.getProgress(req.account.id));
      const step = journey.steps[index];
      if (!step.accessible) return res.status(403).json({
        allowed: false, error: 'Langkah ini belum terbuka. Selesaikan langkah sebelumnya terlebih dahulu.',
        redirectStepId: journey.summary.currentStepId, step, journey,
      });
      res.json({ allowed: true, step, journey });
    } catch (error) { next(error); }
  });
  router.post('/steps/:stepId', async (req, res, next) => {
    if (!service.origins.includes(req.get('origin')) || !req.is('application/json')) return res.status(403).json({ error: 'Permintaan progres tidak diizinkan.' });
    const { stepId } = req.params;
    const index = STEP_INDEX_BY_ID.get(stepId);
    if (index === undefined) return res.status(404).json({ error: 'Langkah kegiatan tidak ditemukan.' });
    const action = req.body?.action;
    if (!['complete', 'skip'].includes(action)) return res.status(400).json({ error: 'Tindakan progres harus bernilai complete atau skip.' });
    if (action === 'skip' && !JOURNEY_STEPS[index].allowSkip) return res.status(400).json({ error: 'Langkah ini harus diselesaikan sebelum melanjutkan.' });
    try {
      const result = await service.repo.recordProgress({ userId: req.account.id, stepId, action });
      if (!result.allowed) return res.status(403).json({
        error: 'Selesaikan langkah sebelumnya terlebih dahulu.', redirectStepId: result.journey.summary.currentStepId, journey: result.journey,
      });
      res.json({ step: result.step, nextStepId: result.nextStepId, journey: result.journey });
    } catch (error) { next(error); }
  });
  return router;
}
