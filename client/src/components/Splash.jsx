import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { Feather } from 'lucide-react'

const PHOTOS = [
  'abdulla-qahhor.jpg', 'abdulla-qahhor-xaykali.jpg', 'khudayar-khan-palace-kokand-01.jpg', 'abdulla-qahhor-001.jpg',
  'chorsu-bazaar-in-tashkent-4.jpg', 'tashkent-old-city.jpg', 'children-in-uzbek-village.jpg', 'abdulla-qahhor-002.jpg',
  'old-city-street-scene-tashkent-uzbekistan-7472128820.jpg', 'presidential-school-in-gulistan.jpg', 'abdulla-qahhor-003.jpg', 'depiction-of-an-uzbek-village.jpg',
].map((f) => `/media/${f}`)

const DURATION = 3.8

/**
 * Ilovaga kirganda: suratlar markazda aylanib, gul ochilgandek atrofga tarqaladi,
 * so'ng markazdan "qochib" ketadi. Sichqoncha harakatiga qarab siljiydi.
 */
export default function Splash({ onDone }) {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (reduce) { onDone(); return }
    const t = setTimeout(() => setDone(true), DURATION * 1000)
    const move = (e) => { mx.set((e.clientX / innerWidth - 0.5) * 2); my.set((e.clientY / innerHeight - 0.5) * 2) }
    window.addEventListener('pointermove', move)
    return () => { clearTimeout(t); window.removeEventListener('pointermove', move) }
  }, [reduce, onDone, mx, my])

  const petals = useMemo(() => {
    const R = Math.min(innerWidth, innerHeight)
    return PHOTOS.map((src, i) => {
      const outer = i < 8
      const idx = outer ? i : i - 8
      const n = outer ? 8 : 4
      const a = (idx / n) * Math.PI * 2 + (outer ? 0 : Math.PI / n) - Math.PI / 2
      const rad = (outer ? 0.36 : 0.19) * R * (innerWidth > 800 ? 1.25 : 1)
      const size = outer ? (innerWidth > 800 ? 150 : 96) : (innerWidth > 800 ? 100 : 68)
      return { src, tx: Math.cos(a) * rad, ty: Math.sin(a) * rad, size, outer, i, depth: outer ? 26 : 14, a }
    })
  }, [])

  if (reduce) return null
  return (
    <AnimatePresence onExitComplete={onDone}>
      {!done && (
        <motion.div
          key="splash" role="presentation" aria-hidden="true"
          className="fixed inset-0 z-[300] bg-deep overflow-hidden grid place-items-center cursor-pointer"
          exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
          onClick={() => setDone(true)}
        >
          {petals.map((p) => (
            <Petal key={p.src} p={p} sx={sx} sy={sy} />
          ))}
          <motion.div
            className="relative z-10 text-center text-white"
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.7, 0.7, 1, 1, 1.15] }}
            transition={{ duration: DURATION, times: [0, 0.35, 0.55, 0.8, 1] }}
          >
            <span className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-white/10 text-mint mb-3"><Feather size={30} /></span>
            <p className="display text-4xl md:text-6xl m-0">Abdulla Qahhor</p>
            <p className="m-0 mt-2 text-mint font-semibold">1907–1968</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Petal({ p, sx, sy }) {
  const x = useTransform(sx, (v) => v * p.depth)
  const y = useTransform(sy, (v) => v * p.depth)
  const delay = p.outer ? 0 : 0.18
  return (
    <motion.div className="absolute" style={{ x, y, width: p.size, height: p.size }}>
      <motion.img
        src={p.src} alt="" draggable={false}
        className={`w-full h-full object-cover ${p.outer ? 'rounded-3xl' : 'rounded-full'} shadow-[0_10px_40px_rgba(0,0,0,0.4)]`}
        initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 0 }}
        animate={{
          x: [0, 0, p.tx, p.tx * 2.7],
          y: [0, 0, p.ty, p.ty * 2.7],
          rotate: [0, p.outer ? 320 : -320, p.outer ? 400 + p.i * 6 : -400, p.outer ? 760 : -760],
          scale: [0, 0.9, 1, 1.6],
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: DURATION - delay, delay, times: [0, 0.3, 0.68, 1], ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
