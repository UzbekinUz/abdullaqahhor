import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Download, Share, X, MoreVertical } from 'lucide-react'

const Ctx = createContext(null)
export const useInstall = () => useContext(Ctx)
const KEY = 'installDismissedAt'
const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

/**
 * O'rnatish holati bitta joyda: tepadagi tugma, "Yana" paneli, footer va pastdagi karta
 * hammasi shu yerdan ishlaydi. "Keyinroq" bosilsa ham tugma yo'qolmaydi.
 */
export function InstallProvider({ children }) {
  const [evt, setEvt] = useState(null)
  const [installed, setInstalled] = useState(() => isStandalone())
  const [banner, setBanner] = useState(false)
  const [help, setHelp] = useState(false)
  const [hint, setHint] = useState(false)
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    if (installed) return
    const onPrompt = (e) => { e.preventDefault(); setEvt(e) }
    const onDone = () => { setInstalled(true); setBanner(false) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onDone)
    let timer
    try {
      if (Date.now() - (+localStorage.getItem(KEY) || 0) > 3 * 86400000) timer = setTimeout(() => setBanner(true), 2500)
    } catch { timer = setTimeout(() => setBanner(true), 2500) }
    return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onDone) }
  }, [installed])

  const later = useCallback(() => {
    setBanner(false)
    try { localStorage.setItem(KEY, String(Date.now())) } catch {}
    setHint(true)
    setTimeout(() => setHint(false), 6000)
  }, [])

  const install = useCallback(async () => {
    if (evt) {
      evt.prompt()
      const r = await evt.userChoice.catch(() => null)
      setEvt(null)
      if (r?.outcome === 'accepted') setBanner(false)
    } else {
      setHelp(true)
    }
  }, [evt])

  const value = useMemo(() => ({ installed, install, banner, later, ios, setHelp }), [installed, install, banner, later, ios])

  return (
    <Ctx.Provider value={value}>
      {children}
      <InstallBanner />
      <AnimatePresence>
        {hint && !installed && (
          <motion.div role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed z-[62] left-3 right-3 bottom-[5.25rem] lg:left-auto lg:right-6 lg:bottom-6 lg:w-[380px] rounded-2xl bg-deep text-white p-4 text-sm">
            Keyinroq o'rnatish uchun yuqori o'ng burchakdagi <b>«O'rnatish»</b> tugmasini (telefonda <b>«Yana»</b> menyusini) bosing.
          </motion.div>
        )}
        {help && (
          <motion.div className="fixed inset-0 z-[90] bg-black/50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHelp(false)}>
            <motion.div role="dialog" aria-label="Ilovani o'rnatish" className="card p-6 max-w-md w-full" initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="display text-2xl m-0">Ilovani o'rnatish</h2>
                <button className="border-0 bg-transparent cursor-pointer text-muted" onClick={() => setHelp(false)} aria-label="Yopish"><X /></button>
              </div>
              <ol className="mt-4 mb-0 pl-5 grid gap-2">
                {ios ? (
                  <>
                    <li>Safari'da pastdagi <Share size={16} className="inline -mt-1" /> «Ulashish» tugmasini bosing.</li>
                    <li>«Bosh ekranga qo'shish» ni tanlang.</li>
                  </>
                ) : (
                  <>
                    <li>Brauzer menyusini <MoreVertical size={16} className="inline -mt-1" /> oching.</li>
                    <li>«Ilovani o'rnatish» yoki «Bosh ekranga qo'shish» ni tanlang.</li>
                  </>
                )}
              </ol>
              <p className="text-sm text-muted mb-0 mt-4">Eslatma: bevosita o'rnatish tugmasi sayt HTTPS orqali (yoki build qilingan holda) ochilganda ishlaydi.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

/** Tepadagi doimiy "O'rnatish" tugmasi (o'rnatilgan bo'lsa ko'rinmaydi) */
export function InstallButton({ className = '', label = true }) {
  const { installed, install } = useInstall()
  if (installed) return null
  return (
    <button onClick={install} className={`btn !py-2 !px-3 sm:!px-4 !text-sm ${className}`} aria-label="Ilovani o'rnatish">
      <Download size={18} />{label && <span className="hidden sm:inline">O'rnatish</span>}
    </button>
  )
}

function InstallBanner() {
  const { installed, install, banner, later } = useInstall()
  return (
    <AnimatePresence>
      {banner && !installed && (
        <motion.div
          role="dialog" aria-label="Ilovani o'rnatish"
          className="fixed z-[60] left-3 right-3 bottom-[5.25rem] lg:left-auto lg:right-6 lg:bottom-6 lg:w-[380px] card p-4"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={(_, i) => { if (i.offset.y > 60) later() }}
        >
          <div className="flex items-start gap-3">
            <span className="icon-box"><Download size={22} /></span>
            <div className="flex-1">
              <p className="m-0 font-bold">Ilovani telefoningizga o'rnating</p>
              <p className="m-0 text-sm text-muted">Bosh ekrandan bir bosishda oching, internetsiz ham ishlaydi.</p>
            </div>
            <button onClick={later} aria-label="Yopish" className="border-0 bg-transparent cursor-pointer text-muted p-1"><X size={20} /></button>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn !py-2 flex-1" onClick={install}><Download size={18} />O'rnatish</button>
            <button className="btn btn-quiet !py-2" onClick={later}>Keyinroq</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
