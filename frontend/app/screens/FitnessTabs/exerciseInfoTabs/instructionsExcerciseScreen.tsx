/**
 * Instructions Exercise Screen
 *
 * Displays step-by-step instructions for performing an exercise.
 * Shows numbered instructions in an easy-to-follow format, with
 * an empty state when no instructions are available.
 */

import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Exercise } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";

// ============================================================================
// Types
// ============================================================================

type InstructionsExerciseScreenProps = {
  /** Exercise object containing instruction steps */
  exercise: Exercise;
};

// ============================================================================
// Component
// ============================================================================

const InstructionsExerciseScreen: React.FC<InstructionsExerciseScreenProps> = ({
  exercise,
}) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** Controls visibility of routine selection modal (currently unused) */
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <ScrollView
      showsVerticalScrollIndicator={true}
      bounces={true}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Instructions List */}
      {exercise.instructions && exercise.instructions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.label}>How to Perform</Text>
          
          {/* Numbered instruction steps */}
          {exercise.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              {/* Step number */}
              <Text style={styles.instructionNumber}>{index + 1}.</Text>
              
              {/* Step description */}
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      ) : (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No instructions available for this exercise.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colorPallet.neutral_6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  
  /** Section header label */
  label: {
    color: colorPallet.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  /** Container for each instruction step (number + text) */
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  
  /** Step number displayed on the left */
  instructionNumber: {
    color: colorPallet.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 12,
    minWidth: 28,
  },
  
  /** Instruction text content */
  instructionText: {
    flex: 1,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    lineHeight: 24,
  },
  
  /** Container for empty state message */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  
  /** Empty state text */
  emptyText: {
    color: colorPallet.neutral_3,
    fontSize: 16,
    textAlign: "center",
  },
});

export default InstructionsExerciseScreen;