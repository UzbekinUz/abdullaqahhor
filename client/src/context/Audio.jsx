import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Pause, Play, X } from 'lucide-react'
import { media } from '../api.js'

const Ctx = createContext(null)
export const useAudio = () => useContext(Ctx)
const fmt = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

/** Butun sayt bo'ylab bitta audio pleyer: sahifa almashganda ham to'xtamaydi */
export function AudioProvider({ children }) {
  const el = useRef(null)
  const [track, setTrack] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState({ cur: 0, dur: 0 })

  useEffect(() => {
    const a = new Audio()
    a.preload = 'none'
    el.current = a
    const on = (n, f) => a.addEventListener(n, f)
    on('timeupdate', () => setTime({ cur: a.currentTime, dur: a.duration || 0 }))
    on('loadedmetadata', () => setTime({ cur: a.currentTime, dur: a.duration || 0 }))
    on('play', () => setPlaying(true))
    on('pause', () => setPlaying(false))
    on('ended', () => setPlaying(false))
    return () => { a.pause(); a.src = '' }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('has-player', !!track)
  }, [track])

  const api = useMemo(() => ({
    track, playing, time,
    toggle(t) {
      const a = el.current
      if (!a) return
      if (t && track?.src !== t.src) {
        setTrack(t)
        a.src = media(t.src)
        a.play().catch(() => {})
      } else if (a.paused) a.play().catch(() => {})
      else a.pause()
    },
    seek(p) { const a = el.current; if (a?.duration) a.currentTime = p * a.duration },
    close() { const a = el.current; a?.pause(); setTrack(null); setPlaying(false) },
  }), [track, playing, time])

  useEffect(() => {
    if (!track || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title, artist: 'Abdulla Qahhor',
      artwork: track.cover ? [{ src: media(track.cover), sizes: '512x512' }] : [],
    })
    navigator.mediaSession.setActionHandler('play', () => el.current?.play())
    navigator.mediaSession.setActionHandler('pause', () => el.current?.pause())
  }, [track])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

/** Hikoya yoki asar kartasidagi tinglash tugmasi */
export function PlayButton({ track, className = '', compact = false }) {
  const a = useAudio()
  if (!track?.src) return null
  const on = a.track?.src === track.src && a.playing
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); a.toggle(track) }
  return (
    <button type="button" onClick={stop} aria-pressed={on} aria-label={`${track.title}: ${on ? "to'xtatish" : 'tinglash'}`}
      className={`btn ${compact ? '!p-3' : '!py-2'} ${className}`}>
      {on ? <Pause size={18} /> : <Play size={18} />}{!compact && (on ? "To'xtatish" : 'Tinglash')}
    </button>
  )
}

/** Pastdagi mini pleyer */
export function MiniPlayer() {
  const a = useAudio()
  const t = a?.track
  const pct = a?.time.dur ? (a.time.cur / a.time.dur) * 100 : 0
  return (
    <AnimatePresence>
      {t && (
        <motion.div
          role="region" aria-label="Audio pleyer"
          className="fixed z-[58] left-3 right-3 bottom-[4.9rem] lg:left-6 lg:right-auto lg:bottom-6 lg:w-[420px] card p-3"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className="flex items-center gap-3">
            {t.cover && <img src={media(t.cover)} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="m-0 font-bold truncate">{t.title}</p>
              <p className="m-0 text-xs text-muted">{fmt(a.time.cur)} / {fmt(a.time.dur)}</p>
            </div>
            <button className="btn !p-3" onClick={() => a.toggle()} aria-label={a.playing ? "To'xtatish" : 'Davom ettirish'}>{a.playing ? <Pause size={20} /> : <Play size={20} />}</button>
            <button className="btn btn-quiet !p-3" onClick={a.close} aria-label="Yopish"><X size={20} /></button>
          </div>
          <input type="range" min="0" max="1000" value={Math.round(pct * 10)} aria-label="Audio joyi"
            onChange={(e) => a.seek(Number(e.target.value) / 1000)}
            className="!p-0 !border-0 !bg-transparent mt-2 accent-[var(--accent)] cursor-pointer" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
