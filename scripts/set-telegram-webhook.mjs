// Telegram bot webhookini ro'yxatdan o'tkazish:
//   npm run tg:set-webhook -- https://sizning-saytingiz.uz
// Webhook URL HTTPS bo'lishi shart va saytning o'zi ishlab turishi kerak.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const tokenLine = readFileSync(envPath, "utf8")
  .split("\n")
  .find((l) => l.startsWith("TELEGRAM_BOT_TOKEN="));

if (!tokenLine) {
  console.error("Xato: .env faylida TELEGRAM_BOT_TOKEN topilmadi.");
  process.exit(1);
}

const token = tokenLine.slice("TELEGRAM_BOT_TOKEN=".length).trim();
const url = process.argv[2];

if (!url) {
  console.error(
    "Xato: webhook URL ko'rsatilmadi.\nIshlatish: npm run tg:set-webhook -- https://sizning-saytingiz.uz",
  );
  process.exit(1);
}

const webhookUrl = `${url.replace(/\/$/, "")}/api/telegram/webhook`;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url: webhookUrl }),
});
const data = await res.json();

if (data.ok) {
  console.log(`✅ Webhook o'rnatildi: ${webhookUrl}`);
} else {
  console.error("❌ Xatolik:", data.description ?? data);
  process.exit(1);
}

// Bot menyusi (buyruqlar tugmasi) ishlatilmaydi — maxsus tugmalar (web_app)
// orqali ishlaydi, shuning uchun menyu qo'shilmaydi.
// Menyuni tozalash uchun: setMyCommands { commands: [] }.
