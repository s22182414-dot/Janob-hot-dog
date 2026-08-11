/**
 * Telegram akkount ulash uchun vaqtinchalik code → foydalanuvchi xaritasi.
 *
 * Oqim:
 *  1. Brauzer "Telegramga ulanish" bosilganda code yaratib,
 *     https://t.me/<bot>?start=connect_<code> ga yo'naltiradi.
 *  2. Bot web_app tugma URL'iga code'ni qo'shadi: <SITE_URL>/profil?tg=<code>.
 *  3. Mini App (Telegram ichida) initData orqali ulanadi va
 *     POST /api/telegram/connect { code, user } bilan serverga yozadi.
 *  4. Foydalanuvchi saytga oddiy kirganda GET /api/telegram/connect?code=...
 *     orqali ulanishni oladi — Telegram ichidagi va brauzerdagi holat bir xil.
 */

export type StoredConnect = {
  user: {
    id: number;
    first_name: string;
    username?: string;
  };
  createdAt: number;
};

const connects = new Map<string, StoredConnect>();
const TTL_MS = 30 * 60 * 1000;

function cleanExpired() {
  const now = Date.now();
  for (const [code, conn] of connects) {
    if (now - conn.createdAt > TTL_MS) connects.delete(code);
  }
}

export function setConnect(code: string, user: StoredConnect["user"]) {
  cleanExpired();
  connects.set(code, { user, createdAt: Date.now() });
}

/** Code bo'yicha foydalanuvchini oladi va code'ni o'chiradi (bir martalik). */
export function takeConnect(code: string): StoredConnect | undefined {
  cleanExpired();
  const conn = connects.get(code);
  if (conn) connects.delete(code);
  return conn;
}
