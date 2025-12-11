/**
 * Shop Screen
 *
 * Daily shop displaying purchasable items with 24-hour refresh timer.
 * Features item grid with categories, prices, and buy buttons.
 * Displays user's current coin balance.
 */

import React, { useState, useEffect } from "react";
import { Text, ScrollView, View, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useShop } from "@/lib/shop-context";
import { useInventory } from "@/lib/inventory-context";
import { getCharacter } from "@/api/endpoints";

// ============================================================================
// Types
// ============================================================================

type ShopScreenProps = {
  coins: number;
}

// ============================================================================
// Component
// ============================================================================

const ShopScreen: React.FC<ShopScreenProps> = ({ coins: initialCoins }) => {
  const { shopItems, isLoading, error, purchaseItem, refreshShopItems, loadShop } = useShop();
  const { refreshInventory } = useInventory();
  const [coins, setCoins] = useState(initialCoins);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Refresh timer (24 hours in seconds)
  const REFRESH_TIME = 24 * 60 * 60; // 24 hours
  const [timeRemaining, setTimeRemaining] = useState(REFRESH_TIME);

  /**
   * Update coins from character data
   */
  useEffect(() => {
    const updateCoins = async () => {
      try {
        const characterData = await getCharacter();
        setCoins(characterData.coins);
      } catch (err) {
        console.error("Failed to fetch coins:", err);
      }
    };
    updateCoins();
  }, []);

  /**
   * Timer countdown
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoRefresh();
          return REFRESH_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Auto-refresh shop when timer expires
   */
  const handleAutoRefresh = async () => {
    try {
      await refreshShopItems();
    } catch (err) {
      console.error("Auto-refresh failed:", err);
    }
  };

  /**
   * Manual refresh button
   */
  const handleManualRefresh = async () => {
    Alert.alert(
      "Refresh Shop",
      "Get new items in the shop?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refresh",
          onPress: async () => {
            await refreshShopItems();
            setTimeRemaining(REFRESH_TIME); // Reset timer
          },
        },
      ]
    );
  };

  /**
   * Handle item purchase
   */
  const handlePurchase = async (itemId: string, itemName: string, price: number) => {
    // Check if user has enough coins
    if (coins < price) {
      Alert.alert(
        "Not Enough Coins",
        `You need ${price.toLocaleString()} coins but only have ${coins.toLocaleString()}.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Buy "${itemName}" for ${price.toLocaleString()} coins?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            try {
              setPurchasing(itemId);

              const result = await purchaseItem(itemId);

              if (result.success && result.remainingCoins !== undefined) {
                setCoins(result.remainingCoins);
                
                // Refresh inventory to show the newly purchased item
                await refreshInventory();
                
                Alert.alert(
                  "Success!",
                  `${itemName} purchased! Check your inventory.`,
                  [{ text: "OK" }]
                );
              } else if (result.error) {
                Alert.alert("Purchase Failed", result.error, [{ text: "OK" }]);
              }
            } catch (err) {
              Alert.alert(
                "Error",
                "Failed to purchase item. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setPurchasing(null);
            }
          },
        },
      ]
    );
  };

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format price with thousands separator
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const getRarityColor = (rarity: string): string => {
    const colorMap: Record<string, string> = {
      common: colorPallet.neutral_3,
      rare: "#3b82f6", // blue
      epic: "#a855f7", // purple
      legendary: "#f59e0b", // orange/gold
    };
    return colorMap[rarity.toLowerCase()] || colorPallet.neutral_3;
  };

  // Loading state
  if (isLoading && shopItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading shop...</Text>
      </View>
    );
  }

  // Error state
  if (error && shopItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color={colorPallet.critical} />
        <Text style={styles.errorText}>Failed to load shop</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadShop}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              name="cash-multiple"
              size={16}
              color={colorPallet.secondary}
            />
            <Text style={styles.currencyAmount}>{coins.toLocaleString()}</Text>
          </View>
        </View>

        {/* Timer row with manual refresh button */}
        <View style={styles.timerRow}>
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={16} color={colorPallet.neutral_3} />
            <Text style={styles.timerLabel}>Refreshes in:</Text>
            <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleManualRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={18} color={colorPallet.primary} />
            <Text style={styles.refreshButtonText}>Refresh Now</Text>
          </TouchableOpacity>
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
            <View style={styles.itemImageContainer}>
              <Image source={item.image} style={styles.itemImage} />
            </View>

            {/* Item Info */}
            <View style={styles.itemDetails}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View
                  style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColor(item.rarity) },
                  ]}
                >
                  <Text style={styles.rarityText}>{item.rarity}</Text>
                </View>
              </View>

              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              {/* Price and Buy Button */}
              <View style={styles.itemFooter}>
                <View style={styles.priceContainer}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={14}
                    color={colorPallet.secondary}
                  />
                  <Text style={styles.priceText}>
                    {formatPrice(item.price)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    purchasing === item.id && styles.buyButtonDisabled,
                  ]}
                  onPress={() => handlePurchase(item.id, item.name, item.price)}
                  activeOpacity={0.7}
                  disabled={purchasing === item.id}
                >
                  {purchasing === item.id ? (
                    <ActivityIndicator
                      size="small"
                      color={colorPallet.neutral_darkest}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="cart"
                        size={16}
                        color={colorPallet.neutral_darkest}
                      />
                      <Text style={styles.buyButtonText}>Buy</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Empty State */}
      {shopItems.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Ionicons
            name="storefront-outline"
            size={64}
            color={colorPallet.neutral_4}
          />
          <Text style={styles.emptyTitle}>Shop is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Tap refresh to get new items!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};


// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
    paddingHorizontal: 40,
    gap: 12,
  },
  loadingText: {
    ...typography.body,
    fontSize: 16,
    color: colorPallet.neutral_3,
    marginTop: 8,
  },
  errorText: {
    ...typography.h2,
    fontSize: 20,
    color: colorPallet.critical,
    fontWeight: "700",
    marginTop: 8,
  },
  errorSubtext: {
    ...typography.body,
    fontSize: 14,
    color: colorPallet.neutral_3,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colorPallet.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontWeight: "700",
    fontSize: 14,
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
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
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
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colorPallet.neutral_darkest,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.primary,
  },
  refreshButtonText: {
    ...typography.body,
    fontSize: 12,
    color: colorPallet.primary,
    fontWeight: "700",
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
  itemImage: {
    width: "95%",
    height: "95%",
    resizeMode: "contain",
  },
  itemDetails: {
    padding: 10,
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
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
  rarityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  rarityText: {
    ...typography.body,
    fontSize: 10,
    color: colorPallet.neutral_lightest,
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
  buyButtonDisabled: {
    opacity: 0.6,
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