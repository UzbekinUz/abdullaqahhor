import { useApi } from '../api.js'
import Reveal, { PageHead } from '../components/Reveal.jsx'

export default function Biography() {
  const [site] = useApi('/site', {})
  return (
    <>
      <PageHead title="Biografiya">{site?.bornDied}</PageHead>
      <section className="px-[5vw] grid gap-10 lg:grid-cols-[1.4fr_1fr] items-start">
        <div className="grid gap-4">
          {(site?.biography || []).map((b, i) => (
            <Reveal key={i} className="card p-7">
              <h2 className="display text-2xl m-0 mb-4">{b.heading}</h2>
              <div className="prose-read">{(b.text || '').split(/\n\s*\n/).map((p, j) => <p key={j}>{p}</p>)}</div>
            </Reveal>
          ))}
        </div>
        <aside className="card p-7 lg:sticky lg:top-24">
          <h2 className="display text-2xl m-0 mb-5">Muhim voqealar</h2>
          <ol className="list-none p-0 m-0 grid gap-5">
            {(site?.timeline || []).map((t, i) => (
              <Reveal as="li" key={i} delay={i * 40} className="grid grid-cols-[4.5rem_1fr] gap-3 items-baseline">
                <span className="display text-2xl text-accent-strong">{t.year}</span>
                <span>{t.text}</span>
              </Reveal>
            ))}
          </ol>
        </aside>
      </section>
    </>
  )
}
