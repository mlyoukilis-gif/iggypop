import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  formatPrice,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STEPS,
  getOrderProgress,
} from "@quickbite/shared";
import { OrderScreenProps } from "../navigation/types";
import { useCartStore } from "../store/cartStore";
import { colors } from "../theme";

export default function OrderScreen({ navigation }: OrderScreenProps) {
  const order = useCartStore((s) => s.currentOrder);
  const advanceOrderStatus = useCartStore((s) => s.advanceOrderStatus);

  useEffect(() => {
    if (!order || order.status === "delivered") return;
    const interval = setInterval(advanceOrderStatus, 4000);
    return () => clearInterval(interval);
  }, [order, advanceOrderStatus]);

  if (!order) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Order not found.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.link}>Back to home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = getOrderProgress(order.status);
  const eta = new Date(order.estimatedDelivery).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const currentIndex = ORDER_STATUS_STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>{order.status === "delivered" ? "🎉" : "🚗"}</Text>
        <Text style={styles.title}>
          {order.status === "delivered"
            ? "Order delivered!"
            : ORDER_STATUS_LABELS[order.status]}
        </Text>
        {order.status !== "delivered" && (
          <Text style={styles.eta}>Estimated arrival by {eta}</Text>
        )}
        <Text style={styles.orderId}>Order {order.id}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isComplete = index <= currentIndex;
          const isCurrent = step === order.status;
          return (
            <View key={step} style={styles.step}>
              <View
                style={[
                  styles.stepDot,
                  isComplete && styles.stepDotComplete,
                  isCurrent && styles.stepDotCurrent,
                ]}
              >
                <Text style={[styles.stepDotText, isComplete && { color: "#fff" }]}>
                  {isComplete ? "✓" : index + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, isComplete && styles.stepLabelActive]}>
                {ORDER_STATUS_LABELS[step]}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.restaurant}>{order.restaurantName}</Text>
        <Text style={styles.address}>{order.address}</Text>
        {order.items.map((item) => (
          <View key={item.menuItemId} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {item.quantity}x {item.name}
            </Text>
            <Text>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.primaryBtnText}>Order again</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 20 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  eta: { color: colors.muted, marginTop: 4 },
  orderId: { color: colors.muted, fontSize: 12, marginTop: 8 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  step: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  stepDotComplete: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotCurrent: { borderWidth: 2, borderColor: colors.primary },
  stepDotText: { fontWeight: "700", fontSize: 12 },
  stepLabel: { color: colors.muted, fontSize: 14 },
  stepLabelActive: { color: colors.foreground, fontWeight: "600" },
  restaurant: { fontWeight: "700", fontSize: 16 },
  address: { color: colors.muted, fontSize: 13, marginTop: 4, marginBottom: 12 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  itemText: { fontSize: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: { fontWeight: "700", fontSize: 16 },
  totalValue: { fontWeight: "700", fontSize: 16 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.muted, marginBottom: 8 },
  link: { color: colors.primary, fontWeight: "600" },
});
