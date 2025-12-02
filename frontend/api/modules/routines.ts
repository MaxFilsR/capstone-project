/**
 * Routines Module
 * 
 * Manages workout routine CRUD operations. Routines are pre-planned workout
 * templates that users can save and reuse. Each routine contains a set of
 * exercises with predefined sets, reps, and weights.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Exercise definition within a workout routine
 */
export type RoutineExercise = {
  id: string;
  sets: number;
  reps: number;
  weight: number;
  distance: number;
};

/**
 * Request payload for creating a new workout routine
 */
export type CreateRoutineRequest = {
  name: string;
  exercises: RoutineExercise[];
};

/**
 * Response data from successful routine creation
 */
export type CreateRoutineResponse = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
};

/**
 * Request payload for updating an existing routine
 */
export type UpdateRoutineRequest = {
  id: number;
  name: string;
  exercises: RoutineExercise[];
};

/**
 * Response data from successful routine update
 */
export type UpdateRoutineResponse = {
  id: number;
  name: string;
  exercises: RoutineExercise[];
};

/**
 * Request payload for deleting a routine
 */
export type DeleteRoutineRequest = {
  id: number;
};

/**
 * Response data from successful routine deletion
 */
export type DeleteRoutineResponse = {
  success: boolean;
};

/**
 * Routine data structure returned by the API
 */
export type RoutineResponse = {
  id?: number;
  name: string;
  exercises: RoutineExercise[];
};

/**
 * Response structure for fetching all routines
 */
export type GetRoutinesResponse = {
  routines: RoutineResponse[];
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new workout routine
 */
export async function createRoutine(
  payload: CreateRoutineRequest
): Promise<CreateRoutineResponse> {
  const response = await apiClient.post("/workout/routines", payload);
  return response.data;
}

/**
 * Update an existing workout routine
 */
export async function updateRoutine(
  payload: UpdateRoutineRequest
): Promise<UpdateRoutineResponse> {
  const { data } = await apiClient.put<UpdateRoutineResponse>(
    "/workout/routines",
    payload
  );
  return data;
}

/**
 * Delete a workout routine
 */
export async function deleteRoutine(
  payload: DeleteRoutineRequest
): Promise<void> {
  await apiClient.delete("/workout/routines", { data: payload });
}

/**
 * Fetch all workout routines for the authenticated user
 */
export async function getRoutines(): Promise<GetRoutinesResponse> {
  const { data } = await apiClient.get<GetRoutinesResponse>(
    "/workout/routines"
  );
  return data;
}