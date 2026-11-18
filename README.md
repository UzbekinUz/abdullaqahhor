# Abdulla Qahhor: sayt, admin ilovasi va Telegram bot

| Qism | Papka | Manzil (dev) | PWA (build) |
|---|---|---|---|
| Ochiq sayt | `client/` | http://localhost:5173 | http://localhost:4173 |
| Admin ilovasi (alohida) | `admin/` | http://localhost:5174 | http://localhost:4174 |
| API + Telegram bot | `server/` | http://localhost:4000 | |

Admin ilovasi ochiq saytdan butunlay alohida: saytda unga havola yo'q, o'z manzili va o'z PWA'si bor.

## Ishga tushirish (hammasi lokal)
MongoDB o'rnatish shart emas: `server/.env` da `MONGODB_URI` bo'sh bo'lsa, lokal baza `server/data` ga yoziladi.
Uchta terminalda:

```bash
npm run server
```

```bash
npm run site
```

```bash
npm run admin
```

Admin kirishi: `server/.env` dagi `ADMIN_USERNAME` / `ADMIN_PASSWORD` (boshlang'ich: `admin` / `change-me`; birinchi ishga tushishda yaratiladi, parolni ishga tushirishdan oldin almashtiring).

## PWA (o'rnatiladigan ilova)
O'rnatish tugmasi faqat build qilingan saytda ishlaydi (service worker kerak):

```bash
npm run build
npm run preview:site
npm run preview:admin
```

So'ng http://localhost:4173 (sayt) va http://localhost:4174 (admin) ni Chrome/Edge da oching, «Ilovani o'rnatish» chiqadi. Telefonda HTTPS manzil kerak (joylashtirilganda yoki tunnel orqali).

## Telegram bot (avtorizatsiya bilan)
1. @BotFather dan token oling, `server/.env` ga `TELEGRAM_BOT_TOKEN=...` yozing.
2. Ixtiyoriy: `TELEGRAM_ADMIN_IDS=123,456`, faqat shu Telegram ID lar kira oladi.
3. Serverni qayta ishga tushiring, botga `/login` yuboring, admin login va parolini kiriting. Parol xabari darhol o'chiriladi, sessiya 30 kun, 5 ta xato urinishdan keyin 10 daqiqa bloklanadi.

Bot admin paneldagi hamma narsani qiladi: hikoyalar (matn, muqova, audio, yashirish), asarlar, iqtiboslar, galereya (rasm yuborish), videolar (fayl yoki havola), manbalar, bosh sahifa matni, biografiya bo'limlari, yillar jadvali, statistika. Buyruqlar: `/menu`, `/stats`, `/cancel`, `/login`, `/logout`.

Bot mantig'ini soxta Telegram bilan sinash (token kerak emas): `npm run test:bot`.

## Eslatma
Hikoya matnlari va ba'zi ma'lumotlar namuna. Suratlar Wikimedia Commons'dan (CC BY / CC BY-SA), mualliflari sayt galereyasida ko'rsatilgan.
