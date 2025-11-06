import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { colorPallet } from "@/styles/variables";
import { typography, popupModalStyles } from "@/styles";
import { FormButton } from "@/components";
import Alert from "./Alert";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRoutines } from "@/lib/routines-context";
import { useWorkoutLibrary } from "@/lib/workout-library-context";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

type StartRoutineModalProps = {
  onClose: () => void;
  routine?: any | null; // Optional - if provided, start that routine directly
};

const StartRoutineModal: React.FC<StartRoutineModalProps> = ({
  onClose,
  routine: passedRoutine,
}) => {
  const router = useRouter();
  const { routines, loading } = useRoutines();
  const { exercises } = useWorkoutLibrary();
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(
    passedRoutine?.id ?? null
  );
  const [alert, setAlert] = useState<{
    visible: boolean;
    mode: "alert" | "success" | "error" | "confirmAction";
    title: string;
    message: string;
  }>({
    visible: false,
    mode: "alert",
    title: "",
    message: "",
  });

  // If a routine was passed, start it immediately (single routine mode)
  // Otherwise, show selection list (multiple routine mode)
  const isSingleRoutineMode = passedRoutine != null;

  const handleStartRoutine = () => {
    let selectedRoutine;

    if (isSingleRoutineMode) {
      selectedRoutine = passedRoutine;
    } else {
      selectedRoutine = routines.find((r) => r.id === selectedRoutineId);
    }

    if (!selectedRoutine) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Routine Selected",
        message: "Please select a routine to start.",
      });
      return;
    }

    if (!selectedRoutine.exercises || selectedRoutine.exercises.length === 0) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Exercises",
        message:
          "This routine has no exercises. Please add exercises before starting.",
      });
      return;
    }

    try {
      // Prepare exercises data for ActiveRoutineScreen
      const exercisesData = selectedRoutine.exercises.map((ex: any) => {
        const fullExercise = exercises.find((e) => e.id === ex.id);
        return {
          id: ex.id,
          name: fullExercise?.name || ex.name || ex.id,
          images: ex.images || fullExercise?.images || [],
          thumbnailUrl: ex.images?.[0] || fullExercise?.images?.[0],
          gifUrl: (ex.images || fullExercise?.images || []).find((u: string) =>
            u?.toLowerCase().endsWith(".gif")
          ),
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          distance: ex.distance,
        };
      });

      // Navigate to ActiveRoutineScreen
      router.push({
        pathname: "/screens/FitnessTabs/routineScreens/activeRoutine",
        params: {
          id: selectedRoutine.id?.toString() || "0",
          name: selectedRoutine.name,
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

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false });
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false });
  };

  const getRoutineThumbnail = (routine: any) => {
    if (!routine.exercises || routine.exercises.length === 0) {
      return null;
    }

    const firstExerciseWithImages = routine.exercises.find((ex: any) => {
      // Check if exercise already has images (from passedRoutine)
      if (ex.images && ex.images.length > 0) {
        return true;
      }
      // Otherwise look up in exercises library
      const fullExercise = exercises.find((e) => e.id === ex.id);
      return fullExercise?.images && fullExercise.images.length > 0;
    });

    if (firstExerciseWithImages) {
      // If exercise has images directly
      if (
        firstExerciseWithImages.images &&
        firstExerciseWithImages.images.length > 0
      ) {
        return `${IMAGE_BASE_URL}${firstExerciseWithImages.images[0]}`;
      }
      // Otherwise look up in library
      const fullExercise = exercises.find(
        (e) => e.id === firstExerciseWithImages.id
      );
      return fullExercise?.images?.[0]
        ? `${IMAGE_BASE_URL}${fullExercise.images[0]}`
        : null;
    }
    return null;
  };

  // Single routine mode - show summary card
  if (isSingleRoutineMode) {
    const thumbnailUrl = getRoutineThumbnail(passedRoutine);

    return (
      <View style={styles.modalSize}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[typography.h2, styles.headerTitle]}>
            {passedRoutine.name}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[popupModalStyles.closeText, styles.closeText]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.thumbWrap}>
            {thumbnailUrl ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
                defaultSource={require("@/assets/images/icon.png")}
              />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Ionicons
                  name="barbell"
                  size={32}
                  color={colorPallet.neutral_3}
                />
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.exerciseTitle}>Exercises</Text>
            <Text style={styles.subText}>
              {passedRoutine.exercises.length} Exercise
              {passedRoutine.exercises.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <FormButton title="Start Workout" onPress={handleStartRoutine} />
        </View>

        <Alert
          visible={alert.visible}
          mode={alert.mode}
          title={alert.title}
          message={alert.message}
          onConfirm={handleAlertConfirm}
          onCancel={handleAlertCancel}
        />
      </View>
    );
  }

  // Multiple routine mode - show selection list
  return (
    <View style={styles.modalSize}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h2, styles.headerTitle]}>Start Workout</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[popupModalStyles.closeText, styles.closeText]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Select a routine to begin</Text>

      {/* Routines List */}
      <ScrollView style={styles.routinesList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorPallet.primary} />
            <Text style={styles.loadingText}>Loading routines...</Text>
          </View>
        ) : !routines || routines.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="barbell-outline"
              size={48}
              color={colorPallet.neutral_4}
            />
            <Text style={styles.emptyText}>No routines available</Text>
            <Text style={styles.emptySubtext}>
              Create a routine first to start a workout
            </Text>
          </View>
        ) : (
          routines.map((routine, index) => {
            const thumbnailUrl = getRoutineThumbnail(routine);
            const isSelected = selectedRoutineId === routine.id;
            const exerciseCount = routine.exercises?.length || 0;

            return (
              <TouchableOpacity
                key={routine.id ?? index}
                style={[
                  styles.routineCard,
                  isSelected && styles.routineCardSelected,
                ]}
                onPress={() => setSelectedRoutineId(routine.id ?? null)}
                activeOpacity={0.7}
              >
                <View style={styles.thumbWrap}>
                  {thumbnailUrl ? (
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                      defaultSource={require("@/assets/images/icon.png")}
                    />
                  ) : (
                    <View
                      style={[styles.thumbnail, styles.thumbnailPlaceholder]}
                    >
                      <Ionicons
                        name="barbell"
                        size={24}
                        color={colorPallet.neutral_3}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <Text style={styles.routineExerciseCount}>
                    {exerciseCount} Exercise
                    {exerciseCount !== 1 ? "s" : ""}
                  </Text>
                </View>

                {isSelected && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colorPallet.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Start Button */}
      <View style={styles.buttonContainer}>
        <FormButton
          title="Start Workout"
          onPress={handleStartRoutine}
          disabled={selectedRoutineId === null || loading}
        />
      </View>

      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalSize: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    flexGrow: 0,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
    maxHeight: "80%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    color: colorPallet.neutral_lightest,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  closeText: {
    color: colorPallet.secondary,
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    marginTop: -2,
  },
  summaryCard: {
    marginHorizontal: 14,
    marginTop: 2,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    backgroundColor: colorPallet.neutral_6,
    padding: 8,
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colorPallet.neutral_3,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  routinesList: {
    maxHeight: 400,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: colorPallet.neutral_3,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: colorPallet.neutral_3,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtext: {
    color: colorPallet.neutral_4,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  routineCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorPallet.neutral_6,
    backgroundColor: colorPallet.neutral_6,
    padding: 10,
    marginBottom: 10,
    gap: 12,
  },
  routineCardSelected: {
    borderColor: colorPallet.primary,
    backgroundColor: colorPallet.neutral_darkest,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  routineExerciseCount: {
    color: colorPallet.neutral_3,
    fontSize: 12,
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  exerciseTitle: {
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  subText: {
    color: colorPallet.neutral_3,
    fontSize: 12,
  },
  buttonContainer: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colorPallet.neutral_6,
  },
});

export default StartRoutineModal;
