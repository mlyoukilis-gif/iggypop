import Link from "next/link";
import Image from "next/image";
import type { Restaurant } from "@quickbite/shared";

interface Props {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className="group bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {restaurant.featured && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-foreground">{restaurant.name}</h3>
          <span className="flex items-center gap-1 text-sm font-semibold shrink-0">
            <span className="text-yellow-500">★</span>
            {restaurant.rating}
          </span>
        </div>
        <p className="text-muted text-sm mt-1 line-clamp-1">{restaurant.description}</p>
        <div className="flex items-center gap-3 mt-3 text-sm text-muted">
          <span>{restaurant.deliveryTime}</span>
          <span>·</span>
          <span>{restaurant.distance}</span>
          <span>·</span>
          <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
        </div>
        <span className="inline-block mt-2 text-xs font-medium bg-background px-2 py-1 rounded-full">
          {restaurant.cuisine}
        </span>
      </div>
    </Link>
  );
}
