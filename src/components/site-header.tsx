import { Link } from "@tanstack/react-router";
import { ShoppingBag, Flame } from "lucide-react";
import { useCart } from "@/components/cart-context";

const links = [
  { to: "/", label: "Bosh sahifa" },
  { to: "/menu", label: "Menyu" },
  { to: "/about", label: "Biz haqimizda" },
  { to: "/contact", label: "Aloqa" },
] as const;

export function SiteHeader() {
  const { count, setOpen } = useCart();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-3xl px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-ember-gradient flex size-9 items-center justify-center rounded-2xl">
            <Flame className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-base leading-none font-semibold tracking-tight sm:text-lg">
            Janob <span className="text-ember-gradient">Hot-Dog</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen(true)}
          aria-label="Buyurtmani ochish"
          className="glass lift relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
        >
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Buyurtma</span>
          {count > 0 && (
            <span className="bg-ember-gradient animate-rise absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
