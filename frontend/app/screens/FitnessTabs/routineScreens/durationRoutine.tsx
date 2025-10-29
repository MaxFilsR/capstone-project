///screens/FitnessTabs/routineScreens/durationRoutine

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput as RNTextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { typography } from "@/styles";
import { BackButton, FormButton } from "@/components";
import { colorPallet } from "@/styles/variables";
import { recordWorkout, WorkoutExercise } from "@/api/endpoints";

type Params = {
  routineName?: string;
  exercises?: string; // JSON stringified array of CompletedExerciseData
};

export default function DurationRoutineScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const [duration, setDuration] = useState(""); // hh:mm
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "slide_from_right",
      headerShown: false,
      contentstyle: { backgroundColor: "#0B0B0B" },
    });
  }, [navigation]);

  function onBack() {
    router.back();
  }

  // Parse duration string (hh:mm) to minutes
  function parseDurationToMinutes(durationStr: string): number {
    const parts = durationStr.split(":");
    if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return hours * 60 + minutes;
    }
    // If format is just minutes
    return parseInt(durationStr) || 0;
  }

  // Calculate points based on workout data
  function calculatePoints(
    exercises: WorkoutExercise[],
    durationMinutes: number
  ): number {
    // 50 XP base + time in minutes
    return 50 + durationMinutes;
  }

  async function onEndWorkout() {
    // Validate duration input
    if (!duration || !duration.includes(":")) {
      Alert.alert("Invalid Duration", "Please enter duration in format hh:mm");
      return;
    }

    // Parse exercises from params
    let exercises: WorkoutExercise[] = [];
    try {
      if (params.exercises) {
        exercises = JSON.parse(params.exercises);
      }
    } catch (error) {
      console.error("Failed to parse exercises:", error);
      Alert.alert("Error", "Failed to load workout data");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("No Exercises", "No exercise data to record");
      return;
    }

    const durationMinutes = parseDurationToMinutes(duration);
    if (durationMinutes <= 0) {
      Alert.alert("Invalid Duration", "Please enter a valid workout duration");
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
      date: new Date().toISOString().split("T")[0],
      duration: durationMinutes,
      points: points,
    };
    console.log(workoutData);

    setIsSubmitting(true);

    try {
      await recordWorkout(workoutData);

      // Show success message
      Alert.alert(
        "Workout Recorded!",
        `Great job! You earned ${points} points for this ${durationMinutes} minute workout.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to Fitness tab and show Routines segment
              router.replace({
                pathname: "/(tabs)/fitness",
                params: { tab: "routines" },
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Failed to record workout:", error);
      Alert.alert("Error", "Failed to record workout. Please try again.", [
        {
          text: "Retry",
          onPress: onEndWorkout,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  function onChangeDur(t: string) {
    // Allow only digits and colon
    let cleaned = t.replace(/[^\d:]/g, "");

    // Auto-format as user types
    if (cleaned.length === 2 && !cleaned.includes(":")) {
      cleaned = cleaned + ":";
    }

    // Limit to hh:mm format (5 chars max)
    cleaned = cleaned.slice(0, 5);

    setDuration(cleaned);
  }

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

        <View style={styles.inputWrap}>
          <RNTextInput
            value={duration}
            onChangeText={onChangeDur}
            placeholder="hh:mm"
            placeholderTextColor={colorPallet.neutral_4}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            style={styles.input}
            editable={!isSubmitting}
          />
        </View>

        <FormButton
          title={isSubmitting ? "Recording..." : "End Workout"}
          onPress={onEndWorkout}
          style={styles.endButton}
          disabled={isSubmitting}
        />

        {isSubmitting && (
          <ActivityIndicator
            size="large"
            color={colorPallet.primary}
            style={{ marginTop: 20 }}
          />
        )}
      </View>
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
    marginTop: -40, // fine-tunes upward offset
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
  inputWrap: {
    borderWidth: 1,
    borderColor: colorPallet.neutral_4,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    width: "85%",
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: "transparent",
    color: colorPallet.neutral_lightest,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 1,
  },
  endButton: {
    alignSelf: "center",
    width: 180,
    marginTop: 8,
  },
});
