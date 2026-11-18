// Admin paneldagi bo'limlar: maydonlar o'zgartirilsa forma avtomatik o'zgaradi.
// type: text | textarea | number | checkbox | image | audio | video
const order = { name: 'order', label: 'Tartib raqami', type: 'number' }

export const resources = {
  hikoyalar: {
    api: '/stories', label: 'Hikoyalar', titleField: 'title',
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'text' },
      { name: 'year', label: 'Yil', type: 'text' },
      { name: 'kind', label: 'Janr (Hikoya, Qissa...)', type: 'text' },
      { name: 'excerpt', label: 'Qisqa mavzu (bir gap)', type: 'text' },
      { name: 'body', label: "Matn (abzatslar bo'sh qator bilan ajratiladi)", type: 'textarea', rows: 18 },
      { name: 'cover', label: 'Muqova rasmi', type: 'image' },
      { name: 'audioUrl', label: 'Audio (mp3)', type: 'audio' },
      { name: 'published', label: "Saytda ko'rsatilsin", type: 'checkbox' },
      order,
    ],
  },
  asarlar: {
    api: '/works', label: 'Asarlar', titleField: 'title',
    fields: [
      { name: 'title', label: 'Nomi', type: 'text' },
      { name: 'kind', label: 'Janr (roman, qissa...)', type: 'text' },
      { name: 'year', label: 'Yil', type: 'text' },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
      { name: 'cover', label: 'Muqova', type: 'image' },
      { name: 'audioUrl', label: 'Audio (mp3)', type: 'audio' },
      order,
    ],
  },
  iqtiboslar: {
    api: '/quotes', label: 'Iqtiboslar', titleField: 'text',
    fields: [
      { name: 'text', label: 'Iqtibos', type: 'textarea' },
      { name: 'source', label: 'Manba (asar nomi)', type: 'text' },
      order,
    ],
  },
  galereya: {
    api: '/gallery', label: 'Galereya', titleField: 'caption',
    fields: [
      { name: 'url', label: 'Rasm', type: 'image' },
      { name: 'caption', label: 'Izoh', type: 'text' },
      { name: 'credit', label: 'Muallif / litsenziya', type: 'text' },
      order,
    ],
  },
  videolar: {
    api: '/videos', label: 'Videolar', titleField: 'title',
    fields: [
      { name: 'title', label: 'Sarlavha', type: 'text' },
      { name: 'description', label: 'Tavsif', type: 'textarea' },
      { name: 'url', label: 'YouTube havolasi yoki yuklangan video', type: 'video' },
      { name: 'thumbnail', label: 'Muqova rasmi', type: 'image' },
      { name: 'published', label: "Saytda ko'rsatilsin", type: 'checkbox' },
      order,
    ],
  },
  manbalar: {
    api: '/sources', label: 'Manbalar', titleField: 'title',
    fields: [
      { name: 'title', label: 'Nomi', type: 'text' },
      { name: 'author', label: 'Muallif', type: 'text' },
      { name: 'url', label: 'Havola', type: 'text' },
      { name: 'note', label: 'Izoh', type: 'text' },
      order,
    ],
  },
}
