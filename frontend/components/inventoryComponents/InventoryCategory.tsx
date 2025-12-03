/**
 * Inventory Category Component
 * 
 * Collapsible category section for inventory items with expandable header.
 * Displays category name, icon, item count, and grid of inventory items when
 * expanded. Supports equipped state indication and smooth layout animations
 * on toggle. Shows empty state when no items in category.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { InventoryItem } from "@/lib/inventory-context";
import InventoryItemCard from "./InventoryItemCard";

// ============================================================================
// Types
// ============================================================================

type InventoryCategoryProps = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: InventoryItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onItemPress: (item: InventoryItem) => void;
  isItemEquipped: (itemId: string) => boolean;
};

// ============================================================================
// Component
// ============================================================================

const InventoryCategory = ({
  name,
  icon,
  items,
  isExpanded,
  onToggle,
  onItemPress,
  isItemEquipped,
}: InventoryCategoryProps) => {
  /**
   * Toggle expansion with smooth layout animation
   */
  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.categorySection}>
      {/* Category header with icon and item count */}
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.categoryTitleRow}>
          <Ionicons name={icon} size={20} color={colorPallet.primary} />
          <Text style={styles.categoryTitle}>{name}</Text>
          <Text style={styles.itemCount}>({items.length})</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colorPallet.neutral_3}
        />
      </TouchableOpacity>

      {/* Items grid or empty state */}
      {isExpanded && (
        <View style={styles.itemsGrid}>
          {items.length > 0 ? (
            items.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                isEquipped={isItemEquipped(item.id)}
                onPress={onItemPress}
              />
            ))
          ) : (
            <View style={styles.emptyCategory}>
              <Text style={styles.emptyCategoryText}>
                No items in this category
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: "700",
    color: colorPallet.neutral_lightest,
  },
  itemCount: {
    ...typography.body,
    fontSize: 13,
    color: colorPallet.neutral_3,
    fontWeight: "600",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  emptyCategory: {
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyCategoryText: {
    ...typography.body,
    fontSize: 14,
    color: colorPallet.neutral_4,
  },
});

export default InventoryCategory;