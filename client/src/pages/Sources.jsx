import { ExternalLink } from 'lucide-react'
import { useApi } from '../api.js'
import Reveal, { PageHead } from '../components/Reveal.jsx'

export default function Sources() {
  const [list, loading] = useApi('/sources', [])
  return (
    <>
      <PageHead title="Manbalar">Ma'lumot olingan kitoblar va saytlar.</PageHead>
      <ul className="list-none p-0 m-0 px-[5vw] grid gap-4 md:grid-cols-2">
        {list.map((s, i) => {
          const Tag = s.url ? 'a' : 'div'
          return (
            <Reveal as="li" key={s._id} delay={(i % 2) * 70}>
              <Tag {...(s.url ? { href: s.url, target: '_blank', rel: 'noreferrer' } : {})} className="card no-underline text-ink p-6 flex items-start gap-4 justify-between hover:-translate-y-1 transition-transform">
                <div>
                  <h3 className="text-xl font-bold m-0">{s.title}</h3>
                  <p className="m-0 mt-1 text-muted">{[s.author, s.note].filter(Boolean).join(' · ')}</p>
                </div>
                {s.url && <ExternalLink size={20} className="text-accent-strong shrink-0 mt-1" />}
              </Tag>
            </Reveal>
          )
        })}
        {!loading && !list.length && <li className="text-muted">Hozircha manba yo'q.</li>}
      </ul>
    </>
  )
}
