import { useCallback, useEffect, useState } from 'react'
import { api, media } from '../api.js'
import Field from './Field.jsx'

export default function Resource({ name, cfg }) {
  const [list, setList] = useState([])
  const [edit, setEdit] = useState(null) // null | {} (yangi) | doc
  const [msg, setMsg] = useState('')

  const load = useCallback(() => api(`${cfg.api}?all=1`).then(setList).catch((e) => setMsg(e.message)), [cfg.api])
  useEffect(() => { setEdit(null); load() }, [name, load])

  const save = async (e) => {
    e.preventDefault()
    try {
      const { _id, createdAt, updatedAt, __v, ...body } = edit
      if (_id) await api(`${cfg.api}/${_id}`, { method: 'PUT', body })
      else await api(cfg.api, { method: 'POST', body })
      setEdit(null); setMsg('Saqlandi'); load()
    } catch (x) { setMsg(x.message) }
  }
  const remove = async (d) => {
    if (!confirm("O'chirishni tasdiqlaysizmi? Bu qaytarilmaydi.")) return
    await api(`${cfg.api}/${d._id}`, { method: 'DELETE' }); load()
  }

  if (edit)
    return (
      <form onSubmit={save} className="grid gap-5 max-w-3xl">
        <h1 className="display text-3xl m-0">{edit._id ? 'Tahrirlash' : "Yangi qo'shish"}</h1>
        {cfg.fields.map((f) => <Field key={f.name} f={f} value={edit[f.name]} onChange={(v) => setEdit({ ...edit, [f.name]: v })} />)}
        {msg && <p role="alert" className="m-0 text-red-400">{msg}</p>}
        <div className="flex gap-3"><button className="btn">Saqlash</button><button type="button" className="btn btn-quiet" onClick={() => setEdit(null)}>Bekor</button></div>
      </form>
    )

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="display text-4xl m-0">{cfg.label}</h1>
        <button className="btn" onClick={() => { setMsg(''); setEdit({ published: true }) }}>Qo'shish</button>
      </div>
      {msg && <p role="status" className="text-muted">{msg}</p>}
      <ul className="list-none p-0 mt-8 grid gap-2">
        {list.map((d) => (
          <li key={d._id} className="bg-surface px-4 py-3 flex items-center gap-4 justify-between">
            <span className="min-w-0 truncate flex items-center gap-3">
              {(d.cover || d.thumbnail || (d.url && /\.(jpe?g|png|webp)$/i.test(d.url))) && <img src={media(d.cover || d.thumbnail || d.url)} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
              {d.published === false && <span className="small text-muted mr-2">[yashirin]</span>}
              {d.audioUrl && <span className="small text-accent mr-2">audio</span>}
              {(d[cfg.titleField] || '(nomsiz)').slice(0, 90)}
            </span>
            <span className="flex gap-2 shrink-0">
              <button className="btn btn-quiet" onClick={() => { setMsg(''); setEdit(d) }}>Tahrir</button>
              <button className="btn btn-quiet" onClick={() => remove(d)}>O'chirish</button>
            </span>
          </li>
        ))}
        {!list.length && <li className="text-muted">Hozircha bo'sh.</li>}
      </ul>
    </>
  )
}
