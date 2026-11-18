const BASE = import.meta.env.VITE_API_URL || ''
// Ochiq sayt manzili: /media/* rasmlari o'sha yerda turadi
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173'

export const token = () => { try { return localStorage.getItem('adminToken') } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem('adminToken', t) : localStorage.removeItem('adminToken') } catch {} }
export const media = (u) => (!u ? '' : /^https?:/.test(u) ? u : u.startsWith('/media') ? SITE_URL + u : BASE + u)

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && token()) { setToken(null); location.replace('/login') }
  if (!res.ok) throw new Error(data.error || 'Xatolik')
  return data
}

export async function upload(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Yuklashda xatolik')
  return data.url
}
