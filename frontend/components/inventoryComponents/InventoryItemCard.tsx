/**
 * Inventory Item Card Component
 * 
 * Displays an individual inventory item in a square card with image, name, and
 * rarity-based border color. Shows equipped badge when item is currently equipped.
 * Supports press interaction for equipping/unequipping items. Rarity colors range
 * from common (gray) to legendary (gold).
 */

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { InventoryItem } from "@/lib/inventory-context";

// ============================================================================
// Constants
// ============================================================================

const RARITY_COLORS = {
  common: colorPallet.neutral_3,
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};

// ============================================================================
// Types
// ============================================================================

type InventoryItemCardProps = {
  item: InventoryItem;
  isEquipped: boolean;
  onPress: (item: InventoryItem) => void;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get image positioning adjustments based on item category
 * Different item types are positioned differently on the 64x64 canvas
 */
function getImageStyle(category: string) {
  const adjustments: Record<string, { scale: number; translateX?: number; translateY?: number }> = {
    backgrounds: { scale: 1.0 },
    bodies: { scale: 1.5, translateY: -12 },
    arms: { scale: 1.5, translateY: -12 },
    heads: { scale: 1.5, translateY: 0 },
    accessories: { scale: 1.5, translateY: 0 },
    weapons: { scale: 1.2, translateX: 2, translateY: -2 },
    pets: { scale: 1.2, translateY: 2 },
  };

  const adjustment = adjustments[category] || { scale: 1.2 };
  
  return {
    transform: [
      { scale: adjustment.scale },
      { translateX: adjustment.translateX || 0 },
      { translateY: adjustment.translateY || 0 },
    ],
  };
}

// ============================================================================
// Component
// ============================================================================

const InventoryItemCard = ({
  item,
  isEquipped,
  onPress,
}: InventoryItemCardProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.itemCard,
        isEquipped && styles.itemCardEquipped,
        { borderColor: RARITY_COLORS[item.rarity] },
      ]}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      {/* Item image with equipped badge */}
      <View style={styles.itemImageContainer}>
        <Image
          source={item.image}
          style={[styles.itemImage, getImageStyle(item.category)]}
          resizeMode="contain"
        />
        {isEquipped && (
          <View style={styles.equippedBadge}>
            <Ionicons name="checkmark" size={12} color={colorPallet.neutral_darkest} />
          </View>
        )}
      </View>

      {/* Item name */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  itemCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: colorPallet.neutral_4,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  itemCardEquipped: {
    borderColor: colorPallet.success,
    backgroundColor: colorPallet.neutral_5,
  },
  itemImageContainer: {
    flex: 1,
    backgroundColor: colorPallet.neutral_4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  equippedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colorPallet.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    padding: 8,
    backgroundColor: colorPallet.neutral_6,
    alignItems: "center",
  },
  itemName: {
    ...typography.body,
    fontSize: 11,
  
    fontWeight: "600",
    textAlign: "center",
  },
});

export default InventoryItemCard;