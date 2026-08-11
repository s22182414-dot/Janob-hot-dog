import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MenuCard } from "@/components/menu-card";
import { categories } from "@/data/menu";
import { useMenu } from "@/lib/use-menu";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menyu va onlayn buyurtma — Janob Hot-Dog" },
      {
        name: "description",
        content:
          "Janob Hot-Dog to'liq menyusi: hot-doglar, lavash dog, kartoshka fri va ichimliklar. Savatga qo'shing va yetkazib berish yoki olib ketishga buyurtma bering.",
      },
      {
        property: "og:title",
        content: "Menyu va onlayn buyurtma — Janob Hot-Dog",
      },
      {
        property: "og:description",
        content:
          "Hot-doglar, gazaklar va ichimliklar. Toshkentda onlayn buyurtma.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [active, setActive] = useState<string>("Barchasi");
  const { items: menu } = useMenu();
  const items =
    active === "Barchasi" ? menu : menu.filter((m) => m.category === active);

  return (
    <section className="relative px-4 pt-16 pb-28 sm:px-6 md:pt-40">
      <div className="veil pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display animate-rise text-4xl font-bold sm:text-6xl">
          Bizning <span className="text-ember-gradient">menyu</span>
        </h1>
        <p className="animate-rise mt-4 max-w-lg text-muted-foreground">
          Istagan taomni savatga qo'shing, so'ng yetkazib berish yoki olib
          ketishni tanlang.
        </p>

        <div className="animate-rise mt-8 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                active === c
                  ? "bg-ember-gradient text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <MenuCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
