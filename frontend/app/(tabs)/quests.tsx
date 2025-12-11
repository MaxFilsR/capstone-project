/**
 * Quests Tab Screen
 *
 * Main quests screen displaying user's active and completed quests.
 * Features quest creation, filtering by status, and progress tracking.
 * Each quest shows difficulty, description, progress bar, and XP rewards.
 */

import React, { useState } from "react";
import { router } from "expo-router";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable, ActivityIndicator, Button } from "react-native";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { MaterialIcons } from "@expo/vector-icons";
import { Quest } from "@/api/endpoints";
import { useQuests } from "@/lib/quest-context";
import QuickActionButton from "@/components/QuickActionButton";
import CreateQuestModal from "@/components/popupModals/CreateQuestModal";

// ============================================================================
// Types
// ============================================================================

type FilterType = "inprogress" | "completed";

// ============================================================================
// Component
// ============================================================================

const QuestScreen = () => {
  const {
    loading,
    error,
    creating,
    createNewQuest,
    refreshQuests,
    getInProgressQuests,
    getCompletedQuests,
    calculateProgress,
    getQuestDescription,
  } = useQuests();

  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>("inprogress");

  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Create new quest with selected difficulty
  const handleCreateQuest = async (difficulty: "Easy" | "Medium" | "Hard") => {
    try {
      await createNewQuest(difficulty);
    } catch (err) {
      throw err;
    }
  };

  // get filtered quests based on selected filter
  const filteredQuests =
    selectedFilter === "inprogress"
      ? getInProgressQuests()
      : getCompletedQuests();

  // Navigate to quest details screen
  const handleQuestPress = (questId: number) => {
    router.push({
      pathname: "/screens/QuestsTabs/detailsQuestsScreen",
      params: { questId: questId.toString() },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={[typography.body, { marginTop: 12 }]}>
          Loading quests...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={refreshQuests} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Quests</Text>
      </View>

      {/* create new quest button */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.newQuestButton}
          onPress={() => setCreateModalVisible(true)}
          disabled={creating}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="add-circle"
            size={24}
            color={colorPallet.neutral_darkest}
          />
          <Text style={styles.newQuestButtonText}>New Quest</Text>
        </TouchableOpacity>
      </View>

      {/* filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <FilterButton
          label="In Progress"
          isActive={selectedFilter === "inprogress"}
          onPress={() => setSelectedFilter("inprogress")}
        />
        <FilterButton
          label="Completed"
          isActive={selectedFilter === "completed"}
          onPress={() => setSelectedFilter("completed")}
        />
      </ScrollView>

      {/* quest cards */}
      <ScrollView
        style={styles.questsContainer}
        contentContainerStyle={styles.questsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredQuests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            progress={calculateProgress(quest)}
            description={getQuestDescription(quest)}
            onPress={() => handleQuestPress(quest.id)}
          />
        ))}

        {/* empty state */}
        {filteredQuests.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="search-off"
              size={64}
              color={colorPallet.neutral_4}
            />
            <Text style={styles.emptyText}>
              No {selectedFilter} quests at the moment
            </Text>
          </View>
        )}
      </ScrollView>

      {/* create quest modal */}
      <CreateQuestModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateQuest={handleCreateQuest}
        creating={creating}
      />

      <QuickActionButton />
    </View>
  );
};

// ============================================================================
// Filter Button Component
// ============================================================================

// filter button component
function FilterButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Quest Card Component
// ============================================================================

// individual quest card displaying difficulty, progress, and rewards
function QuestCard({
  quest,
  progress,
  description,
  onPress,
}: {
  quest: Quest;
  progress: number;
  description: string;
  onPress: () => void;
}) {

  // get color based on difficulty
  const getDifficultyColor = (): string => {
    switch (quest.difficulty.toLocaleLowerCase()) {
      case "easy":
        return colorPallet.primary;
      case "medium":
        return colorPallet.secondary;
      case "hard":
        return colorPallet.critical;
      default:
        return colorPallet.secondary
    }
  };
  //calculate reward based on difficulty
  const getReward = (): number => {
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

  //progress bar progression
  const getProgressColor = () => {
    if (quest.status === "completed") return colorPallet.primary;
    if (progress >= 50) return colorPallet.primary;
    return colorPallet.secondary;
  };

  return (
    <Pressable
      style={[
        styles.questCard,
        { borderColor: getDifficultyColor() }
      ]}
      onPress={onPress}
    >
      <View style={styles.questCardContent}>
        {/* difficulty */}
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor() }
          ]}
        >
          <Text style={styles.difficultyText}>
            {quest.difficulty.toUpperCase()}
          </Text>
        </View>

        {/* quest title */}
        <Text style={styles.questTitle}>{quest.name}</Text>

        {/* quest description */}
        <Text style={styles.questDescription}>{description}</Text>

        {/* reward */}
        <Text style={styles.questReward}>Reward: +{getReward()} XP</Text>

        {/* progress text */}
        <Text style={styles.progressText}>
          {quest.number_of_workouts_completed} /{" "}
          {quest.number_of_workouts_needed} workouts completed
        </Text>

        {/* progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Chevron */}
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={colorPallet.neutral_4}
      />
    </Pressable>
  );
}

// ============================================================================
// Styles
// ============================================================================

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
    backgroundColor: colorPallet.neutral_darkest,
  },
  errorText: {
    ...typography.body,
    color: colorPallet.critical,
    marginBottom: 16,
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    ...typography.h1,
    color: colorPallet.primary,
    fontSize: 32,
    fontWeight: "800",
  },

  // create quest button
  createButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  newQuestButton:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colorPallet.primary,
  },
  newQuestButtonText: {
    color: colorPallet.neutral_darkest,
    fontSize: 16,
    fontWeight: "700"
  },

  // filter button
  filterContainer: {
    maxHeight: 40,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 1,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colorPallet.neutral_6,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colorPallet.primary,
  },
  filterButtonText: {
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    fontWeight: "700",
  },
  filterButtonTextActive: {
    color: colorPallet.neutral_darkest,
    fontWeight: "700",
  },

  // quest list
  questsContainer: {
    flex: 1,
  },
  questsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // quest card
  questCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colorPallet.neutral_5,
  },
  questCardContent: {
    flex: 1,
    gap: 4,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  difficultyText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  questTitle: {
    ...typography.h2,
    color: colorPallet.secondary,
    fontSize: 18,
    fontWeight: "700",
  },
  questDescription: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    lineHeight: 20,
  },
  questReward: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    marginTop: 2,
  },
  progressText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    marginTop: 2,
  },

  // progress bar
  progressBarContainer: {
    height: 8,
    backgroundColor: colorPallet.neutral_4,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  // empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },
});

export default QuestScreen;
