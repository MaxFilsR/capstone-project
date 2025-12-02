/**
 * Workout Card Component
 * 
 * Displays a completed workout session with date, duration, and points earned.
 * Shows formatted metrics with icons and provides a pressable card interface
 * for navigation to workout details. Includes press animation feedback.
 */

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";

// ============================================================================
// Types
// ============================================================================

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  workoutTime: number;
  pointsEarned: number;
}

interface WorkoutCardProps {
  session: WorkoutSession;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format numbers with commas and optional decimal places
 */
function formatNumber(
  value: number | string | undefined | null,
  decimals?: number
): string {
  if (value === undefined || value === null || value === "") return "0";

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  if (decimals !== undefined) {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return num.toLocaleString("en-US");
}

// ============================================================================
// Component
// ============================================================================

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ session }) => {
  const handlePress = () => {
    // router.push(`/workout/${session.id}`);
  };

  /**
   * Format ISO date string to readable format
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          {/* Session name and date */}
          <View style={styles.header}>
            <Text
              style={[typography.h4, { color: colorPallet.neutral_lightest }]}
            >
              {session.name}
            </Text>
            <Text style={styles.date}>{formatDate(session.date)}</Text>
          </View>

          {/* Workout metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colorPallet.primary}
              />
              <Text style={styles.metricValue}>
                {formatNumber(session.workoutTime)}
              </Text>
              <Text style={styles.metricLabel}>mins</Text>
            </View>

            <View style={styles.metric}>
              <Ionicons
                name="trophy-outline"
                size={20}
                color={colorPallet.secondary}
              />
              <Text style={styles.metricValue}>
                {formatNumber(session.pointsEarned)}
              </Text>
              <Text style={styles.metricLabel}>Gainz</Text>
            </View>
          </View>
        </View>

        {/* Navigation arrow */}
        <View style={styles.arrowContainer}>
          <MaterialIcons
            name="arrow-forward-ios"
            size={24}
            color={colorPallet.secondary}
          />
        </View>
      </View>
    </Pressable>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colorPallet.primary,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: "600",
    color: colorPallet.neutral_lightest,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colorPallet.neutral_3,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 24,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colorPallet.neutral_lightest,
  },
  metricLabel: {
    fontSize: 14,
    color: colorPallet.neutral_3,
  },
  arrowContainer: {
    marginLeft: 12,
    justifyContent: "center",
  },
});