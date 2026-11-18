import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AnimatePresence, motion, useAnimationFrame, useMotionValue, useMotionValueEvent, useReducedMotion,
  useScroll, useSpring, useTransform, useVelocity,
} from 'motion/react'
import { media } from '../api.js'

/** Sarlavha so'zlari pastdan "kesib" chiqadi */
export function SplitHeading({ text, className = '', as = 'h2' }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}
      initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ staggerChildren: 0.07 }}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
          <motion.span className="inline-block"
            variants={{ hidden: reduce ? {} : { y: '110%', rotate: 4 }, show: { y: 0, rotate: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] } } }}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Cheksiz yo'l: siljish tezligiga qarab tezlashadi va yo'nalishini o'zgartiradi */
export function Marquee({ items, className = '' }) {
  const reduce = useReducedMotion()
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useVelocity(scrollY)
  const smooth = useSpring(vel, { damping: 50, stiffness: 400 })
  const boost = useTransform(smooth, [-1500, 0, 1500], [-4, 0, 4], { clamp: false })
  const dir = useRef(1)
  const x = useTransform(base, (v) => `${(((v % 50) + 50) % 50) - 50}%`)
  useAnimationFrame((_, delta) => {
    if (reduce) return
    const b = boost.get()
    if (b < -0.05) dir.current = -1
    else if (b > 0.05) dir.current = 1
    base.set(base.get() - dir.current * (1.2 + Math.abs(b)) * (delta / 1000) * -4)
  })
  const row = items.concat(items)
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <motion.div style={{ x }} className="inline-flex w-max">
        {[0, 1].map((k) => (
          <span key={k} className="inline-flex">
            {row.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-8 pr-8">{t}<span className="w-2 h-2 rounded-full bg-current opacity-60" /></span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/** Siljitganda kichik kartadan butun enli bo'limga kengayadi */
export function ScaleReveal({ children, className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  const radius = useTransform(scrollYProgress, [0, 1], [48, 0])
  return (
    <div ref={ref}>
      <motion.div style={reduce ? undefined : { scale, borderRadius: radius }} className={className}>{children}</motion.div>
    </div>
  )
}

/** Yopishib turadigan (sticky) hikoya: siljitgan sari yillar va rasm almashadi */
export function PinnedTimeline({ entries, images }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const n = entries.length
  const [p, setP] = useState(0)
  useEffect(() => {
    const f = () => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight))))
    }
    f()
    window.addEventListener('scroll', f, { passive: true })
    window.addEventListener('resize', f)
    return () => { window.removeEventListener('scroll', f); window.removeEventListener('resize', f) }
  }, [])
  const idx = Math.min(n - 1, Math.floor(p * n * 0.999))
  if (!n) return null
  const e = entries[idx]
  const img = images[idx % images.length]
  return (
    <div ref={ref} style={{ height: reduce ? 'auto' : `${n * 70 + 40}vh` }} className="relative">
      <div className={reduce ? '' : 'sticky top-0 h-screen overflow-hidden'}>
        <div className="h-full grid gap-8 lg:grid-cols-2 items-center px-[5vw] py-20">
          <div className="relative z-10">
            <div className="h-1.5 w-40 rounded-full bg-surface overflow-hidden mb-8"><div style={{ width: `${p * 100}%` }} className="h-full bg-accent transition-[width] duration-150" /></div>
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}>
                <p className="display text-[clamp(4.5rem,2rem+12vw,11rem)] m-0 text-accent-strong leading-none">{e.year}</p>
                <p className="mt-4 mb-0 text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold max-w-[26ch]">{e.text}</p>
              </motion.div>
            </AnimatePresence>
            <ul className="list-none p-0 m-0 mt-8 flex gap-2 flex-wrap" aria-hidden="true">
              {entries.map((_, i) => <li key={i} className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'w-10 bg-accent' : 'w-2 bg-surface'}`} />)}
            </ul>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-[4/5] max-h-[60vh] lg:max-h-[70vh] w-full justify-self-center rounded-3xl overflow-hidden bg-surface">
            <AnimatePresence mode="popLayout">
              <motion.img key={img} src={media(img)} alt="" initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }} className="absolute inset-0 w-full h-full object-cover" />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Pastga siljitganda rasmlar yonga qarab suriladi (pinned horizontal scroll) */
export function HorizontalGallery({ items }) {
  const ref = useRef(null)
  const track = useRef(null)
  const reduce = useReducedMotion()
  const [dist, setDist] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist])
  useLayoutEffect(() => {
    const m = () => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth))
    m()
    window.addEventListener('resize', m)
    const t = setTimeout(m, 600)
    return () => { window.removeEventListener('resize', m); clearTimeout(t) }
  }, [items.length])
  useEffect(() => { const t = setTimeout(() => track.current && setDist(Math.max(0, track.current.scrollWidth - window.innerWidth)), 1200); return () => clearTimeout(t) }, [])

  if (reduce) {
    return <div className="px-[5vw] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((it, i) => <img key={i} src={media(it.src)} alt={it.caption || ''} className="w-full rounded-2xl aspect-[4/3] object-cover" />)}</div>
  }
  return (
    <div ref={ref} style={{ height: `${Math.max(dist * 0.8 + window.innerHeight, window.innerHeight * 1.8)}px` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div ref={track} style={{ x }} className="flex gap-5 px-[5vw] w-max">
          {items.map((it, i) => (
            <figure key={i} className="m-0 shrink-0 w-[78vw] sm:w-[52vw] lg:w-[34vw] relative">
              <img src={media(it.src)} alt={it.caption || ''} loading="lazy" draggable={false} className="w-full h-[56vh] lg:h-[62vh] object-cover rounded-3xl" />
              <figcaption className="absolute left-3 bottom-3 pill !bg-white/90 !text-[#066260] max-w-[calc(100%-1.5rem)] truncate">{it.caption}</figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/** Sichqoncha harakatiga mos siljiydigan va og'adigan qatlam */
export function useMouseParallax() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 16 })
  const sy = useSpring(my, { stiffness: 80, damping: 16 })
  useEffect(() => {
    const move = (e) => { mx.set(e.clientX / innerWidth - 0.5); my.set(e.clientY / innerHeight - 0.5) }
    const orient = (e) => { if (e.gamma != null) { mx.set(Math.max(-0.5, Math.min(0.5, e.gamma / 60))); my.set(Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 90))) } }
    window.addEventListener('pointermove', move)
    window.addEventListener('deviceorientation', orient)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('deviceorientation', orient) }
  }, [mx, my])
  return { sx, sy }
}

export function MouseLayer({ depth = 30, tilt = 0, className = '', children, style }) {
  const { sx, sy } = useMouseParallax()
  const x = useTransform(sx, (v) => v * depth)
  const y = useTransform(sy, (v) => v * depth)
  const rotateY = useTransform(sx, (v) => v * tilt)
  const rotateX = useTransform(sy, (v) => -v * tilt)
  return <motion.div className={className} style={{ x, y, rotateX, rotateY, transformPerspective: 900, ...style }}>{children}</motion.div>
}
