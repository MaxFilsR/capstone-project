import React, { useState } from "react";
import { router } from "expo-router";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable, } from "react-native";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";

type QuestStatus = "active" | "inactive" | "completed";

type Quest = {
  id: string;
  title: string;
  description: string;
  reward: {
    xp: number;
    statBonus?: string;
  };
  progress: number; // 0-100
  status: QuestStatus;
  expiresAt?: string;
};

// sample quests TAYTA NAA KAIKKI
const sampleQuests: Quest[] = [
  {
    id: "1",
    title: "The Iron Trial",
    description: "Complete 4 strength workouts",
    reward: {
      xp: 200,
      statBonus: "+4 Strength",
    },
    progress: 75,
    status: "active",
    expiresAt: "December 12th",
  },
  {
    id: "2",
    title: "The Early Bird",
    description: "Log a workout before 9 AM on 3 different days",
    reward: {
      xp: 400,
      statBonus: "+3 Discipline",
    },
    progress: 60,
    status: "active",
    expiresAt: "January 1st"
  },
  {
    id: "3",
    title: "Path of the Unknown",
    description: "Log a workout type you've never tried before",
    reward: {
      xp: 100,
      statBonus: "+4 Strength",
    },
    progress: 40,
    status: "active",
    expiresAt: "December 3rd"
  },
  {
    id: "4",
    title: "The Mountain of Endurance",
    description: "Complete 3 cardio sessions this week",
    reward: {
      xp: 200,
      statBonus: "+3 Endurance",
    },
    progress: 50,
    status: "active",
    expiresAt: "December 18th"
  },
  {
    id: "5",
    title: "The Zen Mind",
    description: "Log atleast 3 hours yoga, pilates or stretching",
    reward: {
      xp: 200,
      statBonus: "+4 Flexibility",
    },
    progress: 45,
    status: "active",
    expiresAt: "November 21st"
  },
  {
    id: "6",
    title: "Marathon of Heroes",
    description: "Do atleast 240 minutes of cardio in a week",
    reward: {
      xp: 200,
      statBonus: "+2 Endurance",
    },
    progress: 45,
    status: "active",
    expiresAt: "November 10st"
  },
];

type FilterType = "all" | "active"| "inactive" | "completed";

const DailyQuestsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  // filter quests based on selected filter
  const filteredQuests = sampleQuests.filter((quest) => {
    if (selectedFilter === "all") return true;
    return quest.status === selectedFilter;
  });

  const handleQuestPress = (questId: string) => {
    // go to quest detail page
    router.push({
      pathname: "/screens/QuestsTabs/detailsQuestsScreen",
      params: { questId },
    });
  };

  // tulevalle uus quest
  const handleCreateQuest = () => {
    // go to create quest screen
    console.log("Create new quest pressed");
  };

  return (
    <View style={styles.container}>
      {/* header w/ add button */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Quests</Text>

        {/* + Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateQuest}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+</Text>
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
          label="All Quests"
          isActive={selectedFilter === "all"}
          onPress={() => setSelectedFilter("all")}
        />
        <FilterButton
          label="Active"
          isActive={selectedFilter === "active"}
          onPress={() => setSelectedFilter("active")}
        />
        <FilterButton
          label="All Inactive"
          isActive={selectedFilter === "inactive"}
          onPress={() => setSelectedFilter("inactive")}
        />
        <FilterButton
          label="All Completed"
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
            onPress={() => handleQuestPress(quest.id)}
          />
        ))}

        {filteredQuests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {selectedFilter} quests at the moment
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

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
        style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// quest card component
function QuestCard({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  // progress bar color based on status
  const getProgressColor = () => {
    if (quest.status === "completed") return colorPallet.primary;
    if (quest.progress >= 50) return colorPallet.primary;
    return colorPallet.secondary;
  };

  return (
    <Pressable style={styles.questCard} onPress={onPress}>
      <View style={styles.questCardContent}>
        {/* title */}
        <Text style={styles.questTitle}>{quest.title}</Text>

        {/* description */}
        <Text style={styles.questDescription}>{quest.description}</Text>

        {/* expiry date */}
        {quest.expiresAt && (
          <Text style={styles.questExpiry}>Expires: {quest.expiresAt}</Text>
        )}

        {/* reward */}
        <Text style={styles.questReward}>
          Reward: +{quest.reward.xp} XP
          {quest.reward.statBonus && `, ${quest.reward.statBonus}`}
        </Text>

        {/* progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${quest.progress}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingTop: 50,
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
    fontWeight: "800"
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addButtonText: {
    color: colorPallet.secondary,
    fontSize: 30,
    fontWeight: "600",
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
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  questCardContent: {
    gap: 4,
  },
  questTitle: {
    ...typography.h2,
    color: colorPallet.secondary,
    fontSize: 18,
    fontWeight: "700",
    //marginBottom: 2,
  },
  questDescription: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    lineHeight: 20,
  },
  questExpiry: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    fontStyle: "italic",
  },
  questReward: {
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
    fontSize: 16
  },
});

export default DailyQuestsScreen;