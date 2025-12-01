import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Exercise, RoutineExercise } from "@/api/endpoints";
import { typography } from "@/styles";
import { popupModalStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { FormTextInput } from "../FormTextInput";
import { FormButton } from "../FormButton";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import { useRoutines } from "@/lib/routines-context";
import { useRouter } from "expo-router";
import ExerciseSearchList from "../ExerciseSearchList";
import SelectedExercisesList from "../SelectedExercisesList";
import Alert from "./Alert";

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
  const { updateRoutine, removeRoutine } = useRoutines();
  const router = useRouter();
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

  const handleStartRoutine = () => {
    if (selectedExercises.length === 0) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Exercises",
        message:
          "Please add at least one exercise before starting the workout.",
      });
      return;
    }

    try {
      // Prepare exercises data for ActiveRoutineScreen
      const exercisesData = selectedExercises.map((ex) => {
        const metrics = exerciseMetrics[ex.uniqueId] || {};
        return {
          id: ex.id,
          name: ex.name,
          images: ex.images,
          thumbnailUrl: ex.images?.[0],
          gifUrl: ex.images?.find((u) => u?.toLowerCase().endsWith(".gif")),
          sets: parseInt(metrics.sets) || 0,
          reps: parseInt(metrics.reps) || 0,
          weight: parseFloat(metrics.weight) || 0,
          distance: parseFloat(metrics.distance) || 0,
        };
      });

      // Navigate to ActiveRoutineScreen
      router.push({
        pathname: "/screens/FitnessTabs/routineScreens/activeRoutine",
        params: {
          id: routine.id?.toString() || "0",
          name: routineName,
          exercises: JSON.stringify(exercisesData),
          index: "0",
        },
      });

      onClose();
    } catch (error) {
      console.error("Error starting routine:", error);
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message: "Failed to start routine. Please try again.",
      });
    }
  };

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
        id: routine.id,
        name: routineName.trim(),
        exercises: formattedExercises,
      };

      await updateRoutine(routine.id, payload);

      setAlert({
        visible: true,
        mode: "success",
        title: "Success",
        message: "Routine updated successfully!",
      });
    } catch (error: any) {
      console.error("Error updating routine:", error);
      console.error("Error response:", error?.response?.data);
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update routine. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setAlert({
      visible: true,
      mode: "confirmAction",
      title: "Delete Routine",
      message: `Are you sure you want to delete "${routine.name}"? This action cannot be undone.`,
      onConfirmAction: async () => {
        setIsDeleting(true);
        try {
          await removeRoutine(routine.id);
          setAlert({
            visible: true,
            mode: "success",
            title: "Success",
            message: "Routine deleted successfully!",
          });
        } catch (error: any) {
          console.error("Error deleting routine:", error);
          setAlert({
            visible: true,
            mode: "error",
            title: "Error",
            message:
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              "Failed to delete routine. Please try again.",
          });
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const addExercise = (exercise: Exercise) => {
    const uniqueId = `${exercise.id}-${Date.now()}`;
    setSelectedExercises([...selectedExercises, { ...exercise, uniqueId }]);
    setSearchQuery("");
  };

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

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });

    if (alert.mode === "success") {
      setTimeout(() => onClose(), 100);
    } else if (alert.mode === "confirmAction" && alert.onConfirmAction) {
      alert.onConfirmAction();
    }
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });
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

        {/* Start Routine Button */}
        <View style={popupModalStyles.section}>
          <FormButton
            title="Start Workout"
            onPress={handleStartRoutine}
            mode="contained"
            color="primary"
            style={{ marginBottom: 0 }}
          />
        </View>

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

      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
        confirmText={
          alert.mode === "confirmAction"
            ? alert.title === "Delete Routine"
              ? "Delete"
              : "Remove"
            : "OK"
        }
      />
    </View>
  );
};

export default EditRoutineModal;
