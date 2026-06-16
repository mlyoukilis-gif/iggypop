"use client";

import { use, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getRestaurantById, formatPrice } from "@quickbite/shared";
import MenuItemCard from "@/components/MenuItemCard";
import { useCartStore } from "@/lib/store";

interface Props {
  params: Promise<{ id: string }>;
}

export default function RestaurantPage({ params }: Props) {
  const { id } = use(params);
  const restaurant = getRestaurantById(id);
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    if (restaurant) {
      useCartStore.setState({
        restaurantName: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
      });
    }
  }, [restaurant]);

  if (!restaurant) notFound();

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto pb-28">
      <div className="relative h-56 sm:h-72">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span> {restaurant.rating} ({restaurant.reviewCount})
            </span>
            <span>·</span>
            <span>{restaurant.cuisine}</span>
            <span>·</span>
            <span>{restaurant.deliveryTime}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        <p className="text-muted">{restaurant.description}</p>
        <p className="text-sm text-muted">
          Min. order {formatPrice(restaurant.minOrder)} · Delivery fee {formatPrice(restaurant.deliveryFee)}
        </p>

        {restaurant.menu.map((category) => (
          <section key={category.id}>
            <h2 className="text-xl font-bold mb-4">{category.name}</h2>
            <div className="space-y-3">
              {category.items.map((item) => (
                <MenuItemCard key={item.id} item={item} restaurantId={restaurant.id} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border shadow-lg">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/cart"
              className="flex items-center justify-between bg-primary text-white px-6 py-4 rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              <span>{itemCount} item{itemCount !== 1 ? "s" : ""} in cart</span>
              <span>View cart · {formatPrice(cartTotal)}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
