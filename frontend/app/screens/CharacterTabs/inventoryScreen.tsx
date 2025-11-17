import React from "react";
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
import { Ionicons } from "@expo/vector-icons";

type InventoryCategory = {
  name: string;
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: any[]; // This will come from API
};

const InventoryScreen = () => {
  // Mock inventory categories - will be populated from API
  const inventoryCategories: InventoryCategory[] = [
    {
      name: "Backgrounds",
      key: "backgrounds",
      icon: "image",
      items: Array(8).fill(null),
    },
    { name: "Bodies", key: "bodies", icon: "body", items: Array(6).fill(null) },
    {
      name: "Arms",
      key: "arms",
      icon: "hand-left",
      items: Array(5).fill(null),
    },
    { name: "Heads", key: "heads", icon: "happy", items: Array(7).fill(null) },
    {
      name: "Accessories",
      key: "head_accessories",
      icon: "glasses",
      items: Array(4).fill(null),
    },
    {
      name: "Weapons",
      key: "weapons",
      icon: "flash",
      items: Array(9).fill(null),
    },
    { name: "Pets", key: "pets", icon: "paw", items: Array(3).fill(null) },
  ];

  return (
    <ScrollView
      style={[
        tabStyles.tabContent,
        { paddingTop: 16, backgroundColor: colorPallet.neutral_darkest },
      ]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {inventoryCategories.map((category) => (
        <View key={category.key} style={styles.categorySection}>
          {/* Category Header */}
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleRow}>
              <Ionicons
                name={category.icon}
                size={20}
                color={colorPallet.primary}
              />
              <Text style={styles.categoryTitle}>{category.name}</Text>
            </View>
            <Text style={styles.itemCount}>
              {category.items.length}{" "}
              {category.items.length === 1 ? "Item" : "Items"}
            </Text>
          </View>

          {/* Items Grid */}
          <View style={styles.itemsGrid}>
            {category.items.map((item, index) => (
              <TouchableOpacity
                key={`${category.key}-${index}`}
                style={styles.itemCard}
                activeOpacity={0.7}
              >
                <View style={styles.itemImageContainer}>
                  {/* Placeholder - will be replaced with actual item images from API */}
                  <Text style={styles.itemPlaceholder}>?</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>Item {index + 1}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Empty State (show when no items) */}
      {inventoryCategories.every((cat) => cat.items.length === 0) && (
        <View style={styles.emptyState}>
          <Ionicons
            name="cube-outline"
            size={64}
            color={colorPallet.neutral_4}
          />
          <Text style={styles.emptyTitle}>No Items Yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete workouts to earn new equipment and cosmetics!
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
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_5,
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
  },
  itemCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorPallet.neutral_5,
    overflow: "hidden",
  },
  itemImageContainer: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
  },
  itemPlaceholder: {
    fontSize: 32,
    color: colorPallet.neutral_4,
    fontWeight: "300",
  },
  itemInfo: {
    padding: 8,
    backgroundColor: colorPallet.neutral_6,
    alignItems: "center",
  },
  itemName: {
    ...typography.body,
    fontSize: 11,
    color: colorPallet.neutral_2,
    fontWeight: "600",
    textAlign: "center",
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

export default InventoryScreen;
