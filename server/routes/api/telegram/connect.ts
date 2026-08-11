import { defineEventHandler, getQuery, readBody } from "h3";
import { setConnect, takeConnect } from "../../../lib/tg-store";

type ConnectBody = {
  code?: string;
  user?: {
    id?: number;
    first_name?: string;
    username?: string;
  };
};

/**
 * Telegram akkount ulashni brauzerga yetkazish.
 *
 * - POST { code, user } — Mini App (Telegram ichida) ulangach serverga yozadi.
 * - GET ?code=... — saytga oddiy kirganda brauzer ulanishni oladi (bir martalik).
 */
export default defineEventHandler(async (event) => {
  if (event.method === "POST") {
    const body = await readBody<ConnectBody>(event);
    if (!body?.code || !body?.user?.id) {
      return { ok: false, error: "bad request" };
    }
    setConnect(body.code, {
      id: body.user.id,
      first_name: body.user.first_name ?? "",
      ...(body.user.username ? { username: body.user.username } : {}),
    });
    return { ok: true };
  }

  const query = getQuery(event);
  const code = typeof query["code"] === "string" ? query["code"] : "";
  if (!code) return { ok: false, error: "missing code" };
  const conn = takeConnect(code);
  if (!conn) return { ok: false, error: "not found" };
  return { ok: true, user: conn.user };
});
