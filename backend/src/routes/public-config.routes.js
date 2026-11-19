import { Router } from 'express';

export function createPublicConfigRouter(getPublicConfig) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(getPublicConfig());
  });

  return router;
}
