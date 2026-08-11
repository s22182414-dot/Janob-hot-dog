import { defineEventHandler, readBody } from "h3";
import { setPendingLink } from "../../../lib/tg-store";

const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
const SITE_URL = process.env["SITE_URL"] ?? "";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
    from?: {
      id?: number;
      first_name?: string;
      username?: string;
    };
  };
};

type ReplyMarkup = {
  inline_keyboard: { text: string; url: string }[][];
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
 * - /start              → salomlashish xabari
 * - /start connect_XXX  → akkount ulash oqimi: foydalanuvchini saqlab,
 *   "Akkountni ulash" tugmasi (saytga qaytaruvchi havola) bilan javob beradi.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<TelegramUpdate>(event);
    const text = body?.message?.text ?? "";
    const chatId = body?.message?.chat?.id;

    if (!chatId) return { ok: true };

    const from = body.message?.from;
    const name = from?.first_name ?? from?.username ?? "mehmon";

    // Akkount ulash oqimi: /start connect_<token>
    const connectMatch = text
      .trim()
      .match(/^\/start\s+connect_([A-Za-z0-9]+)$/);
    if (connectMatch) {
      const token = connectMatch[1] ?? "";
      setPendingLink(token, {
        chatId,
        ...(from?.id !== undefined ? { tgId: from.id } : {}),
        ...(from?.first_name ? { firstName: from.first_name } : {}),
        ...(from?.username ? { username: from.username } : {}),
        createdAt: Date.now(),
      });

      const linkUrl = SITE_URL
        ? `${SITE_URL.replace(/\/+$/, "")}/profil?tg=${encodeURIComponent(token)}`
        : "";
      const text = linkUrl
        ? `Assalomu alaykum, ${name}! 👋\n\nAkkountni ulash uchun quyidagi tugmani bosing:`
        : `Assalomu alaykum, ${name}! 👋\n\nAkkountni ulash uchun sayt manzili sozlanmagan (SITE_URL). Administratorga murojaat qiling.`;
      await sendMessage(
        chatId,
        text,
        linkUrl
          ? {
              inline_keyboard: [[{ text: "🔗 Akkountni ulash", url: linkUrl }]],
            }
          : undefined,
      );
      return { ok: true };
    }

    if (text.trim() === "/start") {
      await sendMessage(
        chatId,
        `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!\n\nBuyurtma holati va yangiliklar haqidagi xabarlar aynan shu bot orqali keladi.`,
      );
    }

    return { ok: true };
  } catch (error) {
    console.error("Telegram webhook xatosi:", error);
    return { ok: true };
  }
});
