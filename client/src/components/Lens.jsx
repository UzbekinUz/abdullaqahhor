import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { ZoomIn } from 'lucide-react'

const Ctx = createContext({ active: false, toggle() {} })
export const useLens = () => useContext(Ctx)

export function LensProvider({ children }) {
  const [active, setActive] = useState(false)
  return <Ctx.Provider value={{ active, toggle: () => setActive((a) => !a), off: () => setActive(false) }}>{children}<Lens /></Ctx.Provider>
}

/** Sichqoncha (yoki barmoq) o'rniga lupa: ostidagi matn va rasm kattalashib ko'rinadi */
export function LensToggle({ className = '' }) {
  const { active, toggle } = useLens()
  return (
    <button onClick={toggle} aria-pressed={active} aria-label="Lupa rejimi"
      className={`btn !py-2 !px-3 ${active ? '' : 'btn-quiet'} ${className}`}>
      <ZoomIn size={18} /><span className="hidden xl:inline">{active ? 'Lupa yoqilgan' : 'Lupa'}</span>
    </button>
  )
}

const D = 210   // lupa diametri
const Z = 2.4   // kattalashtirish

function Lens() {
  const { active, off } = useLens()
  const wrap = useRef(null)
  const inner = useRef(null)
  const cloneRef = useRef(null)
  const pos = useRef({ x: -999, y: -999, touch: false })
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!active) { document.documentElement.classList.remove('lens-on'); setShown(false); return }
    document.documentElement.classList.add('lens-on')
    const root = document.getElementById('root')
    let raf = 0, rebuildTimer = 0

    const build = () => {
      if (!inner.current || !root) return
      const clone = root.cloneNode(true)
      clone.removeAttribute('id')
      clone.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'))
      clone.querySelectorAll('script,audio,video,iframe,.fixed,[data-lens-skip]').forEach((e) => e.remove())
      clone.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; i.removeAttribute('srcset') })
      clone.querySelectorAll('input,button,a,select,textarea').forEach((e) => { e.tabIndex = -1 })
      clone.setAttribute('inert', '')
      clone.setAttribute('aria-hidden', 'true')
      clone.style.cssText = `position:absolute;left:0;top:0;width:${root.getBoundingClientRect().width}px;pointer-events:none;`
      cloneRef.current = clone
      inner.current.replaceChildren(clone)
      layout()
    }
    const layout = () => {
      raf = 0
      const { x, y, touch } = pos.current
      const cy = touch ? y - D * 0.75 : y
      if (!wrap.current || !inner.current) return
      wrap.current.style.transform = `translate(${x - D / 2}px, ${cy - D / 2}px)`
      inner.current.style.transform = `translate(${D / 2 - x * Z}px, ${D / 2 - cy * Z}px) scale(${Z})`
      if (cloneRef.current) cloneRef.current.style.transform = `translateY(${-window.scrollY}px)`
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(layout) }
    const scheduleRebuild = () => { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(build, 220) }

    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' }
      setShown(true); schedule()
    }
    const scroll = () => { schedule(); scheduleRebuild() }
    const key = (e) => { if (e.key === 'Escape') off() }

    build()
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', move, { passive: true })
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', build)
    window.addEventListener('keydown', key)
    const mo = new MutationObserver(scheduleRebuild)
    mo.observe(root, { childList: true, subtree: true, characterData: true })
    return () => {
      cancelAnimationFrame(raf); clearTimeout(rebuildTimer); mo.disconnect()
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', move)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', build); window.removeEventListener('keydown', key)
      document.documentElement.classList.remove('lens-on')
    }
  }, [active, off])

  if (!active) return null
  return (
    <div ref={wrap} aria-hidden="true" data-lens
      style={{ width: D, height: D, opacity: shown ? 1 : 0, transition: 'opacity .2s' }}
      className="fixed left-0 top-0 z-[200] pointer-events-none">
      <div className="absolute inset-0 rounded-full overflow-hidden border-[5px] border-mint bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <div ref={inner} className="absolute left-0 top-0 origin-top-left overflow-hidden" style={{ width: "100vw", height: "100vh" }} />
      </div>
      {/* lupa dastasi */}
      <span className="absolute -right-5 -bottom-5 w-14 h-3.5 rounded-full bg-mint origin-left rotate-45 translate-x-[-6px]" style={{ left: '82%', top: '82%' }} />
    </div>
  )
}
