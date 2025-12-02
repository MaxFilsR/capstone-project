/**
 * Workouts Module
 * 
 * Manages workout-related operations including exercise library access,
 * workout history tracking, and workout session recording. 
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Exercise definition from the workout library
 */
export type Exercise = {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
};

/**
 * Exercise performed during a workout session
 */
export type WorkoutExercise = {
  id: number;
  sets: number;
  reps: number;
  weight: number;
  distance: number;
};

/**
 * Complete workout session record
 */
export type WorkoutSession = {
  id: number;
  name: string;
  exercises: WorkoutExercise[];
  date: string;
  duration: number;
  points: number;
  coins: number;
};

/**
 * Request payload for recording a new workout
 */
export type RecordWorkoutRequest = {
  name: string;
  exercises: WorkoutExercise[];
  date: string;
  duration: number;
  points: number;
  coins: number;
};

/**
 * Response structure for workout history endpoint
 */
export type GetWorkoutHistoryResponse = {
  history: WorkoutSession[];
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all exercises from the workout library
 */
export async function getWorkoutLibrary(): Promise<Exercise[]> {
  const response = await apiClient.get("/workouts/library");
  let data = response.data;
  return data;
}

/**
 * Fetch details of a specific workout session by ID
 */
export async function getWorkoutById(id: string): Promise<WorkoutSession> {
  const response = await apiClient.get(`/workouts/history/${id}`);
  return response.data;
}

/**
 * Fetch workout history for the authenticated user
 */
export async function getWorkoutHistory(): Promise<WorkoutSession[]> {
  const response = await apiClient.get<GetWorkoutHistoryResponse>(
    "/workouts/history"
  );
  return response.data.history;
}

/**
 * Record a new workout session
 */
export async function recordWorkout(
  payload: RecordWorkoutRequest
): Promise<void> {
  await apiClient.post("/workouts/history", payload);
}