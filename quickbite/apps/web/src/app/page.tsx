"use client";

import { useState } from "react";
import { CUISINES, RESTAURANTS, searchRestaurants } from "@quickbite/shared";
import type { CuisineType } from "@quickbite/shared";
import RestaurantCard from "@/components/RestaurantCard";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | undefined>();

  const filtered = searchRestaurants(query, selectedCuisine);
  const featured = RESTAURANTS.filter((r) => r.featured);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Food delivered to your door
        </h1>
        <p className="text-muted text-lg mb-6">
          Browse restaurants near you and order in minutes.
        </p>

        <div className="relative max-w-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search restaurants or cuisines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </section>

      <section className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCuisine(undefined)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !selectedCuisine
                ? "bg-primary text-white"
                : "bg-surface border border-border text-foreground hover:border-primary"
            }`}
          >
            All
          </button>
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine === selectedCuisine ? undefined : cuisine)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCuisine === cuisine
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-foreground hover:border-primary"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {!query && !selectedCuisine && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Featured near you</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">
          {query || selectedCuisine ? "Search results" : "All restaurants"}
        </h2>
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-12">No restaurants found. Try a different search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
