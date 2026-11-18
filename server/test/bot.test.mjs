// Telegram bot oqimlarini soxta Telegram API bilan sinaydi (token kerak emas).
// Ishlatish: MONGODB_URI=mongodb://127.0.0.1:27018/bot_test node test/bot.test.mjs
import 'dotenv/config'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import { createBot } from '../src/bot/index.js'
import { Admin, Quote, Story, Site, TgAuth } from '../src/models/index.js'

const uri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27018/bot_test'
await mongoose.connect(uri)
await mongoose.connection.dropDatabase()
await Admin.create({ username: 'tester', passwordHash: await bcrypt.hash('secret123', 8) })
await Site.create({ key: 'main', heroTitle: 'Old' })

const sent = []
const bot = createBot('1:TEST')
bot.botInfo = { id: 1, is_bot: true, first_name: 'T', username: 't', can_join_groups: true, can_read_all_group_messages: false, supports_inline_queries: false }
bot.api.config.use(async (_prev, method, payload) => {
  sent.push({ method, payload })
  if (method === 'getFile') return { ok: true, result: { file_id: 'f', file_path: 'photos/x.jpg' } }
  return { ok: true, result: { message_id: 1, date: 0, chat: { id: 7, type: 'private' }, text: 'ok' } }
})
globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new TextEncoder().encode('IMG').buffer, text: async () => 'Matn fayldan' })

let uid = 0
const base = () => ({ update_id: ++uid })
const from = { id: 99, is_bot: false, first_name: 'U' }
const chat = { id: 7, type: 'private' }
const say = (text, extra = {}) => bot.handleUpdate({ ...base(), message: { message_id: uid, date: 0, chat, from, text, ...(text?.startsWith('/') ? { entities: [{ type: 'bot_command', offset: 0, length: text.split(' ')[0].length }] } : {}), ...extra } })
const press = (data) => bot.handleUpdate({ ...base(), callback_query: { id: String(uid), from, chat_instance: 'c', data, message: { message_id: 1, date: 0, chat, text: 'x' } } })
const last = () => sent.filter((s) => ['sendMessage', 'editMessageText'].includes(s.method)).at(-1)?.payload.text || ''
const lastKb = () => JSON.stringify(sent.filter((s) => ['sendMessage', 'editMessageText'].includes(s.method)).at(-1)?.payload.reply_markup || '')

let n = 0
const ok = (name) => console.log(`✓ ${++n}. ${name}`)

// 1. Kirishsiz hech narsa ishlamaydi
await say('/menu'); assert.match(last(), /Avval kiring/); ok('kirishsiz /menu rad etiladi')
await press('m:stories'); assert.ok(sent.some((s) => s.method === 'answerCallbackQuery' && s.payload.show_alert)); ok('kirishsiz tugmalar rad etiladi')

// 2. Noto'g'ri parol
await say('/login'); assert.match(last(), /Login yozing/)
await say('tester'); assert.match(last(), /Parol/)
await say('wrong'); assert.match(last(), /noto'g'ri/); assert.ok(sent.some((s) => s.method === 'deleteMessage')); ok("noto'g'ri parol rad etiladi, parol xabari o'chiriladi")
assert.equal(await TgAuth.countDocuments(), 0)

// 3. To'g'ri kirish
await say('/login'); await say('tester'); await say('secret123'); assert.match(last(), /Kirdingiz/); assert.equal(await TgAuth.countDocuments(), 1); ok('to\'g\'ri login/parol bilan kirish')

// 4. Ro'yxat va yangi iqtibos sehrgari
await press('m:quotes'); assert.match(last(), /Iqtiboslar: jami 0/)
await press('n:quotes'); assert.match(last(), /Iqtibos/)
await say("Bu sinov iqtibosi"); assert.match(last(), /Manba/)
await say('Sinov manbasi'); assert.match(last(), /Saqlandi|Iqtibos/); assert.equal(await Quote.countDocuments(), 1); ok('iqtibos qo\'shish (sehrgar)')

// 5. Hikoya: matn + rasm + audio
await press('n:stories'); await say('Sinov hikoyasi')
await press('skip'); await press('skip'); await press('skip') // janr, yil, mavzu
await say('Birinchi abzats.\n\nIkkinchi abzats.') // matn
await say(undefined, { photo: [{ file_id: 'a', width: 1, height: 1 }, { file_id: 'b', width: 9, height: 9 }] }) // muqova
await press('skip') // audio
const story = await Story.findOne({ title: 'Sinov hikoyasi' })
assert.ok(story); assert.match(story.cover, /^\/uploads\/.+\.jpg$/); assert.match(story.body, /Ikkinchi/); ok('hikoya: matn + rasm bilan qo\'shildi')
fs.rmSync(`./${story.cover.slice(1)}`.replace('./uploads', 'uploads'), { force: true })

// 6. Audio tahrirlash
await press(`e:stories:${story._id}:audioUrl`); assert.match(last(), /Audio/)
await say(undefined, { audio: { file_id: 'au', duration: 1, file_name: 'x.mp3' } })
const s2 = await Story.findById(story._id); assert.match(s2.audioUrl, /^\/uploads\/.+\.mp3$/); ok('hikoyaga audio biriktirish')
fs.rmSync(s2.audioUrl.slice(1), { force: true })

// 7. Yashirish / ko'rsatish
await press(`p:stories:${story._id}`); assert.equal((await Story.findById(story._id)).published, false)
await press(`p:stories:${story._id}`); assert.equal((await Story.findById(story._id)).published, true); ok("yashirish/ko'rsatish")

// 8. Maydonni tahrirlash
await press(`e:stories:${story._id}:title`); await say('Yangi nom'); assert.equal((await Story.findById(story._id)).title, 'Yangi nom'); ok('sarlavhani tahrirlash')

// 9. O'chirish tasdiq bilan
await press(`d:stories:${story._id}`); assert.match(last(), /o'chirilsinmi/); assert.equal(await Story.countDocuments(), 1)
await press(`D:stories:${story._id}`); assert.equal(await Story.countDocuments(), 0); ok("o'chirish (tasdiq bilan)")

// 10. Sayt matni va yillar jadvali
await press('site'); assert.match(last(), /Bosh sahifa va biografiya/)
await press('sf:heroTitle'); await say('Yangi sarlavha'); assert.equal((await Site.findOne({ key: 'main' })).heroTitle, 'Yangi sarlavha')
await press('st'); await say('1951'); await say('Roman chiqdi'); assert.equal((await Site.findOne({ key: 'main' })).timeline.length, 1)
await press('sb'); await say('Bo\'lim'); await say('Matn'); assert.equal((await Site.findOne({ key: 'main' })).biography.length, 1); ok('sayt matni, yillar jadvali, biografiya bo\'limi')

// 11. Statistika va chiqish
await say('/stats'); assert.match(last(), /Statistika/); ok('statistika')
await say('/logout'); assert.equal(await TgAuth.countDocuments(), 0)
await say('/menu'); assert.match(last(), /Avval kiring/); ok('chiqishdan keyin yana rad etiladi')

// 12. Qulflash: 5 ta xato urinish
for (let i = 0; i < 5; i++) { await say('/login'); await say('tester'); await say('bad' + i) }
assert.match(last(), /bloklandi/); await say('/login'); assert.match(last(), /Juda ko'p urinish/); ok('5 xato urinishdan keyin bloklash')

await mongoose.connection.dropDatabase()
await mongoose.disconnect()
console.log(`\nHammasi o'tdi: ${n} ta tekshiruv`)
