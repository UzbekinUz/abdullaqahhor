import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { api, setToken } from '../api.js'

export default function LoginPage() {
  const nav = useNavigate()
  const [f, setF] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const r = await api('/auth/login', { method: 'POST', body: f })
      setToken(r.token)
      nav('/', { replace: true })
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <main className="min-h-screen grid place-items-center px-5 bg-deep">
      <form onSubmit={submit} className="card p-8 w-full max-w-sm grid gap-4">
        <span className="icon-box !w-14 !h-14"><Lock size={26} /></span>
        <h1 className="display text-3xl m-0">Admin kirish</h1>
        <div><label htmlFor="u">Login</label><input id="u" autoComplete="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></div>
        <div><label htmlFor="p">Parol</label><input id="p" type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        {err && <p role="alert" className="m-0 text-red-600 font-medium">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Kirilmoqda…' : 'Kirish'}</button>
      </form>
    </main>
  )
}
