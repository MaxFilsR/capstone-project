/**
 * Stats Module
 * 
 * Manages character stat allocation. Users earn stat points through leveling
 * up and can spend them to increase their character's core attributes.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Available stat types for character progression
 */
export type StatType = "strength" | "endurance" | "flexibility";

/**
 * Request payload for increasing a character stat
 */
export type IncreaseStatRequest = {
  stat: StatType;
  amount: number;
};

/**
 * Response data confirming stat increase
 */
export type IncreaseStatResponse = {
  stat: StatType;
  amount: number;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Increase a specific stat by allocating points
 */
export async function increaseStat(
  payload: IncreaseStatRequest
): Promise<IncreaseStatResponse> {
  const response = await apiClient.post<IncreaseStatResponse>(
    "/stats/increase",
    payload
  );
  return response.data;
}