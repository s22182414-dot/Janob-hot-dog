import { config } from "@/lib/config";
import { Loader, Send, X } from "lucide-react";
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

const STORAGE_KEY = "janob_telegram";
const PENDING_KEY = "janob_tg_pending";

function randomToken(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function TelegramConnect() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as TelegramUser);
    } catch {
      /* ignore */
    }
  }, []);

  // Bot tugmasi bosilgach sayt /profil?tg=<token> da ochiladi — shu yerda ulanamiz.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("tg");
    if (!token) return;

    const pending = localStorage.getItem(PENDING_KEY);
    const done = () => {
      localStorage.removeItem(PENDING_KEY);
      window.history.replaceState({}, "", window.location.pathname);
    };

    if (pending !== token) {
      // Token biznikiga to'g'ri kelmadi — faqat URL'ni tozalaymiz.
      done();
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/telegram/link?token=${encodeURIComponent(token)}`,
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
        } else {
          toast.error("Ulanish amalga oshmadi. Qaytadan urinib ko'ring.");
        }
      } catch {
        toast.error("Ulanish amalga oshmadi. Qaytadan urinib ko'ring.");
      } finally {
        setLoading(false);
        done();
      }
    })();
  }, []);

  const startConnect = () => {
    const token = randomToken();
    localStorage.setItem(PENDING_KEY, token);
    // Foydalanuvchini botga yo'naltiramiz — bot tugma yuboradi.
    window.open(
      `https://t.me/${config.telegramBot}?start=connect_${token}`,
      "_blank",
      "noopener",
    );
  };

  const disconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    toast.success("Telegram akkount uzildi");
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
              disabled={loading}
              className="bg-ember-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {loading ? "Ulanmoqda..." : "Telegramga ulanish"}
            </button>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Tugmani bosganingizda bot ochiladi — botdagi{" "}
            <span className="font-medium text-foreground">
              "Akkountni ulash"
            </span>{" "}
            tugmasini bosing va akkount ulanadi.
          </p>
        </div>
      )}
    </div>
  );
}
