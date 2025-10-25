import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Exercise } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import { FormButton } from "@/components";

type InstructionsExerciseScreenProps = {
  exercise: Exercise;
};

const InstructionsExerciseScreen: React.FC<InstructionsExerciseScreenProps> = ({
  exercise,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={true}
      bounces={true}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Instructions */}
      {exercise.instructions && exercise.instructions.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.label}>How to Perform</Text>
          {exercise.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}.</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No instructions available for this exercise.
          </Text>
        </View>
      )}
      <View>
        <FormButton title="Add to routine" onPress={() => null} />
      </View>
    </ScrollView>
  );
};

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
  label: {
    color: colorPallet.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  instructionNumber: {
    color: colorPallet.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 12,
    minWidth: 28,
  },
  instructionText: {
    flex: 1,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: colorPallet.neutral_3,
    fontSize: 16,
    textAlign: "center",
  },
});

export default InstructionsExerciseScreen;
