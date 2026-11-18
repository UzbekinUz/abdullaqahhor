import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { resources } from './resources.js'

export default function Overview() {
  const [counts, setCounts] = useState({})
  useEffect(() => {
    Object.entries(resources).forEach(([k, cfg]) =>
      api(`${cfg.api}?all=1`).then((l) => setCounts((c) => ({ ...c, [k]: l.length }))).catch(() => {}))
  }, [])
  return (
    <>
      <h1 className="display text-3xl md:text-4xl mt-0">Boshqaruv</h1>
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3 mt-6">
        {Object.entries(resources).map(([k, cfg]) => (
          <Link key={k} to={`/${k}`} className="card p-4 md:p-6 no-underline text-ink block hover:-translate-y-1 transition-transform">
            <span className="display text-4xl md:text-5xl block text-accent-strong">{counts[k] ?? '…'}</span>
            <span className="text-muted font-medium">{cfg.label}</span>
          </Link>
        ))}
      </div>
      <p className="text-muted mt-10 max-w-[56ch]">
        Hikoyaga audio va muqova rasmi qo'shish: «Hikoyalar» bo'limida hikoyani oching va fayl yuklang. Telegram botdan ham boshqarish mumkin: botga /app yuboring yoki pastdagi «Admin» tugmasini bosing.
      </p>
    </>
  )
}
