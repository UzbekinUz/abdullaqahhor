import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Headphones, Search } from 'lucide-react'
import { useApi, media } from '../api.js'
import Reveal, { PageHead } from '../components/Reveal.jsx'
import StoryCard from '../components/StoryCard.jsx'
import { PlayButton } from '../context/Audio.jsx'

export default function Stories() {
  const [stories, loading] = useApi('/stories', [])
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') || '').toLowerCase()
  const kind = params.get('kind') || ''
  const kinds = [...new Set(stories.map((s) => s.kind).filter(Boolean))]
  const list = useMemo(
    () => stories.filter((s) => (!kind || s.kind === kind) && (!q || `${s.title} ${s.excerpt || ''}`.toLowerCase().includes(q))),
    [stories, q, kind],
  )
  const set = (k, v) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); setParams(p, { replace: true }) }

  return (
    <>
      <PageHead title="Hikoyalar">Har bir hikoyani o'qing yoki tinglang.</PageHead>
      <div className="px-[5vw]">
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="relative flex-1 min-w-[14rem] max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input aria-label="Qidirish" placeholder="Hikoya qidirish" value={params.get('q') || ''} onChange={(e) => set('q', e.target.value)} className="!pl-11 !rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['', ...kinds].map((k) => (
              <button key={k || 'all'} onClick={() => set('kind', k)} className={`border-0 cursor-pointer rounded-full px-4 py-2 font-semibold ${kind === k ? 'bg-accent text-accent-ink' : 'bg-surface text-ink'}`}>{k || 'Barchasi'}</button>
            ))}
          </div>
        </div>
        <ul className="list-none p-0 m-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal as="li" key={s._id} delay={(i % 3) * 70}><StoryCard s={s} /></Reveal>
          ))}
        </ul>
        {!loading && !list.length && <p className="text-muted">Hech narsa topilmadi.</p>}
      </div>
    </>
  )
}

export function StoryPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [s, loading] = useApi(`/stories/${id}`)
  const [all] = useApi('/stories', [])
  const [size, setSize] = useState(() => { try { return +localStorage.getItem('readSize') || 1.125 } catch { return 1.125 } })
  const bump = (d) => {
    const n = Math.min(1.8, Math.max(0.95, +(size + d).toFixed(2)))
    setSize(n)
    try { localStorage.setItem('readSize', n) } catch {}
  }
  const idx = all.findIndex((x) => x._id === id)
  const prev = idx > 0 ? all[idx - 1] : null
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
  const swipe = (_, info) => {
    const { x, y } = info.offset
    if (Math.abs(x) < 90 || Math.abs(x) < Math.abs(y) * 1.6) return
    const to = x < 0 ? next : prev
    if (to) nav(`/hikoyalar/${to._id}`)
  }

  if (loading) return <p className="px-[5vw] text-muted">Yuklanmoqda…</p>
  if (!s) return <p className="px-[5vw]">Hikoya topilmadi. <Link to="/hikoyalar" className="underline">Orqaga</Link></p>
  return (
    <motion.article onPanEnd={swipe} style={{ touchAction: 'pan-y' }} className="px-[5vw] grid gap-10 lg:grid-cols-12 items-start pt-8">
      <header className="lg:col-span-7 lg:col-start-2">
        <Link to="/hikoyalar" className="no-underline text-accent-strong font-semibold inline-flex items-center gap-1"><ArrowLeft size={16} />Hikoyalar</Link>
        <h1 className="display text-[clamp(2.25rem,1.2rem+4vw,4.25rem)] m-0 mt-4">{s.title}</h1>
        <div className="flex flex-wrap gap-2 mt-4">
          {s.kind && <span className="pill">{s.kind}</span>}
          {s.year && <span className="pill">{s.year}</span>}
        </div>
        {s.excerpt && <p className="text-muted mt-4 mb-0">{s.excerpt}</p>}
        <div className="flex gap-2 items-center mt-6">
          <button className="btn btn-quiet !px-4" onClick={() => bump(-0.1)} aria-label="Harfni kichraytirish">A−</button>
          <button className="btn btn-quiet !px-4" onClick={() => bump(0.1)} aria-label="Harfni kattalashtirish">A+</button>
        </div>
        {s.audioUrl && (
          <div className="card p-4 mt-6 flex items-center gap-4 flex-wrap">
            <span className="icon-box"><Headphones size={22} /></span>
            <div className="flex-1 min-w-[10rem]">
              <p className="m-0 font-bold">Audio talqin</p>
              <p className="m-0 text-sm text-muted">Pleyer pastda ochiladi va boshqa sahifada ham davom etadi.</p>
            </div>
            <PlayButton track={{ src: s.audioUrl, title: s.title, cover: s.cover }} />
          </div>
        )}
      </header>
      <aside className="lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:sticky lg:top-24 order-first lg:order-none">
        <img src={media(s.cover) || '/media/abdulla-qahhor-xaykali.jpg'} alt={s.title} className="w-full aspect-[4/3] lg:aspect-[4/5] object-cover rounded-2xl" />
        <p className="small text-muted mt-2 m-0">Mavzuga mos tasvir (manba: Foto galereya)</p>
      </aside>
      <div className="lg:col-span-7 lg:col-start-2 prose-read" style={{ '--read-size': `${size}rem` }}>
        {(s.body || '').split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
        <div className="flex justify-between gap-3 mt-10 text-base" data-noswipe>
          {prev ? <Link to={`/hikoyalar/${prev._id}`} className="btn btn-quiet"><ChevronLeft size={18} />{prev.title}</Link> : <span />}
          {next ? <Link to={`/hikoyalar/${next._id}`} className="btn">{next.title}<ChevronRight size={18} /></Link> : <span />}
        </div>
        <p className="small text-muted mt-4 lg:hidden">Telefonda chapga yoki o'ngga surib, boshqa hikoyaga o'tishingiz mumkin.</p>
      </div>
    </motion.article>
  )
}
