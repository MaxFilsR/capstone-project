import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import trophy from "@/assets/images/trophy_summary.png";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import {
  getWorkoutHistory,
  WorkoutSession,
  WorkoutExercise,
  Exercise,
} from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";
import { useWorkoutLibrary } from "@/lib/workout-library-context";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

type StatPair = { label: string; value: string | number };

type Props = {
  routineName?: string;
  playerName?: string;
  summary?: StatPair[];
  onDone?: () => void;
};

// Helper function to format numbers with commas
function formatNumber(
  value: number | string | undefined | null,
  decimals?: number
): string {
  if (value === undefined || value === null || value === "") return "0";

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  // If decimals specified, format with fixed decimal places
  if (decimals !== undefined) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Otherwise, format naturally (removing unnecessary decimals)
  return num.toLocaleString("en-US");
}

// Helper function to determine exercise type
function getExerciseType(
  category: string | null | undefined
): "strength" | "cardio" | "none" {
  if (!category) return "none";

  const cat = category.toLowerCase();

  if (
    cat === "strength" ||
    cat === "olympic weightlifting" ||
    cat === "powerlifting" ||
    cat === "strongman"
  ) {
    return "strength";
  }

  if (cat === "cardio") {
    return "cardio";
  }

  return "none";
}

export default function WorkoutComplete({
  routineName = "Strength Workout",
  playerName = "",
  summary,
  onDone,
}: Props) {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    workoutTime?: string;
    points?: string;
    date?: string;
    exercises?: string;
  }>();

  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(
    new Set()
  );
  const { user } = useAuth();
  const { exercises: exerciseLibrary } = useWorkoutLibrary();

  useEffect(() => {
    if (params.id) {
      loadWorkoutDetails(params.id);
    }
  }, [params.id]);

  async function loadWorkoutDetails(id: string) {
    try {
      setIsLoading(true);
      const history = await getWorkoutHistory();
      const foundWorkout = history.find((w) => String(w.id) === id);
      if (foundWorkout) {
        setWorkout(foundWorkout);
      }
    } catch (error) {
      console.error("Failed to load workout details:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const exercisesFromParams: WorkoutExercise[] = React.useMemo(() => {
    if (params.exercises) {
      try {
        return JSON.parse(params.exercises);
      } catch {
        return [];
      }
    }
    return [];
  }, [params.exercises]);

  const workoutName = workout?.name ?? params.name ?? routineName;
  const workoutDuration =
    workout?.duration ?? (params.workoutTime ? Number(params.workoutTime) : 0);
  const workoutPoints =
    workout?.points ?? (params.points ? Number(params.points) : 0);
  const workoutExercises = workout?.exercises ?? exercisesFromParams;

  const totalSets = workoutExercises.reduce((sum, ex) => sum + ex.sets, 0);

  const toggleExpanded = (index: number) => {
    setExpandedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleDone = () => {
    if (onDone) {
      onDone();
      return;
    }
    router.replace("/(tabs)/fitness");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={[typography.body, styles.loadingText]}>
          Loading workout details...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Done Button */}
      <View style={styles.header}>
        <Pressable onPress={handleDone} hitSlop={24}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image source={trophy} style={styles.trophy} resizeMode="contain" />
        <Text style={styles.title}>
          {workoutName
            ? workoutName[0].toUpperCase() + workoutName.slice(1)
            : "Workout"}{" "}
          Complete!
        </Text>
        <Text style={styles.subtitle}>
          Great work, {user?.profile?.username || "Champion"}!
        </Text>
      </View>

      {/* Stats Cards - Single Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Ionicons
              name="time-outline"
              size={20}
              color={colorPallet.primary}
            />
          </View>
          <Text style={styles.statValue}>
            {workoutDuration ? formatNumber(workoutDuration) : "-"}
          </Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Ionicons
              name="trophy-outline"
              size={20}
              color={colorPallet.primary}
            />
          </View>
          <Text style={styles.statValue}>{formatNumber(workoutPoints)}</Text>
          <Text style={styles.statLabel}>Gainz</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Ionicons
              name="barbell-outline"
              size={20}
              color={colorPallet.primary}
            />
          </View>
          <Text style={styles.statValue}>
            {formatNumber(workoutExercises.length)}
          </Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconWrapper}>
            <Ionicons
              name="repeat-outline"
              size={20}
              color={colorPallet.primary}
            />
          </View>
          <Text style={styles.statValue}>{formatNumber(totalSets)}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
      </View>

      {/* Exercises Section */}
      {workoutExercises.length > 0 && (
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Exercises Completed</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {workoutExercises.length}
              </Text>
            </View>
          </View>

          <View style={styles.exercisesContainer}>
            {workoutExercises.map((exercise, idx) => {
              const exerciseDetails = exerciseLibrary.find(
                (ex) => ex.id === String(exercise.id)
              );

              if (!exerciseDetails) return null;

              return (
                <ExpandableExerciseCard
                  key={idx}
                  exercise={exercise}
                  exerciseDetails={exerciseDetails}
                  isExpanded={expandedExercises.has(idx)}
                  onToggle={() => toggleExpanded(idx)}
                />
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function ExpandableExerciseCard({
  exercise,
  exerciseDetails,
  isExpanded,
  onToggle,
}: {
  exercise: WorkoutExercise;
  exerciseDetails: Exercise;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const exerciseType = getExerciseType(exerciseDetails.category);
  const imageUrl = exerciseDetails.images?.[0]
    ? `${IMAGE_BASE_URL}${exerciseDetails.images[0]}`
    : null;

  return (
    <View style={styles.exerciseCard}>
      {/* Exercise Header */}
      <Pressable onPress={onToggle} style={styles.exerciseHeader}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.exerciseThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.exerciseThumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons name="barbell" size={24} color={colorPallet.neutral_3} />
          </View>
        )}

        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {exerciseDetails.name}
          </Text>
          {exerciseDetails.primaryMuscles &&
            exerciseDetails.primaryMuscles.length > 0 && (
              <Text style={styles.exerciseMuscle}>
                {exerciseDetails.primaryMuscles.join(", ")}
              </Text>
            )}
        </View>

        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={colorPallet.neutral_3}
        />
      </Pressable>

      {/* Expanded Summary Details */}
      {isExpanded && exerciseType !== "none" && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsHeaderText}>Summary</Text>
          </View>

          <View style={styles.summaryGrid}>
            {exerciseType === "strength" && (
              <>
                {exercise.sets > 0 && (
                  <View style={styles.summaryMetric}>
                    <Ionicons
                      name="layers-outline"
                      size={20}
                      color={colorPallet.primary}
                    />
                    <Text style={styles.summaryMetricValue}>
                      {formatNumber(exercise.sets)}
                    </Text>
                    <Text style={styles.summaryMetricLabel}>
                      {exercise.sets === 1 ? "Set" : "Sets"}
                    </Text>
                  </View>
                )}

                {exercise.reps > 0 && (
                  <View style={styles.summaryMetric}>
                    <Ionicons
                      name="repeat-outline"
                      size={20}
                      color={colorPallet.primary}
                    />
                    <Text style={styles.summaryMetricValue}>
                      {formatNumber(exercise.reps)}
                    </Text>
                    <Text style={styles.summaryMetricLabel}>
                      Total {exercise.reps === 1 ? "Rep" : "Reps"}
                    </Text>
                  </View>
                )}

                {exercise.weight > 0 && (
                  <View style={styles.summaryMetric}>
                    <Ionicons
                      name="barbell-outline"
                      size={20}
                      color={colorPallet.primary}
                    />
                    <Text style={styles.summaryMetricValue}>
                      {formatNumber(exercise.weight, 1)}
                    </Text>
                    <Text style={styles.summaryMetricLabel}>
                      Avg Weight (lbs)
                    </Text>
                  </View>
                )}
              </>
            )}

            {exerciseType === "cardio" && (
              <>
                {exercise.sets > 0 && (
                  <View style={styles.summaryMetric}>
                    <Ionicons
                      name="layers-outline"
                      size={20}
                      color={colorPallet.primary}
                    />
                    <Text style={styles.summaryMetricValue}>
                      {formatNumber(exercise.sets)}
                    </Text>
                    <Text style={styles.summaryMetricLabel}>
                      {exercise.sets === 1 ? "Set" : "Sets"}
                    </Text>
                  </View>
                )}

                {exercise.distance > 0 && (
                  <View style={styles.summaryMetric}>
                    <Ionicons
                      name="trail-sign-outline"
                      size={20}
                      color={colorPallet.primary}
                    />
                    <Text style={styles.summaryMetricValue}>
                      {formatNumber(exercise.distance, 1)}
                    </Text>
                    <Text style={styles.summaryMetricLabel}>
                      Total Distance (km)
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colorPallet.neutral_lightest,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  doneText: {
    ...typography.body,
    color: colorPallet.primary,
    fontWeight: "bold",
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  trophy: {
    width: 250,
    height: 250,
    marginBottom: 8,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    fontWeight: "500",
    color: colorPallet.neutral_3,
    textAlign: "center",
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colorPallet.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colorPallet.neutral_lightest,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colorPallet.neutral_3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Exercises Section
  exercisesSection: {
    paddingHorizontal: 16,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionHeader: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "700",
    color: colorPallet.neutral_lightest,
  },
  countBadge: {
    backgroundColor: colorPallet.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colorPallet.neutral_darkest,
  },
  exercisesContainer: {
    gap: 12,
  },

  // Exercise Card
  exerciseCard: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colorPallet.primary,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  exerciseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: colorPallet.neutral_darkest,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: colorPallet.neutral_1,
    fontWeight: "600",
    fontSize: 16,
  },
  exerciseMuscle: {
    color: colorPallet.neutral_3,
    fontSize: 12,
    marginTop: 4,
  },

  // Details Container
  detailsContainer: {
    backgroundColor: colorPallet.neutral_darkest,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colorPallet.neutral_5,
  },
  detailsHeader: {
    marginBottom: 16,
  },
  detailsHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: colorPallet.neutral_3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  summaryMetric: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  summaryMetricValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colorPallet.neutral_lightest,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryMetricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colorPallet.neutral_3,
    textAlign: "center",
  },

  bottomSpacer: {
    height: 20,
  },
});
