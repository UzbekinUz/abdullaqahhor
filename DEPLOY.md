# Bepul joylash qo'llanmasi

Tartib muhim: baza → server → sayt → admin → CORS ni yangilash.

## 1. MongoDB Atlas (baza)
1. https://www.mongodb.com/cloud/atlas da hisob oching, **M0 (Free)** klaster yarating.
2. Database Access: foydalanuvchi yarating (login + parol).
3. Network Access: `0.0.0.0/0` ni qo'shing (Render IP si o'zgaruvchan).
4. Connect → Drivers: ulanish satrini oling, `<password>` ni almashtiring va oxiriga baza nomini qo'shing:
   `mongodb+srv://USER:PAROL@cluster0.xxxx.mongodb.net/abdulla_qahhor`

## 2. GitHub
Loyihani GitHub'ga yuklang (`.env` fayllar yuklanmasligi kerak, `server/data` va `node_modules` ham).

## 3. Render (API + bot)
1. https://render.com → New → **Blueprint** → repo'ni tanlang (`render.yaml` o'qiladi).
2. So'ralganda kiriting:
   - `MONGODB_URI`: 1-qadamdagi satr
   - `ADMIN_PASSWORD`: kuchli parol (admin birinchi ishga tushishda shu parol bilan yaratiladi)
   - `CLIENT_ORIGIN`: hozircha bo'sh qoldirib turing, 6-qadamda to'ldiriladi
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_IDS`: ixtiyoriy
3. Deploy tugagach API manzili chiqadi, masalan `https://qahhor-api.onrender.com`. `/healthz` ni ochib tekshiring.

## 4. Cloudflare Pages: sayt
Workers & Pages → Create → Pages → GitHub repo.
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL` = Render manzili (oxirida `/` siz)

## 5. Cloudflare Pages: admin (alohida loyiha)
- Root directory: `admin`, build `npm run build`, output `dist`
- `VITE_API_URL` = Render manzili
- `VITE_SITE_URL` = 4-qadamdagi sayt manzili (`https://....pages.dev`)

## 6. CORS
Render → Environment → `CLIENT_ORIGIN` ga ikkala manzilni vergul bilan yozing (oxirida `/` siz):
`https://sayt.pages.dev,https://admin.pages.dev`. Server o'zi qayta ishga tushadi.

## 7. Uxlab qolmasligi uchun (ixtiyoriy)
https://uptimerobot.com da `https://qahhor-api.onrender.com/healthz` uchun 5 daqiqalik monitor qo'shing. Bu serverni va Telegram botni uyg'oq tutadi.

## Cheklov
Renderning bepul diski vaqtinchalik: admin/bot orqali yuklangan fayllar (`/uploads`) qayta ishga tushganda o'chadi. Doimiy saqlash uchun Cloudinary yoki R2 ga o'tish kerak.

## Doimiy ishlash (keepalive)
`.github/workflows/keepalive.yml` har 5 daqiqada `/healthz` ga murojaat qiladi (GitHub → Actions bo'limida yoqilganini tekshiring). Qo'shimcha ishonch uchun UptimeRobot ham qo'shing.

## Telegram Mini App
1. @BotFather → `/newbot` (yoki mavjud bot) → token oling.
2. Render → Environment: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_IDS` (sizning Telegram ID, @userinfobot dan biling) va `MINI_APP_URL` (admin manzili) ni kiriting.
3. Botga `/start` yoki `/app` yuboring, yoki chatdagi «Admin» menyu tugmasini bosing. Mini App ochiladi va Telegram orqali avtomatik kiradi (parol so'ralmaydi).
Faqat `TELEGRAM_ADMIN_IDS` dagi foydalanuvchilar kira oladi. Ro'yxat bo'sh bo'lsa, botda `/login` bilan kirganlar kiradi.
