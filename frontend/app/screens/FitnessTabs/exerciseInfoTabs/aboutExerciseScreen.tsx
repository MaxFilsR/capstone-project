/**
 * About Exercise Screen
 *
 * Displays detailed information about a specific exercise including targeted
 * muscle groups with visual diagrams, equipment requirements, difficulty level,
 * and other exercise metadata. Features a horizontally scrollable muscle diagram
 * carousel with primary/secondary muscle distinction.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Exercise } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";

// ============================================================================
// Types
// ============================================================================

type AboutExerciseScreenProps = {
  /** Exercise object containing all exercise details */
  exercise: Exercise;
};

// ============================================================================
// Constants
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Mapping of muscle group names to their corresponding image assets
 * Images provide visual representation of targeted muscle groups
 */
const muscleImagesMap: Record<string, any> = {
  Abdominals: require("@/assets/images/muscleGroups/Abdominals.png"),
  Abductors: require("@/assets/images/muscleGroups/Abductors.png"),
  Adductors: require("@/assets/images/muscleGroups/Adductors.png"),
  Biceps: require("@/assets/images/muscleGroups/Biceps.png"),
  Calves: require("@/assets/images/muscleGroups/Calves.png"),
  Chest: require("@/assets/images/muscleGroups/Chest.png"),
  Forearms: require("@/assets/images/muscleGroups/Forearms.png"),
  Glutes: require("@/assets/images/muscleGroups/Glutes.png"),
  Hamstrings: require("@/assets/images/muscleGroups/Hamstrings.png"),
  Lats: require("@/assets/images/muscleGroups/Lats.png"),
  Neck: require("@/assets/images/muscleGroups/Neck.png"),
  Shoulders: require("@/assets/images/muscleGroups/Shoulders.png"),
  Triceps: require("@/assets/images/muscleGroups/Triceps.png"),
};

// ============================================================================
// Component
// ============================================================================

const AboutExerciseScreen: React.FC<AboutExerciseScreenProps> = ({
  exercise,
}) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** Current index of the muscle image carousel */
  const [currentIndex, setCurrentIndex] = useState(0);
  
  /** Controls visibility of routine selection modal (currently unused) */
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  // --------------------------------------------------------------------------
  // Data Processing
  // --------------------------------------------------------------------------

  /**
   * Combine primary and secondary muscles into a single array
   * Each muscle is tagged with its type for visual distinction
   */
  const combinedMuscles = [
    ...(exercise.primaryMuscles || []).map((name) => ({
      name,
      type: "primary",
    })),
    ...(exercise.secondaryMuscles || []).map((name) => ({
      name,
      type: "secondary",
    })),
  ];

  /**
   * Map muscle names to their corresponding images
   * Normalizes muscle names to match the muscleImagesMap keys
   * Filters out any muscles without matching images
   */
  const muscleImages = combinedMuscles
    .map((muscle) => {
      // Normalize muscle name (capitalize first letter, lowercase rest)
      const normalizedName =
        muscle.name.charAt(0).toUpperCase() +
        muscle.name.slice(1).toLowerCase();
      const img = muscleImagesMap[normalizedName];
      return img ? { img, type: muscle.type } : null;
    })
    .filter(Boolean) as { img: any; type: "primary" | "secondary" }[];

  /**
   * Create info cards for exercise metadata
   * Only includes properties that have values
   */
  const infoCards = [
    { label: "Equipment", value: exercise.equipment },
    { label: "Force Type", value: exercise.force },
    { label: "Difficulty Level", value: exercise.level },
    { label: "Mechanic", value: exercise.mechanic },
    { label: "Category", value: exercise.category },
  ].filter((item) => item.value);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  /**
   * Handle horizontal scroll of muscle image carousel
   * Updates current index based on scroll position for pagination dots
   */
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (SCREEN_WIDTH * 0.8 + 16));
    setCurrentIndex(index);
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <ScrollView
      showsVerticalScrollIndicator
      bounces
      style={[styles.scrollView, { backgroundColor: colorPallet.neutral_6 }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Muscles Section */}
      {combinedMuscles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Muscles</Text>

          {/* Muscle Tags */}
          <View style={styles.tagContainer}>
            {combinedMuscles.map((muscle, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  muscle.type === "secondary" && styles.tagSecondary,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    muscle.type === "secondary" && {
                      color: colorPallet.secondary,
                    },
                  ]}
                >
                  {muscle.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Muscle Images Carousel */}
          {muscleImages.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12, overflow: "visible" }}
              contentContainerStyle={{ alignItems: "center" }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {muscleImages.map((m, index) => (
                <Image
                  key={index}
                  source={m.img}
                  style={[
                    styles.muscleImage,
                    {
                      // Primary muscles use primary color border
                      // Secondary muscles use secondary color border
                      borderColor:
                        m.type === "primary"
                          ? colorPallet.primary
                          : colorPallet.secondary,
                    },
                  ]}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Information Section */}
      {infoCards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Information</Text>
          <View style={styles.infoGrid}>
            {infoCards.map((item, index) => (
              <View key={index} style={styles.infoCard}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  
  /** Section header label */
  label: {
    color: colorPallet.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  /** Container for muscle tags */
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  
  /** Primary muscle tag (filled background) */
  tag: {
    backgroundColor: colorPallet.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  
  /** Secondary muscle tag (outlined style) */
  tagSecondary: {
    backgroundColor: colorPallet.neutral_darkest,
    borderWidth: 1,
    borderColor: colorPallet.neutral_3,
  },
  
  tagText: { fontSize: 14, fontWeight: "600", textTransform: "capitalize" },
  
  /** Muscle diagram image in carousel */
  muscleImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    maxWidth: 400,
    maxHeight: 400,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 16,
    alignSelf: "center",
  },
  
  /** Grid container for info cards */
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  
  /** Individual info card (equipment, difficulty, etc.) */
  infoCard: {
    backgroundColor: colorPallet.neutral_darkest,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
    borderRadius: 10,
    padding: 12,
    width: "48%",
  },
  
  /** Info card label (e.g., "Equipment") */
  infoLabel: {
    color: colorPallet.secondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  
  /** Info card value (e.g., "Barbell") */
  infoValue: {
    color: colorPallet.neutral_lightest,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default AboutExerciseScreen;