/**
 * Duration Routine Screen
 *
 * Allows users to set the duration of their completed workout using scrollable
 * time pickers. Calculates points and coins based on workout duration and exercises,
 * records the workout to the backend, and navigates to appropriate completion screens
 * (level up, quest completion, or standard workout complete).
 */

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
  getWorkoutLibrary,
} from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";
import { useQuests } from "@/lib/quest-context";

// ============================================================================
// Types
// ============================================================================

type Params = {
  /** Name of the workout routine */
  routineName?: string;
  /** Serialized JSON array of completed exercises */
  exercises?: string;
};

// ============================================================================
// Constants
// ============================================================================

/** Height of each item in the time picker scroll view */
const ITEM_HEIGHT = 50;

// ============================================================================
// Component
// ============================================================================

export default function DurationRoutineScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const { user, fetchUserProfile } = useAuth();
  const { quests, refreshQuests } = useQuests();

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** Selected hours (0-23) */
  const [hours, setHours] = useState(0);

  /** Selected minutes (0-59) */
  const [minutes, setMinutes] = useState(30);

  /** Whether workout is being submitted to backend */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Full exercise library for workout stat determination */
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);

  /** Whether initial data is still loading */
  const [isLoadingData, setIsLoadingData] = useState(true);

  /** Alert modal configuration */
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

  /** Ref for hours scroll view (for programmatic scrolling) */
  const hoursScrollRef = useRef<ScrollView>(null);

  /** Ref for minutes scroll view (for programmatic scrolling) */
  const minutesScrollRef = useRef<ScrollView>(null);

  // Get current user stats and level from auth context
  const userStats = user?.profile?.class?.stats || {
    strength: 0,
    endurance: 0,
    flexibility: 0,
  };
  const currentLevel = user?.profile?.level || 1;

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  /**
   * Initialize screen and load exercise library
   * Configures navigation options and scrolls pickers to initial positions
   */
  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "slide_from_right",
      headerShown: false,
      contentstyle: { backgroundColor: "#0B0B0B" },
    });

    async function loadData() {
      try {
        // Only need to load exercise library, user profile comes from context
        const library = await getWorkoutLibrary();
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

    // Scroll to initial time values after layout
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

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  /**
   * Navigate back to previous screen
   */
  function onBack() {
    router.back();
  }

  /**
   * Handle hours scroll event
   * Updates hours state based on scroll position
   */
  const handleHoursScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setHours(Math.max(0, Math.min(23, index)));
  };

  /**
   * Handle minutes scroll event
   * Updates minutes state based on scroll position
   */
  const handleMinutesScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setMinutes(Math.max(0, Math.min(59, index)));
  };

  /**
   * Snap hours scroll to nearest value when scrolling ends
   * Ensures picker always shows a valid hour value
   */
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

  /**
   * Snap minutes scroll to nearest value when scrolling ends
   * Ensures picker always shows a valid minute value
   */
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

  /**
   * Convert hours and minutes to total minutes
   * @param hours - Number of hours
   * @param minutes - Number of minutes
   * @returns Total duration in minutes
   */
  function parseDurationToMinutes(hours: number, minutes: number): number {
    return hours * 60 + minutes;
  }

  /**
   * Determine which stat (strength/endurance/flexibility) this workout trains
   * Analyzes exercise categories and equipment to determine workout focus
   * 
   * @param exercises - Array of workout exercises
   * @param exerciseLibrary - Full exercise library for details lookup
   * @returns Primary stat trained by this workout
   */
  function determineWorkoutStat(
    exercises: WorkoutExercise[],
    exerciseLibrary: Exercise[]
  ): "strength" | "endurance" | "flexibility" {
    const exerciseMap = new Map(exerciseLibrary.map((ex) => [ex.id, ex]));

    const categoryCounts = {
      strength: 0,
      cardio: 0,
      other: 0,
    };

    // Count exercises by category
    exercises.forEach((workoutEx) => {
      const exerciseDetails = exerciseMap.get(String(workoutEx.id));
      if (!exerciseDetails) return;

      const category = exerciseDetails.category.toLowerCase();

      // Strength exercises: weights, powerlifting, olympic lifts
      if (
        category.includes("strength") ||
        category.includes("powerlifting") ||
        category.includes("olympic") ||
        exerciseDetails.equipment === "barbell" ||
        exerciseDetails.equipment === "dumbbell"
      ) {
        categoryCounts.strength++;
      }
      // Cardio exercises: bodyweight, plyometrics
      else if (
        category.includes("cardio") ||
        category.includes("plyometrics") ||
        exerciseDetails.equipment === "body only"
      ) {
        categoryCounts.cardio++;
      }
      // Other exercises: stretching, mobility
      else {
        categoryCounts.other++;
      }
    });

    // Return dominant stat
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

  /**
   * Calculate experience points earned from workout
   * Formula: (50 + duration) * (1 + (stat/50 + streak/50))
   * Points scale with workout duration, relevant stat, and streak
   * 
   * @param exercises - Completed exercises
   * @param durationMinutes - Workout duration in minutes
   * @returns Calculated experience points
   */
  function calculatePoints(
    exercises: WorkoutExercise[],
    durationMinutes: number
  ): number {
    const streak = 10; // TODO: Get actual streak from user data
    const statType = determineWorkoutStat(exercises, exerciseLibrary);
    const stat = userStats[statType];

    const points = Math.round(
      (50 + durationMinutes) * (1 + (stat / 50 + streak / 50))
    );

    console.log(`Using ${statType} stat (${stat}) for point calculation`);
    console.log(
      `Points calculated: ${points} for ${durationMinutes} minute workout`
    );

    return points;
  }

  /**
   * Calculate coins earned from workout
   * Formula: 25 + (duration / 2)
   * 
   * @param durationMinutes - Workout duration in minutes
   * @returns Calculated coins
   */
  function calculateCoins(durationMinutes: number): number {
    const coins = Math.round(25 + durationMinutes / 2);
    return coins;
  }

  /**
   * Submit workout to backend and handle completion flow
   * 
   * Records workout, calculates rewards, checks for level ups and quest
   * completions, then navigates to appropriate completion screen.
   * 
   * Flow priority:
   * 1. Level up screen (if leveled up)
   * 2. Quest completion screen (if quests completed)
   * 3. Standard workout complete screen
   */
  async function onEndWorkout() {
    // Wait for initial data load
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

    // Validate duration
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

    // Validate exercises
    if (exercises.length === 0) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Exercises",
        message: "No exercise data to record",
      });
      return;
    }

    // Calculate rewards
    const points = calculatePoints(exercises, durationMinutes);
    const coins = calculateCoins(durationMinutes);

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
      coins: coins,
    };

    setIsSubmitting(true);

    try {
      // Capture state BEFORE workout recording for comparison
      const oldLevel = currentLevel;
      const oldQuests = [...quests];
      
      console.log("Before workout - Level:", oldLevel, "Quests:", oldQuests.length);
      console.log("Old quests statuses:", oldQuests.map(q => ({ id: q.id, name: q.name, status: q.status })));
      
      // Record the workout to backend
      await recordWorkout(workoutData);
      
      // Fetch updated data and use RETURNED values (not context)
      const [updatedProfile, updatedQuests] = await Promise.all([
        fetchUserProfile(),
        refreshQuests()
      ]);
      
      const newLevel = updatedProfile.level;
      
      console.log("After workout - Level:", newLevel, "Quests:", updatedQuests.length);
      console.log("New quests statuses:", updatedQuests.map(q => ({ id: q.id, name: q.name, status: q.status })));

      // ------------------------------------------------------------------------
      // Priority 1: Check for Level Up
      // ------------------------------------------------------------------------
      if (newLevel > oldLevel) {
        const levelsGained = newLevel - oldLevel;
        console.log(
          `LEVEL UP! ${oldLevel} -> ${newLevel} (+${levelsGained} levels)`
        );

        router.replace({
          pathname: "/screens/LevelUpScreen",
          params: {
            oldLevel: String(oldLevel),
            newLevel: String(newLevel),
            levelsGained: String(levelsGained),
            workoutName: workoutData.name,
            workoutTime: String(durationMinutes),
            points: String(points),
            exercises: JSON.stringify(exercises),
            oldQuests: JSON.stringify(oldQuests),
          },
        });
        return;
      }

      // ------------------------------------------------------------------------
      // Priority 2: Check for Quest Completion
      // ------------------------------------------------------------------------
      // Compare old and new quest states using RETURNED fresh data
      const completedQuests = oldQuests.filter((oldQuest) => {
        const newQuest = updatedQuests.find((q) => q.id === oldQuest.id);
        const wasIncomplete = oldQuest.status !== "Complete";
        const isNowComplete = newQuest?.status === "Complete";
        
        if (wasIncomplete && isNowComplete) {
          console.log(`Quest completed: ${oldQuest.name} (ID: ${oldQuest.id})`);
        }
        
        return wasIncomplete && isNowComplete;
      });

      console.log(`Total completed quests detected: ${completedQuests.length}`);

      if (completedQuests.length > 0) {
        router.replace({
          pathname: "/screens/QuestCompleteScreen",
          params: {
            completedQuests: JSON.stringify(completedQuests),
            workoutName: workoutData.name,
            workoutTime: String(durationMinutes),
            points: String(points),
            exercises: JSON.stringify(exercises),
          },
        });
        return;
      }

      // ------------------------------------------------------------------------
      // Priority 3: Standard Workout Complete
      // ------------------------------------------------------------------------
      console.log("No level up or quest completion, going to workout complete");
      router.replace({
        pathname: "/screens/FitnessTabs/workoutComplete",
        params: {
          name: workoutData.name,
          workoutTime: String(durationMinutes),
          points: String(points),
          exercises: JSON.stringify(exercises),
        },
      });
      
    } catch (error) {
      console.error("Failed to record workout:", error);
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

  /**
   * Handle alert confirmation
   * Executes onConfirmAction if in confirmAction mode
   */
  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });

    if (alert.onConfirmAction) {
      alert.onConfirmAction();
    }
  };

  /**
   * Handle alert cancellation
   * Closes alert and clears action callback
   */
  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });
  };

  // --------------------------------------------------------------------------
  // Render Data
  // --------------------------------------------------------------------------

  /** Array of hours (0-23) for picker */
  const hoursArray = Array.from({ length: 24 }, (_, i) => i);

  /** Array of minutes (0-59) for picker */
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <View style={styles.screen}>
      {/* Back Button */}
      <View style={styles.backContainer}>
        <BackButton onPress={onBack} />
      </View>

      <View style={styles.contentWrap}>
        {/* Title */}
        <Text style={styles.title}>Workout Duration</Text>

        {/* Routine Name */}
        {params.routineName && (
          <Text style={styles.routineName}>{params.routineName}</Text>
        )}

        {/* Time Picker */}
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
              {/* Top padding for centering */}
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
              {/* Bottom padding for centering */}
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
              {/* Top padding for centering */}
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
              {/* Bottom padding for centering */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
            </ScrollView>
            <Text style={styles.pickerLabel}>minutes</Text>
          </View>
        </View>

        {/* Selection Highlight Overlay */}
        <View style={styles.selectionHighlight} pointerEvents="none" />

        {/* End Workout Button */}
        <FormButton
          title={isSubmitting ? "Recording..." : "End Workout"}
          onPress={onEndWorkout}
          style={styles.endButton}
          disabled={isSubmitting || isLoadingData}
        />

        {/* Loading Indicator */}
        {(isSubmitting || isLoadingData) && (
          <ActivityIndicator
            size="large"
            color={colorPallet.primary}
            style={{ marginTop: 20 }}
          />
        )}
      </View>

      {/* Alert Modal */}
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

// ============================================================================
// Styles
// ============================================================================

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
  
  /** Container for both time pickers */
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: ITEM_HEIGHT * 5,
    width: "100%",
    marginBottom: 20,
  },
  
  /** Individual picker column (hours or minutes) */
  pickerColumn: {
    alignItems: "center",
  },
  
  /** Scrollable picker view */
  scrollPicker: {
    height: ITEM_HEIGHT * 5,
    width: 80,
  },
  
  scrollContent: {
    alignItems: "center",
  },
  
  /** Individual time value item */
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  
  /** Inactive picker text */
  pickerText: {
    fontSize: 32,
    color: colorPallet.neutral_5,
    fontWeight: "300",
  },
  
  /** Active (selected) picker text */
  pickerTextActive: {
    color: colorPallet.secondary,
    fontWeight: "700",
    fontSize: 40,
  },
  
  /** Label below picker (hours/minutes) */
  pickerLabel: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  
  /** Colon separator between hours and minutes */
  separator: {
    fontSize: 40,
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  
  /** Highlight box showing selected time value */
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