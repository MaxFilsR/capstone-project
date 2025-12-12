/**
 * Workout Schedule Screen
 *
 * Onboarding step where users select which days of the week they plan to workout.
 */

import { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { BackButton, FormButton } from "@/components";
import { typography, containers } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { useOnboarding } from "@/lib/onboarding-context";

// ============================================================================
// Constants
// ============================================================================

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// ============================================================================
// Component
// ============================================================================

export default function WorkoutScheduleScreen() {
  const { data, updateWorkoutSchedule } = useOnboarding();
  const [schedule, setSchedule] = useState<boolean[]>(data.workoutSchedule);
  const [error, setError] = useState<string | null>(null);

  // Toggle a specific day in the schedule
  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index] = !newSchedule[index];
    setSchedule(newSchedule);
  };

  const handleSubmit = () => {
    setError(null);

    // Save to onboarding context
    updateWorkoutSchedule(schedule);

    // Navigate to username screen
    router.push("/auth/onboarding/username"); // Next step
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={containers.centerContainer}
    >
      {/* Back button */}
      <BackButton />
      <View style={containers.formContainer}>
        {/* Title */}
        <Text
          style={[
            typography.h1,
            { color: colorPallet.neutral_lightest, textAlign: "left" },
          ]}
        >
          What days do you plan on working out?
        </Text>

        {/* Schedule Picker */}
        <View style={styles.scheduleContainer}>
          {DAYS.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                schedule[index] && styles.dayButtonActive,
              ]}
              onPress={() => toggleDay(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  schedule[index] && styles.dayButtonTextActive,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit button */}
        <FormButton mode="contained" title={"Next"} onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}


// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  scheduleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    width: "100%",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
  },
  dayButtonActive: {
    backgroundColor: colorPallet.primary,
    borderColor: colorPallet.primary,
  },
  dayButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: colorPallet.neutral_lightest,
  },
  dayButtonTextActive: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: colorPallet.neutral_darkest,
  },
});
