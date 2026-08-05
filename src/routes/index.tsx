import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Flame, Leaf } from "lucide-react";
import hero from "@/assets/hero-hotdog.jpg";
import { MenuCard } from "@/components/menu-card";
import { menu } from "@/data/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Janob Hot-Dog — Toshkentdagi hot-dog kafesi" },
      {
        name: "description",
        content:
          "Janob Hot-Dog: olovda pishirilgan hot-doglar, lavash dog, kartoshka fri va yalpizli limonad. Toshkent bo'ylab 30 daqiqada yetkazib beramiz.",
      },
      { property: "og:title", content: "Janob Hot-Dog — Toshkentdagi hot-dog kafesi" },
      {
        property: "og:description",
        content: "Jonli olovda pishirilgan hot-doglar. Onlayn buyurtma bering.",
      },
    ],
  }),
  component: Home,
});

const perks = [
  { icon: Flame, title: "Jonli olov grili", text: "Har bir sosiska ochiq olovda pishiriladi." },
  { icon: Leaf, title: "Har kuni yangi", text: "Non har kuni yopiladi, ko'katlar tong sayin teriladi." },
  { icon: Clock, title: "30 daqiqada yetkazish", text: "Toshkent markazi bo'ylab issiq va tez." },
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 sm:pt-40">
        <div className="veil pointer-events-none absolute inset-0 -z-10" />
        <div className="bg-ember-gradient animate-float pointer-events-none absolute -top-32 -right-24 -z-10 size-96 rounded-full opacity-20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs tracking-wide uppercase">
              <Flame className="size-3.5 text-primary" /> Termiz · 2019 yildan beri
            </span>
            <h1 className="font-display mt-6 text-5xl leading-[0.95] font-bold sm:text-7xl">
              Hot-dog,
              <br />
              <span className="text-ember-gradient">o'zbekcha</span> uslubda.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Cho'g'da pishirilgan sosiskalar, tandir non va har tong tayyorlanadigan uy souslari.
              Bir necha bosishda buyurtma bering — issiqligicha yetkazamiz.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="bg-ember-gradient lift inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Buyurtma berish <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/about"
                className="glass lift inline-flex items-center rounded-2xl px-6 py-3.5 text-sm font-medium"
              >
                Bizning tariximiz
              </Link>
            </div>
          </div>

          <div className="animate-rise relative [animation-delay:150ms]">
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

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="glass lift rounded-3xl p-6">
              <p.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Bizning menyumiz</h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="glass relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-8 py-14 text-center">
          <div className="veil pointer-events-none absolute inset-0" />
          <h2 className="font-display relative text-3xl font-bold sm:text-4xl">
            Hozir qorningiz ochmi?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
            Bir daqiqada buyurtma yig'ing. Toshkent markazi bo'ylab 30 daqiqada yetkazamiz.
          </p>
          <Link
            to="/menu"
            className="bg-ember-gradient lift relative mt-8 inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Buyurtmani boshlash <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
