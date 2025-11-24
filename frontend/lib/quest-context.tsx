import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { getQuests, createQuest, Quest } from "@/api/endpoints";

type QuestContextType = {
  quests: Quest[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  fetchQuests: () => Promise<void>;
  createNewQuest: (difficulty: "Easy" | "Medium" | "Hard") => Promise<void>;
  getInProgressQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
  getQuestById: (id: number) => Quest | undefined;
  refreshQuests: () => Promise<void>;
  calculateProgress: (quest: Quest) => number;
  getQuestDescription: (quest: Quest) => string;
};

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const QuestProvider = ({ children }: { children: ReactNode }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Fetch quests from API
  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuests();
      setQuests(data);
    } catch (err) {
      console.error("❌ Failed to load quests:", err);
      setError("Failed to load quests");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new quest
  const createNewQuest = useCallback(
    async (difficulty: "Easy" | "Medium" | "Hard") => {
      try {
        setCreating(true);
        setError(null);
        await createQuest({ difficulty });
        // Refresh quests after creation
        await fetchQuests();
      } catch (err) {
        console.error("Failed to create quest:", err);
        setError("Failed to create quest");
        throw err; // Re-throw so caller can handle if needed
      } finally {
        setCreating(false);
      }
    },
    [fetchQuests]
  );

  // Helper: Get in-progress quests (Incomplete status)
  const getInProgressQuests = useCallback(() => {
    const inProgress = quests.filter((quest) => quest.status === "Incomplete");
    console.log("🎯 In Progress quests:", inProgress.length, inProgress);
    return inProgress;
  }, [quests]);

  // Helper: Get completed quests
  const getCompletedQuests = useCallback(() => {
    const completed = quests.filter((quest) => quest.status === "Complete");

    return completed;
  }, [quests]);

  // Helper: Get quest by ID
  const getQuestById = useCallback(
    (id: number) => {
      return quests.find((quest) => quest.id === id);
    },
    [quests]
  );

  // Helper: Calculate quest progress percentage
  const calculateProgress = useCallback((quest: Quest): number => {
    if (quest.number_of_workouts_needed === 0) return 0;
    const progress =
      (quest.number_of_workouts_completed / quest.number_of_workouts_needed) *
      100;
    return Math.min(progress, 100);
  }, []);

  // Helper: Format quest description
  const getQuestDescription = useCallback((quest: Quest): string => {
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
  }, []);

  // Refresh quests (alias for fetchQuests for clarity)
  const refreshQuests = useCallback(async () => {
    await fetchQuests();
  }, [fetchQuests]);

  // Load quests on mount
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  return (
    <QuestContext.Provider
      value={{
        quests,
        loading,
        error,
        creating,
        fetchQuests,
        createNewQuest,
        getInProgressQuests,
        getCompletedQuests,
        getQuestById,
        refreshQuests,
        calculateProgress,
        getQuestDescription,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

// Custom hook to use the quest context
export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error("useQuests must be used within a QuestProvider");
  }
  return context;
};
