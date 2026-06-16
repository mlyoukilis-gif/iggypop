import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getRestaurantById, formatPrice } from "@quickbite/shared";
import { RestaurantScreenProps } from "../navigation/types";
import { useCartStore } from "../store/cartStore";
import { colors } from "../theme";

export default function RestaurantScreen({ route, navigation }: RestaurantScreenProps) {
  const restaurant = getRestaurantById(route.params.id);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => {
    if (restaurant) {
      useCartStore.setState({
        restaurantName: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
      });
      navigation.setOptions({ title: restaurant.name });
    }
  }, [restaurant, navigation]);

  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: itemCount > 0 ? 100 : 24 }}>
        <Image source={{ uri: restaurant.image }} style={styles.hero} />
        <View style={styles.content}>
          <Text style={styles.desc}>{restaurant.description}</Text>
          <Text style={styles.meta}>
            Min. order {formatPrice(restaurant.minOrder)} · Delivery {formatPrice(restaurant.deliveryFee)}
          </Text>

          {restaurant.menu.map((category) => (
            <View key={category.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{category.name}</Text>
              {category.items.map((item) => {
                const qty = items.find((i) => i.menuItemId === item.id)?.quantity ?? 0;
                return (
                  <View key={item.id} style={styles.menuItem}>
                    <View style={styles.menuInfo}>
                      <View style={styles.menuHeader}>
                        <Text style={styles.menuName}>{item.name}</Text>
                        {item.popular && (
                          <View style={styles.popularBadge}>
                            <Text style={styles.popularText}>Popular</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.menuDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text style={styles.menuPrice}>{formatPrice(item.price)}</Text>
                      {qty > 0 ? (
                        <View style={styles.qtyRow}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQuantity(item.id, qty - 1)}
                          >
                            <Text style={styles.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qty}>{qty}</Text>
                          <TouchableOpacity
                            style={[styles.qtyBtn, styles.qtyBtnPrimary]}
                            onPress={() => updateQuantity(item.id, qty + 1)}
                          >
                            <Text style={[styles.qtyBtnText, { color: "#fff" }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() =>
                            addItem({
                              menuItemId: item.id,
                              restaurantId: restaurant.id,
                              name: item.name,
                              price: item.price,
                              image: item.image,
                            })
                          }
                        >
                          <Text style={styles.addBtnText}>Add to cart</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Image source={{ uri: item.image }} style={styles.menuImage} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {itemCount > 0 && (
        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.cartBarBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.cartBarText}>
              {itemCount} item{itemCount !== 1 ? "s" : ""} · View cart
            </Text>
            <Text style={styles.cartBarTotal}>{formatPrice(cartTotal)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { width: "100%", height: 200 },
  content: { padding: 16 },
  desc: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 8, marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  menuItem: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  menuInfo: { flex: 1 },
  menuHeader: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  menuName: { fontSize: 15, fontWeight: "600" },
  popularBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  popularText: { color: colors.primary, fontSize: 10, fontWeight: "700" },
  menuDesc: { color: colors.muted, fontSize: 12, marginTop: 4 },
  menuPrice: { fontWeight: "600", marginTop: 6 },
  menuImage: { width: 80, height: 80, borderRadius: 8 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  qtyBtnText: { fontSize: 18, fontWeight: "700" },
  qty: { fontWeight: "700", minWidth: 16, textAlign: "center" },
  addBtn: {
    alignSelf: "flex-start",
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addBtnText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cartBarBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cartBarText: { color: "#fff", fontWeight: "700" },
  cartBarTotal: { color: "#fff", fontWeight: "700" },
});
