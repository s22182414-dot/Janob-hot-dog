/**
 * Telegram Mini App (WebApp) SDK bilan ishlash uchun yordamchi.
 * SDK Telegram tomonidan avtomatik yuklanmasa (ba'zi qurilmalarda
 * kechikadi) — rasmiy scriptni o'zimiz yuklaymiz.
 */

export type TgWebApp = {
  initData: string;
  initDataUnsafe?: {
    user?: { id: number; username?: string; first_name?: string };
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
};

function getWebApp(): TgWebApp | null {
  return (
    (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram
      ?.WebApp ?? null
  );
}

let loadPromise: Promise<TgWebApp | null> | null = null;

/** SDK tayyor bo'lishini kutadi va WebApp obyektini qaytaradi. */
export function loadTelegramWebApp(): Promise<TgWebApp | null> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    const existing = getWebApp();
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => {
      const webApp = getWebApp();
      if (!webApp) loadPromise = null; // hali yo'q — keyingi chaqiriqda qayta urinamiz
      resolve(webApp);
    };
    script.onerror = () => {
      loadPromise = null; // tarmoq xatosi — keyingi chaqiriqda qayta urinamiz
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loadPromise;
}
