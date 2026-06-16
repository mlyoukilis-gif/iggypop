import { create } from "zustand";
import type { CartItem, Order } from "@quickbite/shared";
import { createMockOrder } from "@quickbite/shared";

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  currentOrder: Order | null;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  placeOrder: (address: string, tip: number) => Order;
  advanceOrderStatus: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 0,
  currentOrder: null,

  addItem: (item) => {
    const state = get();
    if (state.restaurantId && state.restaurantId !== item.restaurantId) {
      set({ items: [], restaurantId: null, restaurantName: null, deliveryFee: 0 });
    }

    set((s) => {
      const existing = s.items.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        items: [...s.items, { ...item, quantity: 1 }],
        restaurantId: item.restaurantId,
      };
    });
  },

  removeItem: (menuItemId) => {
    set((s) => {
      const items = s.items.filter((i) => i.menuItemId !== menuItemId);
      return {
        items,
        restaurantId: items.length === 0 ? null : s.restaurantId,
        restaurantName: items.length === 0 ? null : s.restaurantName,
        deliveryFee: items.length === 0 ? 0 : s.deliveryFee,
      };
    });
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    set((s) => ({
      items: s.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () =>
    set({ items: [], restaurantId: null, restaurantName: null, deliveryFee: 0 }),

  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  placeOrder: (address, tip) => {
    const state = get();
    const order = createMockOrder(
      state.items,
      state.restaurantName ?? "Restaurant",
      state.restaurantId ?? "",
      state.deliveryFee,
      address,
      tip
    );
    set({ currentOrder: order, items: [], restaurantId: null, restaurantName: null, deliveryFee: 0 });
    return order;
  },

  advanceOrderStatus: () => {
    const order = get().currentOrder;
    if (!order) return;
    const steps = ["placed", "confirmed", "preparing", "picked_up", "delivering", "delivered"] as const;
    const idx = steps.indexOf(order.status);
    if (idx < steps.length - 1) {
      set({ currentOrder: { ...order, status: steps[idx + 1] } });
    }
  },
}));
