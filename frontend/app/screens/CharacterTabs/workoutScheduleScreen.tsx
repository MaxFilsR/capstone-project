/**
 * Workout Schedule Screen
 *
 * Settings screen for configuring weekly workout schedule.
 * Users can toggle days of the week they plan to workout on.
 */

import { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { colorPallet } from "@/styles/variables";
import { typography, containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { BackButton, FormButton } from "@/components";
import { getCharacter, updateWorkoutSchedule } from "@/api/endpoints";
import axios from "axios";

// ============================================================================
// Constants
// ============================================================================

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// ============================================================================
// Component
// ============================================================================

export default function WorkoutScheduleScreen() {
  const [schedule, setSchedule] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  // Load current workout schedule from profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setSchedule([false, true, false, true, false, true, false]);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load current schedule");
      } finally {
        setFetchingProfile(false);
      }
    }

    loadProfile();
  }, []);

  // Toggle workout day on/off
  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index] = !newSchedule[index];
    setSchedule(newSchedule);
  };

  // Submit workout schedule update
  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Update workout schedule
      await updateWorkoutSchedule({ workout_schedule: schedule });

      router.back();
    } catch (err: unknown) {
      console.error("Schedule update error:", err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const serverMessage =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
          setError(`${serverMessage}`);
        } else if (err.request) {
          setError("No response from server. Please try again.");
        } else {
          setError(`Request setup error: ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <View style={[containers.centerContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text
          style={[
            typography.body,
            { color: colorPallet.neutral_lightest, marginTop: 16 },
          ]}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[containers.centerContainer, styles.container]}
    >
      <BackButton />

      {/* title with Icon */}
      <View style={styles.titleContainer}>
        <Ionicons
          name="calendar-outline"
          size={28}
          color={colorPallet.primary}
          style={styles.titleIcon}
        />
        <Text style={[typography.h1, styles.title]}>Workout Schedule</Text>
      </View>

      <View style={containers.formContainer}>
        <Text style={styles.instructionText}>
          Select the days you plan to workout:
        </Text>

        {/* schedule Picker */}
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

        {error && <Text style={typography.errorText}>{error}</Text>}

        <FormButton
          mode="contained"
          title={loading ? "Saving..." : "Save Changes"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    color: colorPallet.neutral_lightest,
  },
  instructionText: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    textAlign: "left",
    marginBottom: 16,
  },
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

