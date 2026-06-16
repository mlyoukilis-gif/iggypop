"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STEPS,
  getOrderProgress,
} from "@quickbite/shared";
import { useCartStore } from "@/lib/store";

interface Props {
  params: Promise<{ id: string }>;
}

export default function OrderPage({ params }: Props) {
  const order = useCartStore((s) => s.currentOrder);
  const advanceOrderStatus = useCartStore((s) => s.advanceOrderStatus);

  useEffect(() => {
    if (!order || order.status === "delivered") return;

    const interval = setInterval(() => {
      advanceOrderStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, [order, advanceOrderStatus]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted mb-4">Order not found.</p>
        <Link href="/" className="text-primary font-semibold hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const progress = getOrderProgress(order.status);
  const eta = new Date(order.estimatedDelivery).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">
          {order.status === "delivered" ? "🎉" : "🚗"}
        </div>
        <h1 className="text-2xl font-bold mb-1">
          {order.status === "delivered"
            ? "Order delivered!"
            : ORDER_STATUS_LABELS[order.status]}
        </h1>
        {order.status !== "delivered" && (
          <p className="text-muted">Estimated arrival by {eta}</p>
        )}
        <p className="text-sm text-muted mt-2">Order {order.id}</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <div className="h-2 bg-background rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="space-y-4">
          {ORDER_STATUS_STEPS.map((step) => {
            const stepIndex = ORDER_STATUS_STEPS.indexOf(step);
            const currentIndex = ORDER_STATUS_STEPS.indexOf(order.status);
            const isComplete = stepIndex <= currentIndex;
            const isCurrent = step === order.status;

            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isComplete
                      ? "bg-primary text-white"
                      : "bg-background text-muted border border-border"
                  } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
                >
                  {isComplete ? "✓" : stepIndex + 1}
                </div>
                <span
                  className={`text-sm ${
                    isComplete ? "font-semibold text-foreground" : "text-muted"
                  }`}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="font-bold mb-3">{order.restaurantName}</h2>
        <p className="text-sm text-muted mb-4">{order.address}</p>
        {order.items.map((item) => (
          <div key={item.menuItemId} className="flex justify-between text-sm py-1">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold pt-3 mt-3 border-t border-border">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link
        href="/"
        className="block w-full text-center bg-primary text-white py-4 rounded-full font-semibold hover:bg-primary-dark"
      >
        Order again
      </Link>
    </div>
  );
}
