import { Bot, InlineKeyboard } from 'grammy';
import bcrypt from 'bcryptjs';
import { Admin, Site, Story, Work, Quote, GalleryItem, Video, Source, TgAuth } from '../models/index.js';
import { RES, SITE_FIELDS } from './config.js';
import { saveTelegramFile, readTelegramText } from './files.js';

const SESSION_DAYS = 30;
const PAGE = 8;
const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;

const state = new Map(); // chatId -> { mode, ... }
const fails = new Map(); // chatId -> { n, until }

const cut = (s, n = 60) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const hasPub = (cfg) => cfg.fields.some((f) => f.name === 'published');
const titleOf = (cfg, d) => cut(d[cfg.title] || '(nomsiz)', 48);

function mainMenu() {
  const k = new InlineKeyboard();
  const keys = Object.keys(RES);
  keys.forEach((key, i) => { k.text(RES[key].label, `m:${key}`); if (i % 2) k.row(); });
  if (keys.length % 2) k.row();
  return k.text('🏠 Bosh sahifa matni', 'site').text('📊 Statistika', 'stats').row().text('🚪 Chiqish', 'logout');
}

function isAuthorizedAllowlist(ctx) {
  const ids = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return !ids.length || ids.includes(String(ctx.from?.id));
}

async function session(chatId) {
  const a = await TgAuth.findOne({ chatId: String(chatId) });
  if (!a) return null;
  if (a.expiresAt && a.expiresAt < new Date()) { await a.deleteOne(); return null; }
  return a;
}

function itemText(cfg, d) {
  const lines = [`${cfg.label.replace(/^\S+\s/, '')}: ${d[cfg.title] ? cut(d[cfg.title], 120) : '(nomsiz)'}`, ''];
  for (const f of cfg.fields) {
    if (f.name === cfg.title) continue;
    let v = d[f.name];
    if (f.type === 'bool') v = v === false ? 'yo\'q (yashirin)' : 'ha';
    else if (['image', 'audio', 'video'].includes(f.type)) v = v ? '✅ ' + cut(v, 40) : '—';
    else v = v ? cut(v, 90) : '—';
    lines.push(`${f.label.split(' (')[0]}: ${v}`);
  }
  return lines.join('\n');
}

