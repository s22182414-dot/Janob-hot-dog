import { Plus } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { formatSom, type MenuItem } from "@/data/menu";

export function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const { add } = useCart();

  return (
    <article
      className="glass lift animate-rise group overflow-hidden rounded-3xl"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={800}
          height={800}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {item.tag && (
          <span className="glass absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium">
            {item.tag}
          </span>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">{item.name}</h3>
          <span className="text-ember-gradient shrink-0 text-sm font-semibold">
            {formatSom(item.price)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        <button
          onClick={() => add(item)}
          className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="size-4" /> Buyurtmaga qo'shish
        </button>
      </div>
    </article>
  );
}
