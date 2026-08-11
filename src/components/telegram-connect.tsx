import { config } from "@/lib/config";
import { Check, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

type TgUnsafeUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe?: { user?: TgUnsafeUser };
        ready: () => void;
        close: () => void;
      };
    };
  }
}

const STORAGE_KEY = "janob_telegram";
const CODE_KEY = "janob_tg_code";

function randomCode(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function ensureCode(): string {
  const existing = localStorage.getItem(CODE_KEY);
  if (existing) return existing;
  const code = randomCode();
  localStorage.setItem(CODE_KEY, code);
  return code;
}

function parseInitDataUnsafeUser(
  u: TgUnsafeUser | undefined,
): TelegramUser | null {
  if (!u?.id) return null;
  return {
    id: u.id,
    first_name: u.first_name ?? "",
    ...(u.last_name ? { last_name: u.last_name } : {}),
    ...(u.username ? { username: u.username } : {}),
    ...(u.photo_url ? { photo_url: u.photo_url } : {}),
    auth_date: Math.floor(Date.now() / 1000),
    hash: "",
  };
}

function parseInitDataUser(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const raw = params.get("user");
    if (!raw) return null;
    const u = JSON.parse(raw) as Partial<TelegramUser>;
    if (!u.id) return null;
    return {
      id: u.id,
      first_name: u.first_name ?? "",
      ...(u.last_name ? { last_name: u.last_name } : {}),
      ...(u.username ? { username: u.username } : {}),
      ...(u.photo_url ? { photo_url: u.photo_url } : {}),
      auth_date: Number(
        params.get("auth_date") ?? Math.floor(Date.now() / 1000),
      ),
      hash: params.get("hash") ?? "",
    };
  } catch {
    return null;
  }
}

export function TelegramConnect() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as TelegramUser);
    } catch {
      /* ignore */
    }
  }, []);

  // Telegram Mini App ichida ochilganda initData orqali avtomatik ulanamiz —
  // foydalanuvchi hech qayerga o'tib ketmaydi, hammasi Telegram ichida bo'ladi.
  useEffect(() => {
    const tryConnect = () => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) return false;
      webApp.ready();
      const tgUser =
        parseInitDataUser(webApp.initData) ??
        parseInitDataUnsafeUser(webApp.initDataUnsafe?.user);
      if (tgUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tgUser));
        setUser(tgUser);
        toast.success("Telegram akkount ulandi! ✅");
        return true;
      }
      return false;
    };

    if (tryConnect()) {
      // Mini App'da ulandik — agar code bo'lsa, serverga yozamiz,
      // shunda saytga oddiy kirganda ham brauzer ulanishni oladi.
      const params = new URLSearchParams(window.location.search);
      const code = params.get("tg");
      const webApp = window.Telegram?.WebApp;
      if (code && webApp?.initData) {
        const u = parseInitDataUser(webApp.initData);
        if (u) {
          fetch("/api/telegram/connect", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              code,
              user: {
                id: u.id,
                first_name: u.first_name,
                ...(u.username ? { username: u.username } : {}),
              },
            }),
          }).catch(() => {
            /* ignore */
          });
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
      return;
    }

    // Telegram SDK hali mavjud bo'lmasa (ba'zi qurilmalarda kechikadi) —
    // rasmiy SDK'ni o'zimiz yuklaymiz va ulanishni qayta urinamiz.
    if (!window.Telegram) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      script.onload = tryConnect;
      document.head.appendChild(script);
    }
  }, []);

  // Oddiy brauzerda (Telegram ichida emas): bot orqali ulangan bo'lsa,
  // serverdan ulanishni olamiz — holat ikkala joyda bir xil bo'ladi.
  useEffect(() => {
    if (window.Telegram?.WebApp?.initData) return; // Mini App'da — yuqoridagi oqim
    const code = localStorage.getItem(CODE_KEY);
    if (!code) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/telegram/connect?code=${encodeURIComponent(code)}`,
        );
        const data = (await res.json()) as {
          ok?: boolean;
          user?: TelegramUser;
        };
        if (data?.ok && data.user) {
          const tgUser: TelegramUser = {
            ...data.user,
            auth_date: Math.floor(Date.now() / 1000),
            hash: "",
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tgUser));
          setUser(tgUser);
          toast.success("Telegram akkount ulandi! ✅");
        }
      } catch {
        /* ignore */
      } finally {
        localStorage.removeItem(CODE_KEY);
      }
    })();
  }, []);

  const startConnect = () => {
    // Code yaratamiz — bot shu code bilan tugma yuboradi, ulanish serverda
    // saqlanadi va saytga oddiy kirganda ham brauzer oladi.
    const code = ensureCode();
    window.open(
      `https://t.me/${config.telegramBot}?start=connect_${code}`,
      "_blank",
      "noopener",
    );
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    toast.success("Telegram akkount uzildi");
  };

  const inWebApp = typeof window !== "undefined" && !!window.Telegram?.WebApp;

  return (
    <div className="glass animate-rise mt-6 rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <span className="bg-ember-gradient flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Send className="size-5 text-primary-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Telegram akkount</h2>
          <p className="text-sm text-muted-foreground">
            {user ? `@${user.username ?? user.first_name}` : "Hali ulanmagan"}
          </p>
        </div>
      </div>

      {user ? (
        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <Check className="size-4 shrink-0" />
            Akkount ulandi: @{user.username ?? user.first_name}
          </p>
          <button
            onClick={() => {
              disconnect();
              // Telegram ichida ochilgan bo'lsa, uzgach chatga qaytamiz.
              if (inWebApp) window.Telegram?.WebApp.close();
            }}
            className="glass flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="size-4" /> Ulanishni uzish
          </button>
        </div>
      ) : (
        <div className="mt-4">
          {config.telegramBot === "YOUR_BOT_USERNAME" ? (
            <div className="rounded-xl border border-dashed border-amber-600/40 bg-amber-950/20 px-4 py-3 text-center text-xs text-amber-400">
              @BotFather orqali bot yarating va{" "}
              <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-amber-300">
                VITE_TG_BOT
              </code>{" "}
              muhit o'zgaruvchisiga bot username ni yozing
            </div>
          ) : (
            <button
              onClick={startConnect}
              className="bg-ember-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground"
            >
              <Send className="size-4" /> Telegramga ulanish
            </button>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Tugmani bosganingizda bot ochiladi — botdagi{" "}
            <span className="font-medium text-foreground">
              "Akkountni ulash"
            </span>{" "}
            tugmasini bosing va akkount ulanadi (hech qayerga o'tib ketmaysiz).
          </p>
        </div>
      )}
    </div>
  );
}
