"use client";

import Image from "next/image";
import type { MenuItem } from "@quickbite/shared";
import { formatPrice } from "@quickbite/shared";
import { useCartStore } from "@/lib/store";

interface Props {
  item: MenuItem;
  restaurantId: string;
}

export default function MenuItemCard({ item, restaurantId }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const quantity = items.find((i) => i.menuItemId === item.id)?.quantity ?? 0;

  return (
    <div className="flex gap-4 p-4 bg-surface rounded-xl border border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-foreground">{item.name}</h4>
          {item.popular && (
            <span className="text-xs font-bold text-primary bg-red-50 px-2 py-0.5 rounded-full shrink-0">
              Popular
            </span>
          )}
        </div>
        <p className="text-sm text-muted mt-1 line-clamp-2">{item.description}</p>
        <p className="font-semibold mt-2">{formatPrice(item.price)}</p>
        {quantity > 0 ? (
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => useCartStore.getState().updateQuantity(item.id, quantity - 1)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold hover:bg-background"
            >
              −
            </button>
            <span className="font-semibold w-4 text-center">{quantity}</span>
            <button
              onClick={() => useCartStore.getState().updateQuantity(item.id, quantity + 1)}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold hover:bg-primary-dark"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              addItem({
                menuItemId: item.id,
                restaurantId,
                name: item.name,
                price: item.price,
                image: item.image,
              })
            }
            className="mt-3 text-sm font-semibold text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors"
          >
            Add to cart
          </button>
        )}
      </div>
      <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>
    </div>
  );
}
