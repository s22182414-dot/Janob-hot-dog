import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero-hotdog.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Bizning tariximiz — Janob Hot-Dog kafesi, Toshkent" },
      {
        name: "description",
        content:
          "Kichik ko'cha aravachasidan Janob Hot-Dog kafesigacha — jonli olov, tandir non va har kuni tayyorlanadigan uy souslari.",
      },
      {
        property: "og:title",
        content: "Bizning tariximiz — Janob Hot-Dog kafesi",
      },
      {
        property: "og:description",
        content: "Ko'cha aravachasidan Toshkentning hot-dog kafesigacha.",
      },
    ],
  }),
  component: About,
});

const stats = [
  { value: "2019", label: "Toshkentda ochilgan" },
  { value: "120k+", label: "Pishirilgan hot-dog" },
  { value: "4.9", label: "O'rtacha reyting" },
];

function About() {
  return (
    <section className="relative px-4 pt-16 pb-28 sm:px-6 md:pt-40">
      <div className="veil pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="animate-rise">
          <h1 className="font-display text-4xl font-bold sm:text-6xl">
            Bitta aravacha, bitta gril
            <br />
            <span className="text-ember-gradient">va bitta retsept.</span>
          </h1>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Janob Hot-Dog Amir Temur xiyoboni yaqinidagi burchakda bitta ko'mir
            grili bilan boshlangan. Asoschimiz uy ta'mini beradigan hot-dog
            yaratmoqchi edi — jonli olovda pishirilgan mol go'shtli sosiska,
            yumshoq bulochka o'rniga tandir non va chakka, sumalak hamda yangi
            ko'katlardan tayyorlangan souslar.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Bugun ham kafemiz ataylab kichik. Hamma narsa har tong yangidan
            tayyorlanadi, hech nima lampa ostida kutib turmaydi va har bir
            buyurtma yetti daqiqada tayyor bo'ladi.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4">
                <p className="font-display text-ember-gradient text-2xl font-bold">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass animate-rise overflow-hidden rounded-[2.5rem] p-3 [animation-delay:150ms]">
          <img
            src={hero}
            alt="Jonli olovda pishirilgan Janob Hot-Dog firma taomi"
            loading="lazy"
            width={1600}
            height={1200}
            className="w-full rounded-[2rem] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
