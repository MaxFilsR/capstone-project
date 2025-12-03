import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  UIManager,
  ActivityIndicator,
  Text,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { useInventory, InventoryItem } from "@/lib/inventory-context";
import InventoryCategory from "@/components/inventoryComponents/InventoryCategory";
import InventoryItemModal from "@/components/inventoryComponents/InventoryItemModal";
import InventoryEmptyState from "@/components/inventoryComponents/InventoryEmptyState";
import { Ionicons } from "@expo/vector-icons";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CategoryConfig = {
  name: string;
  key:
    | "backgrounds"
    | "bodies"
    | "arms"
    | "heads"
    | "accessories"
    | "weapons"
    | "pets";
  icon: keyof typeof Ionicons.glyphMap;
};

const INVENTORY_CATEGORIES: CategoryConfig[] = [
  { name: "Backgrounds", key: "backgrounds", icon: "image" },
  { name: "Bodies", key: "bodies", icon: "body" },
  { name: "Arms", key: "arms", icon: "hand-left" },
  { name: "Heads", key: "heads", icon: "happy" },
  { name: "Accessories", key: "accessories", icon: "glasses" },
  { name: "Weapons", key: "weapons", icon: "flash" },
  { name: "Pets", key: "pets", icon: "paw" },
];

const InventoryScreen = () => {
  const { inventory, equipItem, unequipItem, isEquipped, isLoading, error } =
    useInventory();
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const handleItemPress = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleEquipItem = async () => {
    if (selectedItem && !actionLoading) {
      try {
        setActionLoading(true);
        await equipItem(selectedItem);
        setSelectedItem(null);
      } catch (error) {
        console.error("[InventoryScreen] Failed to equip item:", error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleUnequipItem = async () => {
    if (selectedItem && !actionLoading) {
      const slotMap: Record<
        string,
        | "background"
        | "body"
        | "arms"
        | "head"
        | "headAccessory"
        | "weapon"
        | "pet"
      > = {
        backgrounds: "background",
        bodies: "body",
        arms: "arms",
        heads: "head",
        accessories: "headAccessory",
        weapons: "weapon",
        pets: "pet",
      };

      const slotName = slotMap[selectedItem.category];
      
      if (slotName) {
        try {
          setActionLoading(true);
          await unequipItem(slotName);
          setSelectedItem(null);
        } catch (error) {
          console.error("[InventoryScreen] Failed to unequip item:", error);
        } finally {
          setActionLoading(false);
        }
      }
    }
  };

  const canUnequipItem = (item: InventoryItem | null): boolean => {
    if (!item) return false;
    // Only pets, accessories, and weapons can be unequipped
    return (
      item.category === "pets" ||
      item.category === "accessories" ||
      item.category === "weapons"
    );
  };

  const hasAnyItems = INVENTORY_CATEGORIES.some(
    (cat) => inventory[cat.key].length > 0
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color={colorPallet.critical} />
        <Text style={styles.errorText}>Failed to load inventory</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[
          tabStyles.tabContent,
          { paddingTop: 16, backgroundColor: colorPallet.neutral_darkest },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {INVENTORY_CATEGORIES.map((category) => (
          <InventoryCategory
            key={category.key}
            name={category.name}
            icon={category.icon}
            items={inventory[category.key]}
            isExpanded={expandedCategories[category.key] || false}
            onToggle={() => toggleCategory(category.key)}
            onItemPress={handleItemPress}
            isItemEquipped={isEquipped}
          />
        ))}

        {!hasAnyItems && <InventoryEmptyState />}
      </ScrollView>

      <InventoryItemModal
        visible={selectedItem !== null}
        item={selectedItem}
        isEquipped={selectedItem ? isEquipped(selectedItem.id) : false}
        canUnequip={canUnequipItem(selectedItem)}
        onEquip={handleEquipItem}
        onUnequip={handleUnequipItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Loading overlay when performing equip/unequip action */}
      {actionLoading && (
        <View style={styles.actionLoadingOverlay}>
          <ActivityIndicator size="large" color={colorPallet.primary} />
        </View>
      )}
    </>
  );
};

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
  actionLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});

export default InventoryScreen;