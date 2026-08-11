import { defineEventHandler, getQuery } from "h3";
import { takePendingLink } from "../../../lib/tg-store";

/**
 * Sayt /profil?tg=<token> ga qaytganda chaqiradi.
 * Bot tomonidan saqlangan token bo'yicha Telegram foydalanuvchisini qaytaradi
 * (token bir martalik — ishlatilgach o'chadi).
 */
export default defineEventHandler((event) => {
  const query = getQuery(event);
  const token = typeof query["token"] === "string" ? query["token"] : "";
  if (!token) {
    return { ok: false, error: "missing token" };
  }
  const link = takePendingLink(token);
  if (!link) {
    return { ok: false, error: "expired" };
  }
  return {
    ok: true,
    user: {
      id: link.tgId ?? 0,
      first_name: link.firstName ?? "",
      username: link.username ?? "",
    },
  };
});
