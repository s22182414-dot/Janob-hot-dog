import { useEffect, useState } from "react";
import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { config } from "@/lib/config";
import { formatSom } from "@/data/menu";
import { useTelegram } from "@/lib/use-telegram";

export function CartSheet() {
  const { lines, total, count, open, setOpen, setQty, remove, clear } =
    useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [formOpen, setFormOpen] = useState(false);
  const { tg } = useTelegram();

  // Savat yopilsa yoki bo'shab qolsa, rasmiylashtirish formasini tiklaymiz.
  useEffect(() => {
    if (!open || lines.length === 0) setFormOpen(false);
  }, [open, lines.length]);

  if (!open) return null;

  const placeOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Iltimos, ismingiz va telefon raqamingizni kiriting");
      return;
    }
    const order = {
      id: Date.now().toString(36),
      name: name.trim(),
      phone: phone.trim(),
      mode,
      lines: lines.map((l) => ({
        name: l.item.name,
        qty: l.qty,
        price: l.item.price,
      })),
      total,
      createdAt: Date.now(),
      tg: tg?.username ?? tg?.first_name,
    };
    // Lokal saqlash — mijozning o'z tarixi uchun
    try {
      const existing = JSON.parse(localStorage.getItem("janob_orders") ?? "[]");
      localStorage.setItem(
        "janob_orders",
        JSON.stringify([order, ...existing]),
      );
    } catch {
      /* ignore */
    }
    // Serverga yuboramiz — admin panel istalgan qurilmada ko'ra oladi
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(order),
      });
    } catch {
      /* server bo'lmasa ham buyurtma lokal saqlanadi */
    }
    toast.success(`Rahmat, ${name}! Buyurtmangiz qabul qilindi.`, {
      description: `${count} ta mahsulot · ${formatSom(total)} · ${mode === "delivery" ? "Yetkazib berish ~30 daqiqa" : "Olib ketish ~15 daqiqada tayyor"}${tg ? ` · Telegram: @${tg.username ?? tg.first_name}` : ""}`,
    });
    clear();
    setName("");
    setPhone("");
    setFormOpen(false);
    setOpen(false);
  };

  const startConnect = () => {
    // Code yaratamiz — bot shu code bilan tugma yuboradi, ulanish serverda
    // saqlanadi va saytga oddiy kirganda ham brauzer oladi.
    let code = localStorage.getItem("janob_tg_code");
    if (!code) {
      const arr = new Uint8Array(8);
      crypto.getRandomValues(arr);
      code = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem("janob_tg_code", code);
    }
    window.open(
      `https://t.me/${config.telegramBot}?start=connect_${code}`,
      "_blank",
      "noopener",
    );
  };

  const modeLabel = {
    delivery: "Yetkazib berish",
    pickup: "Olib ketish",
  } as const;

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      <button
        aria-label="Buyurtma panelini yopish"
        onClick={() => setOpen(false)}
        className="animate-in fade-in absolute inset-0 bg-background/70 backdrop-blur-sm duration-300"
      />
      <aside className="glass-strong animate-in slide-in-from-right relative flex h-full w-full max-w-md flex-col duration-400 sm:rounded-l-3xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="size-5 text-primary" /> Sizning buyurtmangiz
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Yopish"
            className="glass hidden size-9 items-center justify-center rounded-full sm:flex"
          >
            <X className="size-4" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="py-16 text-center text-sm text-muted-foreground">
              Savatchangiz bo'sh — mazali taom qo'shing.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="space-y-3">
                {lines.map((line) => (
                  <div
                    key={line.item.id}
                    className="glass flex gap-3 rounded-2xl p-3"
                  >
                    <img
                      src={line.item.image}
                      alt={line.item.name}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="size-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {line.item.name}
                      </p>
                      <p className="text-sm text-primary">
                        {formatSom(line.item.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => setQty(line.item.id, line.qty - 1)}
                          aria-label="Sonini kamaytirish"
                          className="glass flex size-7 items-center justify-center rounded-full"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-5 text-center text-sm">
                          {line.qty}
                        </span>
                        <button
                          onClick={() => setQty(line.item.id, line.qty + 1)}
                          aria-label="Sonini oshirish"
                          className="glass flex size-7 items-center justify-center rounded-full"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          onClick={() => remove(line.item.id)}
                          aria-label={`${line.item.name} ni o'chirish`}
                          className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <div className="glass grid grid-cols-2 gap-1 rounded-full p-1">
                  {(["delivery", "pickup"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`rounded-full py-2 text-sm font-medium transition-all ${
                        mode === m
                          ? "bg-ember-gradient text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {modeLabel[m]}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-amber-950/10 px-4 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <MessageCircle className="size-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${tg ? "text-emerald-400" : "text-muted-foreground"}`}
                      >
                        {tg ? `@${tg.username ?? tg.first_name}` : "Telegram"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tg
                          ? "Buyurtma holati xabarnomalari"
                          : "Buyurtma holati haqida xabardor bo'ling"}
                      </p>
                    </div>
                  </div>
                  {tg ? null : config.telegramBot !== "YOUR_BOT_USERNAME" ? (
                    <button
                      onClick={startConnect}
                      className="bg-ember-gradient shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      Telegramga ulanish
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-border px-6 pt-4 pb-24 md:pb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Jami</span>
                <span className="font-display text-xl font-semibold">
                  {formatSom(total)}
                </span>
              </div>
              {formOpen ? (
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ism familiya"
                    autoFocus
                    className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    inputMode="tel"
                    className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                  <button
                    onClick={placeOrder}
                    className="bg-ember-gradient lift w-full rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground"
                  >
                    Buyurtmani tasdiqlash
                  </button>
                  <button
                    onClick={() => setFormOpen(false)}
                    className="glass w-full rounded-2xl py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Ortga
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFormOpen(true)}
                  className="bg-ember-gradient lift w-full rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground"
                >
                  Buyurtmani rasmiylashtirish
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
