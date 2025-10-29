import React, { useMemo, useEffect, useState } from "react";
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { tabStyles } from "@/styles";
import { WorkoutCard } from "@/components/workoutCard";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { router } from "expo-router";
import { getWorkoutHistory, WorkoutSession } from "@/api/endpoints";

interface MonthGroup {
  monthYear: string;
  displayMonth: string;
  totalSessions: number;
  totalGainz: number;
  workouts: WorkoutSession[];
}

const HistoryScreen = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workout history on mount
  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  async function loadWorkoutHistory() {
    try {
      setIsLoading(true);
      setError(null);
      const history = await getWorkoutHistory();

      setWorkouts(history);
    } catch (err) {
      console.error("❌ Failed to load workout history:", err);
      setError("Failed to load workout history");
    } finally {
      setIsLoading(false);
    }
  }

  // Group workouts by month
  const groupedWorkouts = useMemo(() => {
    const groups: { [key: string]: MonthGroup } = {};

    workouts.forEach((workout) => {
      const date = new Date(workout.date);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const displayMonth = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthYear]) {
        groups[monthYear] = {
          monthYear,
          displayMonth,
          totalSessions: 0,
          totalGainz: 0,
          workouts: [],
        };
      }

      groups[monthYear].workouts.push(workout);
      groups[monthYear].totalSessions += 1;
      groups[monthYear].totalGainz += workout.points;
    });

    // Sort by month (most recent first)
    return Object.values(groups).sort((a, b) =>
      b.monthYear.localeCompare(a.monthYear)
    );
  }, [workouts]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading workout history...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={loadWorkoutHistory} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Empty state
  if (workouts.length === 0) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Text style={styles.emptyTitle}>No Workouts Yet</Text>
        <Text style={styles.emptySubtitle}>
          Complete your first workout to see your history here!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View>
        {groupedWorkouts.map((group) => (
          <View key={group.monthYear} style={styles.monthSection}>
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <Text style={[typography.h2, styles.monthTitle]}>
                {group.displayMonth}
              </Text>

              <Text style={styles.statTextPrimary}>
                Gainz earned:{" "}
                <Text style={styles.statValue}>{group.totalGainz}</Text>
              </Text>

              <Text style={styles.statTextSecondary}>
                Workout sessions:{" "}
                <Text style={styles.statValue}>{group.totalSessions}</Text>
              </Text>
            </View>

            {/* Workout Cards */}
            {group.workouts.map((session) => (
              <View key={session.id} style={{ position: "relative" }}>
                <WorkoutCard
                  session={{
                    id: String(session.id),
                    name: session.name,
                    date: session.date,
                    workoutTime: session.duration,
                    pointsEarned: session.points,
                  }}
                />
                <Pressable
                  onPress={() => {
                    router.push({
                      pathname: "/screens/FitnessTabs/workoutComplete",
                      params: {
                        id: String(session.id),
                        name: session.name,
                        workoutTime: String(session.duration),
                        points: String(session.points),
                        date: session.date,
                      },
                    });
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  }}
                  hitSlop={10}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  monthSection: {
    marginBottom: 32,
  },
  monthHeader: {
    marginBottom: 16,
  },
  monthTitle: {
    color: colorPallet.neutral_lightest,
    marginBottom: 8,
  },
  statTextPrimary: {
    fontSize: 14,
    color: colorPallet.primary,
    marginBottom: 4,
    fontWeight: "600",
  },
  statTextSecondary: {
    fontSize: 14,
    color: colorPallet.secondary,
    marginBottom: 4,
    fontWeight: "600",
  },
  statValue: {
    color: colorPallet.neutral_lightest,
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    marginTop: 16,
  },
  errorText: {
    ...typography.body,
    color: colorPallet.critical,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colorPallet.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontWeight: "700",
  },
  emptyTitle: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    ...typography.body,
    color: colorPallet.neutral_4,
    textAlign: "center",
  },
});

export default HistoryScreen;
