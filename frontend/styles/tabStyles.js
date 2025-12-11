/**
 * Tab Styles
 * 
 * Stylesheet for tab navigation components including tab bars, tab buttons,
 * and tab content areas. Provides consistent styling for segmented controls
 * and tabbed interfaces throughout the application.
 */

import { StyleSheet } from "react-native";
import { colorPallet } from "./variables";

// ============================================================================
// Styles
// ============================================================================

export const tabStyles = StyleSheet.create({
  // Tab content area
  tabContent: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingHorizontal: 22,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 20,
    marginHorizontal: 16,
    color: "#FFFFFF",
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginHorizontal: 16,
    color: "#CCCCCC",
  },

  // Tab container
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
  },

  // Tab bar
  tabBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Individual tab button
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
});