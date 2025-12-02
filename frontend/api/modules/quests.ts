/**
 * Quests Module
 * 
 * Manages quest system operations including fetching active quests and
 * creating new quests. Quests are challenges that reward users for
 * completing specific workout goals.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Quest data structure representing a workout challenge
 */
export type Quest = {
  id: number;
  user_id: number;
  name: string;
  difficulty: string;
  status: string;
  number_of_workouts_needed: number;
  number_of_workouts_completed: number;
  workout_duration?: number;
  exercise_category?: string;
  exercise_muscle?: string;
};

/**
 * Response structure for fetching quests
 */
export type GetQuestsResponse = {
  quests: Quest[];
};

/**
 * Request payload for creating a new quest
 */
export type CreateQuestRequest = {
  difficulty: string;
};

/**
 * Response data from successful quest creation
 */
export type CreateQuestResponse = {
  name: string;
  difficulty: string;
  status: string;
  number_of_workouts_needed: number;
  number_of_workouts_completed: number;
  workout_duration?: number;
  exercise_category?: string;
  exercise_muscle?: string;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all quests for the authenticated user
 */
export async function getQuests(): Promise<Quest[]> {
  const response = await apiClient.get<GetQuestsResponse>("/quests");
  return response.data.quests;
}

/**
 * Create a new quest
 */
export async function createQuest(
  payload: CreateQuestRequest
): Promise<CreateQuestResponse> {
  const response = await apiClient.post<CreateQuestResponse>(
    "/quests",
    payload
  );
  return response.data;
}