import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatSom, resolveImage, type MenuItem } from "@/data/menu";

export function MenuCard({
  item,
  index = 0,
}: {
  item: MenuItem;
  index?: number;
}) {
  const { lines, add, setQty } = useCart();
  const qty = lines.find((l) => l.item.id === item.id)?.qty ?? 0;

  return (
    <article
      className="glass lift animate-rise group overflow-hidden rounded-3xl"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex sm:block">
        <div className="relative aspect-square w-32 shrink-0 sm:aspect-[4/3] sm:w-full">
          <img
            src={resolveImage(item.image)}
            alt={item.name}
            loading="lazy"
            width={800}
            height={800}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {item.tag && (
            <span className="glass absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:top-3 sm:left-3 sm:px-3 sm:py-1 sm:text-xs">
              {item.tag}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display min-w-0 text-base font-semibold sm:text-lg">
              {item.name}
            </h3>
            <span className="text-ember-gradient shrink-0 text-sm font-semibold">
              {formatSom(item.price)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground sm:line-clamp-none sm:mt-3 sm:text-sm">
            {item.description}
          </p>

          {qty === 0 ? (
            <button
              onClick={() => add(item)}
              className="glass mt-auto flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-colors hover:bg-primary hover:text-primary-foreground sm:mt-4 sm:rounded-2xl sm:py-3 sm:text-sm"
            >
              <Plus className="size-4" /> Buyurtmaga qo'shish
            </button>
          ) : (
            <div className="mt-auto flex w-full items-center justify-between gap-2 sm:mt-4">
              <button
                onClick={() => setQty(item.id, qty - 1)}
                className="glass flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-primary hover:text-primary-foreground sm:size-10 sm:rounded-2xl"
                aria-label="Kamaytirish"
              >
                <Minus className="size-4" />
              </button>
              <span className="font-display min-w-[2ch] text-center text-lg font-semibold tabular-nums">
                {qty}
              </span>
              <button
                onClick={() => add(item)}
                className="glass flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-primary hover:text-primary-foreground sm:size-10 sm:rounded-2xl"
                aria-label="Ko'paytirish"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
