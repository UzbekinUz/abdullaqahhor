import { Headphones } from 'lucide-react'
import { useApi, media } from '../api.js'
import Reveal, { PageHead } from '../components/Reveal.jsx'
import { PlayButton } from '../context/Audio.jsx'

export default function Works() {
  const [works, loading] = useApi('/works', [])
  return (
    <>
      <PageHead title="Asarlari">Hikoya, qissa, roman va dramalar: audio bor asarlarni tinglash mumkin.</PageHead>
      <ul className="list-none p-0 m-0 px-[5vw] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((w, i) => {
          const track = w.audioUrl ? { src: w.audioUrl, title: w.title, cover: w.cover } : null
          return (
            <Reveal as="li" key={w._id} delay={(i % 3) * 70} className="card overflow-hidden flex flex-col">
              <div className="relative">
                {w.cover && <img src={media(w.cover)} alt={w.title} loading="lazy" className="w-full aspect-[3/2] object-cover" />}
                {track && <PlayButton track={track} compact className="absolute right-3 bottom-3 !rounded-full shadow-lg" />}
              </div>
              <div className="p-6 flex flex-col gap-2 flex-1">
                <div className="flex gap-2 flex-wrap">
                  {w.kind && <span className="pill">{w.kind}</span>}
                  {w.year && <span className="pill">{w.year}</span>}
                  {track && <span className="pill"><Headphones size={14} />Audio</span>}
                </div>
                <h3 className="text-2xl font-extrabold m-0 tracking-tight">{w.title}</h3>
                {w.description && <p className="m-0 text-muted">{w.description}</p>}
                {track && <PlayButton track={track} className="self-start mt-2" />}
              </div>
            </Reveal>
          )
        })}
        {!loading && !works.length && <li className="text-muted">Hozircha asar yo'q.</li>}
      </ul>
    </>
  )
}
