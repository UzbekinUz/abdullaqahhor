import { Story, Work, Quote, GalleryItem, Source, Video } from '../models/index.js'

// Bot bo'limlari: admin paneldagi bo'limlar bilan bir xil maydonlar.
// type: text | textarea | number | image | audio | video | bool
export const RES = {
  stories: {
    label: '📚 Hikoyalar', Model: Story, title: 'title',
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'text', required: true },
      { name: 'kind', label: 'Janr (Hikoya, Qissa...)', type: 'text' },
      { name: 'year', label: 'Yil', type: 'text' },
      { name: 'excerpt', label: 'Qisqa mavzu (bir gap)', type: 'text' },
      { name: 'body', label: "Matn (xabar yoki .txt fayl sifatida yuboring, abzatslar bo'sh qator bilan)", type: 'textarea' },
      { name: 'cover', label: 'Muqova rasmi', type: 'image' },
      { name: 'audioUrl', label: 'Audio (mp3/voice yuboring)', type: 'audio' },
      { name: 'published', label: "Saytda ko'rsatilsin", type: 'bool' },
      { name: 'order', label: 'Tartib raqami', type: 'number' },
    ],
  },
  works: {
    label: '📖 Asarlari', Model: Work, title: 'title',
    fields: [
      { name: 'title', label: 'Nomi', type: 'text', required: true },
      { name: 'kind', label: 'Janr', type: 'text' },
      { name: 'year', label: 'Yil', type: 'text' },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
      { name: 'cover', label: 'Muqova rasmi', type: 'image' },
      { name: 'audioUrl', label: 'Audio (mp3/voice yuboring)', type: 'audio' },
      { name: 'order', label: 'Tartib raqami', type: 'number' },
    ],
  },
  quotes: {
    label: '💬 Iqtiboslar', Model: Quote, title: 'text',
    fields: [
      { name: 'text', label: 'Iqtibos', type: 'textarea', required: true },
      { name: 'source', label: 'Manba', type: 'text' },
      { name: 'order', label: 'Tartib raqami', type: 'number' },
    ],
  },
  gallery: {
    label: '🖼 Galereya', Model: GalleryItem, title: 'caption',
    fields: [
      { name: 'url', label: 'Rasm (yuboring)', type: 'image', required: true },
      { name: 'caption', label: 'Izoh', type: 'text' },
      { name: 'credit', label: 'Muallif / litsenziya', type: 'text' },
      { name: 'order', label: 'Tartib raqami', type: 'number' },
    ],
  },
  videos: {
    label: '🎬 Videolar', Model: Video, title: 'title',
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'text', required: true },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
      { name: 'url', label: 'YouTube havolasi yoki video fayl', type: 'video' },
      { name: 'thumbnail', label: 'Muqova rasmi', type: 'image' },
      { name: 'published', label: "Saytda ko'rsatilsin", type: 'bool' },
    ],
  },
  sources: {
    label: '🔗 Manbalar', Model: Source, title: 'title',
    fields: [
      { name: 'title', label: 'Nomi', type: 'text', required: true },
      { name: 'author', label: 'Muallif', type: 'text' },
      { name: 'url', label: 'Havola', type: 'text' },
      { name: 'note', label: 'Izoh', type: 'text' },
      { name: 'order', label: 'Tartib raqami', type: 'number' },
    ],
  },
}

// Bosh sahifa va biografiya (yagona hujjat) matn maydonlari
export const SITE_FIELDS = [
  { name: 'heroTitle', label: 'Bosh sarlavha' },
  { name: 'heroSubtitle', label: 'Bosh sahifadagi qisqa gap' },
  { name: 'bornDied', label: 'Yillari (1907 — 1968)' },
  { name: 'credits', label: 'Rasm mualliflari (pastki qism)' },
]
