import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Restaurant: { id: string };
  Cart: undefined;
  Checkout: undefined;
  Order: { id: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;
export type RestaurantScreenProps = NativeStackScreenProps<RootStackParamList, "Restaurant">;
export type CartScreenProps = NativeStackScreenProps<RootStackParamList, "Cart">;
export type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, "Checkout">;
export type OrderScreenProps = NativeStackScreenProps<RootStackParamList, "Order">;
