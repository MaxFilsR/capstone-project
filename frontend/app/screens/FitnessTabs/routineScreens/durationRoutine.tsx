import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { typography } from "@/styles";
import { BackButton, FormButton } from "@/components";
import Alert from "@/components/popupModals/Alert";
import { colorPallet } from "@/styles/variables";
import {
  recordWorkout,
  WorkoutExercise,
  Exercise,
  getCharacter, // Changed from getMe to getCharacter
  getWorkoutLibrary,
} from "@/api/endpoints";

type Params = {
  routineName?: string;
  exercises?: string; // JSON stringified array of CompletedExerciseData
};

const ITEM_HEIGHT = 50;

export default function DurationRoutineScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStats, setUserStats] = useState({
    strength: 0,
    endurance: 0,
    flexibility: 0,
  });
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
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

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "slide_from_right",
      headerShown: false,
      contentstyle: { backgroundColor: "#0B0B0B" },
    });

    // Load user stats and exercise library
    async function loadData() {
      try {
        const [profile, library] = await Promise.all([
          getCharacter(), // Changed from getMe() to getCharacter()
          getWorkoutLibrary(),
        ]);
        setUserStats(profile.class.stats); // Access stats from profile.class.stats
        setExerciseLibrary(library);
      } catch (error) {
        console.error("Failed to load data:", error);
        setAlert({
          visible: true,
          mode: "error",
          title: "Error",
          message: "Failed to load workout data. Please try again.",
        });
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();

    // Scroll to initial position
    setTimeout(() => {
      hoursScrollRef.current?.scrollTo({
        y: hours * ITEM_HEIGHT,
        animated: false,
      });
      minutesScrollRef.current?.scrollTo({
        y: minutes * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, [navigation]);

  function onBack() {
    router.back();
  }

  // Handle scroll events
  const handleHoursScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setHours(Math.max(0, Math.min(23, index)));
  };

  const handleMinutesScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setMinutes(Math.max(0, Math.min(59, index)));
  };

  // Snap to position when scroll ends
  const handleHoursScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(23, index));
    hoursScrollRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
    setHours(clampedIndex);
  };

  const handleMinutesScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(59, index));
    minutesScrollRef.current?.scrollTo({
      y: clampedIndex * ITEM_HEIGHT,
      animated: true,
    });
    setMinutes(clampedIndex);
  };

  // Parse duration to minutes
  function parseDurationToMinutes(hours: number, minutes: number): number {
    return hours * 60 + minutes;
  }

  // Helper function to determine which stat to use based on exercise categories
  function determineWorkoutStat(
    exercises: WorkoutExercise[],
    exerciseLibrary: Exercise[]
  ): "strength" | "endurance" | "flexibility" {
    // Create a map of exercise IDs to their details for quick lookup
    const exerciseMap = new Map(exerciseLibrary.map((ex) => [ex.id, ex]));

    // Count categories
    const categoryCounts = {
      strength: 0,
      cardio: 0,
      other: 0,
    };

    exercises.forEach((workoutEx) => {
      const exerciseDetails = exerciseMap.get(String(workoutEx.id));
      if (!exerciseDetails) return;

      const category = exerciseDetails.category.toLowerCase();

      // Categorize based on exercise category
      if (
        category.includes("strength") ||
        category.includes("powerlifting") ||
        category.includes("olympic") ||
        exerciseDetails.equipment === "barbell" ||
        exerciseDetails.equipment === "dumbbell"
      ) {
        categoryCounts.strength++;
      } else if (
        category.includes("cardio") ||
        category.includes("plyometrics") ||
        exerciseDetails.equipment === "body only"
      ) {
        categoryCounts.cardio++;
      } else {
        categoryCounts.other++;
      }
    });

    // Determine which stat to use based on highest count
    if (
      categoryCounts.strength >= categoryCounts.cardio &&
      categoryCounts.strength >= categoryCounts.other
    ) {
      return "strength";
    } else if (categoryCounts.cardio >= categoryCounts.other) {
      return "endurance";
    } else {
      return "flexibility";
    }
  }

  // Calculate points based on workout data
  function calculatePoints(
    exercises: WorkoutExercise[],
    durationMinutes: number
  ): number {
    const streak = 10;

    // Determine which stat to use based on workout composition
    const statType = determineWorkoutStat(exercises, exerciseLibrary);
    const stat = userStats[statType];

    // New formula: (50 + duration) * (1 + (stat/50 + streak/50))
    const points = Math.round(
      (50 + durationMinutes) * (1 + (stat / 50 + streak / 50))
    );

    console.log(`Using ${statType} stat (${stat}) for point calculation`);
    console.log(
      `Points calculated: ${points} for ${durationMinutes} minute workout`
    );

    return points;
  }

  async function onEndWorkout() {
    if (isLoadingData) {
      setAlert({
        visible: true,
        mode: "error",
        title: "Loading",
        message: "Please wait while data is loading",
      });
      return;
    }

    const durationMinutes = parseDurationToMinutes(hours, minutes);

    if (durationMinutes <= 0) {
      setAlert({
        visible: true,
        mode: "error",
        title: "Invalid Duration",
        message: "Please select a workout duration",
      });
      return;
    }

    // Parse exercises from params
    let exercises: WorkoutExercise[] = [];
    try {
      if (params.exercises) {
        exercises = JSON.parse(params.exercises);
      }
    } catch (error) {
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message: "Failed to load workout data",
      });
      return;
    }

    if (exercises.length === 0) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Exercises",
        message: "No exercise data to record",
      });
      return;
    }

    const points = calculatePoints(exercises, durationMinutes);

    // Prepare workout data for API
    const workoutData = {
      name: params.routineName || "Workout Session",
      exercises: exercises.map((ex) => ({
        id: ex.id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        distance: ex.distance,
      })),
      date: new Date().toISOString().split("T")[0], // Send only date: "YYYY-MM-DD"
      duration: durationMinutes,
      points: points,
    };

    setIsSubmitting(true);

    try {
      await recordWorkout(workoutData);

      // Show success message
      setAlert({
        visible: true,
        mode: "success",
        title: "Workout Recorded!",
        message: `Great job! You earned ${points} points for this ${durationMinutes} minute workout.`,
        onConfirmAction: () => {
          // Navigate to workout complete screen with all data
          router.replace({
            pathname: "/screens/FitnessTabs/workoutComplete",
            params: {
              name: workoutData.name,
              workoutTime: String(durationMinutes),
              points: String(points),
              exercises: JSON.stringify(exercises),
            },
          });
        },
      });
    } catch (error) {
      console.error("❌ Failed to record workout:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setAlert({
        visible: true,
        mode: "confirmAction",
        title: "Error",
        message: "Failed to record workout. Please try again.",
        onConfirmAction: onEndWorkout,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });

    if (alert.onConfirmAction) {
      alert.onConfirmAction();
    }
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });
  };

  // Generate number arrays
  const hoursArray = Array.from({ length: 24 }, (_, i) => i); // 0-23
  const minutesArray = Array.from({ length: 60 }, (_, i) => i); // 0-59

  return (
    <View style={styles.screen}>
      {/* back button */}
      <View style={styles.backContainer}>
        <BackButton onPress={onBack} />
      </View>

      {/* main content */}
      <View style={styles.contentWrap}>
        <Text style={styles.title}>Workout Duration</Text>

        {params.routineName && (
          <Text style={styles.routineName}>{params.routineName}</Text>
        )}

        {/* Timer Picker */}
        <View style={styles.timerContainer}>
          {/* Hours Picker */}
          <View style={styles.pickerColumn}>
            <ScrollView
              ref={hoursScrollRef}
              style={styles.scrollPicker}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={handleHoursScroll}
              onMomentumScrollEnd={handleHoursScrollEnd}
              scrollEventThrottle={16}
            >
              {/* Top padding */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />

              {hoursArray.map((hour) => (
                <View key={hour} style={styles.pickerItem}>
                  <Text
                    style={[
                      styles.pickerText,
                      hour === hours && styles.pickerTextActive,
                    ]}
                  >
                    {String(hour).padStart(2, "0")}
                  </Text>
                </View>
              ))}

              {/* Bottom padding */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
            </ScrollView>
            <Text style={styles.pickerLabel}>hours</Text>
          </View>

          {/* Separator */}
          <Text style={styles.separator}>:</Text>

          {/* Minutes Picker */}
          <View style={styles.pickerColumn}>
            <ScrollView
              ref={minutesScrollRef}
              style={styles.scrollPicker}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onScroll={handleMinutesScroll}
              onMomentumScrollEnd={handleMinutesScrollEnd}
              scrollEventThrottle={16}
            >
              {/* Top padding */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />

              {minutesArray.map((minute) => (
                <View key={minute} style={styles.pickerItem}>
                  <Text
                    style={[
                      styles.pickerText,
                      minute === minutes && styles.pickerTextActive,
                    ]}
                  >
                    {String(minute).padStart(2, "0")}
                  </Text>
                </View>
              ))}

              {/* Bottom padding */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
            </ScrollView>
            <Text style={styles.pickerLabel}>minutes</Text>
          </View>
        </View>

        {/* Selection Highlight */}
        <View style={styles.selectionHighlight} pointerEvents="none" />

        <FormButton
          title={isSubmitting ? "Recording..." : "End Workout"}
          onPress={onEndWorkout}
          style={styles.endButton}
          disabled={isSubmitting || isLoadingData}
        />

        {(isSubmitting || isLoadingData) && (
          <ActivityIndicator
            size="large"
            color={colorPallet.primary}
            style={{ marginTop: 20 }}
          />
        )}
      </View>

      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
        confirmText={alert.mode === "confirmAction" ? "Retry" : "OK"}
        cancelText="Cancel"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    zIndex: 10,
  },
  contentWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
  },
  title: {
    ...typography.h1,
    color: colorPallet.neutral_lightest,
    textAlign: "center",
    marginBottom: 8,
  },
  routineName: {
    ...typography.body,
    color: colorPallet.primary,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: ITEM_HEIGHT * 5,
    width: "100%",
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: "center",
  },
  scrollPicker: {
    height: ITEM_HEIGHT * 5,
    width: 80,
  },
  scrollContent: {
    alignItems: "center",
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 32,
    color: colorPallet.neutral_5,
    fontWeight: "300",
  },
  pickerTextActive: {
    color: colorPallet.secondary,
    fontWeight: "700",
    fontSize: 40,
  },
  pickerLabel: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  separator: {
    fontSize: 40,
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  selectionHighlight: {
    position: "absolute",
    top: "50%",
    left: 20,
    right: 20,
    height: ITEM_HEIGHT + 10,
    marginTop: ITEM_HEIGHT * -0.5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorPallet.primary,
    opacity: 0.3,
  },
  endButton: {
    alignSelf: "center",
    width: 180,
    marginTop: 8,
  },
});
