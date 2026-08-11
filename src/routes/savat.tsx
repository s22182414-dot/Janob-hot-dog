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
    <section className="relative flex h-svh flex-col px-4 pt-6 pb-28 sm:px-6 md:pt-40">
      <div className="veil pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
        <div className="glass animate-rise flex min-h-0 flex-1 flex-col rounded-3xl">
          <CartContent onClose={() => navigate({ to: "/" })} />
        </div>
      </div>
    </section>
  );
}
