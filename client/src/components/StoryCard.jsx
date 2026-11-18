import { Link } from 'react-router-dom'
import { ArrowRight, Headphones } from 'lucide-react'
import { media } from '../api.js'
import { PlayButton } from '../context/Audio.jsx'

export const FALLBACK_IMG = '/media/abdulla-qahhor-xaykali.jpg'

/** Rasmli hikoya kartasi: muqova, janr, mavzu va (audio bo'lsa) tinglash tugmasi */
export default function StoryCard({ s, className = '' }) {
  const track = s.audioUrl ? { src: s.audioUrl, title: s.title, cover: s.cover } : null
  return (
    <Link to={`/hikoyalar/${s._id}`} draggable={false} className={`group card no-underline text-ink overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <img src={media(s.cover) || FALLBACK_IMG} alt={s.title} loading="lazy" draggable={false} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="pill !bg-white/90 !text-[#066260]">{s.kind || 'Hikoya'}</span>
          {track && <span className="pill !bg-white/90 !text-[#066260]"><Headphones size={14} />Audio</span>}
        </div>
        {track && <PlayButton track={track} compact className="absolute right-3 bottom-3 !rounded-full shadow-lg" />}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="text-2xl font-extrabold m-0 tracking-tight">{s.title}</h3>
        {s.excerpt && <p className="m-0 text-muted flex-1">{s.excerpt}</p>}
        <span className="font-semibold text-accent-strong inline-flex items-center gap-1 mt-1">{track ? "O'qish yoki tinglash" : "O'qish"} <ArrowRight size={16} /></span>
      </div>
    </Link>
  )
}
