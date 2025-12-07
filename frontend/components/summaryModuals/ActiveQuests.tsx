/**
 * Active Quests Component
 * 
 * Displays active quests with progress indicators and key details.
 * Shows loading, error, and empty states. Provides navigation to
 * quest details and full quest list.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useQuests } from "@/lib/quest-context";
import { Quest } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { Ionicons } from "@expo/vector-icons";

interface ActiveQuestsProps {
  limit?: number;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "#6DE66D";
    case "medium":
      return "#E9E34A";
    case "hard":
      return "#D64545";
    default:
      return colorPallet.neutral_4;
  }
}

function formatReward(reward: number): string {
  return reward.toLocaleString("en-US");
}

const ActiveQuests: React.FC<ActiveQuestsProps> = ({ limit = 3 }) => {
  const {
    loading,
    error,
    getInProgressQuests,
    calculateProgress,
    getQuestDescription,
  } = useQuests();

  const activeQuests = getInProgressQuests().slice(0, limit);

  const handleQuestPress = (quest: Quest) => {
    router.push({
      pathname: "/screens/QuestsTabs/detailsQuestsScreen",
      params: {
        questId: String(quest.id),
      },
    });
  };

  const handleViewAll = () => {
    router.push("/(tabs)/quests");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Quests</Text>
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
          <Text style={styles.title}>Active Quests</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (activeQuests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Quests</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="trophy-outline"
            size={48}
            color={colorPallet.neutral_4}
          />
          <Text style={styles.emptyText}>No active quests</Text>
          <Text style={styles.emptySubtext}>
            Start a new quest to begin your journey!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Quests</Text>
        <Pressable onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeQuests.map((quest, index) => {
          const progress = calculateProgress(quest);
          const difficultyColor = getDifficultyColor(quest.difficulty);

          return (
            <Pressable
              key={quest.id}
              onPress={() => handleQuestPress(quest)}
              style={[
                styles.questCard,
                index % 2 === 0
                  ? styles.questCardEven
                  : styles.questCardOdd,
              ]}
            >
              <View style={styles.questHeader}>
                <View style={styles.questTitleRow}>
                  <Ionicons
                    name="flag"
                    size={18}
                    color={difficultyColor}
                    style={styles.questIcon}
                  />
                  <Text
                    style={[
                      styles.questName,
                      { color: difficultyColor },
                    ]}
                    numberOfLines={1}
                  >
                    {quest.name}
                  </Text>
                </View>
              </View>

              <Text style={styles.questDescription} numberOfLines={2}>
                {getQuestDescription(quest)}
              </Text>

              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: difficultyColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {quest.number_of_workouts_completed}/
                  {quest.number_of_workouts_needed}
                </Text>
              </View>
            </Pressable>
          );
        })}
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
  questCard: {
    padding: 16,
  },
  questCardEven: {
    backgroundColor: colorPallet.neutral_6,
  },
  questCardOdd: {
    backgroundColor: colorPallet.neutral_darkest,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  questIcon: {
    marginRight: 6,
  },
  questName: {
    ...typography.body,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  questDescription: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colorPallet.neutral_5,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    ...typography.body,
    color: colorPallet.neutral_1,
    fontSize: 12,
    fontWeight: "700",
    minWidth: 40,
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
  },
});

export default ActiveQuests;