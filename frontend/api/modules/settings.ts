/**
 * Settings Module
 *
 * Manages user settings including username, email, name, workout schedule,
 * and character class updates. All endpoints require authentication.
 *
 * Note: Password change endpoint not yet implemented in backend.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

export type UpdateUsernameRequest = {
  username: string;
};

export type UpdateNameRequest = {
  first_name: string;
  last_name: string;
};

export type UpdateWorkoutScheduleRequest = {
  workout_schedule: boolean[];
};

export type UpdateEmailRequest = {
  email: string;
};

export type UpdateClassRequest = {
  class_id: number;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Update user's username
 */
export async function updateUsername(
  payload: UpdateUsernameRequest
): Promise<void> {
  await apiClient.post("/settings/username", payload);
}

/**
 * Update user's first and last name
 */
export async function updateName(payload: UpdateNameRequest): Promise<void> {
  await apiClient.post("/settings/name", payload);
}

/**
 * Update user's workout schedule
 */
export async function updateWorkoutSchedule(
  payload: UpdateWorkoutScheduleRequest
): Promise<void> {
  await apiClient.post("/settings/workout-schedule", payload);
}

/**
 * Update user's email address
 */
export async function updateEmail(payload: UpdateEmailRequest): Promise<void> {
  await apiClient.post("/settings/email", payload);
}

/**
 * Update user's character class
 */
export async function updateClass(payload: UpdateClassRequest): Promise<void> {
  await apiClient.post("/settings/class", payload);
}