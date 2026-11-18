import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useApi, media } from '../api.js'
import Reveal, { PageHead } from '../components/Reveal.jsx'

export default function Gallery() {
  const [items, loading] = useApi('/gallery', [])
  const [open, setOpen] = useState(null)
  const move = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length])

  useEffect(() => {
    if (open === null) return
    const k = (e) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1) }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, move])

  const cur = open !== null ? items[open] : null
  return (
    <>
      <PageHead title="Foto galereya">Suratlar va arxiv lavhalari: bosib kattalashtiring, barmoq bilan suring.</PageHead>
      <div className="px-[5vw] columns-1 sm:columns-2 lg:columns-3 gap-4">
        {items.map((g, i) => (
          <Reveal key={g._id} delay={(i % 3) * 70} className="mb-4 break-inside-avoid">
            <button onClick={() => setOpen(i)} className="card block w-full p-0 border-0 cursor-zoom-in overflow-hidden text-left">
              <img src={media(g.url)} alt={g.caption || 'Abdulla Qahhor'} loading="lazy" className="w-full block" />
              <span className="block p-4 small text-muted">{[g.caption, g.credit].filter(Boolean).join(' · ')}</span>
            </button>
          </Reveal>
        ))}
        {!loading && !items.length && <p className="text-muted">Hozircha surat yo'q.</p>}
      </div>

      <AnimatePresence>
        {cur && (
          <motion.div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="Surat" data-noswipe>
            <button className="absolute top-4 right-4 btn btn-ghost !p-3" onClick={() => setOpen(null)} aria-label="Yopish"><X size={22} /></button>
            <button className="absolute left-3 top-1/2 btn btn-ghost !p-3 hidden md:inline-flex" onClick={() => move(-1)} aria-label="Oldingisi"><ChevronLeft size={22} /></button>
            <button className="absolute right-3 top-1/2 btn btn-ghost !p-3 hidden md:inline-flex" onClick={() => move(1)} aria-label="Keyingisi"><ChevronRight size={22} /></button>
            <motion.figure
              key={open} className="m-0 max-w-[94vw] max-h-[88vh] text-center" style={{ touchAction: 'pan-y' }}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
              onDragEnd={(_, i) => { if (i.offset.x < -80) move(1); else if (i.offset.x > 80) move(-1) }}
            >
              <img src={media(cur.url)} alt={cur.caption || ''} className="max-w-[94vw] max-h-[78vh] object-contain rounded-xl mx-auto" draggable={false} />
              <figcaption className="text-white/85 mt-3 small">{[cur.caption, cur.credit].filter(Boolean).join(' · ')} ({open + 1}/{items.length})</figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
