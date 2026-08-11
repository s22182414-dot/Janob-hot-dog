import { defineEventHandler, readBody } from "h3";
import { addOrder, getOrders, type SavedOrder } from "../../lib/order-store";

export default defineEventHandler(async (event) => {
  try {
    if (event.method === "POST") {
      const body = await readBody<SavedOrder>(event);
      if (!body?.id || !body?.name || !Array.isArray(body?.lines)) {
        return { ok: false, error: "invalid order" };
      }
      await addOrder(body);
      return { ok: true, id: body.id };
    }

    // GET — buyurtmalar ro'yxati (admin panel uchun)
    const orders = await getOrders();
    return { ok: true, orders };
  } catch (error) {
    console.error("Orders API xatosi:", error);
    return { ok: false, error: "server error" };
  }
});
