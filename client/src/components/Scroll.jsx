import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, animate } from 'motion/react'

/** Sahifa tepasidagi o'qish/siljish progress chizig'i */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 })
  return <motion.div aria-hidden="true" style={{ scaleX, transformOrigin: '0 50%' }} className="fixed top-0 inset-x-0 h-1.5 bg-mint z-[70]" />
}

/** Rasm: konteyner ichida sekin siljiydi (parallax) */
export function ParallaxImg({ src, alt = '', className = '', speed = 40, ...rest }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed])
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={reduce ? undefined : { y, scale: 1.2 }}
        className="w-full h-full object-cover block"
        {...rest}
      />
    </div>
  )
}

/** Har qanday blokni siljitish paytida yuqoriga/pastga suradi */
export function Drift({ children, from = 30, to = -30, className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [from, to])
  return <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>{children}</motion.div>
}

/** Raqam ko'rinishga kirganda 0 dan sanaladi */
export function CountUp({ value, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const n = Number(value)
  const countable = Number.isFinite(n) && n < 1000 && n >= 0
  const [shown, setShown] = useState(countable && !reduce ? 0 : value)
  useEffect(() => {
    if (!inView || !countable || reduce) return setShown(value)
    const c = animate(0, n, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    return () => c.stop()
  }, [inView, value, n, countable, reduce])
  return <span ref={ref} className={className}>{shown}</span>
}

function Word({ w, i, total, progress }) {
  const start = (i / total) * 0.75
  const opacity = useTransform(progress, [start, start + 0.25], [0.18, 1])
  return <motion.span style={{ opacity }}>{w} </motion.span>
}

/** Iqtibos so'zma-so'z siljish bilan yorishadi */
export function WordsReveal({ text, className = '', as: Tag = 'p' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.35'] })
  const words = text.split(/\s+/)
  if (reduce) return <Tag className={className}>{text}</Tag>
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => <Word key={i} w={w} i={i} total={words.length} progress={scrollYProgress} />)}
    </Tag>
  )
}
