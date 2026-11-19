import { Router } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

export function createAccessControl(service) {
  async function readAccount(req) {
    if (!service) return null;
    const session = await service.auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    return session ? await service.repo.getAccount(session.user.id) ?? null : null;
  }
  async function requireApproved(req, res, next) {
    try {
      const user = await readAccount(req);
      if (!user) return res.status(401).json({ error: 'Silakan masuk terlebih dahulu.' });
      if (user.status !== 'approved') return res.status(403).json({ error: 'Akun belum disetujui superadmin.' });
      req.account = user;
      next();
    } catch (error) { next(error); }
  }
  const accessRouter = Router();
  accessRouter.get('/me', async (req, res, next) => {
    try { res.set('Cache-Control', 'no-store').json({ user: await readAccount(req) }); }
    catch (error) { next(error); }
  });
  const adminRouter = Router();
  adminRouter.use(requireApproved, (req, res, next) => {
    if (req.account.role !== 'superadmin') return res.status(403).json({ error: 'Akses khusus superadmin.' });
    next();
  });
  adminRouter.get('/users', async (req, res, next) => {
    const status = req.query.status ?? 'pending';
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status akun tidak valid.' });
    const page = Number(req.query.page ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > 1000000) return res.status(400).json({ error: 'Halaman tidak valid.' });
    try { res.json(await service.repo.listAccounts(status, page)); }
    catch (error) { next(error); }
  });
  adminRouter.post('/users/:id/review', async (req, res, next) => {
    if (!service.origins.includes(req.get('origin')) || !req.is('application/json')) return res.status(403).json({ error: 'Permintaan verifikasi tidak diizinkan.' });
    const { decision, note = '' } = req.body ?? {};
    if (!['approved', 'rejected'].includes(decision) || typeof note !== 'string' || note.length > 500) return res.status(400).json({ error: 'Keputusan atau catatan tidak valid.' });
    try {
      const result = await service.repo.reviewAccount({ userId: req.params.id, adminId: req.account.id, decision, note: note.trim() });
      if (result.kind === 'not-found') return res.status(404).json({ error: 'Akun tidak ditemukan.' });
      if (result.kind === 'conflict') return res.status(409).json({ error: 'Akun sudah ditinjau. Muat ulang daftar akun.' });
      res.json({ user: result.user, counts: result.counts });
    } catch (error) { next(error); }
  });
  return { accessRouter, adminRouter, requireApproved };
}
