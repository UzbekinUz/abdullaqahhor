import { useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, BookOpen, Library, Quote, Images, Video, Link2, ExternalLink, LogOut, Menu, X } from 'lucide-react'
import { token, setToken, SITE_URL } from '../api.js'
import { resources } from './resources.js'

const ICONS = { hikoyalar: BookOpen, asarlar: Library, iqtiboslar: Quote, galereya: Images, videolar: Video, manbalar: Link2 }

export default function Shell() {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  if (!token()) return <Navigate to="/login" replace />
  const item = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl no-underline font-semibold ${isActive ? 'bg-accent text-accent-ink' : 'text-ink hover:bg-surface'}`
  const links = (
    <nav className="grid gap-1" aria-label="Admin bo'limlari" onClick={() => setOpen(false)}>
      <NavLink end to="/" className={item}><LayoutDashboard size={20} />Boshqaruv</NavLink>
      <NavLink to="/sayt" className={item}><FileText size={20} />Bosh sahifa va biografiya</NavLink>
      {Object.entries(resources).map(([k, r]) => {
        const Icon = ICONS[k] || FileText
        return <NavLink key={k} to={`/${k}`} className={item}><Icon size={20} />{r.label}</NavLink>
      })}
    </nav>
  )
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <header className="lg:hidden sticky top-0 z-30 bg-card px-4 py-3 flex items-center justify-between shadow-[0_1px_0_var(--line)]">
        <span className="display text-xl">Qahhor Admin</span>
        <button className="btn btn-quiet !p-2" onClick={() => setOpen(!open)} aria-label="Menyu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} lg:block bg-card p-4 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen overflow-auto`}>
        <p className="display text-2xl m-0 mb-5 hidden lg:block px-2">Qahhor Admin</p>
        {links}
        <div className="grid gap-2 mt-6">
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="btn btn-quiet"><ExternalLink size={18} />Saytni ochish</a>
          <button className="btn btn-quiet" onClick={() => { setToken(null); nav('/login') }}><LogOut size={18} />Chiqish</button>
        </div>
      </aside>
      <main className="p-5 md:p-10 min-w-0 pb-24"><Outlet /></main>
    </div>
  )
}
