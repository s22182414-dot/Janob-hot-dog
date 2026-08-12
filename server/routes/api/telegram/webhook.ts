import { defineEventHandler, readBody } from "h3";
import {
  answerCallbackQuery,
  editMessageText,
  notifyOrderDelivered,
  notifyOrderReady,
  sendMessage,
} from "../../../lib/telegram-notify";

const SITE_URL = process.env["SITE_URL"] ?? "";
const OWNER_CHAT_ID = process.env["OWNER_CHAT_ID"] ?? "";

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
  callback_query?: {
    id: string;
    from?: { id?: number };
    data?: string;
    message?: {
      chat: { id: number };
      message_id: number;
      text?: string;
    };
  };
};

/**
 * Telegram webhook.
 *
 * - /start connect_<code> — website'dan boshlangan oqim: "🔗 Akkountni ulash"
 *   tugmasi (web_app) yuboriladi — Telegram ichida Mini App (profil sahifasi)
 *   ochiladi, foydalanuvchi hech qayerga o'tib ketmaydi.
 * - /start (oddiy) — tugma/link berilmaydi, faqat saytga yo'naltiruvchi matn.
 * - /admin — faqat egaga (OWNER_CHAT_ID) admin panelni Mini App sifatida
 *   ochadigan tugma yuboriladi.
 * - callback_query order_ready:<id> / order_delivered:<id> — oshpazlar va
 *   yetkazib beruvchilar kanalidagi tugmalar: buyurtma keyingi bosqichga
 *   o'tadi va foydalanuvchiga bildirishnoma boradi.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<TelegramUpdate>(event);

    // ── Tugma bosildi (callback_query) ────────────────────────────────
    const callback = body?.callback_query;
    if (callback?.data && callback.message) {
      await answerCallbackQuery(callback.id);
      const match = callback.data.match(
        /^(order_ready|order_delivered):([^:]+)(?::(\d+))?$/,
      );
      if (match) {
        const action = match[1] ?? "";
        const orderId = match[2] ?? "";
        const tgId = match[3] ? Number(match[3]) : undefined;
        const baseText = callback.message.text ?? "";
        if (action === "order_ready") {
          // baseText — oshpaz kanalidagi buyurtma matni; ombor (KV)
          // o'rnatilmagan bo'lsa ham yetkazuvchilarga shu matn yuboriladi.
          await notifyOrderReady(orderId, tgId, baseText);
          await editMessageText(
            callback.message.chat.id,
            callback.message.message_id,
            `${baseText}\n\n✅ Tayyor qilindi`,
          );
        } else {
          await notifyOrderDelivered(orderId, tgId);
          await editMessageText(
            callback.message.chat.id,
            callback.message.message_id,
            `${baseText}\n\n🚚 Yetkazildi`,
          );
        }
      }
      return { ok: true };
    }

    // ── Matnli xabar (buyruq) ─────────────────────────────────────────
    const text = body?.message?.text ?? "";
    const chatId = body?.message?.chat?.id;
    if (!chatId) return { ok: true };

    const from = body.message?.from;
    const name = from?.first_name ?? from?.username ?? "mehmon";
    const trimmed = text.trim();
    const startMatch = trimmed.match(/^\/start(?:\s+connect_([A-Za-z0-9]+))?$/);

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
          ? `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!\n\nAkkountni ulash uchun saytimizga o'ting va profil sahifasidagi "Telegramdan kirish" tugmasini bosing:\n\n${site}/profil\n\nShundan keyin bot sizga ulanish tugmasini yuboradi.\n\nℹ️ Sizning chat ID: ${chatId}`
          : `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!`;
        await sendMessage(chatId, messageText);
      }
    } else if (/^\/admin(@\S+)?$/.test(trimmed)) {
      // Admin panel — faqat egaga (OWNER_CHAT_ID). OWNER_CHAT_ID
      // o'rnatilmagan bo'lsa (dev rejim), tugma yuboriladi — panelni
      // parol himoya qiladi.
      const fromId = body.message?.from?.id;
      const isOwner =
        !OWNER_CHAT_ID ||
        (fromId !== undefined && String(fromId) === String(OWNER_CHAT_ID));
      const adminUrl = SITE_URL ? `${SITE_URL.replace(/\/+$/, "")}/admin` : "";

      if (isOwner && adminUrl) {
        await sendMessage(
          chatId,
          "🛠 Admin panelni ochish uchun tugmani bosing — hammasi shu yerda ochiladi:",
          {
            inline_keyboard: [
              [{ text: "🛠 Admin panel", web_app: { url: adminUrl } }],
            ],
          },
        );
      } else {
        await sendMessage(
          chatId,
          "Kechirasiz, bu buyruqdan foydalanish uchun ruxsat yo'q. 🙅",
        );
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("Telegram webhook xatosi:", error);
    return { ok: true };
  }
});
