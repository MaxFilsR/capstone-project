/**
 * Create Routine Modal Component
 * 
 * Modal for creating a new workout routine with exercise selection and configuration.
 * Allows searching and adding exercises, setting metrics (sets/reps/distance), and
 * reordering exercises. Validates routine name and exercise list before saving.
 * Shows confirmation alerts for removals and success/error states.
 */

import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Exercise, RoutineExercise } from "@/api/endpoints";
import { typography } from "@/styles";
import { popupModalStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { FormTextInput } from "../FormTextInput";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import { useRoutines } from "@/lib/routines-context";
import ExerciseSearchList from "../ExerciseSearchList";
import SelectedExercisesList from "../SelectedExercisesList";
import Alert from "./Alert";

// ============================================================================
// Types
// ============================================================================

type CreateRoutineModalProps = {
  onClose: () => void;
};

// ============================================================================
// Component
// ============================================================================

const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({ onClose }) => {
  const { exercises } = useWorkoutLibrary();
  const { addRoutine } = useRoutines();
  const [isSaving, setIsSaving] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    Array<Exercise & { uniqueId: string }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseMetrics, setExerciseMetrics] = useState<Record<string, any>>(
    {}
  );
  const [alert, setAlert] = useState<{
    visible: boolean;
    mode: "alert" | "success" | "error" | "confirmAction";
    title: string;
    message: string;
    onConfirmAction?: () => void;
  }>({
    visible: false,
    mode: "alert",
    title: "",
    message: "",
    onConfirmAction: undefined,
  });

  /**
   * Filter exercises based on search query
   */
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return exercises
      .filter(
        (ex) =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.primaryMuscles.some((m) =>
            m.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      .slice(0, 20);
  }, [searchQuery, exercises]);

  /**
   * Validate and save routine
   */
  const handleSave = async () => {
    if (!routineName.trim()) {
      setAlert({
        visible: true,
        mode: "error",
        title: "Missing Name",
        message: "Please enter a routine name.",
      });
      return;
    }
    if (selectedExercises.length === 0) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Exercises",
        message: "Please add at least one exercise to the routine.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const formattedExercises: RoutineExercise[] = selectedExercises.map(
        (ex) => {
          const metrics = exerciseMetrics[ex.uniqueId] || {};
          return {
            id: ex.id,
            sets: parseInt(metrics.sets) || 0,
            reps: parseInt(metrics.reps) || 0,
            weight: parseFloat(metrics.weight) || 0.0,
            distance: parseFloat(metrics.distance) || 0.0,
          };
        }
      );

      const payload = {
        name: routineName.trim(),
        exercises: formattedExercises,
      };

      await addRoutine(payload);

      setAlert({
        visible: true,
        mode: "success",
        title: "Success",
        message: "Routine created successfully!",
      });
    } catch (error: any) {
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message: "Failed to create routine. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Add exercise to routine with unique ID
   */
  const addExercise = (exercise: Exercise) => {
    const uniqueId = `${exercise.id}-${Date.now()}`;
    setSelectedExercises([...selectedExercises, { ...exercise, uniqueId }]);
    setSearchQuery("");
  };

  /**
   * Remove exercise with confirmation
   */
  const removeExercise = (uniqueId: string) => {
    setAlert({
      visible: true,
      mode: "confirmAction",
      title: "Remove Exercise",
      message: "Are you sure you want to remove this exercise?",
      onConfirmAction: () => {
        setSelectedExercises(
          selectedExercises.filter((ex) => ex.uniqueId !== uniqueId)
        );
        setExerciseMetrics((prev) => {
          const newMetrics = { ...prev };
          delete newMetrics[uniqueId];
          return newMetrics;
        });
      },
    });
  };

  /**
   * Reorder exercises in the list
   */
  const moveExercise = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= selectedExercises.length) return;

    const newList = [...selectedExercises];
    [newList[fromIndex], newList[toIndex]] = [
      newList[toIndex],
      newList[fromIndex],
    ];
    setSelectedExercises(newList);
  };

  /**
   * Update metrics for an exercise
   */
  const updateExerciseMetric = (
    uniqueId: string,
    field: string,
    value: string
  ) => {
    setExerciseMetrics((prev) => ({
      ...prev,
      [uniqueId]: {
        ...prev[uniqueId],
        [field]: value,
      },
    }));
  };

  const handleAlertConfirm = () => {
    if (alert.mode === "success") {
      onClose();
    } else if (alert.mode === "confirmAction" && alert.onConfirmAction) {
      alert.onConfirmAction();
    }
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header bar with save button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colorPallet.neutral_5,
          backgroundColor: colorPallet.neutral_darkest,
        }}
      >
        <TouchableOpacity onPress={onClose} disabled={isSaving}>
          <Text style={popupModalStyles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text
          style={{
            color: colorPallet.neutral_1,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          New Routine
        </Text>

        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text
            style={{
              color: isSaving ? colorPallet.neutral_3 : colorPallet.primary,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Routine content */}
      <ScrollView
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: colorPallet.neutral_darkest,
        }}
      >
        <View style={{ marginBottom: 16 }}>
          <FormTextInput
            label="Routine Name"
            value={routineName}
            placeholder="Enter routine name..."
            onChangeText={setRoutineName}
            labelStyle={typography.h2}
          />
        </View>

        <ExerciseSearchList
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredExercises={filteredExercises}
          onAddExercise={addExercise}
        />

        <SelectedExercisesList
          selectedExercises={selectedExercises}
          exerciseMetrics={exerciseMetrics}
          onMoveExercise={moveExercise}
          onRemoveExercise={removeExercise}
          onUpdateMetric={updateExerciseMetric}
        />
      </ScrollView>

      {/* Alert dialog */}
      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
        confirmText={alert.mode === "confirmAction" ? "Remove" : "OK"}
      />
    </View>
  );
};

export default CreateRoutineModal;