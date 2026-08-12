import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { formatSom } from "@/data/menu";
import { useTelegram } from "@/lib/use-telegram";

/**
 * Savat ichidagi kontent (sarlavha + mahsulotlar + rasmiylashtirish formasi).
 * Ikkala joyda ishlatiladi:
 *  - kompyuterda: yondan chiqadigan modal (CartSheet)
 *  - telefonda: alohida sahifa (/savat)
 */
export function CartContent({ onClose }: { onClose: () => void }) {
  const { lines, total, count, setQty, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { tg } = useTelegram();

  /** Telefon raqamni "+998 xx xxx xx xx" formatida avtomatik joylashtiradi. */
  const formatPhone = (raw: string) => {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("998")) digits = digits.slice(3);
    else if (digits.startsWith("8")) digits = digits.slice(1);
    digits = digits.slice(0, 9);
    let result = "+998";
    if (digits.length > 0) result += ` ${digits.slice(0, 2)}`;
    if (digits.length > 2) result += ` ${digits.slice(2, 5)}`;
    if (digits.length > 5) result += ` ${digits.slice(5, 7)}`;
    if (digits.length > 7) result += ` ${digits.slice(7, 9)}`;
    return result;
  };

  const placeOrder = async () => {
    if (!name.trim()) {
      toast.error("Iltimos, ismingizni kiriting");
      return;
    }
    if (phone.replace(/\D/g, "").length !== 12) {
      toast.error("Iltimos, telefon raqamingizni to'liq kiriting");
      return;
    }
    if (mode === "delivery" && !address.trim()) {
      toast.error("Iltimos, yetkazib berish manzilini kiriting");
      return;
    }
    const order = {
      id: Date.now().toString(36),
      name: name.trim(),
      phone: phone.trim(),
      mode,
      ...(mode === "delivery" ? { address: address.trim() } : {}),
      lines: lines.map((l) => ({
        name: l.item.name,
        qty: l.qty,
        price: l.item.price,
      })),
      total,
      createdAt: Date.now(),
      tg: tg?.username ?? tg?.first_name,
      tgId: tg?.id,
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
    onClose();
  };

  const modeLabel = {
    delivery: "Yetkazib berish",
    pickup: "Olib ketish",
  } as const;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => (formOpen ? setFormOpen(false) : onClose())}
            aria-label="Ortga"
            className="glass flex size-9 shrink-0 items-center justify-center rounded-full sm:hidden"
          >
            <ArrowLeft className="size-4" />
          </button>
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="size-5 shrink-0 text-primary" />{" "}
            {formOpen ? "Buyurtmani rasmiylashtirish" : "Sizning buyurtmangiz"}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Yopish"
          className="glass hidden size-9 items-center justify-center rounded-full sm:flex"
        >
          <X className="size-4" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-16">
          <p className="text-center text-sm text-muted-foreground">
            Savatchangiz bo'sh — mazali taom qo'shing.
          </p>
        </div>
      ) : formOpen ? (
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-6 py-5 pb-4 md:pb-10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Jami</span>
            <span className="font-display text-xl font-semibold">
              {formatSom(total)}
            </span>
          </div>
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
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ism familiya"
            autoFocus
            className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="+998 90 123 45 67"
            inputMode="tel"
            className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          {mode === "delivery" && (
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Manzilingiz (masalan: Chilonzor 20, 12-uy)"
              className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          )}
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
        <>
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto px-6 py-5">
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
          </div>

          <div className="shrink-0 space-y-4 border-t border-border px-6 pt-4 pb-4 md:pb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Jami</span>
              <span className="font-display text-xl font-semibold">
                {formatSom(total)}
              </span>
            </div>
            <button
              onClick={() => setFormOpen(true)}
              className="bg-ember-gradient lift w-full rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Buyurtmani rasmiylashtirish
            </button>
          </div>
        </>
      )}
    </>
  );
}

/**
 * Kompyuter rejimidagi savat — yondan chiqadigan modal.
 * Telefon rejimida ko'rinmaydi (u yerda /savat alohida sahifa).
 */
export function CartSheet() {
  const { open, setOpen } = useCart();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!open || !isDesktop) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      <button
        aria-label="Buyurtma panelini yopish"
        onClick={() => setOpen(false)}
        className="animate-in fade-in absolute inset-0 bg-background/70 backdrop-blur-sm duration-300"
      />
      <aside className="glass-strong animate-in slide-in-from-right relative flex h-full w-full flex-col duration-400 sm:max-w-md sm:rounded-l-3xl">
        <CartContent onClose={() => setOpen(false)} />
      </aside>
    </div>
  );
}
