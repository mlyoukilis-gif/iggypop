import { CartItem, Order, OrderStatus } from './types';

export const TAX_RATE = 0.0875;

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function calculateTotal(
  subtotal: number,
  deliveryFee: number,
  tip: number
): number {
  const tax = calculateTax(subtotal);
  return Math.round((subtotal + deliveryFee + tax + tip) * 100) / 100;
}

export function generateOrderId(): string {
  return `QB-${Date.now().toString(36).toUpperCase()}`;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing Your Food',
  picked_up: 'Picked Up',
  delivering: 'On the Way',
  delivered: 'Delivered',
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'picked_up',
  'delivering',
  'delivered',
];

export function getOrderProgress(status: OrderStatus): number {
  const index = ORDER_STATUS_STEPS.indexOf(status);
  return index >= 0 ? ((index + 1) / ORDER_STATUS_STEPS.length) * 100 : 0;
}

export function createMockOrder(
  items: CartItem[],
  restaurantName: string,
  restaurantId: string,
  deliveryFee: number,
  address: string,
  tip: number
): Order {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, deliveryFee, tip);
  const now = new Date();
  const eta = new Date(now.getTime() + 35 * 60 * 1000);

  return {
    id: generateOrderId(),
    restaurantId,
    restaurantName,
    items: [...items],
    subtotal,
    deliveryFee,
    tax,
    tip,
    total,
    status: 'placed',
    address,
    placedAt: now.toISOString(),
    estimatedDelivery: eta.toISOString(),
  };
}
