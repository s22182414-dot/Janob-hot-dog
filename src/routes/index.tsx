import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame } from "lucide-react";
import hero from "@/assets/hero-hotdog.jpg";
import { MenuCard } from "@/components/menu-card";
import { categories } from "@/data/menu";
import { useMenu } from "@/lib/use-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Janob Hot-Dog — Toshkentdagi hot-dog kafesi" },
      {
        name: "description",
        content:
          "Janob Hot-Dog: olovda pishirilgan hot-doglar, lavash dog, kartoshka fri va yalpizli limonad. Toshkent bo'ylab 30 daqiqada yetkazib beramiz.",
      },
      {
        property: "og:title",
        content: "Janob Hot-Dog — Toshkentdagi hot-dog kafesi",
      },
      {
        property: "og:description",
        content: "Jonli olovda pishirilgan hot-doglar. Onlayn buyurtma bering.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [active, setActive] = useState<string>("Barchasi");
  const { items: menu } = useMenu();
  const grouped = categories
    .filter((c) => c !== "Barchasi")
    .map((c) => ({ category: c, items: menu.filter((m) => m.category === c) }))
    .filter((g) => g.items.length > 0)
    .filter((g) => active === "Barchasi" || active === g.category);

  return (
    <>
      <section className="relative hidden overflow-hidden px-4 pt-16 pb-20 sm:px-6 md:block md:pt-40">
        <div className="veil pointer-events-none absolute inset-0 -z-10" />
        <div className="bg-ember-gradient animate-float pointer-events-none absolute -top-32 -right-24 -z-10 size-96 rounded-full opacity-20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-wide uppercase">
              <Flame className="size-3.5 text-primary" /> Termiz · 2019 yildan
              beri
            </span>
            <h1 className="font-display mt-6 text-5xl leading-[0.95] font-bold sm:text-7xl">
              Hot-dog,
              <br />
              <span className="text-ember-gradient">o'zbekcha</span> uslubda.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Cho'g'da pishirilgan sosiskalar, tandir non va har tong
              tayyorlanadigan uy souslari. Bir necha bosishda buyurtma bering —
              issiqligicha yetkazamiz.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="bg-ember-gradient lift inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Menyuga o'tish <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="animate-rise relative hidden [animation-delay:150ms] md:block">
            <div className="glass overflow-hidden rounded-[2.5rem] p-3">
              <img
                src={hero}
                alt="Janob Hot-Dog firma taomi — tuzlangan piyoz va ko'katli hot-dog"
                width={1600}
                height={1200}
                className="w-full rounded-[2rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-8 pb-28 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Bizning menyumiz
            </h2>
          </div>

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

          <div className="mt-10 space-y-12">
            {grouped.map(({ category, items }) => (
              <section key={category}>
                <h3 className="font-display flex items-center gap-3 text-xl font-bold sm:text-2xl">
                  {category}
                  <span className="text-ember-gradient text-sm font-medium">
                    {items.length} ta
                  </span>
                </h3>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, i) => (
                    <MenuCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
