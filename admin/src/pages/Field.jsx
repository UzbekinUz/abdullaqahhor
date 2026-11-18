import { useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { upload, media } from '../api.js'

export default function Field({ f, value, onChange }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const id = `f-${f.name}`
  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true); setErr('')
    try { onChange(await upload(file)) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  if (f.type === 'checkbox')
    return (
      <label className="switch-row" htmlFor={id}>
        <span className="text-ink text-base">{f.label}</span>
        <input id={id} type="checkbox" role="switch" className="switch" checked={value ?? true} onChange={(e) => onChange(e.target.checked)} />
      </label>
    )
  if (f.type === 'textarea')
    return <div><label htmlFor={id}>{f.label}</label><textarea id={id} rows={f.rows || 4} value={value || ''} onChange={(e) => onChange(e.target.value)} /></div>
  if (['image', 'audio', 'video'].includes(f.type)) {
    const accept = `${f.type}/*`
    const noun = { image: 'rasm', audio: 'audio', video: 'video' }[f.type]
    return (
      <div>
        <label htmlFor={id}>{f.label}</label>
        <div className="flex gap-2">
          <input id={id} inputMode="url" value={value || ''} placeholder={f.type === 'video' ? 'YouTube havolasi yoki fayl' : 'Havola yoki fayl'} onChange={(e) => onChange(e.target.value)} />
          {value && <button type="button" className="icon-btn shrink-0" aria-label="Olib tashlash" onClick={() => onChange('')}><X size={20} /></button>}
        </div>
        <label className={`btn btn-quiet w-full mt-2 ${busy ? 'opacity-60 pointer-events-none' : ''}`} style={{ marginBottom: 0 }}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {busy ? 'Yuklanmoqda…' : `Telefondan ${noun} tanlash`}
          <input type="file" accept={accept} onChange={pick} className="sr-only !w-px" aria-label={`${f.label} yuklash`} />
        </label>
        {err && <p role="alert" className="small text-red-500 m-0 mt-1">{err}</p>}
        {value && f.type === 'image' && <img src={media(value)} alt="" className="mt-3 w-full max-h-56 object-cover rounded-xl" />}
        {value && f.type === 'audio' && <audio controls src={media(value)} className="mt-3 w-full" />}
      </div>
    )
  }
  return (
    <div>
      <label htmlFor={id}>{f.label}</label>
      <input id={id} type={f.type === 'number' ? 'number' : 'text'} inputMode={f.type === 'number' ? 'numeric' : undefined} value={value ?? ''} onChange={(e) => onChange(f.type === 'number' ? +e.target.value : e.target.value)} />
    </div>
  )
}
