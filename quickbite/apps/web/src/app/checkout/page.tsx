"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice, calculateTax, calculateTotal } from "@quickbite/shared";
import { useCartStore } from "@/lib/store";

const TIP_OPTIONS = [0, 2, 3, 5];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const placeOrder = useCartStore((s) => s.placeOrder);

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [tip, setTip] = useState(3);
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, deliveryFee, tip);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted mb-4">Nothing to checkout.</p>
        <Link href="/" className="text-primary font-semibold hover:underline">
          Browse restaurants
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) return;

    setLoading(true);
    const address = `${street}, ${city}, ${state} ${zip}`;
    const order = placeOrder(address, tip);

    setTimeout(() => {
      router.push(`/order/${order.id}`);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-surface rounded-xl border border-border p-6">
          <h2 className="font-bold mb-4">Delivery address</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Street address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <input
              type="text"
              placeholder="ZIP code"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </section>

        <section className="bg-surface rounded-xl border border-border p-6">
          <h2 className="font-bold mb-4">Tip your driver</h2>
          <div className="flex gap-2">
            {TIP_OPTIONS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTip(amount)}
                className={`flex-1 py-3 rounded-lg font-semibold border transition-colors ${
                  tip === amount
                    ? "bg-primary text-white border-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {amount === 0 ? "No tip" : formatPrice(amount)}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-xl border border-border p-6 space-y-3">
          <h2 className="font-bold mb-2">Order summary</h2>
          <p className="text-sm text-muted">{restaurantName}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Delivery</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tip</span>
            <span>{formatPrice(tip)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Placing order..." : `Place order · ${formatPrice(total)}`}
        </button>
      </form>
    </div>
  );
}
