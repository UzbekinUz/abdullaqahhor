import { useReducedMotion, useScroll, useTransform, motion } from 'motion/react'
import { BookOpen, Feather, Quote } from 'lucide-react'

const GLYPHS = [
  { t: 'Aa', x: '6%', y: '12%', s: 120, sp: 0.18, d: 14, r: -8 },
  { t: '“', x: '88%', y: '8%', s: 200, sp: -0.12, d: 18, r: 6 },
  { t: 'Q', x: '78%', y: '62%', s: 160, sp: 0.22, d: 16, r: 10 },
  { t: 'ʻ', x: '14%', y: '70%', s: 180, sp: -0.2, d: 20, r: -12 },
  { t: '”', x: '46%', y: '86%', s: 150, sp: 0.1, d: 15, r: 4 },
  { icon: BookOpen, x: '30%', y: '18%', s: 64, sp: -0.16, d: 12, r: -6 },
  { icon: Feather, x: '66%', y: '30%', s: 72, sp: 0.2, d: 13, r: 12 },
  { icon: Quote, x: '92%', y: '78%', s: 60, sp: -0.14, d: 17, r: -10 },
]

function Item({ g, tone }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, (v) => v * g.sp)
  const rot = useTransform(scrollY, (v) => g.r + v * 0.02)
  const color = tone === 'dark' ? 'rgba(94,224,210,0.10)' : 'rgba(10,126,122,0.07)'
  return (
    <motion.span aria-hidden="true" className="absolute select-none leading-none font-extrabold" style={{ left: g.x, top: g.y, y, rotate: rot, color, fontSize: g.s }}>
      <span className="block bg-drift" style={{ animationDuration: `${g.d}s`, '--dx': `${(g.sp > 0 ? 1 : -1) * 18}px`, '--dy': '-26px' }}>
        {g.icon ? <g.icon size={g.s} strokeWidth={1.4} /> : g.t}
      </span>
    </motion.span>
  )
}

/** Orqa fondagi suzuvchi harflar va belgilar: o'zi suzadi va siljitganda parallaks beradi */
export default function FloatingBg({ tone = 'light', className = '' }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {GLYPHS.map((g, i) => <Item key={i} g={g} tone={tone} />)}
    </div>
  )
}
