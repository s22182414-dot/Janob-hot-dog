import type { SavedOrder } from "./order-store";

const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
const OWNER_CHAT_ID = process.env["OWNER_CHAT_ID"] ?? "";

const modeLabel = {
  delivery: "Yetkazib berish",
  pickup: "Olib ketish",
} as const;

const paymentLabel = {
  cash: "Naqd pul",
  card: "Karta",
} as const;

/**
 * Yangi buyurtma haqida egasining Telegram chatiga xabar yuboradi.
 * OWNER_CHAT_ID o'rnatilmagan bo'lsa, hech narsa qilmaydi.
 */
export async function notifyOrder(order: SavedOrder) {
  if (!BOT_TOKEN || !OWNER_CHAT_ID) return;

  const lines = order.lines
    .map(
      (l) =>
        `• ${l.qty} × ${l.name} — ${(l.price * l.qty).toLocaleString("uz-UZ")} so'm`,
    )
    .join("\n");

  const text = [
    "🛒 <b>Yangi buyurtma!</b>",
    "",
    `👤 <b>${order.name}</b>${order.tg ? ` (@${order.tg})` : ""}`,
    `📞 ${order.phone}`,
    `🚚 ${modeLabel[order.mode]}`,
    ...(order.payment ? [`💳 To'lov: ${paymentLabel[order.payment]}`] : []),
    ...(order.address ? [`📍 ${order.address}`] : []),
    "",
    lines,
    "",
    `💰 <b>Jami: ${order.total.toLocaleString("uz-UZ")} so'm</b>`,
    `🕐 ${new Date(order.createdAt).toLocaleString("uz-UZ")}`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: OWNER_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      },
    );
    if (!res.ok) {
      console.error("Telegram buyurtma xabari xatosi:", await res.text());
    }
  } catch (error) {
    console.error("Telegram buyurtma xabari yuborilmadi:", error);
  }
}
