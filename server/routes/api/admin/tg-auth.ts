import { defineEventHandler, readBody } from "h3";
import { createHmac, timingSafeEqual } from "node:crypto";

const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
const OWNER_CHAT_ID = process.env["OWNER_CHAT_ID"] ?? "";

/** Telegram initData (application/x-www-form-urlencoded) ni parslaydi. */
function parseInitData(initData: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of initData.split("&")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    try {
      out[decodeURIComponent(pair.slice(0, idx))] = decodeURIComponent(
        pair.slice(idx + 1),
      );
    } catch {
      /* ignore */
    }
  }
  return out;
}

/**
 * Telegram Mini App initData imzosini tekshiradi (rasmiy algoritm):
 * secret_key = HMAC_SHA256(key="WebAppData", data=bot_token)
 * hash = HMAC_SHA256(key=secret_key, data=key=value qatorlari)
 * To'g'ri bo'lsa foydalanuvchi id qaytaradi, aks holda null.
 */
function verifyInitData(initData: string): number | null {
  if (!BOT_TOKEN || !initData) return null;
  const params = parseInitData(initData);
  const hash = params["hash"];
  delete params["hash"];
  if (!hash) return null;

  const checkString = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  const computed = createHmac("sha256", secretKey).update(checkString).digest();
  const expected = Buffer.from(hash, "hex");

  if (
    computed.length !== expected.length ||
    !timingSafeEqual(computed, expected)
  ) {
    return null;
  }

  try {
    const user = JSON.parse(params["user"] ?? "null") as { id?: number } | null;
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Admin panelga Telegram orqali kirish:
 * Mini App ichidagi initData ni tekshiradi va faqat egaga (OWNER_CHAT_ID)
 * ruxsat beradi. OWNER_CHAT_ID o'rnatilmagan bo'lsa — parol kerak bo'ladi.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ initData?: string }>(event);
    const userId = verifyInitData(body?.initData ?? "");
    if (!userId) return { ok: false, error: "invalid" };
    if (!OWNER_CHAT_ID || String(userId) !== String(OWNER_CHAT_ID)) {
      return { ok: false, error: "forbidden" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "server error" };
  }
});
