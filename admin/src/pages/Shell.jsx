import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, BookOpen, Library, Quote, Images, Video, Link2, ExternalLink, LogOut, MoreHorizontal, X } from 'lucide-react'
import { token, setToken, SITE_URL } from '../api.js'
import { resources } from './resources.js'
import { haptic } from '../tg.js'

const ICONS = { hikoyalar: BookOpen, asarlar: Library, iqtiboslar: Quote, galereya: Images, videolar: Video, manbalar: Link2 }
const TABS = ['hikoyalar', 'asarlar', 'iqtiboslar'] // pastki panelda; qolgani «Yana» ichida

export default function Shell() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [more, setMore] = useState(false)
  useEffect(() => setMore(false), [pathname])
  if (!token()) return <Navigate to="/login" replace />

  const side = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl no-underline font-semibold ${isActive ? 'bg-accent text-accent-ink' : 'text-ink hover:bg-surface'}`
  const tab = ({ isActive }) => `tab ${isActive ? 'tab-on' : ''}`
  const sheetItem = ({ isActive }) => `sheet-item ${isActive ? 'sheet-on' : ''}`
  const rest = Object.keys(resources).filter((k) => !TABS.includes(k))
  const logout = () => { setToken(null); nav('/login') }

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Kompyuter: chap panel */}
      <aside className="hidden lg:block bg-card p-4 min-h-screen sticky top-0 h-screen overflow-auto">
        <p className="display text-2xl m-0 mb-5 px-2">Qahhor Admin</p>
        <nav className="grid gap-1" aria-label="Admin bo'limlari">
          <NavLink end to="/" className={side}><LayoutDashboard size={20} />Boshqaruv</NavLink>
          <NavLink to="/sayt" className={side}><FileText size={20} />Bosh sahifa va biografiya</NavLink>
          {Object.entries(resources).map(([k, r]) => {
            const Icon = ICONS[k] || FileText
            return <NavLink key={k} to={`/${k}`} className={side}><Icon size={20} />{r.label}</NavLink>
          })}
        </nav>
        <div className="grid gap-2 mt-6">
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="btn btn-quiet"><ExternalLink size={18} />Saytni ochish</a>
          <button className="btn btn-quiet" onClick={logout}><LogOut size={18} />Chiqish</button>
        </div>
      </aside>

      <main className="main-pad min-w-0"><Outlet /></main>

      {/* Telefon: pastki panel */}
      <nav className="tabbar lg:hidden" aria-label="Asosiy bo'limlar" onClick={() => haptic('light')}>
        <NavLink end to="/" className={tab}><LayoutDashboard size={22} /><span>Boshqaruv</span></NavLink>
        {TABS.map((k) => {
          const Icon = ICONS[k]
          return <NavLink key={k} to={`/${k}`} className={tab}><Icon size={22} /><span>{resources[k].label}</span></NavLink>
        })}
        <button className={`tab ${more ? 'tab-on' : ''}`} onClick={() => setMore(true)} aria-label="Yana"><MoreHorizontal size={22} /><span>Yana</span></button>
      </nav>

      {more && (
        <div className="sheet-wrap lg:hidden" role="dialog" aria-modal="true" aria-label="Yana bo'limlar">
          <button className="sheet-back" aria-label="Yopish" onClick={() => setMore(false)} />
          <div className="sheet">
            <div className="flex items-center justify-between mb-2">
              <span className="display text-xl">Yana</span>
              <button className="icon-btn" onClick={() => setMore(false)} aria-label="Yopish"><X size={20} /></button>
            </div>
            <NavLink to="/sayt" className={sheetItem}><FileText size={22} />Bosh sahifa va biografiya</NavLink>
            {rest.map((k) => {
              const Icon = ICONS[k] || FileText
              return <NavLink key={k} to={`/${k}`} className={sheetItem}><Icon size={22} />{resources[k].label}</NavLink>
            })}
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="sheet-item"><ExternalLink size={22} />Saytni ochish</a>
            <button className="sheet-item text-red-500" onClick={logout}><LogOut size={22} />Chiqish</button>
          </div>
        </div>
      )}
    </div>
  )
}
