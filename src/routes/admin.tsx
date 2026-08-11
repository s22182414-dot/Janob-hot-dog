import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  CreditCard,
  Lock,
  MapPin,
  Phone,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { MenuManager } from "@/components/menu-manager";
import { config } from "@/lib/config";
import { loadTelegramWebApp } from "@/lib/telegram-webapp";
import { formatSom } from "@/data/menu";

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search["tab"] === "menyu" ? ("menyu" as const) : ("buyurtmalar" as const),
  }),
  head: () => ({
    meta: [
      { title: "Admin panel — Janob Hot-Dog" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type SavedOrder = {
  id: string;
  name: string;
  phone: string;
  mode: "delivery" | "pickup";
  payment?: "cash" | "card";
  address?: string;
  lines: { name: string; qty: number; price: number }[];
  total: number;
  createdAt: number;
  tg?: string;
};

const ORDERS_KEY = "janob_orders";
const AUTH_KEY = "janob_admin_auth";

function loadOrders(): SavedOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw) as SavedOrder[];
  } catch {
    /* ignore */
  }
  return [];
}

function mergeOrders(server: SavedOrder[], local: SavedOrder[]): SavedOrder[] {
  const byId = new Map<string, SavedOrder>();
  for (const o of server) byId.set(o.id, o);
  for (const o of local) if (!byId.has(o.id)) byId.set(o.id, o);
  return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
}

function AdminPage() {
  const [authed, setAuthed] = useState(
    () =>
      typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1",
  );
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [orders, setOrders] = useState<SavedOrder[]>(loadOrders);
  const navigate = useNavigate();
  const { tab } = Route.useSearch();
  const setTab = (t: "buyurtmalar" | "menyu") =>
    navigate({ to: "/admin", search: { tab: t } });

  const login = () => {
    if (pass === config.adminPassword) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setError(false);
      setOrders(loadOrders());
    } else {
      setError(true);
    }
  };

  // Serverdagi buyurtmalarni o'qiymiz — istalgan qurilmadan berilgan
  // buyurtmalar ham admin panelda ko'rinadi.
  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = (await res.json()) as {
        ok?: boolean;
        orders?: SavedOrder[];
      };
      if (data?.ok && Array.isArray(data.orders)) {
        setOrders(mergeOrders(data.orders, loadOrders()));
      }
    } catch {
      /* server bo'lmasa lokal buyurtmalar qoladi */
    }
  }, []);

  // Yangilanadi: sahifa ochilganda, oynaga qaytganda va har 15 soniyada.
  useEffect(() => {
    if (!authed) return;
    refreshOrders();
    const id = setInterval(refreshOrders, 15000);
    const onFocus = () => refreshOrders();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [authed, refreshOrders]);

  // Telegram bot orqali (/admin → Mini App) ochilganda — egasi avtomatik
  // kiradi: initData serverda tekshiriladi (faqat OWNER_CHAT_ID mos bo'lsa).
  useEffect(() => {
    if (authed) return;
    let cancelled = false;
    (async () => {
      const webApp = await loadTelegramWebApp();
      if (cancelled || !webApp?.initData) return;
      webApp.ready();
      webApp.expand();
      webApp.setHeaderColor("#1a1412");
      webApp.setBackgroundColor("#1a1412");
      try {
        const res = await fetch("/api/admin/tg-auth", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ initData: webApp.initData }),
        });
        const data = (await res.json()) as { ok?: boolean };
        if (!cancelled && data?.ok) {
          sessionStorage.setItem(AUTH_KEY, "1");
          setAuthed(true);
          setOrders(loadOrders());
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  if (!authed) {
    return (
      <section className="relative px-4 pt-16 pb-28 sm:px-6 md:pt-40">
        <div className="veil pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-sm">
          <div className="glass animate-rise rounded-3xl p-8 text-center">
            <span className="bg-ember-gradient mx-auto flex size-14 items-center justify-center rounded-2xl">
              <Lock className="size-7 text-primary-foreground" />
            </span>
            <h1 className="font-display mt-5 text-2xl font-bold">
              Admin panel
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Davom etish uchun parolni kiriting
            </p>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Parol"
              autoFocus
              className="glass mt-6 w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {error && (
              <p className="mt-3 text-sm text-destructive">Parol noto'g'ri</p>
            )}
            <button
              onClick={login}
              className="bg-ember-gradient lift mt-4 w-full rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Kirish
            </button>
          </div>
        </div>
      </section>
    );
  }

  const totalSum = orders.reduce((s, o) => s + o.total, 0);
  const today = new Date().toDateString();
  const todayCount = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today,
  ).length;
  const modeLabel = {
    delivery: "Yetkazib berish",
    pickup: "Olib ketish",
  } as const;
  const paymentLabel = {
    cash: "Naqd pul",
    card: "Karta",
  } as const;

  return (
    <section className="relative px-4 pt-16 pb-28 sm:px-6 md:pt-40">
      <div className="veil pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Admin <span className="text-ember-gradient">panel</span>
          </h1>
          <Link
            to="/"
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowLeft className="size-4" /> Saytga qaytish
          </Link>
        </div>

        <div className="mt-6 hidden gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex">
          <button
            onClick={() => setTab("buyurtmalar")}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              tab === "buyurtmalar"
                ? "bg-ember-gradient text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <ReceiptText className="size-4" /> Buyurtmalar
          </button>
          <button
            onClick={() => setTab("menyu")}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              tab === "menyu"
                ? "bg-ember-gradient text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <UtensilsCrossed className="size-4" /> Menyu
          </button>
        </div>

        {tab === "buyurtmalar" ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="glass rounded-3xl p-5">
                <ShoppingBag className="size-6 text-primary" />
                <p className="mt-3 font-display text-3xl font-bold">
                  {orders.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Jami buyurtmalar
                </p>
              </div>
              <div className="glass rounded-3xl p-5">
                <BarChart3 className="size-6 text-primary" />
                <p className="mt-3 font-display text-3xl font-bold">
                  {formatSom(totalSum)}
                </p>
                <p className="text-sm text-muted-foreground">Umumiy summa</p>
              </div>
              <div className="glass rounded-3xl p-5">
                <Clock className="size-6 text-primary" />
                <p className="mt-3 font-display text-3xl font-bold">
                  {todayCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bugungi buyurtmalar
                </p>
              </div>
            </div>

            <div className="glass mt-6 rounded-3xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                  <ReceiptText className="size-5 text-primary" /> Buyurtmalar
                </h2>
                <button
                  onClick={() => refreshOrders()}
                  className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <RefreshCw className="size-3.5" /> Yangilash
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Hali buyurtmalar yo'q
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {orders.map((o) => (
                    <li
                      key={o.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {o.name}
                          {o.tg ? (
                            <span className="text-primary"> · @{o.tg}</span>
                          ) : null}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(o.createdAt).toLocaleString("uz-UZ")} ·{" "}
                          {modeLabel[o.mode]}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <Phone className="size-3" /> {o.phone}
                        </p>
                        {o.address ? (
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            <MapPin className="size-3" /> {o.address}
                          </p>
                        ) : null}
                        {o.payment ? (
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            <CreditCard className="size-3" />{" "}
                            {paymentLabel[o.payment]}
                          </p>
                        ) : null}
                        <ul className="mt-1 text-xs text-muted-foreground">
                          {o.lines.map((l) => (
                            <li key={l.name}>
                              {l.qty} × {l.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <span className="text-ember-gradient shrink-0 font-semibold">
                        {formatSom(o.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <MenuManager />
        )}
      </div>
    </section>
  );
}
