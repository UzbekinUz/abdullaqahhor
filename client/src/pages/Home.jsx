import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import {
  ArrowRight, BookOpen, BookUser, ChevronDown, Clock, Headphones, Images, Languages,
  Library, Quote, Search, ShieldCheck, Smartphone, Sparkles, Video, Wallet, ZoomIn,
} from 'lucide-react'
import { useApi, media } from '../api.js'
import Reveal from '../components/Reveal.jsx'
import Carousel from '../components/Carousel.jsx'
import StoryCard from '../components/StoryCard.jsx'
import FloatingBg from '../components/Backdrop.jsx'
import { CountUp, ParallaxImg, WordsReveal } from '../components/Scroll.jsx'
import { HorizontalGallery, MouseLayer, PinnedTimeline, ScaleReveal, SplitHeading } from '../components/ScrollFx.jsx'
import { PlayButton } from '../context/Audio.jsx'

const IMG = {
  a: '/media/abdulla-qahhor.jpg',
  b: '/media/abdulla-qahhor-xaykali.jpg',
  c: '/media/abdulla-qahhor-003.jpg',
  d: '/media/abdulla-qahhor-001.jpg',
  e: '/media/abdulla-qahhor-002.jpg',
  k: '/media/khudayar-khan-palace-kokand-01.jpg',
  bazaar: '/media/chorsu-bazaar-in-tashkent-4.jpg',
  village: '/media/children-in-uzbek-village.jpg',
  oldcity: '/media/tashkent-old-city.jpg',
  street: '/media/old-city-street-scene-tashkent-uzbekistan-7472128820.jpg',
}
const TIMELINE_IMGS = [IMG.k, IMG.village, IMG.oldcity, IMG.bazaar, IMG.street, IMG.e, IMG.a]
const FALLBACK_GALLERY = [IMG.b, IMG.d, IMG.a, IMG.k, IMG.bazaar, IMG.oldcity, IMG.village, IMG.street].map((src) => ({ src, caption: 'Abdulla Qahhor' }))
const H2 = 'display text-[clamp(1.9rem,1.2rem+2.6vw,3rem)] m-0'

