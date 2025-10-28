import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";

// TypeScript interfaces
interface WorkoutSession {
  id: string;
  name: string;
  date: string; // ISO date string
  workoutTime: number; // in minutes
  pointsEarned: number;
}

interface WorkoutCardProps {
  session: WorkoutSession;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ session }) => {
  const handlePress = () => {
    // router.push(`/workout/${session.id}`);
  };

  // Format date to readable format
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
          {/* Header Section */}
          <View style={styles.header}>
            <Text
              style={[typography.h4, { color: colorPallet.neutral_lightest }]}
            >
              {session.name}
            </Text>
            <Text style={styles.date}>{formatDate(session.date)}</Text>
          </View>

          {/* Metrics Section */}
          <View style={styles.metricsRow}>
            {/* Workout Time Metric */}
            <View style={styles.metric}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colorPallet.primary}
              />
              <Text style={styles.metricValue}>{session.workoutTime}</Text>
              <Text style={styles.metricLabel}>mins</Text>
            </View>

            {/* Points Earned Metric */}
            <View style={styles.metric}>
              <Ionicons
                name="trophy-outline"
                size={20}
                color={colorPallet.secondary}
              />
              <Text style={styles.metricValue}>{session.pointsEarned}</Text>
              <Text style={styles.metricLabel}>Gainz</Text>
            </View>
          </View>
        </View>

        {/* Arrow Icon */}
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
