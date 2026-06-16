import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { formatPrice, calculateTax, calculateTotal } from "@quickbite/shared";
import { CartScreenProps } from "../navigation/types";
import { useCartStore } from "../store/cartStore";
import { colors } from "../theme";

export default function CartScreen({ navigation }: CartScreenProps) {
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
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.primaryBtnText}>Browse restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {restaurantName && (
        <Text style={styles.subtitle}>From {restaurantName}</Text>
      )}

      {items.map((item) => (
        <View key={item.menuItemId} style={styles.item}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{formatPrice(item.price)} each</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.menuItemId, item.quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnPrimary]}
                onPress={() => updateQuantity(item.menuItemId, item.quantity + 1)}
              >
                <Text style={[styles.qtyBtnText, { color: "#fff" }]}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeItem(item.menuItemId)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.lineTotal}>
            {formatPrice(item.price * item.quantity)}
          </Text>
        </View>
      ))}

      <View style={styles.summary}>
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row label="Delivery fee" value={formatPrice(deliveryFee)} />
        <Row label="Tax" value={formatPrice(tax)} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("Checkout")}
      >
        <Text style={styles.primaryBtnText}>Proceed to checkout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  subtitle: { color: colors.muted, marginBottom: 16 },
  item: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: "600", fontSize: 15 },
  itemPrice: { color: colors.muted, fontSize: 12, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  qtyBtnText: { fontSize: 16, fontWeight: "700" },
  qty: { fontWeight: "700" },
  remove: { color: colors.muted, fontSize: 12, marginLeft: 8 },
  lineTotal: { fontWeight: "600" },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rowLabel: { color: colors.muted, fontSize: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontWeight: "700", fontSize: 17 },
  totalValue: { fontWeight: "700", fontSize: 17 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
});
