import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Field from './Field.jsx'

// Takrorlanuvchi qatorlar (tarjimai hol bo'limlari, yillar jadvali)
function Rows({ label, rows = [], fields, onChange }) {
  const set = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  return (
    <fieldset className="border-0 p-0 m-0 grid gap-4">
      <legend className="display text-2xl mb-2">{label}</legend>
      {rows.map((r, i) => (
        <div key={i} className="bg-surface p-4 grid gap-3">
          {fields.map((f) => <Field key={f.name} f={f} value={r[f.name]} onChange={(v) => set(i, f.name, v)} />)}
          <button type="button" className="btn btn-quiet justify-self-start" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Olib tashlash</button>
        </div>
      ))}
      <button type="button" className="btn btn-quiet justify-self-start" onClick={() => onChange([...rows, {}])}>+ Qo'shish</button>
    </fieldset>
  )
}

export default function SiteEditor() {
  const [s, setS] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => { api('/site').then(setS) }, [])
  if (!s) return <p className="text-muted">Yuklanmoqda…</p>
  const save = async (e) => {
    e.preventDefault()
    const { _id, createdAt, updatedAt, __v, key, ...body } = s
    try { await api('/site', { method: 'PUT', body }); setMsg('Saqlandi ✓') } catch (x) { setMsg(x.message) }
  }
  const up = (k) => (v) => setS({ ...s, [k]: v })
  return (
    <form onSubmit={save} className="grid gap-6 max-w-3xl pb-24">
      <h1 className="display text-3xl md:text-4xl m-0">Bosh sahifa va tarjimai hol</h1>
      <Field f={{ name: 'heroTitle', label: 'Bosh sarlavha', type: 'text' }} value={s.heroTitle} onChange={up('heroTitle')} />
      <Field f={{ name: 'heroSubtitle', label: 'Bosh sahifadagi qisqa gap', type: 'textarea' }} value={s.heroSubtitle} onChange={up('heroSubtitle')} />
      <Field f={{ name: 'bornDied', label: 'Yillari (1907 — 1968)', type: 'text' }} value={s.bornDied} onChange={up('bornDied')} />
      <Field f={{ name: 'portrait', label: 'Asosiy portret', type: 'image' }} value={s.portrait} onChange={up('portrait')} />
      <Rows label="Tarjimai hol bo'limlari" rows={s.biography} onChange={up('biography')}
        fields={[{ name: 'heading', label: 'Sarlavha', type: 'text' }, { name: 'text', label: 'Matn', type: 'textarea', rows: 8 }]} />
      <Rows label="Hayot yillari jadvali" rows={s.timeline} onChange={up('timeline')}
        fields={[{ name: 'year', label: 'Yil', type: 'text' }, { name: 'text', label: 'Voqea', type: 'text' }]} />
      <Field f={{ name: 'credits', label: "Rasm mualliflari (pastki qismda ko'rinadi)", type: 'textarea' }} value={s.credits} onChange={up('credits')} />
      {msg && <p role="status" className="m-0 text-muted">{msg}</p>}
      <div className="actionbar"><button className="btn flex-1">Saqlash</button></div>
    </form>
  )
}
