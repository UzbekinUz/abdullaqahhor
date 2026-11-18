import jwt from 'jsonwebtoken';

export const sign = (admin) =>
  jwt.sign({ id: admin._id, u: admin.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

export function requireAdmin(req, res, next) {
  const h = req.headers.authorization || '';
  try {
    req.admin = jwt.verify(h.replace('Bearer ', ''), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Ruxsat yo'q" });
  }
}

// Token bor va to'g'ri bo'lsa true (xato bermaydi)
export function isAdmin(req) {
  try {
    jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
