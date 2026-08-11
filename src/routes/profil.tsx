import { createFileRoute } from "@tanstack/react-router";
import { Clock, Phone, ShoppingBag } from "lucide-react";
import { TelegramConnect } from "@/components/telegram-connect";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — Janob Hot-Dog" },
      {
        name: "description",
        content:
          "Janob Hot-Dog shaxsiy kabinet: buyurtma tarixi, manzil va telefon ma'lumotlaringiz.",
      },
      { property: "og:title", content: "Profil — Janob Hot-Dog" },
      {
        property: "og:description",
        content: "Buyurtma tarixi va shaxsiy ma'lumotlar.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  return (
    <section className="relative px-4 pt-16 pb-28 sm:px-6 md:pt-40">
      <div className="veil pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display animate-rise text-4xl font-bold sm:text-6xl">
          Sizning <span className="text-ember-gradient">profilingiz</span>
        </h1>
        <p className="animate-rise mt-4 max-w-lg text-muted-foreground">
          Buyurtmalaringiz, manzilingiz va kontaktlaringiz — hammasi bitta
          joyda.
        </p>

        <div className="mt-8">
          <TelegramConnect />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="glass lift rounded-3xl p-5">
            <ShoppingBag className="size-6 text-primary" />
            <h2 className="mt-3 font-semibold">Buyurtma tarixi</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Buyurtma berganingizda tarix shu yerda saqlanadi.
            </p>
          </div>
          <div className="glass lift rounded-3xl p-5">
            <Clock className="size-6 text-primary" />
            <h2 className="mt-3 font-semibold">Yetkazib berish</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manzilingizni saqlang — keyingi buyurtma tezroq.
            </p>
          </div>
          <div className="glass lift rounded-3xl p-5">
            <Phone className="size-6 text-primary" />
            <h2 className="mt-3 font-semibold">Aloqa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              +998 90 123 45 67 — istalgan vaqtda qo'ng'iroq qiling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
