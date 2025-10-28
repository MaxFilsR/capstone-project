import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Exercise, createRoutine, RoutineExercise } from "@/api/endpoints";
import { typography } from "@/styles";
import { popupModalStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { FormTextInput } from "../FormTextInput";
import { FormButton } from "../FormButton";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import ExerciseSearchList from "../ExerciseSearchList";
import SelectedExercisesList from "../SelectedExercisesList";
import { AlertBox, AlertMode } from "./AlertBox";

type CreateRoutineModalProps = {
  onClose: () => void;
};

const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({ onClose }) => {
  const { exercises } = useWorkoutLibrary();
  const [isSaving, setIsSaving] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    Array<Exercise & { uniqueId: string }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseMetrics, setExerciseMetrics] = useState<Record<string, any>>(
    {}
  );

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | string[]>("");
  const [alertMode, setAlertMode] = useState<AlertMode>("alert");

  const showAlert = (msg: string | string[], mode: AlertMode = "alert") => {
    setAlertMessage(msg);
    setAlertMode(mode);
    setAlertVisible(true);
  };

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
      showAlert("Please enter a routine name.", "error");
      return;
    }
    if (selectedExercises.length === 0) {
      showAlert("Please add at least one exercise.", "error");
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

      await createRoutine(payload);

      showAlert("Routine created successfully!", "success");
      onClose();
    } catch (error: any) {
      showAlert("Failed to create routine. Please try again.", "action"); // uses action mode
    } finally {
      setIsSaving(false);
    }
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
      <AlertBox
        visible={alertVisible}
        message={alertMessage}
        mode={alertMode}
        onClose={() => setAlertVisible(false)}
      />

      {/* Header Bar */}
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
    </View>
  );
};

export default CreateRoutineModal;
