import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const opts = { timestamps: true };

export const Admin = model('Admin', new Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
}, opts));

export const Story = model('Story', new Schema({
  title: { type: String, required: true },
  year: String,
  kind: String, // Hikoya, Qissa...
  excerpt: String,
  body: { type: String, default: '' }, // bo'sh qator = yangi abzats
  cover: String,
  audioUrl: String, // faqat admin yuklaydi
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, opts));

export const Work = model('Work', new Schema({
  title: { type: String, required: true },
  year: String,
  kind: String, // roman, qissa, drama, tarjima...
  description: String,
  cover: String,
  audioUrl: String, // faqat admin yuklaydi
  order: { type: Number, default: 0 },
}, opts));

export const Quote = model('Quote', new Schema({
  text: { type: String, required: true },
  source: String,
  order: { type: Number, default: 0 },
}, opts));

export const GalleryItem = model('GalleryItem', new Schema({
  url: { type: String, required: true },
  caption: String,
  credit: String,
  order: { type: Number, default: 0 },
}, opts));

export const Source = model('Source', new Schema({
  title: { type: String, required: true },
  author: String,
  url: String,
  note: String,
  order: { type: Number, default: 0 },
}, opts));

export const Video = model('Video', new Schema({
  title: { type: String, required: true },
  description: String,
  url: String, // YouTube havolasi yoki yuklangan fayl
  thumbnail: String,
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, opts));

// Yagona hujjat: bosh sahifa va tarjimai hol
export const Site = model('Site', new Schema({
  key: { type: String, unique: true, default: 'main' },
  heroTitle: String,
  heroSubtitle: String,
  portrait: String,
  bornDied: String,
  biography: [{ heading: String, text: String }],
  timeline: [{ year: String, text: String }],
  credits: String,
}, opts));

// Telegram bot orqali kirgan adminlar (login/parol tekshirilgandan keyin)
export const TgAuth = model('TgAuth', new Schema({
  chatId: { type: String, unique: true, required: true },
  username: String,
  tgUser: String,
  expiresAt: Date,
}, opts));
