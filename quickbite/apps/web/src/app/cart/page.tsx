"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, calculateTax, calculateTotal } from "@quickbite/shared";
import { useCartStore } from "@/lib/store";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, deliveryFee, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted mb-6">Add items from a restaurant to get started.</p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Your cart</h1>
      {restaurantName && (
        <p className="text-muted mb-6">From {restaurantName}</p>
      )}

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.menuItemId}
            className="flex gap-4 p-4 bg-surface rounded-xl border border-border"
          >
            <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted">{formatPrice(item.price)} each</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-bold hover:bg-background"
                >
                  −
                </button>
                <span className="font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="ml-auto text-sm text-muted hover:text-primary"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="font-semibold shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Delivery fee</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full text-center bg-primary text-white py-4 rounded-full font-semibold hover:bg-primary-dark transition-colors"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
