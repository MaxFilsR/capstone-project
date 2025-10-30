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
import trophy from "@/assets/images/trophy_summary.png";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import {
  getWorkoutHistory,
  WorkoutSession,
  WorkoutExercise,
} from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";

type StatPair = { label: string; value: string | number };

type Props = {
  routineName?: string;
  playerName?: string;
  summary?: StatPair[];
  onDone?: () => void;
};

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
    exercises?: string; // For newly completed workouts
  }>();

  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch workout details if ID is provided (from history)
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

  // Parse exercises from params if provided
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

  // Build summary stats
  const rows: StatPair[] = summary ?? [
    {
      label: "Workout Time",
      value: workoutDuration ? `${workoutDuration} min` : "-",
    },
    { label: "Gainz Earned", value: workoutPoints || "-" },
    { label: "Total Exercises", value: workoutExercises.length },
    {
      label: "Total Sets",
      value: workoutExercises.reduce((sum, ex) => sum + ex.sets, 0),
    },
  ];

  const handleDone = () => {
    if (onDone) {
      onDone();
      return;
    }
    router.replace("/(tabs)/fitness");
  };

  const HEADER_OFFSET = 80;

  const pairs: StatPair[][] = [];
  for (let i = 0; i < rows.length; i += 2) {
    pairs.push(rows.slice(i, i + 2));
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text
          style={[
            typography.body,
            { color: colorPallet.neutral_lightest, marginTop: 16 },
          ]}
        >
          Loading workout details...
        </Text>
      </View>
    );
  }
  const { user } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: HEADER_OFFSET }]}
    >
      {/* Done Button */}
      <Pressable
        onPress={handleDone}
        hitSlop={24}
        style={[styles.doneWrap, { top: HEADER_OFFSET }]}
      >
        <Text style={styles.doneText}>Done</Text>
      </Pressable>

      {/* Title */}
      <Text style={[typography.h1, styles.title]}>
        {`${workoutName} Complete`}
      </Text>

      <Image source={trophy} style={styles.trophy} resizeMode="contain" />

      {/* Post Workout Message */}
      <Text style={[typography.h1, styles.postMessage]}>
        Good job, {user?.profile?.username}!
      </Text>

      {/* Summary Stats */}
      <Text style={styles.sectionHeader}>Workout Summary</Text>

      <View style={styles.card}>
        {pairs.map((pair, idx) => (
          <View
            key={`${pair[0].label}-${pair[1]?.label ?? idx}`}
            style={[styles.row, idx > 0 && styles.rowDivider]}
          >
            {/* Left Cell */}
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>{pair[0].label}</Text>
              <Text style={styles.cellValue}>
                {typeof pair[0].value === "number"
                  ? pair[0].value.toLocaleString()
                  : pair[0].value}
              </Text>
            </View>

            {/* Right Cell */}
            <View style={[styles.cell, styles.cellLeftDivider]}>
              {pair[1] ? (
                <>
                  <Text style={styles.cellLabel}>{pair[1].label}</Text>
                  <Text style={styles.cellValue}>
                    {typeof pair[1].value === "number"
                      ? pair[1].value.toLocaleString()
                      : pair[1].value}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {/* Exercise Details */}
      {workoutExercises.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Exercises</Text>
          <View style={styles.exercisesContainer}>
            {workoutExercises.map((exercise, idx) => (
              <ExerciseDetailCard key={idx} exercise={exercise} index={idx} />
            ))}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function ExerciseDetailCard({
  exercise,
  index,
}: {
  exercise: WorkoutExercise;
  index: number;
}) {
  const hasWeight = exercise.weight > 0;
  const hasReps = exercise.reps > 0;
  const hasDistance = exercise.distance > 0;

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseNumber}>{index + 1}</Text>
        <Text style={styles.exerciseName}>Exercise {exercise.id}</Text>
      </View>

      <View style={styles.exerciseStats}>
        <View style={styles.exerciseStat}>
          <Text style={styles.exerciseStatLabel}>Sets</Text>
          <Text style={styles.exerciseStatValue}>{exercise.sets}</Text>
        </View>

        {hasReps && (
          <View style={styles.exerciseStat}>
            <Text style={styles.exerciseStatLabel}>Total Reps</Text>
            <Text style={styles.exerciseStatValue}>{exercise.reps}</Text>
          </View>
        )}

        {hasWeight && (
          <View style={styles.exerciseStat}>
            <Text style={styles.exerciseStatLabel}>Avg Weight</Text>
            <Text style={styles.exerciseStatValue}>{exercise.weight} lbs</Text>
          </View>
        )}

        {hasDistance && (
          <View style={styles.exerciseStat}>
            <Text style={styles.exerciseStatLabel}>Distance</Text>
            <Text style={styles.exerciseStatValue}>{exercise.distance} km</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
  },
  content: {
    padding: 16,
    paddingTop: 100,
  },

  doneWrap: {
    position: "absolute",
    right: 16,
    zIndex: 1,
  },
  doneText: {
    color: colorPallet.secondary,
    fontSize: 16,
    fontWeight: "700",
  },

  title: {
    color: colorPallet.primary,
    textAlign: "center",
    marginTop: 80,
  },

  trophy: {
    width: "72%",
    height: 180,
    alignSelf: "center",
    marginVertical: 12,
    marginTop: 20,
  },

  postMessage: {
    color: colorPallet.neutral_lightest,
    textAlign: "center",
    marginBottom: 12,
    marginTop: 4,
  },

  sectionHeader: {
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 12,
  },

  card: {
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colorPallet.primary,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colorPallet.neutral_5,
  },

  cell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  cellLeftDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colorPallet.neutral_5,
  },

  cellLabel: {
    ...typography.h1,
    color: colorPallet.neutral_lightest,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  cellValue: {
    color: colorPallet.neutral_3,
    fontSize: 16,
    fontWeight: "400",
  },

  // Exercise Cards
  exercisesContainer: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colorPallet.primary,
    color: colorPallet.neutral_darkest,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "700",
    fontSize: 14,
    marginRight: 12,
  },
  exerciseName: {
    ...typography.h3,
    color: colorPallet.neutral_lightest,
    flex: 1,
  },
  exerciseStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  exerciseStat: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  exerciseStatLabel: {
    color: colorPallet.neutral_4,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseStatValue: {
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    fontWeight: "700",
  },
});
