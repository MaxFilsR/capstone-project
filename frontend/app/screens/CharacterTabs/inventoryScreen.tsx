import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  UIManager,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
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
  const { inventory, equipItem, unequipItem, isEquipped } = useInventory();
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const handleItemPress = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleEquipItem = () => {
    if (selectedItem) {
      equipItem(selectedItem);
      setSelectedItem(null);
    }
  };

  const handleUnequipItem = () => {
    if (selectedItem) {
      // Map category to slot name
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
        unequipItem(slotName);
        setSelectedItem(null);
      }
    }
  };

  const canUnequipItem = (item: InventoryItem | null): boolean => {
    if (!item) return false;
    // Only pets and accessories can be unequipped
    return item.category === "pets" || item.category === "accessories";
  };

  const hasAnyItems = INVENTORY_CATEGORIES.some(
    (cat) => inventory[cat.key].length > 0
  );

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
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
});

export default InventoryScreen;
