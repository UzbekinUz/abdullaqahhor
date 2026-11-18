import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { UPLOAD_DIR } from '../paths.js'

const EXT = { image: ['.jpg', '.jpeg', '.png', '.webp'], audio: ['.mp3', '.m4a', '.ogg', '.oga', '.wav', '.opus'], video: ['.mp4', '.mov', '.webm', '.mkv'] }

/** Telegram faylini yuklab olib server/uploads ga saqlaydi, "/uploads/xxx" qaytaradi */
export async function saveTelegramFile(api, token, fileId, kind, hintName = '') {
  const info = await api.getFile(fileId)
  if (!info.file_path) throw new Error('Fayl topilmadi')
  let ext = path.extname(info.file_path || hintName).toLowerCase()
  if (!EXT[kind]?.includes(ext)) ext = kind === 'image' ? '.jpg' : kind === 'audio' ? '.mp3' : '.mp4'
  const res = await fetch(`https://api.telegram.org/file/bot${token}/${info.file_path}`)
  if (!res.ok) throw new Error('Yuklab olishda xatolik')
  const name = crypto.randomBytes(8).toString('hex') + ext
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await res.arrayBuffer()))
  return `/uploads/${name}`
}

export async function readTelegramText(api, token, fileId) {
  const info = await api.getFile(fileId)
  const res = await fetch(`https://api.telegram.org/file/bot${token}/${info.file_path}`)
  if (!res.ok) throw new Error('Faylni o\'qib bo\'lmadi')
  return (await res.text()).replace(/\r\n/g, '\n').trim()
}
