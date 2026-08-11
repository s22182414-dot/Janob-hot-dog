import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CartContent } from "@/components/cart-sheet";

export const Route = createFileRoute("/savat")({
  head: () => ({
    meta: [
      { title: "Savat — Janob Hot-Dog" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SavatPage,
});

function SavatPage() {
  const navigate = useNavigate();

  return (
    <section className="relative px-4 pt-20 pb-28 sm:px-6 md:pt-40">
      <div className="veil pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-md">
        <div className="glass animate-rise rounded-3xl">
          <CartContent onClose={() => navigate({ to: "/" })} />
        </div>
      </div>
    </section>
  );
}
