/**
 * History Screen
 *
 * Displays user's workout history organized by month with statistics.
 * Shows workout sessions in chronological order (most recent first) with
 * monthly summaries of total gainz earned and session counts. Provides
 * loading, error, and empty states with appropriate user feedback.
 */

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

// ============================================================================
// Types
// ============================================================================

/**
 * Monthly workout group containing aggregated stats and workout sessions
 */
interface MonthGroup {
  monthYear: string; // Format: "YYYY-MM" for sorting
  displayMonth: string; // Format: "Month Year" for display
  totalSessions: number;
  totalGainz: number;
  workouts: WorkoutSession[];
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format numbers with locale-appropriate commas and optional decimal places
 * 
 * @param value - Number to format (can be string, number, undefined, or null)
 * @param decimals - Optional fixed decimal places
 * @returns Formatted number string with commas, or "0" if invalid
 */
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

// ============================================================================
// Component
// ============================================================================

const HistoryScreen = () => {
  // ============================================================================
  // State
  // ============================================================================

  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Fetch workout history on component mount
   */
  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  /**
   * Load workout history from API
   * Sets loading state, handles errors, and updates workout list
   */
  async function loadWorkoutHistory() {
    try {
      setIsLoading(true);
      setError(null);
      const history = await getWorkoutHistory();

      setWorkouts(history);
    } catch (err) {
      console.error("Failed to load workout history:", err);
      setError("Failed to load workout history");
    } finally {
      setIsLoading(false);
    }
  }

  // ============================================================================
  // Computed Values
  // ============================================================================

  /**
   * Group workouts by month with aggregated statistics
   * 
   * Creates monthly groups sorted by most recent first. Each group contains:
   * - Total workout sessions for the month
   * - Total gainz earned in the month
   * - Array of all workout sessions in that month
   */
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

  // ============================================================================
  // Conditional Rendering
  // ============================================================================

  /**
   * Loading state - Show spinner while fetching workout data
   */
  if (isLoading) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading workout history...</Text>
      </View>
    );
  }

  /**
   * Error state - Show error message with retry button
   */
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

  /**
   * Empty state - Show message when no workout history exists
   */
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

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View>
        {groupedWorkouts.map((group) => (
          <View key={group.monthYear} style={styles.monthSection}>
            {/* Month Header with Statistics */}
            <View style={styles.monthHeader}>
              <Text style={[typography.h2, styles.monthTitle]}>
                {group.displayMonth}
              </Text>

              <Text style={styles.statTextPrimary}>
                Gainz earned:{" "}
                <Text style={styles.statValue}>
                  {formatNumber(group.totalGainz)}
                </Text>
              </Text>

              <Text style={styles.statTextSecondary}>
                Workout sessions:{" "}
                <Text style={styles.statValue}>
                  {formatNumber(group.totalSessions)}
                </Text>
              </Text>
            </View>

            {/* Workout Cards with Navigation Overlay */}
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
                {/* Invisible pressable overlay for navigation */}
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

// ============================================================================
// Styles
// ============================================================================

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