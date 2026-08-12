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

// Bot chatidagi yozish maydoni yonidagi "Open" tugmasi — Mini App
// (menu button): bosh sahifani ochadigan web_app tugmasi o'rnatiladi.
// (BotFather'da ham sozlash mumkin: /mybots -> Bot Settings -> Configure Mini App)
const siteRoot = url.replace(/\/$/, "");
const menuRes = await fetch(
  `https://api.telegram.org/bot${token}/setChatMenuButton`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      menu_button: {
        type: "web_app",
        text: "🌭 Menyu",
        web_app: { url: siteRoot },
      },
    }),
  },
);
const menuData = await menuRes.json();

if (menuData.ok) {
  console.log("✅ Mini App tugmasi o'rnatildi: 🌭 Menyu (bosh sahifa)");
} else {
  console.error("❌ setChatMenuButton xatoligi:", menuData.description ?? menuData);
}
