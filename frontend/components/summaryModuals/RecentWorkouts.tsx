/**
 * Recent Workouts Component
 * 
 * Displays a list of recent workout sessions with key metrics including points,
 * duration, and exercise count. Fetches workout history from API and shows
 * loading, error, and empty states. Provides navigation to detailed workout
 * view and full history page.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { getWorkoutHistory, WorkoutSession } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";

// ============================================================================
// Types
// ============================================================================

interface RecentWorkoutsProps {
  limit?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format numbers with commas
 */
function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Format date with relative labels for today/yesterday
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format duration in seconds to hours/minutes
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ============================================================================
// Component
// ============================================================================

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({ limit = 5 }) => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  /**
   * Fetch and sort recent workout history
   */
  async function loadRecentWorkouts() {
    try {
      setIsLoading(true);
      setError(null);
      const history = await getWorkoutHistory();

      const sortedHistory = history
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);

      setWorkouts(sortedHistory);
    } catch (err) {
      console.error("Failed to load recent workouts:", err);
      setError("Failed to load workouts");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Navigate to workout details page
   */
  const handleWorkoutPress = (session: WorkoutSession) => {
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
  };

  const handleViewAll = () => {
    router.push("/(tabs)/fitness");
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Workouts</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colorPallet.primary} />
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Workouts</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadRecentWorkouts} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Empty state
  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Workouts</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workouts yet</Text>
          <Text style={styles.emptySubtext}>
            Start your first workout to see it here!
          </Text>
        </View>
      </View>
    );
  }

  // Workout list
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Workouts</Text>
        <Pressable onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {workouts.map((session, index) => (
          <Pressable
            key={session.id}
            onPress={() => handleWorkoutPress(session)}
            style={[
              styles.workoutCard,
              index % 2 === 0 ? styles.workoutCardEven : styles.workoutCardOdd,
              index === workouts.length - 1 && styles.lastWorkoutCard,
            ]}
          >
            <View style={styles.workoutCardHeader}>
              <Text style={styles.workoutName} numberOfLines={1}>
                {session.name}
              </Text>
              <Text style={styles.workoutDate}>{formatDate(session.date)}</Text>
            </View>

            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Gainz</Text>
                <Text style={styles.statValue}>
                  {formatNumber(session.points)}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>
                  {formatDuration(session.duration)}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Exercises</Text>
                <Text style={styles.statValue}>{session.exercises.length}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: colorPallet.primary,
  },
  title: {
    ...typography.h2,
    color: colorPallet.neutral_darkest,
  },
  viewAllText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 14,
    fontWeight: "600",
  },
  workoutCard: {
    padding: 12,
  },
  workoutCardEven: {
    backgroundColor: colorPallet.neutral_6,
  },
  workoutCardOdd: {
    backgroundColor: colorPallet.neutral_darkest,
  },
  lastWorkoutCard: {
    marginBottom: 0,
  },
  workoutCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  workoutName: {
    ...typography.body,
    color: colorPallet.secondary,
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  workoutDate: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 12,
  },
  workoutStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 11,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  statValue: {
    ...typography.body,
    color: colorPallet.neutral_1,
    fontSize: 16,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colorPallet.neutral_4,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 14,
  },
  errorText: {
    ...typography.body,
    color: colorPallet.critical,
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colorPallet.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RecentWorkouts;