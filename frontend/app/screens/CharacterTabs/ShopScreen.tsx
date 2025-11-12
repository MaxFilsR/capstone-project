import React, { useState, useEffect } from "react";
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type ShopItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
};

const ShopScreen = () => {
  // Mock shop items - will come from API
  const [shopItems] = useState<ShopItem[]>([
    { id: "1", name: "Ninja Headband", category: "Accessory", price: 5000 },
    { id: "2", name: "Dragon Armor", category: "Body", price: 15000 },
    { id: "3", name: "Lightning Sword", category: "Weapon", price: 12000 },
    { id: "4", name: "Phoenix Pet", category: "Pet", price: 25000 },
    { id: "5", name: "Mystic Background", category: "Background", price: 8000 },
    { id: "6", name: "Cyber Arms", category: "Arms", price: 10000 },
    { id: "7", name: "Warrior Helmet", category: "Head", price: 7500 },
    { id: "8", name: "Shadow Cloak", category: "Body", price: 18000 },
    { id: "9", name: "Crystal Staff", category: "Weapon", price: 20000 },
    { id: "10", name: "Golden Crown", category: "Accessory", price: 30000 },
  ]);

  // Refresh timer (24 hours in seconds)
  const REFRESH_TIME = 24 * 60 * 60; // 24 hours
  const [timeRemaining, setTimeRemaining] = useState(REFRESH_TIME);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Refresh shop items here
          return REFRESH_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const getCategoryIcon = (
    category: string
  ): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      Accessory: "glasses",
      Body: "body",
      Weapon: "flash",
      Pet: "paw",
      Background: "image",
      Arms: "hand-left",
      Head: "happy",
    };
    return iconMap[category] || "cube";
  };

  const handlePurchase = (item: ShopItem) => {
    // TODO: Implement purchase logic with API
    console.log("Purchasing:", item);
  };

  return (
    <ScrollView
      style={[
        tabStyles.tabContent,
        { paddingTop: 16, backgroundColor: colorPallet.neutral_darkest },
      ]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Shop Header with Timer */}
      <View style={styles.shopHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleRow}>
            <Ionicons
              name="storefront"
              size={24}
              color={colorPallet.secondary}
            />
            <Text style={styles.headerTitle}>Daily Shop</Text>
          </View>

          {/* Currency Display */}
          <View style={styles.currencyContainer}>
            <MaterialCommunityIcons
              name="arm-flex"
              size={16}
              color={colorPallet.secondary}
            />
            <Text style={styles.currencyAmount}>999,999,999</Text>
          </View>
        </View>

        <View style={styles.timerContainer}>
          <Ionicons name="time" size={16} color={colorPallet.neutral_3} />
          <Text style={styles.timerLabel}>Refreshes in:</Text>
          <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons
          name="information-circle"
          size={18}
          color={colorPallet.primary}
        />
        <Text style={styles.infoBannerText}>
          Shop refreshes daily with new items!
        </Text>
      </View>

      {/* Shop Items Grid */}
      <View style={styles.itemsGrid}>
        {shopItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            {/* Item Image */}
            <View style={styles.itemImageContainer}>
              <Ionicons
                name={getCategoryIcon(item.category)}
                size={32}
                color={colorPallet.neutral_4}
              />
            </View>

            {/* Item Info */}
            <View style={styles.itemDetails}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>

              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              {/* Price and Buy Button */}
              <View style={styles.itemFooter}>
                <View style={styles.priceContainer}>
                  <MaterialCommunityIcons
                    name="arm-flex"
                    size={14}
                    color={colorPallet.secondary}
                  />
                  <Text style={styles.priceText}>
                    {formatPrice(item.price)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => handlePurchase(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="cart"
                    size={16}
                    color={colorPallet.neutral_darkest}
                  />
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Empty State (if no items) */}
      {shopItems.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="storefront-outline"
            size={64}
            color={colorPallet.neutral_4}
          />
          <Text style={styles.emptyTitle}>Shop is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new items!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  shopHeader: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    ...typography.h1,
    fontSize: 22,
    fontWeight: "800",
    color: colorPallet.neutral_lightest,
  },
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorPallet.neutral_darkest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colorPallet.secondary,
  },
  currencyAmount: {
    ...typography.body,
    color: colorPallet.secondary,
    fontWeight: "800",
    fontSize: 14,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorPallet.neutral_darkest,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timerLabel: {
    ...typography.body,
    fontSize: 13,
    color: colorPallet.neutral_3,
    fontWeight: "600",
  },
  timerValue: {
    ...typography.body,
    fontSize: 14,
    color: colorPallet.primary,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colorPallet.neutral_6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colorPallet.primary,
  },
  infoBannerText: {
    ...typography.body,
    fontSize: 13,
    color: colorPallet.neutral_2,
    fontWeight: "600",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  itemCard: {
    width: "48%",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorPallet.neutral_5,
    overflow: "hidden",
  },
  itemImageContainer: {
    aspectRatio: 1,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    padding: 10,
    gap: 6,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: colorPallet.neutral_5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    ...typography.body,
    fontSize: 10,
    color: colorPallet.neutral_2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  itemName: {
    ...typography.body,
    fontSize: 14,
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    minHeight: 36,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    ...typography.body,
    fontSize: 14,
    color: colorPallet.secondary,
    fontWeight: "800",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colorPallet.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buyButtonText: {
    ...typography.body,
    fontSize: 12,
    color: colorPallet.neutral_darkest,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colorPallet.neutral_3,
    fontWeight: "700",
    marginTop: 8,
  },
  emptySubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colorPallet.neutral_4,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default ShopScreen;
