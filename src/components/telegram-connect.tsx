import { config } from "@/lib/config";
import { Check, Loader, Send, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth: ((user: TelegramUser) => void) | null;
  }
}

const STORAGE_KEY = "janob_telegram";

export function TelegramConnect() {
  const id = useId();
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const handleAuth = useCallback((tgUser: TelegramUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tgUser));
    setUser(tgUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    window.onTelegramAuth = handleAuth;
    return () => {
      window.onTelegramAuth = null;
    };
  }, [handleAuth]);

  const loadWidget = useCallback(() => {
    if (loading) return;
    setLoading(true);

    // remove old widget scripts & containers
    document
      .querySelectorAll(`[data-tg-widget="${id}"]`)
      .forEach((el) => el.remove());

    const container = document.getElementById(`tg-container-${id}`);
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", config.telegramBot);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "14");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-tg-widget", id);
    container.appendChild(script);
  }, [id, loading]);

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

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
        <button
          onClick={disconnect}
          className="glass mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="size-4" /> Ulanishni uzish
        </button>
      ) : (
        <div className="mt-4">
          <div
            id={`tg-container-${id}`}
            className="flex justify-center [&_iframe]:!mx-auto [&_iframe]:!overflow-hidden"
          />

          {config.telegramBot === "YOUR_BOT_USERNAME" ? (
            <div className="mt-3 rounded-xl border border-dashed border-amber-600/40 bg-amber-950/20 px-4 py-3 text-center text-xs text-amber-400">
              @BotFather orqali bot yarating va{" "}
              <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-amber-300">
                VITE_TG_BOT
              </code>{" "}
              muhit o'zgaruvchisiga bot username ni yozing
            </div>
          ) : (
            <button
              onClick={loadWidget}
              disabled={loading}
              className="bg-ember-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {loading ? "Yuklanmoqda..." : "Telegramga ulanish"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
