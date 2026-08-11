/**
 * Telegram akkount ulash uchun vaqtinchalik token → foydalanuvchi xaritasi.
 *
 * Oqim:
 *  1. Sayt "Telegramga ulanish" bosilganda tasodifiy token yaratib,
 *     https://t.me/<bot>?start=connect_<token> ga yo'naltiradi.
 *  2. Bot /start connect_<token> ni qabul qilib, shu token ostida
 *     foydalanuvchini saqlaydi va "Akkountni ulash" tugmasi (saytga
 *     qaytaruvchi havola) bilan javob yuboradi.
 *  3. Tugma bosilganda sayt /profil?tg=<token> da ochiladi; sayt
 *     /api/telegram/link?token=... orqali foydalanuvchini oladi.
 */

export type PendingLink = {
  chatId: number;
  tgId?: number;
  firstName?: string;
  username?: string;
  createdAt: number;
};

const pending = new Map<string, PendingLink>();
const TTL_MS = 15 * 60 * 1000;

function cleanExpired() {
  const now = Date.now();
  for (const [token, link] of pending) {
    if (now - link.createdAt > TTL_MS) pending.delete(token);
  }
}

export function setPendingLink(token: string, link: PendingLink) {
  cleanExpired();
  pending.set(token, link);
}

/** Token bo'yicha foydalanuvchini oladi va tokenni o'chiradi (bir martalik). */
export function takePendingLink(token: string): PendingLink | undefined {
  cleanExpired();
  const link = pending.get(token);
  if (link) pending.delete(token);
  return link;
}
