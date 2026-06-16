import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { formatPrice, calculateTax, calculateTotal } from "@quickbite/shared";
import { CheckoutScreenProps } from "../navigation/types";
import { useCartStore } from "../store/cartStore";
import { colors } from "../theme";

const TIP_OPTIONS = [0, 2, 3, 5];

export default function CheckoutScreen({ navigation }: CheckoutScreenProps) {
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
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nothing to checkout.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.link}>Browse restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePlaceOrder = () => {
    if (!street || !city || !state || !zip) return;
    setLoading(true);
    const address = `${street}, ${city}, ${state} ${zip}`;
    const order = placeOrder(address, tip);
    setTimeout(() => {
      navigation.replace("Order", { id: order.id });
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <TextInput
          style={styles.input}
          placeholder="Street address"
          value={street}
          onChangeText={setStreet}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="State"
            value={state}
            onChangeText={setState}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="ZIP code"
          value={zip}
          onChangeText={setZip}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tip your driver</Text>
        <View style={styles.tipRow}>
          {TIP_OPTIONS.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[styles.tipBtn, tip === amount && styles.tipBtnActive]}
              onPress={() => setTip(amount)}
            >
              <Text style={[styles.tipText, tip === amount && styles.tipTextActive]}>
                {amount === 0 ? "No tip" : formatPrice(amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order summary</Text>
        <Text style={styles.restaurant}>{restaurantName}</Text>
        <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        <SummaryRow label="Delivery" value={formatPrice(deliveryFee)} />
        <SummaryRow label="Tax" value={formatPrice(tax)} />
        <SummaryRow label="Tip" value={formatPrice(tip)} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.disabled]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>Place order · {formatPrice(total)}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 15,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  tipRow: { flexDirection: "row", gap: 8 },
  tipBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  tipBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tipText: { fontWeight: "600", fontSize: 13 },
  tipTextActive: { color: "#fff" },
  restaurant: { color: colors.muted, fontSize: 13, marginBottom: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { color: colors.muted, fontSize: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: { fontWeight: "700", fontSize: 17 },
  totalValue: { fontWeight: "700", fontSize: 17 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.muted, marginBottom: 8 },
  link: { color: colors.primary, fontWeight: "600" },
});
