/**
 * Inventory Item Modal Component
 * 
 * Modal dialog for viewing and managing inventory items. Displays item image,
 * name, and rarity badge with color-coded styling. Provides equip, unequip, and
 * close actions. Conditionally shows unequip button only for equipped items that
 * can be removed.
 */

import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { InventoryItem } from "@/lib/inventory-context";

// ============================================================================
// Constants
// ============================================================================

const RARITY_COLORS: Record<string, string> = {
  common: colorPallet.neutral_3,
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
  default: colorPallet.neutral_3, // Fallback for "default" rarity
};

// ============================================================================
// Types
// ============================================================================

type InventoryItemModalProps = {
  visible: boolean;
  item: InventoryItem | null;
  isEquipped: boolean;
  canUnequip: boolean;
  onEquip: () => void;
  onUnequip: () => void;
  onClose: () => void;
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
    bodies: { scale: 1.5, translateY: -24 },
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

const InventoryItemModal = ({
  visible,
  item,
  isEquipped,
  canUnequip,
  onEquip,
  onUnequip,
  onClose,
}: InventoryItemModalProps) => {
  if (!item) return null;

  // Get rarity color with fallback
  const rarityColor = RARITY_COLORS[item.rarity] || colorPallet.neutral_3;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Item image */}
          <View style={styles.modalImageContainer}>
            <Image
              source={item.image}
              style={[styles.modalImage, getImageStyle(item.category)]}
              resizeMode="contain"
            />
          </View>

          {/* Item details */}
          <Text style={styles.modalTitle}>{item.name}</Text>

          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: rarityColor + "33" },
            ]}
          >
            <Text
              style={[styles.rarityText, { color: rarityColor }]}
            >
              {item.rarity.toUpperCase()}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.equipButton]}
              onPress={onEquip}
              activeOpacity={0.7}
            >
              <Text style={styles.equipButtonText}>
                {isEquipped ? "Re-equip" : "Equip"}
              </Text>
            </TouchableOpacity>

            {isEquipped && canUnequip && (
              <TouchableOpacity
                style={[styles.modalButton, styles.unequipButton]}
                onPress={onUnequip}
                activeOpacity={0.7}
              >
                <Text style={styles.unequipButtonText}>Unequip</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalImageContainer: {
    width: 140,
    height: 140,
    backgroundColor: colorPallet.neutral_4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "700",
    color: colorPallet.neutral_lightest,
    marginBottom: 12,
    textAlign: "center",
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 24,
  },
  rarityText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  equipButton: {
    backgroundColor: colorPallet.primary,
  },
  equipButtonText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontWeight: "700",
    fontSize: 16,
  },
  unequipButton: {
    backgroundColor: colorPallet.critical,
  },
  unequipButtonText: {
    ...typography.body,
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: colorPallet.neutral_5,
  },
  cancelButtonText: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontWeight: "700",
    fontSize: 16,
  },
});

export default InventoryItemModal;