/**
 * Workout Library Context
 * 
 * Manages the exercise library state with cross-platform caching support.
 * Fetches and caches exercise data for 7 days to reduce API calls and improve
 * performance. Automatically loads exercises when user is authenticated.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWorkoutLibrary, Exercise } from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";

// ============================================================================
// Constants
// ============================================================================

const CACHE_KEY = "workout_library_cache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// ============================================================================
// Cache Helpers
// ============================================================================

/**
 * Get cached value from storage (cross-platform)
 */
const getCache = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn("localStorage not available:", err);
      return null;
    }
  } else {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.warn("AsyncStorage error:", err);
      return null;
    }
  }
};

/**
 * Set cached value in storage (cross-platform)
 */
const setCache = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn("localStorage not available:", err);
    }
  } else {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn("AsyncStorage error:", err);
    }
  }
};

// ============================================================================
// Types
// ============================================================================

/**
 * Context value providing workout library state and methods
 */
type WorkoutLibraryContextType = {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

// ============================================================================
// Context
// ============================================================================

const WorkoutLibraryContext = createContext<WorkoutLibraryContextType>({
  exercises: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Workout Library Provider component that wraps the app
 */
export const WorkoutLibraryProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch exercises from cache or API
   */
  const fetchExercises = async () => {
    if (!user) {
      setExercises([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cachedStr = await getCache(CACHE_KEY);
      if (cachedStr) {
        const { data, timestamp } = JSON.parse(cachedStr);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setExercises(data);
          setLoading(false);
          return;
        }
      }

      const data = await getWorkoutLibrary();

      if (Array.isArray(data)) {
        setExercises(data);
        await setCache(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } else {
        setExercises([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch workout library:", err);
      setError(err?.message || "Failed to load exercises. Please try again.");
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load exercises when user authentication changes
   */
  useEffect(() => {
    fetchExercises();
  }, [user]);

  return (
    <WorkoutLibraryContext.Provider
      value={{ exercises, loading, error, refresh: fetchExercises }}
    >
      {children}
    </WorkoutLibraryContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access workout library context
 */
export const useWorkoutLibrary = () => useContext(WorkoutLibraryContext);