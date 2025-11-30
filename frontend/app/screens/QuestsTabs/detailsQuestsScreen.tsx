import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Button } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { BackButton } from "@/components";
import { getQuests, Quest } from "@/api/endpoints";


const DetailsQuestsScreen = () => {
  const params = useLocalSearchParams();
  const questId = params.questId as string;

  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestDetails();
  }, [questId]);

  const loadQuestDetails = async () => {
    try {
      setLoading(true);
      // Fetch all quests and find the one matching this ID
      const allQuests = await getQuests();
      const foundQuest = allQuests.find((q) => q.id === parseInt(questId));

      if (foundQuest) {
        setQuest(foundQuest);
        setError(null);
      } else {
        setError("Quest not found");
      }
    } catch (err) {
      console.error("Failed to load quest details:", err);
      setError("Failed to load quest details");
    } finally {
      setLoading(false);
    }
  };

  //calculate progress percentage
  const calculateProgress = (): number => {
    if (!quest || quest.number_of_workouts_needed === 0) return 0;
    const progress =
      (quest.number_of_workouts_completed / quest.number_of_workouts_needed) *
      100;
    return Math.min(progress, 100);
  };

  // calculate reward base don what difficulty is
  const getReward = (): number => {
    if (!quest) return 0;
    switch (quest.difficulty.toLowerCase()) {
      case "easy":
        return 100;
      case "medium":
        return 500;
      case "hard":
        return 1500;
      default:
        return 100;
    }
  };

  const getQuestDescription = (): string => {
    if (!quest) return "";

    let description = `Complete ${quest.number_of_workouts_needed} workout${
      quest.number_of_workouts_needed > 1 ? "s" : ""
    }`;

    if (quest.workout_duration) {
      description += ` of at least ${quest.workout_duration} minutes`;
    }

    if (quest.exercise_category) {
      description += ` that include ${quest.exercise_category}`;
    }

    if (quest.exercise_muscle) {
      description += ` targeting ${quest.exercise_muscle}`;
    }

    return description;
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colorPallet.primary} />
          <Text style={[typography.body, { marginTop: 12, color: colorPallet.neutral_3 }]}>
            Loading quest details...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !quest) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colorPallet.critical} />
          <Text style={styles.errorText}>{error || "Quest not found"}</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  // check if quest completed
  const progress = calculateProgress();
  const isCompleted = quest.status === "completed" || progress === 100;

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
          {/* difficulty badge */}
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>
              {quest.difficulty.toUpperCase()}
            </Text>
          </View>

          {/* quest title */}
          <Text style={styles.questTitle}>{quest.name}</Text>

          {/* quest description */}
          <Text style={styles.questDescription}>{getQuestDescription()}</Text>

          {/* Status badge */}
          <View style={styles.statusBadge}>
            <MaterialIcons
              name={
                quest.status === "completed"
                  ? "check-circle"
                  : quest.status === "active"
                  ? "radio-button-checked"
                  : "radio-button-unchecked"
              }
              size={16}
              color={
                quest.status === "completed"
                  ? colorPallet.primary
                  : quest.status === "active"
                  ? colorPallet.secondary
                  : colorPallet.neutral_4
              }
            />
            <Text style={styles.statusText}>
              Status: {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
            </Text>
          </View>

          {/* reward info */}
          <Text style={styles.rewardText}>Reward: +{getReward()} XP</Text>

          {/* progress text */}
          <Text style={styles.progressCountText}>
            {quest.number_of_workouts_completed} / {quest.number_of_workouts_needed}{" "}
            workouts completed
          </Text>

          {/* progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isCompleted
                    ? colorPallet.primary
                    : colorPallet.secondary,
                },
              ]}
            />
          </View>

          {/* progress percentage */}
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>

          {/* quest completed badge */}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check-circle" size={24} color={colorPallet.primary} />
              <Text style={styles.completedText}>Quest Completed!</Text>
            </View>
          )}
        </View>

        {/* requirements section */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>

          <View style={styles.requirementCard}>
            <MaterialIcons
              name="fitness-center"
              size={24}
              color={colorPallet.secondary}
            />
            <View style={styles.requirementInfo}>
              <Text style={styles.requirementLabel}>Workouts Needed</Text>
              <Text style={styles.requirementValue}>
                {quest.number_of_workouts_needed}
              </Text>
            </View>
          </View>

          {quest.workout_duration && (
            <View style={styles.requirementCard}>
              <MaterialIcons name="timer" size={24} color={colorPallet.secondary} />
              <View style={styles.requirementInfo}>
                <Text style={styles.requirementLabel}>Minimum Duration</Text>
                <Text style={styles.requirementValue}>
                  {quest.workout_duration} minutes
                </Text>
              </View>
            </View>
          )}

          {quest.exercise_category && (
            <View style={styles.requirementCard}>
              <MaterialIcons name="category" size={24} color={colorPallet.secondary} />
              <View style={styles.requirementInfo}>
                <Text style={styles.requirementLabel}>Exercise Category</Text>
                <Text style={styles.requirementValue}>
                  {quest.exercise_category}
                </Text>
              </View>
            </View>
          )}

          {quest.exercise_muscle && (
            <View style={styles.requirementCard}>
              <MaterialIcons
                name="accessibility"
                size={24}
                color={colorPallet.secondary}
              />
              <View style={styles.requirementInfo}>
                <Text style={styles.requirementLabel}>Target Muscle</Text>
                <Text style={styles.requirementValue}>
                  {quest.exercise_muscle}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* info box */}
        <View style={styles.infoBox}>
          <MaterialIcons
            name="info-outline"
            size={20}
            color={colorPallet.primary}
          />
          <Text style={styles.infoText}>
            Complete workouts that meet the requirements. Your progress updates
            automatically!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingTop: 50,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 60,
  },

  // error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    ...typography.body,
    color: colorPallet.critical,
    fontSize: 16,
    textAlign: "center",
  },

  // quest section
  questInfoSection: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    backgroundColor: colorPallet.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  difficultyText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statusText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 14,
    fontWeight: "600",
  },
  rewardText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 14,
    marginBottom: 16,
  },
  progressCountText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 14,
    marginBottom: 12,
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
    marginTop: 4,
  },
  completedText: {
    ...typography.body,
    color: colorPallet.primary,
    fontSize: 16,
    fontWeight: "700"
  },

  // requirements section
  requirementsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h2,
    color: colorPallet.primary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  requirementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  requirementInfo: {
    marginLeft: 16,
    flex: 1,
  },
  requirementLabel: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 13,
    marginBottom: 4,
  },
  requirementValue: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    fontWeight: "700",
  },

  // info box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colorPallet.neutral_6,
    borderLeftWidth: 3,
    borderLeftColor: colorPallet.primary,
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  infoText: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});

export default DetailsQuestsScreen;

