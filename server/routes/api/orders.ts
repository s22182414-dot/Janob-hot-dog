import { defineEventHandler, readBody } from "h3";
import { addOrder, getOrders, type SavedOrder } from "../../lib/order-store";
import { notifyOrder } from "../../lib/telegram-notify";

export default defineEventHandler(async (event) => {
  try {
    if (event.method === "POST") {
      const body = await readBody<SavedOrder>(event);
      if (!body?.id || !body?.name || !Array.isArray(body?.lines)) {
        return { ok: false, error: "invalid order" };
      }
      // Ombor (KV/fayl) mavjud bo'lsa saqlaymiz; bo'lmasa ham
      // buyurtma Telegram orqali egasiga yetkaziladi.
      let persisted = false;
      try {
        await addOrder(body);
        persisted = true;
      } catch (error) {
        console.error("Buyurtma omborga saqlanmadi:", error);
      }
      await notifyOrder(body);
      return { ok: true, id: body.id, persisted };
    }

    // GET — buyurtmalar ro'yxati (admin panel uchun)
    const orders = await getOrders();
    return { ok: true, orders };
  } catch (error) {
    console.error("Orders API xatosi:", error);
    return { ok: false, error: "server error" };
  }
});
