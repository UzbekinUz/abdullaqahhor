import { useEffect, useRef, useState, Children } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Surib o'tiladigan lenta: telefonda barmoq bilan (oddiy skroll + snap),
 * kompyuterda sichqoncha bilan tutib sudrash, strelkalar va klaviatura ham ishlaydi.
 */
export default function Carousel({ children, className = '', label = 'Lenta' }) {
  const box = useRef(null)
  const drag = useRef({ down: false, moved: false, x: 0, left: 0, id: null })
  const [dragging, setDragging] = useState(false)
  const [edge, setEdge] = useState({ start: true, end: false })

  const measure = () => {
    const el = box.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 })
  }
  useEffect(() => {
    measure()
    const el = box.current
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onDown = (e) => {
    if (e.pointerType === 'touch') return // barmoq: brauzerning o'z skrolli
    drag.current = { down: true, moved: false, x: e.clientX, left: box.current.scrollLeft, id: e.pointerId }
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d.down) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; setDragging(true); box.current.setPointerCapture?.(d.id) }
    if (d.moved) box.current.scrollLeft = d.left - dx
  }
  const end = () => {
    const d = drag.current
    if (!d.down) return
    d.down = false
    if (d.moved) setTimeout(() => { d.moved = false }, 0)
    setDragging(false)
  }
  const go = (dir) => box.current.scrollBy({ left: dir * box.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <div data-noswipe className={`relative ${className}`} role="region" aria-label={label}>
      <div
        ref={box} tabIndex={0}
        onScroll={measure}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}
        onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation() } }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }}
        className={`flex gap-4 overflow-x-auto -mx-[5vw] px-[5vw] pb-2 select-none snap-x snap-mandatory scroll-px-[5vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${dragging ? 'cursor-grabbing !snap-none' : 'cursor-grab'}`}
        style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
      >
        {Children.map(children, (c) => <div className="snap-start shrink-0 contents">{c}</div>)}
      </div>
      {!(edge.start && edge.end) && (
        <div className="hidden md:flex gap-2 mt-6">
          <button className="btn btn-quiet !p-3" disabled={edge.start} onClick={() => go(-1)} aria-label="Oldingisi"><ChevronLeft size={20} /></button>
          <button className="btn btn-quiet !p-3" disabled={edge.end} onClick={() => go(1)} aria-label="Keyingisi"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  )
}
