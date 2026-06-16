import { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { CUISINES, searchRestaurants } from "@quickbite/shared";
import type { CuisineType, Restaurant } from "@quickbite/shared";
import { HomeScreenProps } from "../navigation/types";
import { useCartStore } from "../store/cartStore";
import { colors } from "../theme";

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [query, setQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | undefined>();
  const itemCount = useCartStore((s) => s.getItemCount());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("Cart")} style={styles.cartBtn}>
          <Text style={styles.cartBtnText}>Cart ({itemCount})</Text>
        </Pressable>
      ),
    });
  }, [navigation, itemCount]);

  const filtered = searchRestaurants(query, selectedCuisine);

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Restaurant", { id: item.id })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.rating}>★ {item.rating}</Text>
        </View>
        <Text style={styles.cardDesc} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.cardMeta}>
          {item.deliveryTime} · {item.distance} · ${item.deliveryFee.toFixed(2)} delivery
        </Text>
        <View style={styles.cuisineTag}>
          <Text style={styles.cuisineText}>{item.cuisine}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Food delivered to your door</Text>
        <Text style={styles.heroSub}>Browse restaurants near you</Text>
        <TextInput
          style={styles.search}
          placeholder="Search restaurants or cuisines..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={colors.muted}
        />
      </View>

      <FlatList
        data={CUISINES}
        horizontal
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.cuisineList}
        contentContainerStyle={styles.cuisineContent}
        renderItem={({ item: cuisine }) => (
          <TouchableOpacity
            style={[
              styles.cuisinePill,
              selectedCuisine === cuisine && styles.cuisinePillActive,
            ]}
            onPress={() =>
              setSelectedCuisine(cuisine === selectedCuisine ? undefined : cuisine)
            }
          >
            <Text
              style={[
                styles.cuisinePillText,
                selectedCuisine === cuisine && styles.cuisinePillTextActive,
              ]}
            >
              {cuisine}
            </Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.cuisinePill, !selectedCuisine && styles.cuisinePillActive]}
            onPress={() => setSelectedCuisine(undefined)}
          >
            <Text
              style={[
                styles.cuisinePillText,
                !selectedCuisine && styles.cuisinePillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No restaurants found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { padding: 16, paddingBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: colors.foreground },
  heroSub: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 12 },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  cuisineList: { maxHeight: 48, marginBottom: 8 },
  cuisineContent: { paddingHorizontal: 16, gap: 8 },
  cuisinePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  cuisinePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cuisinePillText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
  cuisinePillTextActive: { color: "#fff" },
  list: { padding: 16, paddingTop: 0, gap: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardImage: { width: "100%", height: 160 },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  featuredText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cardBody: { padding: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTitle: { fontSize: 17, fontWeight: "700", flex: 1 },
  rating: { fontSize: 14, fontWeight: "600" },
  cardDesc: { color: colors.muted, fontSize: 13, marginTop: 4 },
  cardMeta: { color: colors.muted, fontSize: 12, marginTop: 8 },
  cuisineTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  cuisineText: { fontSize: 11, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.muted, paddingVertical: 40 },
  cartBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 4,
  },
  cartBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
