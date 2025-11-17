import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable, } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { BackButton } from "@/components";


type ContributingWorkout = {
  id: string;
  name: string;
  pointsScored: number;
  date: string;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  reward: {
    xp: number;
  };
  progress: number; // 0-100
  status: "active" | "inactive" | "completed"
  expiresAt?: string;
  contributingWorkouts: ContributingWorkout[];
};


// sample quests
const sampleQuests: Quest[] = [
  {
    id: "1",
    title: "The Iron Trial",
    description: "Complete 4 strength workouts",
    reward: {
      xp: 200,
    },
    progress: 75,
    status: "active",
    expiresAt: "December 12th",
    contributingWorkouts: [
      {
        id: "w1",
        name: "Hamstring workout",
        pointsScored: 25,
        date: "10-28-2025",
      },
      {
        id: "w2",
        name: "Quad workout",
        pointsScored: 30,
        date: "10-24-2025",
      },
      {
        id: "w3",
        name: "Push day",
        pointsScored: 20,
        date: "10-14-2025",
      },
    ],
  },
  {
    id: "2",
    title: "The Early Bird",
    description: "Log a workout before 9 AM on 3 different days",
    reward: {
      xp: 400,
    },
    progress: 100,
    status: "active",
    expiresAt: "January 1st",
    contributingWorkouts: [
      {
        id: "w4",
        name: "Morning run",
        pointsScored: 35,
        date: "10-28-2025",
      },
      {
        id: "w5",
        name: "Glute day",
        pointsScored: 20,
        date: "10-28-2025",
      },
      {
        id: "w6",
        name: "Back and Biceps",
        pointsScored: 25,
        date: "10-28-2025",
      },
    ],
  },
];


const DetailsQuestsScreen = () => {
  const params = useLocalSearchParams()
  const questId = params.questId;

  const quest = sampleQuests.find((q) => q.id === questId);

  if (!quest) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Details Not Found</Text>
        </View>
      </View>
    );
  }

  // check if quest completed
  const isCompleted = quest.status === "completed" || quest.progress === 100;

  // how many days until expiry
  const daysUntilExpiry = 7;

  const handleWorkoutPress = (workoutId: string) => {
    console.log("Navigate to workout details:", workoutId);
    //router.push({pathname: "/screens/FitnessTabs/workoutComplete", params: { id: workoutId }});
  };

  return (
    <View style={styles.container}>
      {/* back button */}
      <BackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questInfoSection}>
          {/* quest title */}
          <Text style={styles.questTitle}>{quest.title}</Text>

          {/* quest description */}
          <Text style={styles.questDescription}>{quest.description}</Text>

          {/* expiry date */}
          {quest.expiresAt && (
            <Text style={styles.expiryText}>
              Expires in: {daysUntilExpiry} Days
            </Text>
          )}

          {/* reward info */}
          <Text style={styles.rewardText}>
            Reward: +{quest.reward.xp} XP
          </Text>

          {/* progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${quest.progress}%`,
                  backgroundColor: isCompleted
                    ? colorPallet.primary
                    : colorPallet.secondary,
                },
              ]}
            />
          </View>

          {/* progress % */}
          <Text style={styles.progressText}>{quest.progress}%</Text>

          {/* cquest completed */}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check-circle" size={24} color={colorPallet.primary} />
              <Text style={styles.completedText}>Quest Completed!</Text>
            </View>
          )}
        </View>

        {/* contributing workouts */}
        <View style={styles.workoutsSection}>
          {/* header */}
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutHeaderText}>Contributing Workouts</Text>
          </View>

          {/* workouts list */}
          {quest.contributingWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => handleWorkoutPress(workout.id)}
            />
          ))}

          {/* if no workouts yet */}
          {quest.contributingWorkouts.length === 0 && (
            <Text style={styles.noWorkoutsText}> No workouts completed yet</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

type WorkoutCardProps = {
  workout: ContributingWorkout;
  onPress: () => void;
};

// workout card component
function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
  return (
    <Pressable style={styles.workoutCard} onPress={onPress}>
      {/* running icon */}
      <View style={styles.workoutIconContainer}>
        <MaterialIcons
          //name="directions-run"
          name="fitness-center"
          size={32}
          color={colorPallet.secondary}
        />
      </View>

      {/* workout info */}
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.workoutPoints}> {workout.pointsScored} points</Text>
      </View>

      <MaterialIcons
          name="chevron-right"
          size={24}
          color={colorPallet.neutral_3}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 40,
  },

  // error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  errorText: {
    ...typography.body,
    color: colorPallet.critical,
    fontSize: 16,
  },

  // quest section
  questInfoSection: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  questTitle: {
    ...typography.h1,
    color: colorPallet.secondary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  questDescription: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  expiryText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 8,
  },
  rewardText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 14,
    marginBottom: 16,
  },

  // progress bar
  questsContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  // progress bar
  progressBarContainer: {
    height: 12,
    backgroundColor: colorPallet.neutral_4,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 16,
  },

  // quest completed
  completedBadge: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colorPallet.neutral_darkest,
    gap: 8,
    borderWidth: 2,
    borderColor: colorPallet.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  completedText: {
    ...typography.body,
    color: colorPallet.primary,
    fontSize: 16,
    fontWeight: "700"
  },

  // contributing workouts
  workoutsSection: {
    marginBottom: 20,
  },
  workoutHeader: {
    backgroundColor: colorPallet.neutral_6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutHeaderText: {
    ...typography.h2,
    color: colorPallet.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  // workout card
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    ...typography.body,
    color: colorPallet.secondary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  workoutPoints: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 13,
  },

  // no workouts
  noWorkoutsText: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});

export default DetailsQuestsScreen;