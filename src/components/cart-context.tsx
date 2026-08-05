import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { MenuItem } from "@/data/menu";

export type CartLine = { item: MenuItem; qty: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: MenuItem) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const total = lines.reduce((sum, l) => sum + l.qty * l.item.price, 0);

    return {
      lines,
      count,
      total,
      open,
      setOpen,
      add: (item) => {
        setLines((prev) => {
          const found = prev.find((l) => l.item.id === item.id);
          if (found) {
            return prev.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l));
          }
          return [...prev, { item, qty: 1 }];
        });
        toast.success(`${item.name} added to your order`);
      },
      remove: (id) => setLines((prev) => prev.filter((l) => l.item.id !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.item.id !== id)
            : prev.map((l) => (l.item.id === id ? { ...l, qty } : l)),
        ),
      clear: () => setLines([]),
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