const FEATURES = [
  [BookUser, 'Biografiya', "Asht qishlog'idan Toshkentgacha: hayot yo'li, yillar jadvali va muhim voqealar.", '/tarjimai-hol', "Biografiyani o'qish"],
  [BookOpen, "O'qishga qulay hikoyalar", "Katta harf, keng qator oralig'i, yorug' va qorong'i rejim: ko'z charchamasligi uchun.", '/hikoyalar', 'Hikoyalarni ochish'],
  [Headphones, 'Audio talqin', "Audio bor hikoya va asarlarni o'qish o'rniga tinglash mumkin: pleyer sahifa almashganda ham to'xtamaydi.", '/hikoyalar', 'Tinglash'],
  [ZoomIn, 'Lupa rejimi', "Tepadagi lupa tugmasini bosing: sichqoncha lupaga aylanadi va matnni kattalashtirib ko'rsatadi.", '/hikoyalar', "Sinab ko'rish"],
  [Images, 'Foto galereya', "Yodgorliklar, joylar va arxiv suratlari. Barmoq bilan surib ko'rish mumkin.", '/galereya', 'Galereyani ochish'],
  [Video, 'Videolar', "Adibga bag'ishlangan hujjatli va sun'iy intellekt yordamida tayyorlangan videolar.", '/videolar', "Videolarni ko'rish"],
]
const WHY = [
  [ShieldCheck, "Manbalar ko'rsatiladi", "Har bir ma'lumot va surat manbasi bilan beriladi."],
  [Wallet, 'Mutlaqo bepul', "Ro'yxatdan o'tish ham, to'lov ham shart emas."],
  [Smartphone, "Telefonga o'rnatiladi", "Ilova sifatida o'rnating, internetsiz ham ochiladi."],
  [Clock, 'Vaqtingizni tejaydi', "Hikoya, biografiya va iqtiboslar bir joyda, qidirish shart emas."],
  [Languages, "O'zbek tilida", "Butun sayt o'zbek tilida, matn o'qishga qulay shriftda."],
  [Sparkles, 'Doim yangilanadi', "Yangi hikoya, audio va videolar muntazam qo'shib boriladi."],
]
const STEPS = [
  ['Hikoyani tanlang', "Mashhur hikoyalardan birini oching yoki qidiruvdan foydalaning."],
  ['Harfni sozlang', "A+ va A− tugmalari bilan o'zingizga qulay o'lchamni tanlang."],
  ['Tinglang', "Audio bo'lsa, tinglash tugmasini bosing: pastda pleyer chiqadi."],
  ['Suring', "Telefonda chapga yoki o'ngga surib, keyingi hikoyaga o'ting."],
]
const FAQ = [
  ['Abdulla Qahhor kim?', "Abdulla Qahhor (1907–1968) o'zbek adabiyotining yirik yozuvchisi, hikoya janrining tengsiz ustasi. Hikoya, qissa, roman, drama va publitsistika janrlarida ijod qilgan, ko'pincha «o'zbek Chexovi» deb ataladi."],
  ['Qaysi asardan boshlash mumkin?', "Qisqa hikoyalardan: «O'g'ri», «Bemor», «Anor». Keyin «Sinchalak» qissasi va boshqa asarlarga o'ting."],
  ['Audio qanday ishlaydi?', "Audio bor hikoya yoki asarda «Tinglash» tugmasi ko'rinadi. Bosganingizda pastda pleyer ochiladi va boshqa sahifaga o'tsangiz ham davom etadi."],
  ['Lupa nima?', "Tepadagi lupa tugmasini bossangiz, sichqoncha (telefonda barmoq) lupaga aylanadi: doira ichidagi matn va suratlar kattalashib ko'rinadi. Chiqish uchun tugmani qayta bosing yoki Esc tugmasini bosing."],
  ["Hikoyalardagi suratlar kimniki?", "Suratlar Wikimedia Commons'dan, ochiq litsenziya bilan olingan va mavzuga mos umumiy tasvirlardir. Mualliflari «Foto galereya» bo'limida ko'rsatilgan."],
  ["Saytni telefonga o'rnatish mumkinmi?", "Ha. Tepadagi «O'rnatish» tugmasini (telefonda «Yana» menyusini) bosing yoki brauzer menyusidan «Bosh ekranga qo'shish» ni tanlang."],
]

