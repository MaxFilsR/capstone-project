/**
 * Typography Styles
 * 
 * Defines text styles and font hierarchies used throughout the application.
 * Includes heading levels (h1-h5), body text, error messages, and specialized
 * text styles with consistent font families and color palette.
 */

import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

// ============================================================================
// Styles
// ============================================================================

export const typography = StyleSheet.create({
  // Heading levels
  h1: {
    fontSize: 24,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h2: {
    fontSize: 18,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h3: {
    fontSize: 16,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h4: {
    fontSize: 14,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
  h5: {
    fontSize: 12,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },

  // Body and specialized text
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: colorPallet.neutral_lightest,
    textAlign: "left",
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
  header: {
    fontSize: 24,
    fontFamily: "Anton",
    color: colorPallet.primary,
  },
});