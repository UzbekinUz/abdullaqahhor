import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import api from './routes/index.js';
import { Admin } from './models/index.js';
import { UPLOAD_DIR } from './paths.js';
import { startBot } from './bot/index.js';
import { connectDb } from './db.js';
import { seedIfEmpty } from './seed.js';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean) || true }));
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api', api);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server xatosi' });
});

await connectDb();
await seedIfEmpty();
if (!(await Admin.countDocuments())) {
  await Admin.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', 10),
  });
  console.log('Admin yaratildi');
}
startBot();
const port = process.env.PORT || 4000;
app.listen(port, () => console.log('API :' + port));
