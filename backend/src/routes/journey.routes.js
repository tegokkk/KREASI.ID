import { Router } from 'express';
import { buildJourneyState, JOURNEY_STEPS } from '../domain/journey.js';

export { buildJourneyState, JOURNEY_STEPS } from '../domain/journey.js';
const STEP_INDEX_BY_ID = new Map(JOURNEY_STEPS.map((step, index) => [step.id, index]));

export function createJourneyRouter(service) {
  const router = Router();
  router.get('/', async (req, res, next) => {
    try { res.json(buildJourneyState(await service.repo.getProgress(req.account.id))); }
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
