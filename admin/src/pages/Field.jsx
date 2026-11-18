import { useState } from 'react'
import { upload, media } from '../api.js'

export default function Field({ f, value, onChange }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const id = `f-${f.name}`
  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setErr('')
    try { onChange(await upload(file)) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  if (f.type === 'checkbox')
    return (
      <label className="flex items-center gap-3 text-ink" htmlFor={id}>
        <input id={id} type="checkbox" className="!w-auto" checked={value ?? true} onChange={(e) => onChange(e.target.checked)} /> {f.label}
      </label>
    )
  if (f.type === 'textarea')
    return <div><label htmlFor={id}>{f.label}</label><textarea id={id} rows={f.rows || 4} value={value || ''} onChange={(e) => onChange(e.target.value)} /></div>
  if (['image', 'audio', 'video'].includes(f.type))
    return (
      <div>
        <label htmlFor={id}>{f.label}</label>
        <input id={id} value={value || ''} placeholder={f.type === 'video' ? 'YouTube havolasi yoki yuklang' : 'Havola yoki fayl yuklang'} onChange={(e) => onChange(e.target.value)} />
        <input type="file" accept={`${f.type === 'video' ? 'video' : f.type}/*`} onChange={pick} className="mt-2" aria-label={`${f.label} yuklash`} />
        {busy && <p className="small text-muted m-0">Yuklanmoqda…</p>}
        {err && <p role="alert" className="small text-red-400 m-0">{err}</p>}
        {value && f.type === 'image' && <img src={media(value)} alt="" className="mt-2 max-h-40" />}
        {value && f.type === 'audio' && <audio controls src={media(value)} className="mt-2 w-full" />}
      </div>
    )
  return (
    <div>
      <label htmlFor={id}>{f.label}</label>
      <input id={id} type={f.type === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={(e) => onChange(f.type === 'number' ? +e.target.value : e.target.value)} />
    </div>
  )
}
