import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Home, BookOpen, Library, Quote, Menu, Sun, Moon, UserRound, Images, Video, Link2, X, Feather, Download } from 'lucide-react'
import { useApi } from '../api.js'
import { ScrollProgress } from './Scroll.jsx'
import { InstallButton, useInstall } from '../context/Install.jsx'
import { MiniPlayer } from '../context/Audio.jsx'
import { LensToggle } from './Lens.jsx'

export const NAV = [
  ['/tarjimai-hol', 'Biografiya'],
  ['/hikoyalar', 'Hikoyalar'],
  ['/asarlar', 'Asarlari'],
  ['/iqtiboslar', 'Iqtiboslar'],
  ['/galereya', 'Foto galereya'],
  ['/videolar', 'Videolar'],
  ['/manbalar', 'Manbalar'],
]
// Telefonda pastki panel: asosiy bo'limlar; qolganlari "Yana" ichida
const TABS = [['/', 'Bosh', Home], ['/hikoyalar', 'Hikoyalar', BookOpen], ['/asarlar', 'Asarlari', Library], ['/iqtiboslar', 'Iqtibos', Quote]]
const MORE = [['/tarjimai-hol', 'Biografiya', UserRound], ['/galereya', 'Foto galereya', Images], ['/videolar', 'Videolar', Video], ['/manbalar', 'Manbalar', Link2]]

function ThemeToggle({ className = '', withLabel = false }) {
  const [t, setT] = useState(() => document.documentElement.dataset.theme || 'light')
  const flip = () => {
    const n = t === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = n
    try { localStorage.setItem('theme', n) } catch {}
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', n === 'dark' ? '#071516' : '#0e2627')
    setT(n)
  }
  const Icon = t === 'dark' ? Sun : Moon
  return (
    <button onClick={flip} className={`btn btn-quiet !py-2 !px-3 ${className}`} aria-label="Yorug' yoki qorong'i rejim">
      <Icon size={18} />{withLabel && <span>{t === 'dark' ? "Yorug' rejim" : "Qorong'i rejim"}</span>}
    </button>
  )
}

function FooterInstall() {
  const { installed, install } = useInstall()
  if (installed) return null
  return <button className="btn btn-mint mt-8" onClick={install}><Download size={18} />Ilovani o'rnatish</button>
}

function MoreInstall() {
  const { installed, install } = useInstall()
  if (installed) return null
  return <button className="btn flex-1" onClick={install}><Download size={18} />O'rnatish</button>
}

export default function Layout() {
  const [more, setMore] = useState(false)
  const { pathname } = useLocation()
  const [site] = useApi('/site')
  useEffect(() => { setMore(false); window.scrollTo(0, 0) }, [pathname])
  const top = ({ isActive }) => `no-underline px-3 py-2 rounded-full font-medium ${isActive ? 'bg-mint-soft text-accent-strong' : 'text-ink hover:bg-surface'}`
  const moreActive = MORE.some(([to]) => pathname.startsWith(to))
  const tab = (active) => `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs no-underline border-0 bg-transparent cursor-pointer ${active ? 'text-accent-strong font-semibold' : 'text-muted'}`

  return (
    <>
      <ScrollProgress />
      <MiniPlayer />
      <div className="bg-mint-soft text-accent-strong text-center text-sm px-4 py-2 font-medium">
        Hikoyalarni o'qing va tinglang:{' '}
        <Link to="/hikoyalar" className="underline underline-offset-4">Hikoyalar bo'limiga o'tish</Link>
      </div>

      <header className="bg-card px-[5vw] py-3 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-[0_1px_0_var(--line)]">
        <Link to="/" className="no-underline text-ink flex items-center gap-3 whitespace-nowrap">
          <span className="w-10 h-10 rounded-xl bg-deep flex items-center justify-center"><Feather size={22} className="text-mint" /></span>
          <span className="display text-xl">Abdulla <span className="text-accent-strong">Qahhor</span></span>
        </Link>
        <nav className="hidden lg:flex gap-1 whitespace-nowrap text-[0.9375rem]" aria-label="Asosiy">
          {NAV.map(([to, label]) => <NavLink key={to} to={to} className={top}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <LensToggle />
          <InstallButton />
          <ThemeToggle />
        </div>
      </header>

      <motion.main key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}>
        <Outlet />
      </motion.main>

      <footer className="mt-24 bg-deep text-deep-ink px-[5vw] pt-16 pb-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="display text-3xl m-0">Abdulla Qahhor</p>
            <p className="mt-3 max-w-[36ch] opacity-80">Buyuk o'zbek yozuvchisi haqida: biografiya, hikoyalar, audio, iqtiboslar va suratlar bir joyda.</p>
          </div>
          <ul className="list-none p-0 m-0 grid gap-2 content-start">
            {NAV.slice(0, 4).map(([to, label]) => <li key={to}><Link to={to} className="no-underline text-deep-ink opacity-90 hover:opacity-100 hover:text-mint">{label}</Link></li>)}
          </ul>
          <ul className="list-none p-0 m-0 grid gap-2 content-start">
            {NAV.slice(4).map(([to, label]) => <li key={to}><Link to={to} className="no-underline text-deep-ink opacity-90 hover:opacity-100 hover:text-mint">{label}</Link></li>)}
          </ul>
        </div>
        <FooterInstall />
        <p className="small opacity-70 mt-12 mb-0 max-w-[70ch]">
          {site?.credits || 'Suratlar: Wikimedia Commons, CC BY-SA 4.0: Azizbek Karimov, Humoyun Mehridinov, Aza Olimjonovv, Bobyrr.'}
        </p>
      </footer>

      {/* Telefon: pastki navigatsiya, "Yana" paneli pastga surib yopiladi */}
      <AnimatePresence>
        {more && (
          <>
            <motion.div className="lg:hidden fixed inset-0 bg-black/40 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMore(false)} />
            <motion.div
              className="lg:hidden fixed inset-x-0 bottom-[4.25rem] z-50 bg-card rounded-t-3xl px-[5vw] pt-3 pb-6"
              role="dialog" aria-label="Boshqa bo'limlar"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, i) => { if (i.offset.y > 80 || i.velocity.y > 500) setMore(false) }}
            >
              <div className="mx-auto w-10 h-1.5 rounded-full bg-surface mb-4" aria-hidden="true" />
              <div className="grid grid-cols-2 gap-3">
                {MORE.map(([to, label, Icon]) => (
                  <NavLink key={to} to={to} className="card no-underline text-ink p-4 flex items-center gap-3">
                    <span className="icon-box"><Icon size={20} /></span><span className="font-semibold">{label}</span>
                  </NavLink>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <ThemeToggle withLabel className="flex-1" />
                <MoreInstall />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <nav aria-label="Pastki navigatsiya" className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-card flex px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--line),0_-8px_24px_rgba(14,38,39,0.06)]">
        {TABS.map(([to, label, Icon]) => (
          <NavLink key={to} end={to === '/'} to={to} className={({ isActive }) => tab(isActive)}>
            {({ isActive }) => (
              <>
                <span className={`px-4 py-1 rounded-full ${isActive ? 'bg-mint-soft' : ''}`}><Icon size={22} /></span>
                {label}
              </>
            )}
          </NavLink>
        ))}
        <button onClick={() => setMore(!more)} aria-expanded={more} className={tab(more || moreActive)}>
          <span className={`px-4 py-1 rounded-full ${more || moreActive ? 'bg-mint-soft' : ''}`}>{more ? <X size={22} /> : <Menu size={22} />}</span>
          Yana
        </button>
      </nav>
    </>
  )
}
