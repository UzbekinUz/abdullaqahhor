import { useEffect } from 'react'

// Telegram Mini App yordamchilari. Oddiy brauzerda hammasi jim ishlamaydi (xato bermaydi).
export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
export const inTelegram = !!tg?.initData

export function initTelegram() {
  if (!tg) return
  try {
    tg.ready()
    tg.expand()
    tg.disableVerticalSwipes?.()
    const dark = tg.colorScheme === 'dark'
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    const bg = dark ? '#0b1a1a' : '#ffffff'
    tg.setHeaderColor?.(bg)
    tg.setBackgroundColor?.(bg)
    tg.setBottomBarColor?.(dark ? '#112b2b' : '#ffffff')
  } catch {}
}

export const haptic = (kind = 'light') => { try { tg?.HapticFeedback?.impactOccurred(kind) } catch {} }
export const hapticDone = (type = 'success') => { try { tg?.HapticFeedback?.notificationOccurred(type) } catch {} }

// Tasdiqlash oynasi: Telegram ichida o'zining dialogi, brauzerda confirm()
export function askConfirm(message) {
  return new Promise((resolve) => {
    if (tg?.showConfirm) tg.showConfirm(message, (ok) => resolve(!!ok))
    else resolve(window.confirm(message))
  })
}

// Telegram'ning "Orqaga" tugmasi (tepada), faol bo'lganda ko'rinadi
export function useBackButton(active, onBack) {
  useEffect(() => {
    const b = tg?.BackButton
    if (!b || !active) return
    b.show()
    b.onClick(onBack)
    return () => { b.offClick(onBack); b.hide() }
  }, [active, onBack])
}