export function createBot(token) {
  const bot = new Bot(token);

  // ---------- Avtorizatsiya ----------
  bot.use(async (ctx, next) => {
    if (!ctx.chat) return next();
    const id = String(ctx.chat.id);
    const text = ctx.message?.text || '';
    if (/^\/(start|login|help)\b/.test(text)) return next();
    const st = state.get(id);
    if (st && (st.mode === 'login-user' || st.mode === 'login-pass')) return next();
    if (!isAuthorizedAllowlist(ctx)) return ctx.reply(`Ruxsat yo'q. Sizning Telegram ID: ${ctx.from?.id}`);
    if (!(await session(id))) {
      if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: 'Avval /login qiling', show_alert: true });
      else await ctx.reply('Avval kiring: /login');
      return;
    }
    return next();
  });


  // ---------- Ekranlar ----------
  const home = (ctx, text = '🏠 Asosiy menyu. Bo\'limni tanlang:') =>
    ctx.reply(text, { reply_markup: mainMenu() });

  async function showList(ctx, key, page = 0, edit = false) {
    const cfg = RES[key];
    const total = await cfg.Model.countDocuments();
    const docs = await cfg.Model.find().sort({ order: 1, createdAt: -1 }).skip(page * PAGE).limit(PAGE);
    const k = new InlineKeyboard();
    for (const d of docs) {
      const mark = d.published === false ? '🚫 ' : d.audioUrl ? '🎧 ' : '';
      k.text(mark + titleOf(cfg, d), `v:${key}:${d._id}`).row();
    }
    const pages = Math.max(1, Math.ceil(total / PAGE));
    if (pages > 1) {
      if (page > 0) k.text('◀️', `l:${key}:${page - 1}`);
      k.text(`${page + 1}/${pages}`, 'noop');
      if (page < pages - 1) k.text('▶️', `l:${key}:${page + 1}`);
      k.row();
    }
    k.text('➕ Yangi', `n:${key}`).text('⬅️ Menyu', 'menu');
    const text = `${cfg.label}: jami ${total} ta`;
    if (edit) await ctx.editMessageText(text, { reply_markup: k }).catch(() => ctx.reply(text, { reply_markup: k }));
    else await ctx.reply(text, { reply_markup: k });
  }

  async function showItem(ctx, key, id, edit = false) {
    const cfg = RES[key];
    const d = await cfg.Model.findById(id).catch(() => null);
    if (!d) return ctx.reply('Topilmadi.');
    const k = new InlineKeyboard();
    const editable = cfg.fields.filter((f) => f.type !== 'bool');
    editable.forEach((f, i) => { k.text('✏️ ' + f.label.split(' (')[0], `e:${key}:${id}:${f.name}`); if (i % 2) k.row(); });
    if (editable.length % 2) k.row();
    if (hasPub(cfg)) k.text(d.published === false ? '👁 Ko\'rsatish' : '🙈 Yashirish', `p:${key}:${id}`).row();
    k.text('🗑 O\'chirish', `d:${key}:${id}`).text('⬅️ Ro\'yxat', `l:${key}:0`);
    const text = itemText(cfg, d);
    if (edit) await ctx.editMessageText(text, { reply_markup: k }).catch(() => ctx.reply(text, { reply_markup: k }));
    else await ctx.reply(text, { reply_markup: k });
  }

  const promptField = (ctx, f, extra = '') => {
    const hints = {
      image: 'Rasm yuboring (surat sifatida) yoki havola yozing.',
      audio: 'Audio fayl yoki ovozli xabar yuboring.',
      video: 'Video fayl yuboring yoki YouTube havolasini yozing.',
      number: 'Raqam yozing.',
      textarea: 'Matnni yozing (yoki .txt fayl yuboring).',
      text: 'Matnni yozing.',
    };
    const k = new InlineKeyboard().text('⏭ O\'tkazib yuborish', 'skip').text('✖️ Bekor qilish', 'cancel');
    return ctx.reply(`${f.label}\n${hints[f.type] || ''}${f.required ? '' : '\n"-" yozsangiz maydon tozalanadi.'}${extra}`, { reply_markup: k });
  };

  // ---------- Qiymatni xabardan o'qish ----------
  async function readValue(ctx, f) {
    const m = ctx.message;
    if (['image', 'audio', 'video'].includes(f.type)) {
      let fileId = null, name = '';
      if (f.type === 'image') {
        if (m.photo) fileId = m.photo[m.photo.length - 1].file_id;
        else if (m.document?.mime_type?.startsWith('image/')) { fileId = m.document.file_id; name = m.document.file_name; }
      } else if (f.type === 'audio') {
        const a = m.audio || m.voice || (m.document?.mime_type?.startsWith('audio/') ? m.document : null);
        if (a) { fileId = a.file_id; name = a.file_name || ''; }
      } else {
        const v = m.video || m.video_note || (m.document?.mime_type?.startsWith('video/') ? m.document : null);
        if (v) { fileId = v.file_id; name = v.file_name || ''; }
      }
      if (fileId) return { ok: true, value: await saveTelegramFile(ctx.api, token, fileId, f.type, name) };
      const t = m.text?.trim();
      if (t === '-' && !f.required) return { ok: true, value: '' };
      if (t && /^https?:\/\//i.test(t)) return { ok: true, value: t };
      return { ok: false, msg: 'Bu maydon uchun fayl yoki havola kerak.' };
    }
    let text = m.text;
    if (!text && m.document && f.type === 'textarea') text = await readTelegramText(ctx.api, token, m.document.file_id);
    if (text === undefined) return { ok: false, msg: 'Matn yuboring.' };
    text = text.trim();
    if (text === '-' && !f.required) return { ok: true, value: f.type === 'number' ? 0 : '' };
    if (f.type === 'number') {
      const n = Number(text.replace(',', '.'));
      return Number.isFinite(n) ? { ok: true, value: n } : { ok: false, msg: 'Raqam yozing.' };
    }
    if (!text && f.required) return { ok: false, msg: 'Bu maydon bo\'sh bo\'lmasligi kerak.' };
    return { ok: true, value: text };
  }

  // ---------- Yangi yozuv sehrgari ----------
  const wizFields = (cfg) => cfg.fields.filter((f) => f.type !== 'bool' && f.name !== 'order');
  async function wizardNext(ctx, st) {
    const cfg = RES[st.key];
    const fields = wizFields(cfg);
    if (st.i >= fields.length) {
      const last = await cfg.Model.findOne().sort({ order: -1 });
      const doc = await cfg.Model.create({ ...st.data, ...(cfg.fields.some((f) => f.name === 'order') ? { order: (last?.order || 0) + 1 } : {}) });
      state.delete(String(ctx.chat.id));
      await ctx.reply('✅ Saqlandi.');
      return showItem(ctx, st.key, doc._id);
    }
    return promptField(ctx, fields[st.i], `\n(${st.i + 1}/${fields.length})`);
  }

  // ---------- Buyruqlar ----------
  bot.command('start', async (ctx) => {
    if (!isAuthorizedAllowlist(ctx)) return ctx.reply(`Ruxsat yo'q. Sizning Telegram ID: ${ctx.from?.id}`);
    const a = await session(ctx.chat.id);
    if (a) return home(ctx, `Salom, ${a.username}! Asosiy menyu:`);
    return ctx.reply('Qahhor admin boti.\nKirish uchun /login yuboring va admin login/parolini kiriting.');
  });

  bot.command('login', async (ctx) => {
    if (!isAuthorizedAllowlist(ctx)) return ctx.reply(`Ruxsat yo'q. Sizning Telegram ID: ${ctx.from?.id}`);
    if (ctx.chat.type !== 'private') return ctx.reply('Kirish faqat shaxsiy chatda mumkin.');
    const f = fails.get(String(ctx.chat.id));
    if (f && f.until > Date.now()) return ctx.reply(`Juda ko'p urinish. ${Math.ceil((f.until - Date.now()) / 60000)} daqiqadan keyin qayta urining.`);
    state.set(String(ctx.chat.id), { mode: 'login-user' });
    return ctx.reply('Login yozing:');
  });

  bot.command('logout', async (ctx) => { await TgAuth.deleteOne({ chatId: String(ctx.chat.id) }); state.delete(String(ctx.chat.id)); return ctx.reply('Chiqdingiz. Qayta kirish: /login'); });
  bot.command('cancel', (ctx) => { state.delete(String(ctx.chat.id)); return home(ctx, 'Bekor qilindi.'); });
  bot.command('menu', (ctx) => home(ctx));
  bot.command('help', (ctx) => ctx.reply('/menu — asosiy menyu\n/stats — statistika\n/cancel — joriy amalni bekor qilish\n/logout — chiqish\n/login — kirish'));
  bot.command('stats', (ctx) => stats(ctx));

  async function stats(ctx) {
    const [s, sa, sh, w, q, g, v, r] = await Promise.all([
      Story.countDocuments(), Story.countDocuments({ audioUrl: { $exists: true, $ne: '' } }), Story.countDocuments({ published: false }),
      Work.countDocuments(), Quote.countDocuments(), GalleryItem.countDocuments(), Video.countDocuments(), Source.countDocuments(),
    ]);
    return ctx.reply(`📊 Statistika\nHikoyalar: ${s} (audio: ${sa}, yashirin: ${sh})\nAsarlar: ${w}\nIqtiboslar: ${q}\nSuratlar: ${g}\nVideolar: ${v}\nManbalar: ${r}`, { reply_markup: new InlineKeyboard().text('⬅️ Menyu', 'menu') });
  }

  // ---------- Tugmalar ----------
  bot.on('callback_query:data', async (ctx) => {
    const id = String(ctx.chat.id);
    const [a, key, arg, field] = ctx.callbackQuery.data.split(':');
    await ctx.answerCallbackQuery().catch(() => {});
    if (a === 'noop') return;
    if (a === 'menu') { state.delete(id); return ctx.editMessageText('🏠 Asosiy menyu. Bo\'limni tanlang:', { reply_markup: mainMenu() }).catch(() => home(ctx)); }
    if (a === 'stats') return stats(ctx);
    if (a === 'logout') { await TgAuth.deleteOne({ chatId: id }); state.delete(id); return ctx.reply('Chiqdingiz. Qayta kirish: /login'); }
    if (a === 'cancel') { state.delete(id); return home(ctx, 'Bekor qilindi.'); }

    if (a === 'skip') {
      const st = state.get(id);
      if (st?.mode === 'new') {
        const f = wizFields(RES[st.key])[st.i];
        if (f.required) return ctx.reply('Bu maydon majburiy.');
        st.i += 1; return wizardNext(ctx, st);
      }
      return;
    }
    if (a === 'site') return showSite(ctx);
    if (a === 'sf') { // sayt maydonini tahrirlash
      state.set(id, { mode: 'site-field', field: key });
      const f = SITE_FIELDS.find((x) => x.name === key);
      return ctx.reply(`${f.label}\nYangi matnni yozing.`, { reply_markup: new InlineKeyboard().text('✖️ Bekor qilish', 'cancel') });
    }
    if (a === 'sb') { // biografiya bo'limi qo'shish
      state.set(id, { mode: 'bio-head' });
      return ctx.reply('Yangi bo\'lim sarlavhasini yozing:', { reply_markup: new InlineKeyboard().text('✖️ Bekor qilish', 'cancel') });
    }
    if (a === 'st') { // yillar jadvaliga qo'shish
      state.set(id, { mode: 'tl-year' });
      return ctx.reply('Yilni yozing (masalan 1951):', { reply_markup: new InlineKeyboard().text('✖️ Bekor qilish', 'cancel') });
    }
    if (a === 'sdb' || a === 'sdt') { // o'chirish
      const site = await Site.findOne({ key: 'main' });
      const arr = a === 'sdb' ? site.biography : site.timeline;
      arr.splice(Number(key), 1); await site.save();
      return showSite(ctx);
    }

    const cfg = RES[key];
    if (!cfg) return;
    if (a === 'm' || a === 'l') return showList(ctx, key, a === 'l' ? Number(arg) || 0 : 0, true);
    if (a === 'v') return showItem(ctx, key, arg, true);
    if (a === 'n') {
      state.set(id, { mode: 'new', key, i: 0, data: {} });
      return wizardNext(ctx, state.get(id));
    }
    if (a === 'e') {
      const f = cfg.fields.find((x) => x.name === field);
      state.set(id, { mode: 'edit', key, id: arg, field });
      return promptField(ctx, f);
    }
    if (a === 'p') {
      const d = await cfg.Model.findById(arg);
      if (d) { d.published = d.published === false; await d.save(); }
      return showItem(ctx, key, arg, true);
    }
    if (a === 'd') {
      const d = await cfg.Model.findById(arg);
      const k = new InlineKeyboard().text('🗑 Ha, o\'chirish', `D:${key}:${arg}`).text('↩️ Yo\'q', `v:${key}:${arg}`);
      return ctx.editMessageText(`"${titleOf(cfg, d || {})}" o'chirilsinmi? Bu qaytarilmaydi.`, { reply_markup: k });
    }
    if (a === 'D') { await cfg.Model.findByIdAndDelete(arg); return showList(ctx, key, 0, true); }
  });

  async function showSite(ctx) {
    const s = (await Site.findOne({ key: 'main' })) || (await Site.create({ key: 'main' }));
    const k = new InlineKeyboard();
    SITE_FIELDS.forEach((f) => k.text('✏️ ' + f.label.split(' (')[0], `sf:${f.name}`).row());
    k.text('➕ Biografiya bo\'limi', 'sb').text('➕ Yillar jadvali', 'st').row();
    (s.biography || []).forEach((b, i) => k.text(`🗑 ${cut(b.heading, 28)}`, `sdb:${i}`).row());
    (s.timeline || []).forEach((t, i) => k.text(`🗑 ${t.year}`, `sdt:${i}`));
    k.row().text('⬅️ Menyu', 'menu');
    const text = ['🏠 Bosh sahifa va biografiya', '',
      ...SITE_FIELDS.map((f) => `${f.label.split(' (')[0]}: ${cut(s[f.name], 80) || '—'}`), '',
      `Biografiya bo'limlari: ${(s.biography || []).length}`, `Yillar jadvali: ${(s.timeline || []).length}`].join('\n');
    return ctx.reply(text, { reply_markup: k });
  }

  // ---------- Xabarlar (matn / fayl) ----------
  bot.on('message', async (ctx) => {
    const id = String(ctx.chat.id);
    const st = state.get(id);
    const text = ctx.message.text;
    if (text?.startsWith('/')) return;

    if (st?.mode === 'login-user') {
      state.set(id, { mode: 'login-pass', username: (text || '').trim() });
      return ctx.reply('Parolni yozing (xabar kirgandan keyin o\'chiriladi):');
    }
    if (st?.mode === 'login-pass') {
      await ctx.deleteMessage().catch(() => {});
      state.delete(id);
      const admin = await Admin.findOne({ username: st.username });
      const ok = admin && (await bcrypt.compare(text || '', admin.passwordHash));
      if (!ok) {
        const f = fails.get(id) || { n: 0, until: 0 };
        f.n += 1;
        if (f.n >= MAX_FAILS) { f.until = Date.now() + LOCK_MS; f.n = 0; }
        fails.set(id, f);
        return ctx.reply(f.until > Date.now() ? 'Juda ko\'p xato urinish. 10 daqiqaga bloklandi.' : 'Login yoki parol noto\'g\'ri. Qayta urinish: /login');
      }
      fails.delete(id);
      await TgAuth.findOneAndUpdate({ chatId: id }, { username: admin.username, tgUser: String(ctx.from?.id), expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000) }, { upsert: true });
      return home(ctx, `✅ Kirdingiz, ${admin.username}!`);
    }

    if (!st) return home(ctx, 'Menyudan tanlang yoki /menu yuboring.');

    try {
      if (st.mode === 'new' || st.mode === 'edit') {
        const cfg = RES[st.key];
        const f = st.mode === 'new' ? wizFields(cfg)[st.i] : cfg.fields.find((x) => x.name === st.field);
        const r = await readValue(ctx, f);
        if (!r.ok) return ctx.reply(r.msg);
        if (st.mode === 'new') { st.data[f.name] = r.value; st.i += 1; return wizardNext(ctx, st); }
        await cfg.Model.findByIdAndUpdate(st.id, { [f.name]: r.value });
        state.delete(id);
        await ctx.reply('✅ Yangilandi.');
        return showItem(ctx, st.key, st.id);
      }
      if (st.mode === 'site-field') {
        await Site.findOneAndUpdate({ key: 'main' }, { [st.field]: (text || '').trim() === '-' ? '' : (text || '').trim() }, { upsert: true });
        state.delete(id); await ctx.reply('✅ Saqlandi.'); return showSite(ctx);
      }
      if (st.mode === 'bio-head') { state.set(id, { mode: 'bio-text', heading: text }); return ctx.reply('Bo\'lim matnini yozing (yoki .txt fayl yuboring):'); }
      if (st.mode === 'bio-text') {
        const body = text ?? (ctx.message.document ? await readTelegramText(ctx.api, token, ctx.message.document.file_id) : '');
        await Site.findOneAndUpdate({ key: 'main' }, { $push: { biography: { heading: st.heading, text: body } } }, { upsert: true });
        state.delete(id); await ctx.reply('✅ Qo\'shildi.'); return showSite(ctx);
      }
      if (st.mode === 'tl-year') { state.set(id, { mode: 'tl-text', year: (text || '').trim() }); return ctx.reply('Voqea matnini yozing:'); }
      if (st.mode === 'tl-text') {
        await Site.findOneAndUpdate({ key: 'main' }, { $push: { timeline: { year: st.year, text: (text || '').trim() } } }, { upsert: true });
        state.delete(id); await ctx.reply('✅ Qo\'shildi.'); return showSite(ctx);
      }
    } catch (e) {
      console.error('bot xatosi:', e.message);
      return ctx.reply('Xatolik: ' + e.message);
    }
  });

  bot.catch((e) => console.error('bot', e.error?.message || e.message));
  return bot;
}

export function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return console.log("Telegram bot o'chiq (TELEGRAM_BOT_TOKEN yo'q)");
  const bot = createBot(token);
  bot.api.setMyCommands([
    { command: 'menu', description: 'Asosiy menyu' },
    { command: 'stats', description: 'Statistika' },
    { command: 'login', description: 'Kirish' },
    { command: 'logout', description: 'Chiqish' },
    { command: 'cancel', description: 'Bekor qilish' },
  ]).catch(() => {});
  bot.start({ onStart: (i) => console.log(`Telegram bot ishga tushdi: @${i.username}`) });
}
