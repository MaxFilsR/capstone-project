import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { InventoryItem } from "@/lib/inventory-context";

const RARITY_COLORS = {
  common: colorPallet.neutral_3,
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};

type InventoryItemCardProps = {
  item: InventoryItem;
  isEquipped: boolean;
  onPress: (item: InventoryItem) => void;
};

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
      <View style={styles.itemImageContainer}>
        <Image
          source={item.image}
          style={styles.itemImage}
          resizeMode="contain"
        />
        {isEquipped && (
          <View style={styles.equippedBadge}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: colorPallet.neutral_6,
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
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  itemImage: {
    width: "80%",
    height: "80%",
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
    color: colorPallet.neutral_2,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default InventoryItemCard;
