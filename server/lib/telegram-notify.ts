import {
  getOrderById,
  updateOrderStatus,
  type SavedOrder,
} from "./order-store";

const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
const OWNER_CHAT_ID = process.env["OWNER_CHAT_ID"] ?? "";
const COOKS_CHAT_ID = process.env["COOKS_CHAT_ID"] ?? "";
const COURIERS_CHAT_ID = process.env["COURIERS_CHAT_ID"] ?? "";

const modeLabel = {
  delivery: "Yetkazib berish",
  pickup: "Olib ketish",
} as const;

type ReplyMarkup = {
  inline_keyboard: {
    text: string;
    callback_data?: string;
    url?: string;
    web_app?: { url: string };
  }[][];
};

async function tgCall(method: string, payload: Record<string, unknown>) {
  if (!BOT_TOKEN) {
    console.error(
      `Telegram ${method} yuborilmadi: TELEGRAM_BOT_TOKEN o'rnatilmagan.`,
    );
    return;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      console.error(`Telegram ${method} xatosi:`, await res.text());
    }
  } catch (error) {
    console.error(`Telegram ${method} uzilish:`, error);
  }
}

export function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: ReplyMarkup,
) {
  return tgCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

export function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
) {
  return tgCall("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
  });
}

export function answerCallbackQuery(callbackQueryId: string) {
  return tgCall("answerCallbackQuery", { callback_query_id: callbackQueryId });
}

/** Buyurtma matnini barcha kanallar uchun bitta joyda quramiz. */
export function buildOrderText(order: SavedOrder): string {
  const lines = order.lines
    .map(
      (l) =>
        `• ${l.qty} × ${l.name} — ${(l.price * l.qty).toLocaleString("uz-UZ")} so'm`,
    )
    .join("\n");

  return [
    `👤 <b>${order.name}</b>${order.tg ? ` (@${order.tg})` : ""}`,
    `📞 ${order.phone}`,
    `🚚 ${modeLabel[order.mode]}`,
    ...(order.address ? [`📍 ${order.address}`] : []),
    "",
    lines,
    "",
    `💰 <b>Jami: ${order.total.toLocaleString("uz-UZ")} so'm</b>`,
    `🕐 ${new Date(order.createdAt).toLocaleString("uz-UZ")}`,
  ].join("\n");
}

/**
 * Yangi buyurtma:
 *  - egasiga (OWNER_CHAT_ID) oddiy xabar,
 *  - oshpazlar kanaliga (COOKS_CHAT_ID) "✅ Tayyor" tugmasi bilan
 *    (yetkazib berish ham, olib ketish ham — bitta kanal),
 *  - yetkazib berish bo'lsa — bir vaqtning o'zida yetkazib beruvchilar
 *    kanaliga (COURIERS_CHAT_ID) "🚚 Yetkazildi" tugmasi bilan.
 */
export async function notifyOrder(order: SavedOrder) {
  if (OWNER_CHAT_ID) {
    await sendMessage(
      Number(OWNER_CHAT_ID),
      `🛒 <b>Yangi buyurtma!</b>\n\n${buildOrderText(order)}`,
    );
  }
  // Callback data'ga foydalanuvchining Telegram ID'sini ham qo'shamiz —
  // ombor (KV) o'rnatilmagan bo'lsa ham "Tayyor" bosilganda foydalanuvchiga
  // bildirishnoma yuborish imkoni bo'ladi.
  const tgSuffix = order.tgId ? `:${order.tgId}` : "";

  if (COOKS_CHAT_ID) {
    await sendMessage(
      Number(COOKS_CHAT_ID),
      `🍳 <b>Yangi buyurtma!</b>\n\n${buildOrderText(order)}`,
      {
        inline_keyboard: [
          [
            {
              text: "✅ Tayyor",
              callback_data: `order_ready:${order.id}${tgSuffix}`,
            },
          ],
        ],
      },
    );
  }
  if (order.mode === "delivery" && COURIERS_CHAT_ID) {
    await sendMessage(
      Number(COURIERS_CHAT_ID),
      `🚚 <b>Yetkazish uchun buyurtma!</b>\n\n${buildOrderText(order)}`,
      {
        inline_keyboard: [
          [
            {
              text: "🚚 Yetkazildi",
              callback_data: `order_delivered:${order.id}${tgSuffix}`,
            },
          ],
        ],
      },
    );
  }
}

/**
 * "Tayyor" bosildi:
 *  - foydalanuvchiga (Telegram ID) "ovqatingiz tayyor" bildirishnomasi,
 *  - buyurtma holati "ready" ga o'tkaziladi.
 * (Yetkazib beruvchilar kanaliga buyurtma allaqachon yuborilgan.)
 */
/**
 * "Tayyor" bosildi. Buyurtma omborda topilmasa ham (KV o'rnatilmagan bo'lsa)
 * callback data'dagi tgId orqali foydalanuvchiga bildirishnoma yuboriladi.
 */
export async function notifyOrderReady(orderId: string, tgId?: number) {
  const order = await getOrderById(orderId);
  const notifyTgId = order?.tgId ?? tgId;

  if (order) {
    // Buyurtma topildi: takroriy bosilgan bo'lsa qayta xabar yuborilmaydi.
    if (order.status === "ready" || order.status === "delivered") return;
    await updateOrderStatus(orderId, "ready");
  } else if (!notifyTgId) {
    return; // Buyurtma ham, tgId ham yo'q — yuboradigan hech narsa yo'q.
  }

  if (notifyTgId) {
    const userText =
      order?.mode === "delivery"
        ? `✅ <b>Ovqatingiz tayyor!</b>\n\nTez orada yetkazib beramiz. 🚚`
        : `✅ <b>Sizning buyurtmangiz tayyor!</b>\n\nOlib ketishingiz mumkin. 😋`;
    await sendMessage(notifyTgId, userText);
  }
}

/**
 * "Yetkazildi" bosildi — foydalanuvchiga yetkazilganlik bildirishnomasi,
 * buyurtma holati "delivered" ga o'tkaziladi.
 */
export async function notifyOrderDelivered(orderId: string, tgId?: number) {
  const order = await getOrderById(orderId);
  const notifyTgId = order?.tgId ?? tgId;

  if (order) {
    if (order.status === "delivered") return;
    await updateOrderStatus(orderId, "delivered");
  } else if (!notifyTgId) {
    return;
  }

  if (notifyTgId) {
    await sendMessage(
      notifyTgId,
      `🚚 <b>Ovqatingiz yetkazildi!</b>\n\nYoqimli ishtaha! 😋`,
    );
  }
}
