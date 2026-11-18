import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2, RefreshCw } from 'lucide-react'
import { api, setToken, telegramLogin } from '../api.js'
import { tg, inTelegram } from '../tg.js'

export default function LoginPage() {
  const nav = useNavigate()
  const [f, setF] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(inTelegram)

  const tgLogin = () => {
    setBusy(true); setErr('')
    telegramLogin(tg.initData)
      .then(() => nav('/', { replace: true }))
      .catch((x) => setErr(x.message))
      .finally(() => setBusy(false))
  }
  useEffect(() => { if (inTelegram) tgLogin() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const r = await api('/auth/login', { method: 'POST', body: f })
      setToken(r.token)
      nav('/', { replace: true })
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  if (inTelegram)
    return (
      <main className="min-h-[100dvh] grid place-items-center px-6 text-center">
        <div className="grid gap-4 justify-items-center max-w-xs">
          <span className="icon-box !w-16 !h-16">{busy ? <Loader2 size={28} className="animate-spin" /> : <Lock size={28} />}</span>
          <h1 className="display text-2xl m-0">{busy ? 'Kirilmoqda…' : "Kirib bo'lmadi"}</h1>
          {busy && <p className="m-0 text-muted small">Server uyg'onishi uchun 30–50 soniya kerak bo'lishi mumkin.</p>}
          {err && <p role="alert" className="m-0 text-red-500 font-medium">{err}</p>}
          {!busy && <button className="btn" onClick={tgLogin}><RefreshCw size={18} />Qayta urinish</button>}
        </div>
      </main>
    )

  return (
    <main className="min-h-[100dvh] grid place-items-center px-5 bg-deep">
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
