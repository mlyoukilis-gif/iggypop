export type CuisineType =
  | 'American'
  | 'Italian'
  | 'Mexican'
  | 'Japanese'
  | 'Chinese'
  | 'Indian'
  | 'Thai'
  | 'Mediterranean'
  | 'Fast Food'
  | 'Healthy';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: CuisineType;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  distance: string;
  featured?: boolean;
  menu: MenuCategory[];
}

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'picked_up'
  | 'delivering'
  | 'delivered';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  status: OrderStatus;
  address: string;
  placedAt: string;
  estimatedDelivery: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}
