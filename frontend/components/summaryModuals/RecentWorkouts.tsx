/**
 * Recent Workouts Component
 * 
 * Displays a list of recent workout sessions with key metrics.
 * Shows loading, error, and empty states. Provides navigation to
 * workout details and full history page.
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
import { Ionicons } from "@expo/vector-icons";

interface RecentWorkoutsProps {
  limit?: number;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function formatDate(dateString: string): string {
  // Parse the date string and treat it as local time
  const parts = dateString.split('T')[0].split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return "Today";
  }

  if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({ limit = 5 }) => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

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

  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Workouts</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="barbell-outline"
            size={48}
            color={colorPallet.neutral_4}
          />
          <Text style={styles.emptyText}>No workouts yet</Text>
          <Text style={styles.emptySubtext}>
            Start your first workout to see it here!
          </Text>
        </View>
      </View>
    );
  }

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
            ]}
          >
            <View style={styles.workoutContent}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName} numberOfLines={1}>
                  {session.name}
                </Text>
                <Text style={styles.workoutDate}>
                  {formatDate(session.date)}
                </Text>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colorPallet.primary}
                  />
                  <Text style={styles.metricValue}>
                    {formatDuration(session.duration)}
                  </Text>
                </View>

                <View style={styles.metric}>
                  <Ionicons
                    name="trophy-outline"
                    size={16}
                    color={colorPallet.secondary}
                  />
                  <Text style={styles.metricValue}>
                    {formatNumber(session.points)}
                  </Text>
                </View>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colorPallet.neutral_4}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  workoutCardEven: {
    backgroundColor: colorPallet.neutral_6,
  },
  workoutCardOdd: {
    backgroundColor: colorPallet.neutral_darkest,
  },
  workoutContent: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  workoutName: {
    ...typography.body,
    color: colorPallet.secondary,
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  workoutDate: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 20,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    ...typography.body,
    color: colorPallet.neutral_1,
    fontSize: 14,
    fontWeight: "600",
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
    marginTop: 12,
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