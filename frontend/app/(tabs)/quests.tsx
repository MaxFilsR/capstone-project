import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Button,
} from "react-native";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { MaterialIcons } from "@expo/vector-icons";
import { getQuests, Quest } from "@/api/endpoints";

type FilterType = "active" | "inactive" | "completed";

const DailyQuestsScreen = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("active");

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const data = await getQuests();
      setQuests(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load quests:", err);
      setError("Failed to load quests");
    } finally {
      setLoading(false);
    }
  };

  // calculate progress percentage
  const calculateProgress = (quest: Quest): number => {
    if (quest.number_of_workouts_needed === 0) return 0;
    const progress =
      (quest.number_of_workouts_completed / quest.number_of_workouts_needed) *
      100;
    return Math.min(progress, 100);
  };

  // filter quest
  const filteredQuests = quests.filter((quest) => {
    return quest.status === selectedFilter;
  });

  // format quest description based on requitements
  const getQuestDescription = (quest: Quest): string => {
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
        <Button title="Retry" onPress={loadQuests} />
      </View>
    );
  }


/*
type Quest = {
  id: string;
  title: string;
  description: string;
  reward: {
    xp: number;
  };
  progress: number; // 0-100
  status: QuestStatus;
  expiresAt?: string;
};
*/
// sample quests
/*
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
  },
  {
    id: "2",
    title: "The Early Bird",
    description: "Log a workout before 9 AM",
    reward: {
      xp: 400,
    },
    progress: 100,
    status: "active",
    expiresAt: "January 1st",
  },
  {
    id: "3",
    title: "Path of the Unknown",
    description: "Log a new type of workout",
    reward: {
      xp: 100,
    },
    progress: 40,
    status: "active",
    expiresAt: "December 3rd",
  },
  {
    id: "4",
    title: "The Mountain of Endurance",
    description: "Complete 3 cardio sessions this week",
    reward: {
      xp: 200,
    },
    progress: 50,
    status: "active",
    expiresAt: "December 18th",
  },
  {
    id: "5",
    title: "The Zen Mind",
    description: "Log atleast 3 hours yoga, pilates or stretching",
    reward: {
      xp: 200,
    },
    progress: 45,
    status: "active",
    expiresAt: "November 21st",
  },
  {
    id: "6",
    title: "Marathon of Heroes",
    description: "Do atleast 240 minutes of cardio in a week",
    reward: {
      xp: 200,
    },
    progress: 45,
    status: "active",
    expiresAt: "November 10st",
  },
];
*/

/*

const DailyQuestsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("active");

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
*/
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Quests</Text>
      </View>

      {/* filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <FilterButton
          label="Active"
          isActive={selectedFilter === "active"}
          onPress={() => setSelectedFilter("active")}
        />
        <FilterButton
          label="Inactive"
          isActive={selectedFilter === "inactive"}
          onPress={() => setSelectedFilter("inactive")}
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


/*
// quest card component
function QuestCard({ quest, onPress }: { quest: Quest; onPress: () => void }) {
  // progress bar color based on status
  const getProgressColor = () => {
    if (quest.status === "completed") return colorPallet.primary;
    if (quest.progress >= 50) return colorPallet.primary;
    return colorPallet.secondary;
  };*/

  return (
    <Pressable style={styles.questCard} onPress={onPress}>
      <View style={styles.questCardContent}>
        { /* difficulty */}
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            {quest.difficulty.toUpperCase()}
          </Text>
        </View>

        {/* title */}
        <Text style={styles.questTitle}>{quest.name}</Text>

        {/* description */}
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
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  questCardContent: {
    flex: 1,
    gap: 4,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    backgroundColor: colorPallet.secondary,
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

  /*questReward: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    marginTop: 2,
  },
  */

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

export default DailyQuestsScreen;
