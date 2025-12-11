/**
 * Container Styles
 * 
 * Reusable container layouts for consistent screen structure throughout the app.
 */

import { Platform, StyleSheet } from "react-native";
import { colorPallet } from "./variables";

export const containers = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
    padding: 16,
    gap: 24,
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  formContainer: {
    gap: 24,
    marginVertical: 8,
    width: "100%",
  },
  formActionContainer: {
    gap: 4,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: Platform.OS === "ios" ? 120 : 100,
  },
  moduleContainer: {
    marginBottom: 16,
  },
});