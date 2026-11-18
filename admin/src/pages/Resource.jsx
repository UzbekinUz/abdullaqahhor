import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Trash2, ChevronRight, Loader2 } from 'lucide-react'
import { api, media } from '../api.js'
import { askConfirm, haptic, hapticDone, useBackButton } from '../tg.js'
import Field from './Field.jsx'

export default function Resource({ name, cfg }) {
  const [list, setList] = useState(null)
  const [edit, setEdit] = useState(null) // null | {} (yangi) | doc
  const [msg, setMsg] = useState('')
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => api(`${cfg.api}?all=1`).then(setList).catch((e) => { setList([]); setMsg(e.message) }), [cfg.api])
  useEffect(() => { setEdit(null); setList(null); setQ(''); setMsg(''); load() }, [name, load])
  useBackButton(!!edit, useCallback(() => setEdit(null), []))

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (list || []).filter((d) => !s || String(d[cfg.titleField] || '').toLowerCase().includes(s))
  }, [list, q, cfg.titleField])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    try {
      const { _id, createdAt, updatedAt, __v, ...body } = edit
      if (_id) await api(`${cfg.api}/${_id}`, { method: 'PUT', body })
      else await api(cfg.api, { method: 'POST', body })
      hapticDone('success')
      setEdit(null); setMsg('Saqlandi ✓'); load()
    } catch (x) { hapticDone('error'); setMsg(x.message) } finally { setSaving(false) }
  }
  const remove = async (d) => {
    if (!(await askConfirm("O'chirishni tasdiqlaysizmi? Bu qaytarilmaydi."))) return
    try { await api(`${cfg.api}/${d._id}`, { method: 'DELETE' }); hapticDone('warning'); load() } catch (x) { setMsg(x.message) }
  }

  if (edit)
    return (
      <form onSubmit={save} className="grid gap-5 max-w-3xl pb-24">
        <h1 className="display text-3xl m-0">{edit._id ? 'Tahrirlash' : "Yangi qo'shish"}</h1>
        {cfg.fields.map((f) => <Field key={f.name} f={f} value={edit[f.name]} onChange={(v) => setEdit({ ...edit, [f.name]: v })} />)}
        {msg && <p role="alert" className="m-0 text-red-500">{msg}</p>}
        <div className="actionbar">
          <button type="button" className="btn btn-quiet" onClick={() => setEdit(null)}>Bekor</button>
          <button className="btn flex-1" disabled={saving}>{saving ? <Loader2 size={18} className="animate-spin" /> : null}{saving ? 'Saqlanmoqda…' : 'Saqlash'}</button>
        </div>
      </form>
    )

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="display text-3xl md:text-4xl m-0">{cfg.label}</h1>
        <button className="btn !px-4" onClick={() => { haptic('medium'); setMsg(''); setEdit({ published: true }) }}><Plus size={20} />Qo'shish</button>
      </div>

      {(list?.length || 0) > 6 && (
        <div className="relative mt-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input type="search" placeholder="Qidirish" value={q} onChange={(e) => setQ(e.target.value)} className="!pl-10" />
        </div>
      )}
      {msg && <p role="status" className="text-muted mt-3 mb-0">{msg}</p>}

      <ul className="list-none p-0 mt-5 grid gap-2.5">
        {list === null && [0, 1, 2].map((i) => <li key={i} className="row skeleton" aria-hidden="true" />)}
        {shown.map((d) => {
          const img = d.cover || d.thumbnail || (d.url && /\.(jpe?g|png|webp)$/i.test(d.url) ? d.url : '')
          const sub = [d.kind, d.year, d.source, d.author].filter(Boolean).join(' · ')
          return (
            <li key={d._id} className="row">
              <button className="row-main" onClick={() => { haptic('light'); setMsg(''); setEdit(d) }}>
                {img && <img src={media(img)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
                <span className="min-w-0 flex-1 text-left">
                  <span className="block font-semibold leading-snug line-clamp-2">{(d[cfg.titleField] || '(nomsiz)').slice(0, 140)}</span>
                  {(sub || d.published === false || d.audioUrl) && (
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 small text-muted mt-0.5">
                      {d.published === false && <span className="chip-off">yashirin</span>}
                      {d.audioUrl && <span className="text-accent font-medium">audio</span>}
                      {sub && <span className="truncate">{sub}</span>}
                    </span>
                  )}
                </span>
                <ChevronRight size={18} className="text-muted shrink-0" />
              </button>
              <button className="icon-btn shrink-0" onClick={() => remove(d)} aria-label={`O'chirish: ${d[cfg.titleField] || ''}`}><Trash2 size={19} /></button>
            </li>
          )
        })}
        {list && !shown.length && <li className="text-muted py-6 text-center">{q ? 'Hech narsa topilmadi.' : "Hozircha bo'sh. «Qo'shish» ni bosing."}</li>}
      </ul>
    </>
  )
}