function daysToBirthday() {
  const now = new Date()
  let t = new Date(now.getFullYear(), 8, 17)
  if (t < new Date(now.getFullYear(), now.getMonth(), now.getDate())) t = new Date(now.getFullYear() + 1, 8, 17)
  return Math.ceil((t - now) / 86400000)
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 text-left bg-transparent border-0 cursor-pointer p-5 font-semibold text-ink text-[1.0625rem]" aria-expanded={open} onClick={() => setOpen(!open)}>
        {q}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-accent-strong"><ChevronDown /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <p className="px-5 pb-5 m-0 text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  const nav = useNavigate()
  const [site] = useApi('/site', {})
  const [works] = useApi('/works', [])
  const [quotes] = useApi('/quotes', [])
  const [gallery] = useApi('/gallery', [])
  const [stories] = useApi('/stories', [])
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('')
  const reduce = useReducedMotion()
  const heroRef = useRef(null)
  const { scrollYProgress: hp } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(hp, [0, 1], [0, 90])
  const textY = useTransform(hp, [0, 1], [0, -60])
  const bio = site?.biography?.[0]
  const quote = quotes?.[0]
  const days = useMemo(daysToBirthday, [])
  const kinds = [...new Set(stories.map((s) => s.kind).filter(Boolean))]
  const search = (e) => { e.preventDefault(); nav(`/hikoyalar?${new URLSearchParams({ ...(q && { q }), ...(kind && { kind }) })}`) }
  const galleryItems = (gallery.length ? gallery.map((g) => ({ src: g.url, caption: g.caption })) : FALLBACK_GALLERY).slice(0, 8)

  return (
    <>
      {/* HERO */}
      <section ref={heroRef} className="relative bg-deep text-deep-ink px-[5vw] pt-14 pb-20 md:pb-28 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-center overflow-hidden">
        <FloatingBg tone="dark" />
        <motion.div className="relative z-10" style={reduce ? undefined : { y: textY }}>
          <h1 className="display text-[clamp(2.25rem,1.2rem+4.2vw,4.5rem)] m-0">
            Abdulla Qahhor<br /><span className="text-mint">hikoyalari va hayoti</span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg opacity-85 m-0">{site?.heroSubtitle}</p>
          <form onSubmit={search} className="mt-8 rounded-2xl bg-white/[0.07] p-4 max-w-xl" role="search">
            <label htmlFor="hq" className="!text-white/80">Hikoya yoki janr bo'yicha qidiring:</label>
            <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_9rem_auto]">
              <input id="hq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Masalan: Anor" className="!rounded-xl col-span-2 sm:col-span-1" />
              <select value={kind} onChange={(e) => setKind(e.target.value)} className="!rounded-xl" aria-label="Janr">
                <option value="">Barcha janr</option>
                {kinds.map((k) => <option key={k}>{k}</option>)}
              </select>
              <button className="btn btn-mint"><Search size={18} />Qidirish</button>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/hikoyalar" className="btn btn-mint">Hikoyalarni o'qish</Link>
            <Link to="/tarjimai-hol" className="btn btn-ghost">Biografiya</Link>
          </div>
        </motion.div>

        {/* Adib portreti: sichqoncha harakatiga mos qatlamlar */}
        <motion.div className="relative z-10 max-w-[32rem] mx-auto w-full pb-12 order-first lg:order-none" style={reduce ? undefined : { y: heroY }}>
          <MouseLayer depth={16} tilt={5}>
            <img src={IMG.a} alt="Abdulla Qahhor portreti" width="1200" height="1500" className="w-full aspect-[4/5] object-cover object-[50%_18%] rounded-3xl" />
          </MouseLayer>
          <MouseLayer depth={-38} tilt={-8} className="absolute -right-3 md:-right-10 top-10 w-[34%]">
            <img src={IMG.k} alt="Qo'qon, Xudoyorxon o'rdasi" className="w-full aspect-[4/5] object-cover rounded-2xl border-[6px] border-deep" />
          </MouseLayer>
          <MouseLayer depth={52} tilt={10} className="absolute -left-3 md:-left-10 bottom-32 w-[24%]">
            <img src={IMG.b} alt="Abdulla Qahhor haykali" className="w-full aspect-square object-cover rounded-full border-[6px] border-deep" />
          </MouseLayer>
          <MouseLayer depth={-24} tilt={6} className="absolute right-3 md:right-0 bottom-28 w-[22%]">
            <img src={IMG.bazaar} alt="Chorsu bozori" className="w-full aspect-square object-cover rounded-2xl border-[6px] border-deep" />
          </MouseLayer>
          <div className="absolute left-4 right-4 bottom-0 rounded-2xl bg-card text-ink p-4 flex items-center gap-4 shadow-[var(--shadow)]">
            <div className="shrink-0">
              <p className="m-0 font-extrabold text-lg leading-tight">Abdulla Qahhor</p>
              <p className="m-0 text-sm text-muted">{site?.bornDied || '1907 — 1968'}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="display text-4xl m-0 text-accent-strong leading-none"><CountUp value={days} /></p>
              <p className="m-0 text-xs font-bold tracking-wide text-accent-strong">KUN: TAVALLUDGACHA</p>
            </div>
          </div>
          <p className="mt-6 mb-0 text-center">
            <span className="inline-block rounded-xl bg-mint text-deep font-extrabold px-5 py-2 tracking-wide">1907–1968 · o'zbek adabiyoti</span>
          </p>
        </motion.div>
      </section>

      {/* Raqamlar: siljitganda kengayadi */}
      <ScaleReveal className="bg-deep text-white mt-16 md:mt-24 px-[5vw] py-14 md:py-20">
        <ul className="list-none p-0 m-0 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {[[stories.length, 'Hikoyalar'], [works.length, 'Asarlari'], [quotes.length, 'Iqtiboslar'], [gallery.length, 'Suratlar']].map(([n, l], i) => (
            <Reveal as="li" key={l} delay={i * 70}>
              <p className="display text-5xl md:text-7xl m-0 text-mint"><CountUp value={n} /></p>
              <p className="m-0 mt-1 opacity-85 font-medium">{l}</p>
            </Reveal>
          ))}
        </ul>
      </ScaleReveal>

      {/* Mashhur asarlari */}
      <section className="px-[5vw] pt-16 md:pt-24">
        <div className="flex items-end justify-between gap-4 mb-8">
          <SplitHeading text="Mashhur asarlari" className={H2} />
          <Link to="/hikoyalar" className="font-semibold text-accent-strong no-underline whitespace-nowrap inline-flex items-center gap-1">Barchasi <ArrowRight size={16} /></Link>
        </div>
        <Carousel label="Mashhur hikoyalar">
          {stories.slice(0, 8).map((s) => <div key={s._id} className="shrink-0 w-[82%] sm:w-[340px]"><StoryCard s={s} /></div>)}
        </Carousel>
      </section>

      {/* Hayot yo'li: sticky, siljitganda almashadi */}
      <section className="pt-16 md:pt-24">
        <div className="px-[5vw]"><SplitHeading text="Hayot yo'li" className={H2} /></div>
        <PinnedTimeline entries={site?.timeline || []} images={TIMELINE_IMGS} />
      </section>

      {/* Galereya: pastga siljitganda yonga suriladi */}
      <section className="pt-16 md:pt-24 bg-surface">
        <div className="px-[5vw] pb-6 flex items-end justify-between gap-4">
          <SplitHeading text="Foto galereya" className={H2} />
          <Link to="/galereya" className="font-semibold text-accent-strong no-underline whitespace-nowrap inline-flex items-center gap-1">Barchasi <ArrowRight size={16} /></Link>
        </div>
        <HorizontalGallery items={galleryItems} />
      </section>

      {/* Sayt nimalarni beradi */}
      <section className="relative overflow-hidden px-[5vw] pt-16 md:pt-24 pb-4">
        <FloatingBg tone="light" />
        <div className="relative z-10">
          <SplitHeading text="Sayt sizga nimalarni beradi" className={H2} />
          <Reveal delay={80}><p className="text-muted mt-3 max-w-[56ch]">Adib bilan tanishish uchun kerak bo'lgan hamma narsa: o'qish, tinglash, ko'rish va manbalar.</p></Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-10">
            {FEATURES.map(([Icon, title, text, to, cta], i) => (
              <Reveal key={title} delay={(i % 3) * 80}>
                <Link to={to} className="card no-underline text-ink p-6 h-full flex flex-col gap-3 transition-transform hover:-translate-y-1">
                  <span className="icon-box"><Icon size={22} /></span>
                  <h3 className="text-xl font-bold m-0">{title}</h3>
                  <p className="m-0 text-muted flex-1">{text}</p>
                  <span className="font-semibold text-accent-strong inline-flex items-center gap-1">{cta} <ArrowRight size={16} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Kitoblari */}
      <section className="px-[5vw] pt-16 md:pt-24">
        <div className="flex items-end justify-between gap-4 mb-8">
          <SplitHeading text="Kitoblari" className={H2} />
          <Link to="/asarlar" className="font-semibold text-accent-strong no-underline whitespace-nowrap inline-flex items-center gap-1">Barchasi <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {works.slice(0, 4).map((w, i) => {
            const track = w.audioUrl ? { src: w.audioUrl, title: w.title, cover: w.cover } : null
            return (
              <Reveal key={w._id} delay={i * 70} className="card overflow-hidden">
                <div className="relative">
                  <img src={media(w.cover) || IMG.b} alt={w.title} loading="lazy" className="w-full aspect-[4/3] object-cover" />
                  {track && <PlayButton track={track} compact className="absolute right-3 bottom-3 !rounded-full shadow-lg" />}
                </div>
                <div className="p-5">
                  <div className="flex gap-2 flex-wrap mb-2">{w.kind && <span className="pill">{w.kind}</span>}{w.year && <span className="pill">{w.year}</span>}</div>
                  <h3 className="text-xl font-extrabold m-0 tracking-tight">{w.title}</h3>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Iqtibos: siljitganda yorishadi */}
      <section className="mx-[5vw] mt-16 md:mt-24 rounded-3xl bg-deep text-deep-ink overflow-hidden grid md:grid-cols-[1fr_320px]">
        <div className="px-6 md:px-14 py-12 md:py-16">
          <Quote size={32} className="text-mint" />
          <WordsReveal as="blockquote" className="m-0 mt-5 display !font-bold text-[clamp(1.5rem,1rem+1.8vw,2.4rem)] max-w-[30ch]" text={quote ? `«${quote.text}»` : "Iqtibos shu yerda ko'rinadi."} />
          <p className="mt-5 mb-0 opacity-80">{quote?.source || 'Abdulla Qahhor'}</p>
          <Link to="/iqtiboslar" className="btn btn-mint mt-6">Barcha iqtiboslar</Link>
        </div>
        <img src={IMG.a} alt="Abdulla Qahhor haykali" loading="lazy" className="w-full h-full min-h-[260px] object-cover" />
      </section>

      {/* Biografiya */}
      <section className="px-[5vw] pt-16 md:pt-24 grid gap-10 lg:grid-cols-2 items-center">
        <Reveal>
          <h2 className={H2}>Biografiya</h2>
          <p className="mt-5 text-muted max-w-[52ch]">{bio?.text?.split('\n')[0]}</p>
          <Link to="/tarjimai-hol" className="btn mt-8">To'liq o'qish <ArrowRight size={18} /></Link>
        </Reveal>
        <Reveal delay={100}>
          <ParallaxImg src={IMG.k} alt="Qo'qon, Xudoyorxon o'rdasi" loading="lazy" speed={40} className="w-full aspect-[16/10] rounded-2xl" />
          <p className="small text-muted mt-3 m-0">Qo'qon, Xudoyorxon o'rdasi: adib tug'ilgan yurt</p>
        </Reveal>
      </section>

      {/* Qanday foydalanish */}
      <section className="px-[5vw] pt-16 md:pt-24">
        <SplitHeading text="Qanday foydalanish" className={H2} />
        <ol className="list-none p-0 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 70} className="card p-6">
              <span className="icon-box font-extrabold">{i + 1}</span>
              <h3 className="text-lg font-bold mt-4 mb-1">{t}</h3>
              <p className="m-0 text-muted">{d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Nega aynan shu sayt */}
      <section className="px-[5vw] pt-16 md:pt-24">
        <SplitHeading text="Nega aynan shu sayt" className={H2} />
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {WHY.map(([Icon, t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 70} className="flex gap-4">
              <span className="icon-box"><Icon size={22} /></span>
              <div><h3 className="font-bold text-lg m-0">{t}</h3><p className="m-0 mt-1 text-muted">{d}</p></div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Savol-javob */}
      <section className="relative overflow-hidden px-[5vw] pt-16 md:pt-24 pb-4 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <FloatingBg tone="light" />
        <div className="relative z-10"><SplitHeading text="Ko'p beriladigan savollar" className={H2} /></div>
        <div className="relative z-10 grid gap-3">{FAQ.map(([qq, a]) => <Faq key={qq} q={qq} a={a} />)}</div>
      </section>

      {/* CTA */}
      <section className="mx-[5vw] mt-16 md:mt-24 rounded-3xl bg-accent text-accent-ink px-6 md:px-14 py-12 md:py-16 flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="display text-[clamp(1.6rem,1rem+2vw,2.6rem)] m-0">Birinchi hikoyadan boshlang</p>
          <p className="m-0 mt-2 opacity-90">Ro'yxatdan o'tish shart emas, hammasi bepul.</p>
        </div>
        <Link to="/hikoyalar" className="btn btn-mint"><Library size={18} />Hikoyalarni ochish</Link>
      </section>
    </>
  )
}
