import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Aloqa va manzil — Janob Hot-Dog, Toshkent" },
      {
        name: "description",
        content:
          "Janob Hot-Dog: Amir Temur ko'chasi 24, Toshkent. Har kuni 10:00–00:00. Yetkazib berish uchun +998 90 123 45 67 raqamiga qo'ng'iroq qiling.",
      },
      { property: "og:title", content: "Aloqa va manzil — Janob Hot-Dog, Toshkent" },
      {
        property: "og:description",
        content: "Toshkent markazidamiz, har kuni 10:00–00:00 ochiqmiz.",
      },
    ],
  }),
  component: Contact,
});

const info = [
  { icon: MapPin, title: "Manzil", lines: ["Amir Temur ko'chasi 24", "Toshkent, O'zbekiston"] },
  { icon: Clock, title: "Ish vaqti", lines: ["Har kuni", "10:00 – 00:00"] },
  { icon: Phone, title: "Qo'ng'iroq qiling", lines: ["+998 90 123 45 67", "Yetkazib berish va keytering"] },
];

function Contact() {
  return (
    <section className="relative px-4 pt-32 pb-20 sm:px-6 sm:pt-40">
      <div className="veil pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display animate-rise text-4xl font-bold sm:text-6xl">
          Kelib <span className="text-ember-gradient">salom</span> ayting
        </h1>
        <p className="animate-rise mt-4 max-w-lg text-muted-foreground">
          Peshtaxta yonida o'tiring, grilni tomosha qiling yoki Toshkent markazi bo'ylab yetkazib
          beramiz.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {info.map((i, idx) => (
            <div
              key={i.title}
              className="glass lift animate-rise rounded-3xl p-6"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <i.icon className="size-6 text-primary" />
              <h2 className="mt-4 font-semibold">{i.title}</h2>
              {i.lines.map((l) => (
                <p key={l} className="text-sm text-muted-foreground">
                  {l}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="glass animate-rise mt-6 overflow-hidden rounded-[2.5rem] p-3">
          <iframe
            title="Janob Hot-Dog joylashuvi xaritada"
            src="https://www.openstreetmap.org/export/embed.html?bbox=69.26%2C41.30%2C69.30%2C41.32&layer=mapnik"
            loading="lazy"
            className="h-80 w-full rounded-[2rem] border-0 grayscale-[0.4]"
          />
        </div>
      </div>
    </section>
  );
}
