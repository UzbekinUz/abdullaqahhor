import { useEffect, useState } from 'react'
import { demoFor } from './demoData.js'

const BASE = import.meta.env.VITE_API_URL || ''
export const token = () => { try { return localStorage.getItem('token') } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem('token', t) : localStorage.removeItem('token') } catch {} }
export const media = (u) => (!u ? '' : /^(https?:|\/media)/.test(u) ? u : BASE + u)

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
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

export function useApi(path, fallback = null) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let live = true
    // Server javob bermasa (faqat o'qish uchun) namuna ma'lumotlar ko'rsatiladi
    api(path)
      .then((d) => live && setData(d))
      .catch((e) => { if (live && !path.includes('all=1')) { const d = demoFor(path); if (d) setData(d) } })
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [path])
  return [data, loading]
}
