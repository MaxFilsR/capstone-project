import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWorkoutLibrary, Exercise } from "@/api/endpoints";

const CACHE_KEY = "workout_library_cache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from cache
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < CACHE_DURATION) {
          setExercises(data);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh
      const data = await getWorkoutLibrary();
      if (Array.isArray(data)) {
        setExercises(data);
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } else {
        setExercises([]);
      }
    } catch (err) {
      console.error("Failed to fetch workout library:", err);
      setError("Failed to load exercises. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  return (
    <WorkoutLibraryContext.Provider
      value={{ exercises, loading, error, refresh: fetchExercises }}
    >
      {children}
    </WorkoutLibraryContext.Provider>
  );
};
