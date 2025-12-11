/**
 * Quest Context
 * 
 * Manages quest system state and provides quest-related operations throughout
 * the application. Handles fetching quests, creating new quests, and provides
 * helper methods for filtering, calculating progress, and formatting quest
 * descriptions. Automatically loads quests on mount.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { getQuests, createQuest, Quest } from "@/api/endpoints";

// ============================================================================
// Types
// ============================================================================

/**
 * Context value providing quest state and management methods
 */
type QuestContextType = {
  quests: Quest[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  fetchQuests: () => Promise<Quest[]>;
  createNewQuest: (difficulty: "Easy" | "Medium" | "Hard") => Promise<void>;
  getInProgressQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
  getQuestById: (id: number) => Quest | undefined;
  refreshQuests: () => Promise<Quest[]>;
  calculateProgress: (quest: Quest) => number;
  getQuestDescription: (quest: Quest) => string;
};

// ============================================================================
// Context
// ============================================================================

const QuestContext = createContext<QuestContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Quest Provider component that wraps the app
 */
export const QuestProvider = ({ children }: { children: ReactNode }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  /**
   * Fetch all quests from API and update state
   */
  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuests();
      setQuests(data);
      return data;
    } catch (err) {
      console.error("Failed to load quests:", err);
      setError("Failed to load quests");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new quest with specified difficulty
   */
const createNewQuest = useCallback(
  async (difficulty: "Easy" | "Medium" | "Hard") => {
    try {
      setCreating(true);
      setError(null);
      await createQuest({ difficulty });
      await fetchQuests();
    } catch (err: any) {
      console.error("Failed to create quest:", err);
      
      // More specific error messages
      if (err.code === 'ECONNABORTED') {
        setError("Request timed out. Please try again.");
      } else if (err.message === 'Network Error') {
        setError("Network connection failed. Check your internet.");
      } else {
        setError("Failed to create quest. Please try again.");
      }
      
      throw err;
    } finally {
      setCreating(false);
    }
  },
  [fetchQuests]
);

  /**
   * Get all in-progress quests (status: Incomplete)
   */
  const getInProgressQuests = useCallback(() => {
    const inProgress = quests.filter((quest) => quest.status === "Incomplete");
    console.log("In Progress quests:", inProgress.length, inProgress);
    return inProgress;
  }, [quests]);

  /**
   * Get all completed quests (status: Complete)
   */
  const getCompletedQuests = useCallback(() => {
    const completed = quests.filter((quest) => quest.status === "Complete");
    return completed;
  }, [quests]);

  /**
   * Find a specific quest by ID
   */
  const getQuestById = useCallback(
    (id: number) => {
      return quests.find((quest) => quest.id === id);
    },
    [quests]
  );

  /**
   * Calculate quest completion progress as percentage
   */
  const calculateProgress = useCallback((quest: Quest): number => {
    if (quest.number_of_workouts_needed === 0) return 0;
    const progress =
      (quest.number_of_workouts_completed / quest.number_of_workouts_needed) *
      100;
    return Math.min(progress, 100);
  }, []);

  /**
   * Generate formatted quest description with all requirements
   */
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

  /**
   * Refresh quests from API
   */
  const refreshQuests = useCallback(async () => {
    return await fetchQuests();
  }, [fetchQuests]);

  /**
   * Load quests on mount
   */
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

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access quest context
 */
export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error("useQuests must be used within a QuestProvider");
  }
  return context;
};