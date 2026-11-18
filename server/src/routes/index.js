import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { Admin, Story, Work, Quote, GalleryItem, Source, Video, Site } from '../models/index.js';
import { sign, requireAdmin } from '../auth.js';
import { crud } from './crud.js';
import { UPLOAD_DIR } from '../paths.js';

const api = Router();

api.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const admin = await Admin.findOne({ username });
  if (!admin || !(await bcrypt.compare(password || '', admin.passwordHash)))
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
  res.json({ token: sign(admin), username: admin.username });
});

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) =>
    cb(null, crypto.randomBytes(8).toString('hex') + path.extname(file.originalname).toLowerCase()),
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^(image|audio|video)\//.test(file.mimetype)),
});
api.post('/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fayl turi qabul qilinmadi' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Bosh sahifa / biografiya (yagona hujjat)
api.get('/site', async (_req, res) =>
  res.json(await Site.findOneAndUpdate({ key: 'main' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true })));
api.put('/site', requireAdmin, async (req, res) =>
  res.json(await Site.findOneAndUpdate({ key: 'main' }, req.body, { upsert: true, new: true })));

api.use('/stories', crud(Story, { publicFilter: { published: true } }));
api.use('/works', crud(Work));
api.use('/quotes', crud(Quote));
api.use('/gallery', crud(GalleryItem));
api.use('/sources', crud(Source));
api.use('/videos', crud(Video, { publicFilter: { published: true } }));

export default api;
