import { Router } from 'express';
import { requireAdmin, isAdmin } from '../auth.js';

// Umumiy CRUD: o'qish ochiq (admin ?all=1 bilan hammasini ko'radi), o'zgartirish faqat admin
export function crud(Model, { publicFilter = {} } = {}) {
  const r = Router();
  r.get('/', async (req, res) => {
    const filter = req.query.all && isAdmin(req) ? {} : publicFilter;
    res.json(await Model.find(filter).sort({ order: 1, createdAt: -1 }));
  });
  r.get('/:id', async (req, res) => {
    const doc = await Model.findById(req.params.id).catch(() => null);
    if (!doc || (!isAdmin(req) && publicFilter.published && !doc.published))
      return res.status(404).json({ error: 'Topilmadi' });
    res.json(doc);
  });
  r.post('/', requireAdmin, async (req, res) => res.status(201).json(await Model.create(req.body)));
  r.put('/:id', requireAdmin, async (req, res) =>
    res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
  r.delete('/:id', requireAdmin, async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  });
  return r;
}
