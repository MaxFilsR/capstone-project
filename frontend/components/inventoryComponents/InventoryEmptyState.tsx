/**
 * Inventory Empty State Component
 * 
 * Displays when user has no inventory items. Shows icon, title, and message
 * encouraging users to complete workouts to earn equipment and cosmetics.
 * Centered layout with consistent spacing and styling.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";

// ============================================================================
// Component
// ============================================================================

const InventoryEmptyState = () => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color={colorPallet.neutral_4} />
      <Text style={styles.emptyTitle}>No Items Yet</Text>
      <Text style={styles.emptySubtitle}>
        Complete workouts to earn new equipment and cosmetics!
      </Text>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
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

export default InventoryEmptyState;