/**
 * Character Module
 * 
 * Manages character profile data including equipment, inventory, stats,
 * and progression. Provides access to the authenticated user's character
 * information.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Currently equipped items for character customization
 */
export type CharacterEquipment = {
  arms: number;
  background: number;
  bodies: number;
  head: number;
  head_accessory: number;
  pet: number;
  weapon: number;
};

/**
 * Collection of owned items available for equipping
 */
export type CharacterInventory = {
  arms: number[];
  backgrounds: number[];
  bodies: number[];
  heads: number[];
  head_accessories: number[];
  pets: number[];
  weapons: number[];
};

/**
 * Complete character profile for the authenticated user
 */
export type CharacterProfile = {
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
  pending_stat_points: number;
  streak: number;
  coins: number;
  equipped: CharacterEquipment;
  inventory: CharacterInventory;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch the authenticated user's character profile
 */
export async function getCharacter(): Promise<CharacterProfile> {
  const response = await apiClient.get("/character");
  return response.data;
}