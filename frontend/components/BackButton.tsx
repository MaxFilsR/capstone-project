/**
 * Back Button Component
 * 
 * Navigation button that returns to the previous screen. Can use default
 * router.back() behavior or accept a custom onPress handler. Supports
 * both absolute and relative positioning for flexible layout integration.
 */

import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { colorPallet } from "@/styles/variables";

// ============================================================================
// Types
// ============================================================================

type BackButtonProps = {
  onPress?: () => void;
  style?: ViewStyle;
  position?: "absolute" | "relative";
};

// ============================================================================
// Component
// ============================================================================

export const BackButton = ({
  onPress,
  style,
  position = "absolute",
}: BackButtonProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={onPress ? onPress : () => router.back()}
      style={[styles.button, { position }, style]}
    >
      <MaterialIcons
        name="arrow-back-ios"
        size={28}
        color={colorPallet.primary}
      />
      <Text style={styles.text}>Back</Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    top: 64,
    left: 22,
    zIndex: 10,
    margin: 0,
    borderRadius: 8,
    elevation: 2,
  },
  text: {
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    fontWeight: "500",
    margin: 0,
    padding: 0,
  },
});

export default BackButton;