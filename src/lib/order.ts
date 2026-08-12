/**
 * Buyurtma raqami — order id (base36 timestamp) dan 4 xonali noyob raqam.
 * Bir xil buyurtma uchun har doim bir xil raqam chiqadi (mijoz toast'i,
 * kanal xabarlari va admin panel bir-biriga mos keladi).
 */
export function orderNumber(id: string): string {
  const n = parseInt(id, 36);
  return String(((Number.isFinite(n) ? n : 0) % 9000) + 1000);
}
