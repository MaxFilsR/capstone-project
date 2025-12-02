/**
 * Onboarding Module
 * 
 * Manages the user onboarding process including character class selection
 * and initial profile setup. Must be completed after sign up before
 * accessing main application features.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Character class definition with base stats
 */
export type CharacterClass = {
  id: number;
  name: string;
  stats: {
    strength: number;
    endurance: number;
    flexibility: number;
  };
};

/**
 * Request payload for completing user onboarding
 */
export type OnboardingRequest = {
  first_name: string;
  last_name: string;
  class_id: number;
  workout_schedule: boolean[];
  username: string;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Retrieve all available character classes
 */
export async function getClasses(): Promise<CharacterClass[]> {
  const response = await apiClient.post("/constants/classes");
  return response.data.classes;
}

/**
 * Submit user onboarding information
 */
export async function submitOnboarding(
  payload: OnboardingRequest
): Promise<void> {
  const response = await apiClient.post("/onboarding", payload);
  return response.data;
}