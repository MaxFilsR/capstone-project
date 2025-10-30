import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { Routine } from "./Popup";
import { colorPallet } from "@/styles/variables";
import { typography, popupModalStyles } from "@/styles";
import { FormButton } from "@/components";
import Alert from "./Alert";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

type StartRoutineModalProps = {
  onClose: () => void;
  routine: Routine;
};

const StartRoutineModal: React.FC<StartRoutineModalProps> = ({
  onClose,
  routine,
}) => {
  const router = useRouter();
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

  const handleStartRoutine = () => {
    if (!routine.exercises || routine.exercises.length === 0) {
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
      const exercisesData = routine.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        images: ex.images,
        thumbnailUrl: ex.images?.[0],
        gifUrl: ex.images?.find((u) => u?.toLowerCase().endsWith(".gif")),
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        distance: ex.distance,
      }));

      // Navigate to ActiveRoutineScreen
      router.push({
        pathname: "/screens/FitnessTabs/routineScreens/activeRoutine",
        params: {
          id: routine.id?.toString() || "0",
          name: routine.name,
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

  // Get thumbnail from first exercise with images - same pattern as LibraryScreen
  const firstExerciseWithImages = routine.exercises.find(
    (ex) => ex.images && ex.images.length > 0
  );
  const thumbnailUrl = firstExerciseWithImages?.images?.[0]
    ? `${IMAGE_BASE_URL}${firstExerciseWithImages.images[0]}`
    : null;

  return (
    <View style={styles.modalSize}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h2, styles.headerTitle]}>{routine.name}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[popupModalStyles.closeText, styles.closeText]}>✕</Text>
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
            {routine.exercises.length} Exercise
            {routine.exercises.length !== 1 ? "s" : ""}
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
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
    borderWidth: 1,
    borderColor: colorPallet.neutral_darkest,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
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
  exerciseListContainer: {
    paddingHorizontal: 14,
    marginBottom: 10,
    maxHeight: 300,
  },
  exerciseItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_6,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 12,
    color: colorPallet.neutral_3,
    width: 20,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
    color: colorPallet.neutral_lightest,
  },
  exerciseInfo: {
    fontSize: 13,
    color: colorPallet.neutral_3,
  },
  buttonContainer: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
});

export default StartRoutineModal;
