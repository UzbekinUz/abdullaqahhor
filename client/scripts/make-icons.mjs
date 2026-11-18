// PWA ikonkalarini (PNG) paketsiz chizadi: "Q" monogrammasi.
// Ishlatish: node scripts/make-icons.mjs <chiqish papkasi> <fon> <belgi rangi>
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const [outDir = 'public/icons', bgHex = '#0e2627', fgHex = '#5ee0d2'] = process.argv.slice(2)
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const BG = rgb(bgHex), FG = rgb(fgHex)

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y)
      const o = y * (size * 4 + 1) + 1 + x * 4
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

// Shakl: 0..1 koordinatalarda "Q"
function inShape(u, v, scale) {
  // scale: belgi hajmi (maskable uchun kichikroq)
  const cx = 0.5, cy = 0.5
  const x = (u - cx) / scale, y = (v - cy) / scale
  const d = Math.hypot(x, y)
  const ring = d <= 0.34 && d >= 0.21
  // dum: diagonal chiziq
  const ax = 0.12, ay = 0.12, bx = 0.40, by = 0.40
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)))
  const dist = Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay)))
  return ring || dist <= 0.055
}
function roundedRect(u, v, r) {
  const x = Math.abs(u - 0.5) - (0.5 - r), y = Math.abs(v - 0.5) - (0.5 - r)
  return Math.hypot(Math.max(x, 0), Math.max(y, 0)) + Math.min(Math.max(x, y), 0) <= r
}

function render(size, { maskable }) {
  const SS = 3
  return png(size, (px, py) => {
    let r = 0, g = 0, b = 0, a = 0
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const u = (px + (sx + 0.5) / SS) / size, v = (py + (sy + 0.5) / SS) / size
      const inside = maskable ? true : roundedRect(u, v, 0.22)
      if (!inside) continue
      const col = inShape(u, v, maskable ? 0.78 : 1) ? FG : BG
      r += col[0]; g += col[1]; b += col[2]; a += 255
    }
    const n = SS * SS
    const cov = a / 255
    return cov ? [Math.round(r / cov), Math.round(g / cov), Math.round(b / cov), Math.round(a / n)] : [0, 0, 0, 0]
  })
}

fs.mkdirSync(outDir, { recursive: true })
const files = { 'icon-192.png': [192, false], 'icon-512.png': [512, false], 'maskable-512.png': [512, true], 'apple-touch-icon.png': [180, true] }
for (const [name, [size, maskable]] of Object.entries(files)) fs.writeFileSync(path.join(outDir, name), render(size, { maskable }))
console.log('ikonkalar yozildi:', outDir)
