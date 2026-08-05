import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-context";
import { formatSom } from "@/data/menu";

export function CartSheet() {
  const { lines, total, count, open, setOpen, setQty, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");

  if (!open) return null;

  const placeOrder = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Iltimos, ismingiz va telefon raqamingizni kiriting");
      return;
    }
    toast.success(`Rahmat, ${name}! Buyurtmangiz qabul qilindi.`, {
      description: `${count} ta mahsulot · ${formatSom(total)} · ${mode === "delivery" ? "Yetkazib berish ~30 daqiqa" : "Olib ketish ~15 daqiqada tayyor"}`,
    });
    clear();
    setName("");
    setPhone("");
    setOpen(false);
  };

  const modeLabel = { delivery: "Yetkazib berish", pickup: "Olib ketish" } as const;

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
            className="glass flex size-9 items-center justify-center rounded-full"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {lines.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Savatchangiz bo'sh — mazali taom qo'shing.
            </p>
          )}
          {lines.map((line) => (
            <div key={line.item.id} className="glass flex gap-3 rounded-2xl p-3">
              <img
                src={line.item.image}
                alt={line.item.name}
                loading="lazy"
                width={800}
                height={800}
                className="size-16 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{line.item.name}</p>
                <p className="text-sm text-primary">{formatSom(line.item.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setQty(line.item.id, line.qty - 1)}
                    aria-label="Sonini kamaytirish"
                    className="glass flex size-7 items-center justify-center rounded-full"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-5 text-center text-sm">{line.qty}</span>
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

        {lines.length > 0 && (
          <div className="space-y-4 border-t border-border px-6 py-5">
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
              placeholder="Ismingiz"
              className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              inputMode="tel"
              className="glass w-full rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Jami</span>
              <span className="font-display text-xl font-semibold">{formatSom(total)}</span>
            </div>
            <button
              onClick={placeOrder}
              className="bg-ember-gradient lift w-full rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Buyurtma berish
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
