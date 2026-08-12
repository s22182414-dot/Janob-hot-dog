import { defineEventHandler, readBody } from "h3";
import {
  answerCallbackQuery,
  editMessageText,
  notifyOrderDelivered,
  notifyOrderReady,
  sendMessage,
} from "../../../lib/telegram-notify";

const SITE_URL = process.env["SITE_URL"] ?? "";
const ADMIN_PASSWORD = process.env["VITE_ADMIN_PASSWORD"] ?? "";

// /admin yozilganda parol so'raladi — keyingi xabar parol deb hisoblanadi.
const pendingAdminAuth = new Map<number, true>();

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
 * - /start (oddiy) — xush kelibsiz matni + bosh sahifani ochadigan
 *   "🌭 Bizning menyu" web_app tugmasi.
 * - /admin — parol so'raladi; to'g'ri bo'lsa admin panelni Mini App sifatida
 *   ochadigan tugma yuboriladi, noto'g'ri bo'lsa "Xato" deydi.
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

    // ── /admin uchun parol kutilmoqda — keyingi xabar parol deb hisoblanadi. ──
    if (pendingAdminAuth.has(chatId)) {
      pendingAdminAuth.delete(chatId);
      const adminUrl = SITE_URL ? `${SITE_URL.replace(/\/+$/, "")}/admin` : "";
      if (ADMIN_PASSWORD && trimmed === ADMIN_PASSWORD && adminUrl) {
        await sendMessage(
          chatId,
          "✅ Parol to'g'ri! Admin panelni ochish uchun tugmani bosing — hammasi shu yerda ochiladi:",
          {
            inline_keyboard: [
              [{ text: "🛠 Admin panel", web_app: { url: adminUrl } }],
            ],
          },
        );
      } else {
        await sendMessage(
          chatId,
          "❌ Xato! Parol noto'g'ri. Qayta urinish uchun /admin yozing.",
        );
      }
      return { ok: true };
    }

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
        // Oddiy /start — xush kelibsiz matni + bosh sahifani ochadigan
        // web_app (Mini App) tugmasi.
        const site = SITE_URL ? SITE_URL.replace(/\/+$/, "") : "";
        const messageText = site
          ? `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!\n\nEng mazali hot-doglar, gazaklar va ichimliklar — hammasi bizning menyuda. Buyurtma berish uchun quyidagi tugmani bosing, hammasi shu yerda bo'ladi:`
          : `Assalomu alaykum, ${name}! 👋\n\n🌭 Janob Hot-Dog botiga xush kelibsiz!`;
        if (site) {
          await sendMessage(chatId, messageText, {
            inline_keyboard: [
              [{ text: "🌭 Bizning menyu", web_app: { url: site } }],
            ],
          });
        } else {
          await sendMessage(chatId, messageText);
        }
      }
    } else if (/^\/admin(@\S+)?$/.test(trimmed)) {
      // Admin panel — avval parol so'raladi (pendingAdminAuth), to'g'ri
      // parol kiritilgach tugma yuboriladi. Parol VITE_ADMIN_PASSWORD.
      pendingAdminAuth.set(chatId, true);
      await sendMessage(chatId, "🔐 Admin panel uchun parolni kiriting:");
    }

    return { ok: true };
  } catch (error) {
    console.error("Telegram webhook xatosi:", error);
    return { ok: true };
  }
});
