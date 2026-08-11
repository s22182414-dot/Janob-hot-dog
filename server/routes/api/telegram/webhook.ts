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
 * /start (yoki /start connect) — salomlashish + "🔗 Akkountni ulash" tugmasi.
 * Tugma web_app turida: Telegram ichida Mini App (profil sahifasi) ochiladi,
 * foydalanuvchi hech qayerga o'tib ketmaydi — initData orqali akkount ulanadi.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<TelegramUpdate>(event);
    const text = body?.message?.text ?? "";
    const chatId = body?.message?.chat?.id;

    if (!chatId) return { ok: true };

    const from = body.message?.from;
    const name = from?.first_name ?? from?.username ?? "mehmon";

    const isStart =
      text.trim() === "/start" || /^\/start\s+connect$/.test(text.trim());

    if (isStart) {
      const appUrl = SITE_URL ? `${SITE_URL.replace(/\/+$/, "")}/profil` : "";
      const messageText = appUrl
        ? `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!\n\nAkkountni ulash uchun quyidagi tugmani bosing — hammasi shu yerda bo'ladi, hech qayerga o'tib ketmaysiz:`
        : `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!`;
      await sendMessage(
        chatId,
        messageText,
        appUrl
          ? {
              inline_keyboard: [
                [{ text: "🔗 Akkountni ulash", web_app: { url: appUrl } }],
              ],
            }
          : undefined,
      );
    }

    return { ok: true };
  } catch (error) {
    console.error("Telegram webhook xatosi:", error);
    return { ok: true };
  }
});
