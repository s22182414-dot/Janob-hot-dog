import { defineEventHandler, readBody } from "h3";

const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
const SITE_URL = process.env["SITE_URL"] ?? "";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
    from?: {
      first_name?: string;
      username?: string;
    };
  };
};

type InlineButton = {
  text: string;
  url?: string;
  web_app?: { url: string };
};

type ReplyMarkup = {
  inline_keyboard: InlineButton[][];
};

async function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: ReplyMarkup,
) {
  if (!BOT_TOKEN) {
    console.error(
      "Telegram xabari yuborilmadi: TELEGRAM_BOT_TOKEN o'rnatilmagan.",
    );
    return;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        }),
      },
    );
    if (!res.ok) {
      console.error("Telegram sendMessage xatosi:", await res.text());
    }
  } catch (error) {
    console.error("Telegram sendMessage uzilish:", error);
  }
}

/**
 * Telegram webhook.
 *
 * /start connect_<code> — website'dan boshlangan oqim: "🔗 Akkountni ulash"
 * tugmasi (web_app) yuboriladi — Telegram ichida Mini App (profil sahifasi)
 * ochiladi, foydalanuvchi hech qayerga o'tib ketmaydi.
 * /start (oddiy) — tugma/link berilmaydi, faqat saytga yo'naltiruvchi matn.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<TelegramUpdate>(event);
    const text = body?.message?.text ?? "";
    const chatId = body?.message?.chat?.id;

    if (!chatId) return { ok: true };

    const from = body.message?.from;
    const name = from?.first_name ?? from?.username ?? "mehmon"; // /start yoki /start connect_<code> — code bo'lsa web_app URL'iga qo'shamiz,
    // shunda Mini App ulangach brauzer ham ulanishni ola oladi.
    const startMatch = text
      .trim()
      .match(/^\/start(?:\s+connect_([A-Za-z0-9]+))?$/);

    if (startMatch) {
      const code = startMatch[1] ?? "";
      const base = SITE_URL ? `${SITE_URL.replace(/\/+$/, "")}/profil` : "";
      const appUrl = base
        ? `${base}${code ? `?tg=${encodeURIComponent(code)}` : ""}`
        : "";

      if (code && appUrl) {
        // Website'dan kelgan oqim (connect_<code>) — shundagina tugma beramiz.
        const messageText = `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!\n\nAkkountni ulash uchun quyidagi tugmani bosing — hammasi shu yerda bo'ladi, hech qayerga o'tib ketmaysiz:`;
        await sendMessage(chatId, messageText, {
          inline_keyboard: [
            [{ text: "🔗 Akkountni ulash", web_app: { url: appUrl } }],
          ],
        });
      } else {
        // Oddiy /start — tugma/link berilmaydi, faqat ko'rsatma matni.
        const site = SITE_URL ? SITE_URL.replace(/\/+$/, "") : "";
        const messageText = site
          ? `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!\n\nAkkountni ulash uchun saytimizga o'ting va profil sahifasidagi "Telegramdan kirish" tugmasini bosing:\n\n${site}/profil\n\nShundan keyin bot sizga ulanish tugmasini yuboradi.`
          : `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!`;
        await sendMessage(chatId, messageText);
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("Telegram webhook xatosi:", error);
    return { ok: true };
  }
});
