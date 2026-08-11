import { Link } from "@tanstack/react-router";
import { Flame, Instagram, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="hidden px-4 pb-28 sm:px-6 md:block md:pb-10">
      <div className="glass mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-ember-gradient flex size-8 items-center justify-center rounded-xl">
              <Flame className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display font-semibold">Janob Hot-Dog</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Amir Temur ko'chasi 24, Toshkent · Har kuni 10:00 – 00:00
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            to="/menu"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Menyu
          </Link>
          <Link
            to="/contact"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Aloqa
          </Link>
          <a
            href="tel:+998901234567"
            className="glass flex items-center gap-2 rounded-full px-3 py-2"
          >
            <Phone className="size-4" /> +998 90 123 45 67
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="glass flex size-9 items-center justify-center rounded-full"
            aria-label="Instagram"
          >
            <Instagram className="size-4" />
          </a>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Janob Hot-Dog · Toshkent, O'zbekiston
        <span className="mx-2 opacity-40">·</span>
        <Link
          to="/admin"
          search={{ tab: "buyurtmalar" }}
          className="opacity-50 transition-opacity hover:opacity-100"
        >
          Admin
        </Link>
      </p>
    </footer>
  );
}
