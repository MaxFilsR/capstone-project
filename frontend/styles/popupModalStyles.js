/**
 * Popup Modal Styles
 * 
 * Stylesheet for popup modal components including overlays, content containers,
 * exercise cards, tab bars, and form inputs. Handles responsive sizing and
 * maintains consistent styling across all modal variations.
 */

import { Dimensions, StyleSheet } from "react-native";
import { colorPallet } from "./variables";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// Styles
// ============================================================================

export const popupModalStyles = StyleSheet.create({
  // Modal container and overlay
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    height: SCREEN_HEIGHT * 0.85,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    height: "100%",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorPallet.neutral_6,
    overflow: "hidden",
  },

  // Close button
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
  },
  closeText: {
    color: colorPallet.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },

  // Content and empty states
  text: {
    color: colorPallet.neutral_3,
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Tab bar overrides
  tabOuterContainer: {
    paddingTop: 0,
    margin: 0,
    paddingBottom: 0,
    justifyContent: "center",
  },
  tabBarContainer: {
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  tabBar: {
    backgroundColor: colorPallet.neutral_darkest,
    margin: 0,
    borderRadius: 0,
    padding: 0,
    borderBottomColor: colorPallet.primary,
    borderBottomWidth: 1,
  },
  tabButton: {
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
  pageTitle: {
    alignSelf: "center",
    paddingTop: 16,
  },

  // Exercise cards
  exerciseCard: {
    flexDirection: "row",
    backgroundColor: colorPallet.neutral_6,
    borderBottomWidth: 1,
    borderColor: colorPallet.neutral_lightest,
    overflow: "hidden",
    alignItems: "center",
  },
  selectedExerciseCard: {
    flexDirection: "row",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
    overflow: "hidden",
    alignItems: "center",
    marginBottom: 16,
  },
  selectedExerciseCardWithMetrics: {
    flexDirection: "row",
    backgroundColor: colorPallet.neutral_6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colorPallet.neutral_lightest,
    overflow: "hidden",
    alignItems: "center",
  },
  exerciseThumbnail: {
    width: 70,
    height: 70,
    marginRight: 12,
    backgroundColor: colorPallet.neutral_5,
    borderTopStartRadius: 8,
  },

  // Exercise metrics
  metricsContainer: {
    padding: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colorPallet.neutral_lightest,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colorPallet.neutral_5,
    marginBottom: 16,
  },
  metricInput: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    color: colorPallet.neutral_1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
    fontSize: 14,
  },

  // Header
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_5,
    backgroundColor: colorPallet.neutral_darkest,
  },
  headerTitle: {
    color: colorPallet.neutral_1,
    fontSize: 18,
    fontWeight: "bold",
  },
  saveText: {
    color: colorPallet.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  saveTextDisabled: {
    color: colorPallet.neutral_3,
  },

  // Scrollable content
  scrollContent: {
    flex: 1,
    padding: 16,
    backgroundColor: colorPallet.neutral_darkest,
  },
  section: {
    marginBottom: 16,
  },
});