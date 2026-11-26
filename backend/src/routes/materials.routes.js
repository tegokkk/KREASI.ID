import { randomUUID } from 'node:crypto';
import { Router } from 'express';

const MATERIAL_CATEGORIES = new Set(['kenali-potensi', 'mengembangkan-potensi', 'umum']);
const STAFF_ROLES = new Set(['superadmin', 'admin', 'bk']);

function parseSafeHttpUrl(raw) {
  if (raw === undefined || raw === null || raw === '') return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false };
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  if (trimmed.length > 500) return { ok: false };
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) return { ok: false };
    return { ok: true, value: parsed.toString() };
  } catch {
    return { ok: false };
  }
}

export function createMaterialsRouter(service) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    const category = typeof req.query.category === 'string' && req.query.category.trim() ? req.query.category.trim() : null;
    if (category && !MATERIAL_CATEGORIES.has(category)) {
      return res.status(400).json({ error: 'Kategori materi tidak valid.' });
    }
    const manage = req.query.scope === 'manage';
    try {
      const { role, school } = req.account;
      let materials;
      if (manage && STAFF_ROLES.has(role)) {
        materials = await service.repo.listMaterials({
          school: role === 'bk' ? (school?.trim() || '__none__') : null,
          category,
          staffSchoolOnly: true,
        });
      } else if (role === 'superadmin' || role === 'admin') {
        materials = await service.repo.listMaterials({ school: null, category, staffSchoolOnly: true });
      } else {
        materials = await service.repo.listMaterials({ school: school?.trim() || null, category, staffSchoolOnly: false });
      }
      res.json({ materials });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    const { role, school: accountSchool, id: authorId, name: authorName } = req.account;
    if (!STAFF_ROLES.has(role)) {
      return res.status(403).json({ error: 'Hanya Superadmin, Admin, atau Guru BK yang dapat menambahkan materi.' });
    }
    if (!service.origins.includes(req.get('origin')) || !req.is('application/json')) {
      return res.status(403).json({ error: 'Permintaan penambahan materi tidak diizinkan.' });
    }

    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const urlCheck = parseSafeHttpUrl(body.resourceUrl);

    if (!title || title.length > 160) {
      return res.status(400).json({ error: 'Judul materi wajib diisi (maksimal 160 karakter).' });
    }
    if (!MATERIAL_CATEGORIES.has(category)) {
      return res.status(400).json({ error: 'Pilih kategori penempatan materi yang valid.' });
    }
    if (summary.length > 300) {
      return res.status(400).json({ error: 'Ringkasan materi maksimal 300 karakter.' });
    }
    if (!content || content.length > 8000) {
      return res.status(400).json({ error: 'Isi materi wajib diisi (maksimal 8000 karakter).' });
    }
    if (!urlCheck.ok) {
      return res.status(400).json({ error: 'Tautan pendukung harus berupa alamat http:// atau https:// yang valid.' });
    }

    let targetSchool = null;
    if (role === 'bk') {
      if (!accountSchool?.trim()) {
        return res.status(403).json({ error: 'Akun Guru BK belum memiliki nama sekolah yang terdaftar.' });
      }
      targetSchool = accountSchool.trim();
    } else if (typeof body.school === 'string' && body.school.trim()) {
      if (body.school.trim().length > 150) {
        return res.status(400).json({ error: 'Nama sekolah maksimal 150 karakter.' });
      }
      targetSchool = body.school.trim();
    }

    try {
      const material = await service.repo.createMaterial({
        id: randomUUID(),
        title,
        category,
        summary,
        content,
        resourceUrl: urlCheck.value,
        school: targetSchool,
        authorId,
        authorName,
        authorRole: role,
      });
      res.status(201).json({ material });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    const { role, school: accountSchool } = req.account;
    if (!STAFF_ROLES.has(role)) {
      return res.status(403).json({ error: 'Hanya Superadmin, Admin, atau Guru BK yang dapat menghapus materi.' });
    }
    if (!service.origins.includes(req.get('origin'))) {
      return res.status(403).json({ error: 'Permintaan penghapusan materi tidak diizinkan.' });
    }
    try {
      const deleted = await service.repo.deleteMaterial({
        id: req.params.id,
        school: role === 'bk' ? (accountSchool?.trim() || '__none__') : null,
      });
      if (!deleted) return res.status(404).json({ error: 'Materi tidak ditemukan atau tidak dapat dihapus.' });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
