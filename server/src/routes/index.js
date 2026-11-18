import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { Admin, Story, Work, Quote, GalleryItem, Source, Video, Site, TgAuth } from '../models/index.js';
import { sign, requireAdmin } from '../auth.js';
import { verifyInitData } from '../tgauth.js';
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

// Telegram Mini App: initData imzosi tekshiriladi. Ruxsat: TELEGRAM_ADMIN_IDS ro'yxatida bo'lsa,
// yoki ro'yxat bo'sh bo'lsa botda /login bilan kirgan (TgAuth) bo'lsa.
api.post('/auth/telegram', async (req, res) => {
  const user = verifyInitData(req.body?.initData, process.env.TELEGRAM_BOT_TOKEN);
  if (!user) return res.status(401).json({ error: "Telegram ma'lumoti yaroqsiz. Mini App'ni bot orqali oching." });
  const ids = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  let ok = ids.includes(String(user.id));
  if (!ok && !ids.length) {
    const a = await TgAuth.findOne({ chatId: String(user.id) });
    ok = !!a && (!a.expiresAt || a.expiresAt > new Date());
  }
  if (!ok) return res.status(403).json({ error: `Ruxsat yo'q. Sizning Telegram ID: ${user.id}` });
  const admin = await Admin.findOne();
  if (!admin) return res.status(500).json({ error: 'Admin topilmadi' });
  res.json({ token: sign(admin), username: user.first_name || admin.username });
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
