const { Telegraf } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN || '8917836890:AAG3y8PaAHOOrMVRFD5dP2u4MquPDdXJ9XM';
const ADMIN_ID  = process.env.ADMIN_ID  || ''; // твой Telegram user_id
const APP_URL   = 'https://stream-pro-e8b16.web.app/';

const bot = new Telegraf(BOT_TOKEN);

// file_id кружочка хранится здесь — задаётся командой /setvideo
let videoNoteFileId = process.env.VIDEO_NOTE_FILE_ID || '';

// ─── /start ───────────────────────────────────────────────────────────────
bot.start(async (ctx) => {
  // Шлём кружочек если он задан (ошибка не убивает приветствие)
  if (videoNoteFileId) {
    try {
      await ctx.sendVideoNote(videoNoteFileId);
    } catch (vidErr) {
      console.error('Ошибка sendVideoNote:', vidErr.message);
    }
  }

  // Приветствие + кнопка
  try {
    await ctx.reply(
      'Привет! Добро пожаловать в Streamer Pro. Выбери что тебя интересует:',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Зайти в приложение', web_app: { url: APP_URL } }
          ]]
        }
      }
    );
  } catch (err) {
    console.error('Ошибка /start reply:', err.message);
  }
});

// ─── /setvideo — отправь кружочек боту как reply, потом введи /setvideo ──
bot.command('setvideo', async (ctx) => {
  const userId = String(ctx.from.id);
  if (ADMIN_ID && userId !== ADMIN_ID) {
    return ctx.reply('Нет доступа');
  }

  const reply = ctx.message.reply_to_message;
  if (!reply?.video_note) {
    return ctx.reply(
      'Ответь на кружочек командой /setvideo — перешли кружочек в этот чат и ответь на него /setvideo'
    );
  }

  videoNoteFileId = reply.video_note.file_id;
  console.log('Новый video_note file_id:', videoNoteFileId);
  await ctx.reply(`✅ Кружочек сохранён!\nfile_id: ${videoNoteFileId}`);
});

// ─── /getvideo — посмотреть текущий file_id ───────────────────────────────
bot.command('getvideo', async (ctx) => {
  const userId = String(ctx.from.id);
  if (ADMIN_ID && userId !== ADMIN_ID) return;
  await ctx.reply(videoNoteFileId ? `Текущий file_id:\n${videoNoteFileId}` : 'Кружочек не задан');
});

// ─── Старт бота ───────────────────────────────────────────────────────────
bot.launch()
  .then(() => console.log('✅ Streamer Pro Bot запущен'))
  .catch(err => console.error('Ошибка запуска:', err));

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
