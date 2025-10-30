import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWorkoutLibrary, Exercise } from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";

const CACHE_KEY = "workout_library_cache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Cross-platform cache helpers
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

// Context type
type WorkoutLibraryContextType = {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const WorkoutLibraryContext = createContext<WorkoutLibraryContextType>({
  exercises: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

export const useWorkoutLibrary = () => useContext(WorkoutLibraryContext);

export const WorkoutLibraryProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    if (!user) {
      setExercises([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 🚫 TEMPORARILY DISABLE CACHE FOR TESTING
      const SKIP_CACHE = false; // Set to false to re-enable

      if (!SKIP_CACHE) {
        // Try cache first
        const cachedStr = await getCache(CACHE_KEY);
        if (cachedStr) {
          const { data, timestamp } = JSON.parse(cachedStr);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log("Using fresh cache");
            setExercises(data);
            setLoading(false);
            return;
          }
        }
      } else {
        console.log("⚠️ CACHE DISABLED FOR TESTING");
      }

      console.log("Fetching from API...");
      // Fetch from API
      const data = await getWorkoutLibrary();
      console.log("Success! Got", data?.length, "exercises");

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
      console.error("=== Fetch Failed ===");
      console.error("Status:", err?.response?.status);
      console.error("Response data:", err?.response?.data);

      setError(err?.message || "Failed to load exercises. Please try again.");
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

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
