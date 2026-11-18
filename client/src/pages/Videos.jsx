import { useApi, media } from '../api.js'
import Reveal, { PageHead } from '../components/Reveal.jsx'

function embed(url = '') {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null
}

export default function Videos() {
  const [videos, loading] = useApi('/videos', [])
  return (
    <>
      <PageHead title="Videolar">Adibga bag'ishlangan videolar.</PageHead>
      <ul className="list-none p-0 m-0 px-[5vw] grid gap-4 md:grid-cols-2">
        {videos.map((v, i) => {
          const e = embed(v.url)
          return (
            <Reveal as="li" key={v._id} delay={(i % 2) * 80} className="card overflow-hidden">
              {e ? (
                <iframe src={e} title={v.title} loading="lazy" allowFullScreen className="w-full aspect-video border-0" />
              ) : !v.url ? (
                <div className="relative">
                  <img src={media(v.thumbnail)} alt="" loading="lazy" className="w-full aspect-video object-cover" />
                  <span className="absolute left-4 bottom-4 pill !bg-mint !text-deep">Tez orada</span>
                </div>
              ) : (
                <video src={media(v.url)} poster={media(v.thumbnail)} controls preload="none" className="w-full aspect-video bg-surface" />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold m-0">{v.title}</h3>
                {v.description && <p className="text-muted mt-2 mb-0">{v.description}</p>}
              </div>
            </Reveal>
          )
        })}
        {!loading && !videos.length && <li className="text-muted md:col-span-2">Hozircha video yo'q.</li>}
      </ul>
    </>
  )
}
