import { useEffect, useRef, useState, type RefObject } from "react";
import { Link, useMatchRoute, useRouterState } from "@tanstack/react-router";
import {
  Home,
  ReceiptText,
  ShoppingBag,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useCart } from "@/components/cart-context";

const items = [
  { to: "/", label: "Bosh sahifa", icon: Home },
  { to: "/profil", label: "Profil", icon: User },
] as const;

type AdminTab = "buyurtmalar" | "menyu";

export function MobileNav() {
  const matchRoute = useMatchRoute();
  const routerSearch = useRouterState({
    select: (s) => s.location.search,
  });
  const { count, setOpen } = useCart();
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);

  const homeRef = useRef<HTMLAnchorElement | null>(null);
  const profilRef = useRef<HTMLAnchorElement | null>(null);
  const savatRef = useRef<HTMLAnchorElement | null>(null);
  const buyurtmaRef = useRef<HTMLAnchorElement | null>(null);
  const menyuRef = useRef<HTMLAnchorElement | null>(null);

  const isAdmin = !!matchRoute({ to: "/admin", fuzzy: false });
  const isHome = !!matchRoute({ to: "/", fuzzy: false });
  const isProfil = !!matchRoute({ to: "/profil", fuzzy: false });
  const isSavat = !!matchRoute({ to: "/savat", fuzzy: false });

  const adminTab: AdminTab =
    isAdmin &&
    routerSearch &&
    typeof routerSearch === "object" &&
    "tab" in routerSearch &&
    (routerSearch as { tab?: unknown }).tab === "menyu"
      ? "menyu"
      : "buyurtmalar";

  // Admin: 0 = Buyurtmalar, 1 = Menyu
  // Oddiy: 0 = Bosh sahifa, 1 = Profil, 2 = Savat, -1 = hech biri faol emas
  const activeIndex = isAdmin
    ? adminTab === "menyu"
      ? 1
      : 0
    : isSavat
      ? 2
      : isProfil
        ? 1
        : isHome
          ? 0
          : -1;

  useEffect(() => {
    const refs: Array<RefObject<HTMLElement | null>> = isAdmin
      ? [buyurtmaRef, menyuRef]
      : [homeRef, profilRef, savatRef];
    const measure = () => {
      if (activeIndex < 0) {
        setPill(null);
        return;
      }
      const el = refs[activeIndex]?.current;
      if (el) setPill({ x: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex, isAdmin]);

  const itemClass = (isActive: boolean) =>
    `relative flex flex-col items-center gap-0.5 rounded-full px-5 py-2 text-[11px] font-medium transition-colors duration-300 ${
      isActive
        ? "text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="fixed inset-x-0 bottom-0 z-[110] md:hidden"
    >
      <div
        className="mx-auto max-w-md px-3"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
        }}
      >
        <div className="glass relative flex items-center justify-around rounded-full px-2 py-1.5">
          <span
            aria-hidden
            className="bg-ember-gradient pointer-events-none absolute inset-y-1.5 left-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={
              pill
                ? { transform: `translateX(${pill.x}px)`, width: pill.width }
                : { opacity: 0 }
            }
          />
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                search={{ tab: "buyurtmalar" }}
                ref={buyurtmaRef}
                onClick={() => setOpen(false)}
                className={itemClass(activeIndex === 0)}
              >
                <ReceiptText className="size-5" />
                Buyurtmalar
              </Link>
              <Link
                to="/admin"
                search={{ tab: "menyu" }}
                ref={menyuRef}
                onClick={() => setOpen(false)}
                className={itemClass(activeIndex === 1)}
              >
                <UtensilsCrossed className="size-5" />
                Menyu
              </Link>
            </>
          ) : (
            <>
              {items.map(({ to, label, icon: Icon }, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <Link
                    key={to}
                    ref={idx === 0 ? homeRef : profilRef}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={itemClass(isActive)}
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                );
              })}
              <Link
                to="/savat"
                ref={savatRef}
                onClick={() => setOpen(false)}
                aria-label="Savatni ochish"
                className={`relative ${itemClass(activeIndex === 2)}`}
              >
                <ShoppingBag className="size-5" />
                Savat
                {count > 0 && (
                  <span className="bg-ember-gradient animate-rise absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
