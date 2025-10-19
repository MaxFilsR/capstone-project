import React, { useMemo } from "react";
import { Text, ScrollView, Image, View, StyleSheet, Pressable } from "react-native";
import { tabStyles } from "@/styles";
import { WorkoutCard } from "@/components/workoutCard";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { router } from "expo-router";

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  workoutTime: number;
  pointsEarned: number;
}

interface MonthGroup {
  monthYear: string;
  displayMonth: string;
  totalSessions: number;
  totalGainz: number;
  workouts: WorkoutSession[];
}

// Mock data - replace with API call later
const mockWorkouts: WorkoutSession[] = [
  {
    id: "wkt_1a2b3c4d",
    name: "Morning Strength Training",
    date: "2025-10-15T08:30:00Z",
    workoutTime: 45,
    pointsEarned: 120,
  },
  {
    id: "wkt_5e6f7g8h",
    name: "Evening Cardio Session",
    date: "2025-10-14T18:00:00Z",
    workoutTime: 30,
    pointsEarned: 85,
  },
  {
    id: "wkt_9i0j1k2l",
    name: "Upper Body Strength",
    date: "2025-10-12T10:00:00Z",
    workoutTime: 50,
    pointsEarned: 135,
  },
  {
    id: "wkt_3m4n5o6p",
    name: "Leg Day",
    date: "2025-09-28T09:00:00Z",
    workoutTime: 60,
    pointsEarned: 150,
  },
  {
    id: "wkt_7q8r9s0t",
    name: "HIIT Training",
    date: "2025-09-25T17:30:00Z",
    workoutTime: 25,
    pointsEarned: 95,
  },
];

const HistoryScreen = () => {
  // Group workouts by month
  const groupedWorkouts = useMemo(() => {
    const groups: { [key: string]: MonthGroup } = {};

    mockWorkouts.forEach((workout) => {
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
      groups[monthYear].totalGainz += workout.pointsEarned;
    });

    // Sort by month (most recent first)
    return Object.values(groups).sort((a, b) =>
      b.monthYear.localeCompare(a.monthYear)
    );
  }, []);

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
                <WorkoutCard session={session} />
                <Pressable
                  onPress={() => {
                    console.log("Tapped:", session.id, session.name);
                    router.push({
                      pathname: "/screens/FitnessTabs/workoutComplete",
                      params: {
                        name: session.name,
                        workoutTime: String(session.workoutTime),
                        points: String(session.pointsEarned),
                      },
                    });
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
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
});

export default HistoryScreen;
