import { Quote } from 'lucide-react'
import { useApi } from '../api.js'
import Reveal, { PageHead } from '../components/Reveal.jsx'

export default function Quotes() {
  const [quotes, loading] = useApi('/quotes', [])
  return (
    <>
      <PageHead title="Iqtiboslar">Adibning eslab qolarli so'zlari.</PageHead>
      <ul className="list-none p-0 m-0 px-[5vw] grid gap-4 md:grid-cols-2">
        {quotes.map((q, i) => (
          <Reveal as="li" key={q._id} delay={(i % 2) * 80} className="card p-7 flex flex-col gap-4">
            <div className="flex items-center gap-3"><img src="/media/abdulla-qahhor.jpg" alt="" className="w-12 h-12 rounded-full object-cover" /><span className="icon-box"><Quote size={20} /></span></div>
            <blockquote className="m-0 text-[1.375rem] font-semibold leading-snug">«{q.text}»</blockquote>
            {q.source && <p className="m-0 text-muted small">{q.source}</p>}
          </Reveal>
        ))}
        {!loading && !quotes.length && <li className="text-muted">Hozircha iqtibos yo'q.</li>}
      </ul>
    </>
  )
}
