/**
 * Selected Exercises List Component
 * 
 * Container component that displays a list of selected exercises for a routine.
 * Shows exercise count, empty state message, and renders individual exercise
 * items with their controls and metrics. Manages exercise reordering, removal,
 * and metric updates through callback props.
 */

import React from "react";
import { View, Text } from "react-native";
import { Exercise } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import SelectedExerciseItem from "./SelectedExerciseItem";

// ============================================================================
// Types
// ============================================================================

type SelectedExercisesListProps = {
  selectedExercises: Array<Exercise & { uniqueId: string }>;
  exerciseMetrics: Record<string, any>;
  onMoveExercise: (index: number, direction: "up" | "down") => void;
  onRemoveExercise: (uniqueId: string) => void;
  onUpdateMetric: (uniqueId: string, field: string, value: string) => void;
};

// ============================================================================
// Component
// ============================================================================

const SelectedExercisesList: React.FC<SelectedExercisesListProps> = ({
  selectedExercises,
  exerciseMetrics,
  onMoveExercise,
  onRemoveExercise,
  onUpdateMetric,
}) => {
  return (
    <View>
      {/* List header with count */}
      <Text
        style={{
          color: colorPallet.neutral_1,
          marginBottom: 8,
          fontWeight: "600",
        }}
      >
        Exercises ({selectedExercises.length})
      </Text>

      {/* Exercise list or empty state */}
      {selectedExercises.length === 0 ? (
        <Text
          style={{
            color: colorPallet.neutral_3,
            textAlign: "center",
            padding: 20,
          }}
        >
          No exercises added yet
        </Text>
      ) : (
        selectedExercises.map((ex, index) => (
          <SelectedExerciseItem
            key={ex.uniqueId}
            exercise={ex}
            index={index}
            isFirst={index === 0}
            isLast={index === selectedExercises.length - 1}
            metrics={exerciseMetrics[ex.uniqueId] || {}}
            onMove={onMoveExercise}
            onRemove={onRemoveExercise}
            onUpdateMetric={onUpdateMetric}
          />
        ))
      )}
    </View>
  );
};

export default SelectedExercisesList;