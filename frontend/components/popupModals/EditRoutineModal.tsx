import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import {
  Exercise,
  updateRoutine,
  deleteRoutine,
  RoutineExercise,
} from "@/api/endpoints";
import { typography } from "@/styles";
import { popupModalStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { FormTextInput } from "../FormTextInput";
import { FormButton } from "../FormButton";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import ExerciseSearchList from "../ExerciseSearchList";
import SelectedExercisesList from "../SelectedExercisesList";

type Routine = {
  id: number;
  name: string;
  exercises: Array<
    Exercise & {
      uniqueId: string;
      sets?: number;
      reps?: number;
      weight?: number;
      distance?: number;
    }
  >;
};

type EditRoutineModalProps = {
  onClose: () => void;
  routine: Routine;
};

const EditRoutineModal: React.FC<EditRoutineModalProps> = ({
  onClose,
  routine,
}) => {
  const { exercises } = useWorkoutLibrary();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [routineName, setRoutineName] = useState(routine.name);
  const [selectedExercises, setSelectedExercises] = useState<
    Array<Exercise & { uniqueId: string }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseMetrics, setExerciseMetrics] = useState<Record<string, any>>(
    {}
  );

  useEffect(() => {
    const exercisesWithIds = routine.exercises.map((ex, index) => {
      const exerciseWithId = {
        ...ex,
        uniqueId: ex.uniqueId || `${ex.id}-${index}`,
      };

      return exerciseWithId;
    });

    setSelectedExercises(exercisesWithIds);
    const initialMetrics: Record<string, any> = {};
    exercisesWithIds.forEach((ex) => {
      initialMetrics[ex.uniqueId] = {
        sets: ex.sets?.toString() || "",
        reps: ex.reps?.toString() || "",
        weight: ex.weight?.toString() || "",
        distance: ex.distance?.toString() || "",
      };
    });

    setExerciseMetrics(initialMetrics);
  }, [routine]);

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

  const handleSave = async () => {
    if (!routineName.trim()) {
      Alert.alert("Error", "Please enter a routine name");
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
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
        id: routine.id,
        name: routineName.trim(),
        exercises: formattedExercises,
      };

      const response = await updateRoutine(payload);

      Alert.alert("Success", "Routine updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error updating routine:", error);
      console.error("Error response:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update routine. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Routine",
      `Are you sure you want to delete "${routine.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteRoutine({ id: routine.id });
              Alert.alert("Success", "Routine deleted successfully!");
              onClose();
            } catch (error: any) {
              console.error("Error deleting routine:", error);
              Alert.alert(
                "Error",
                error?.response?.data?.message ||
                  error?.response?.data?.error ||
                  "Failed to delete routine. Please try again."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const addExercise = (exercise: Exercise) => {
    const uniqueId = `${exercise.id}-${Date.now()}`;
    setSelectedExercises([...selectedExercises, { ...exercise, uniqueId }]);
    setSearchQuery("");
  };

  const removeExercise = (uniqueId: string) => {
    setSelectedExercises(
      selectedExercises.filter((ex) => ex.uniqueId !== uniqueId)
    );
    setExerciseMetrics((prev) => {
      const newMetrics = { ...prev };
      delete newMetrics[uniqueId];
      return newMetrics;
    });
  };

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

  return (
    <View style={{ flex: 1 }}>
      {/* Header Bar */}
      <View style={popupModalStyles.headerBar}>
        <FormButton
          title="✕"
          onPress={onClose}
          mode="text"
          fontSize={20}
          color="secondary"
          style={{ width: "auto", marginVertical: 0 }}
        />

        <Text style={popupModalStyles.headerTitle}>Edit Routine</Text>

        <FormButton
          title={isSaving ? "Saving..." : "Save"}
          onPress={handleSave}
          mode="text"
          color="primary"
          fontSize={16}
          style={{ width: "auto", marginVertical: 0 }}
        />
      </View>

      <ScrollView
        style={popupModalStyles.scrollContent}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Routine Name Input */}
        <View style={popupModalStyles.section}>
          <FormTextInput
            label="Routine Name"
            value={routineName}
            placeholder="Enter routine name..."
            onChangeText={setRoutineName}
            labelStyle={typography.h2}
          />
        </View>

        {/* Search Section */}
        <ExerciseSearchList
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredExercises={filteredExercises}
          onAddExercise={addExercise}
        />

        {/* Selected Exercises */}
        <SelectedExercisesList
          selectedExercises={selectedExercises}
          exerciseMetrics={exerciseMetrics}
          onMoveExercise={moveExercise}
          onRemoveExercise={removeExercise}
          onUpdateMetric={updateExerciseMetric}
        />

        {/* Delete Button */}
        <View style={popupModalStyles.section}>
          <FormButton
            title={isDeleting ? "Deleting..." : "Delete Routine"}
            onPress={handleDelete}
            mode="contained"
            color="critical"
            textColor={colorPallet.neutral_lightest}
            style={{ opacity: isDeleting || isSaving ? 0.5 : 1 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EditRoutineModal;
