/** Sayt sozlamalari */
export const config = {
  /** @BotFather orqali yaratilgan bot username (masalan: "janob_hotdog_bot") */
  telegramBot:
    (import.meta.env["VITE_TG_BOT"] as string | undefined) ??
    "YOUR_BOT_USERNAME",
  /** Admin panelga kirish paroli (albatta o'zgartiring!) */
  adminPassword:
    (import.meta.env["VITE_ADMIN_PASSWORD"] as string | undefined) ??
    "admin123",
};
