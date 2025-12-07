/**
 * Inventory Module
 * 
 * Manages inventory items including fetching item metadata, reconstructing
 * images from binary data, and equipping/unequipping items. Handles the
 * conversion of backend item data to client-ready format.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Item category types from backend
 */
export type ItemCategory = 
  | "arms" 
  | "backgrounds" 
  | "bodies" 
  | "heads" 
  | "head_accessories" 
  | "pets" 
  | "weapons";

/**
 * Item rarity levels
 */
export type ItemRarity = "common" | "rare" | "epic" | "legendary";

/**
 * Raw item data from backend including binary image data
 */
export type ItemData = {
  id: number;
  name: string;
  category: string;
  rarity: string;
  bytes: number[]; // PNG as array of bytes
};

/**
 * Request payload for fetching items by IDs
 */
export type GetItemsRequest = {
  ids: number[];
};

/**
 * Response structure for fetching items
 */
export type GetItemsResponse = {
  items: ItemData[];
};

/**
 * Complete inventory structure
 */
export type Inventory = {
  arms: number[];
  backgrounds: number[];
  bodies: number[];
  heads: number[];
  head_accessories: number[];
  pets: number[];
  weapons: number[];
};

/**
 * Equipped items structure
 */
export type EquippedItems = {
  arms: number;
  background: number;
  bodies: number;
  head: number;
  head_accessory: number | null;
  pet: number | null;
  weapon: number | null;
};

/**
 * Request payload for updating inventory (equip/unequip)
 */
export type UpdateInventoryRequest = {
  inventory: Inventory;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert binary PNG data (array of bytes) to base64 data URI
 * 
 * Takes the raw byte array from the backend and converts it into a
 * data URI that can be used directly in React Native Image components.
 */
export function reconstructPngImage(binaryData: number[]): string {
  // Convert array of bytes to Uint8Array
  const uint8Array = new Uint8Array(binaryData);
  
  // Convert Uint8Array to binary string
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  
  // Encode binary string to base64
  const base64 = btoa(binary);
  
  // Return as data URI
  return `data:image/png;base64,${base64}`;
}

/**
 * Get all unique item IDs from character inventory and equipped items
 */
export function getAllItemIds(
  inventory: Inventory,
  equipped: EquippedItems
): number[] {
  const ids = new Set<number>();

  // Add all inventory items
  Object.values(inventory).forEach(items => {
    items.forEach(id => ids.add(id));
  });

  // Add all equipped items
  Object.values(equipped).forEach(id => {
    if (id !== null) ids.add(id);
  });

  return Array.from(ids);
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch items by their IDs
 * 
 * Uses POST request with JSON body (actix-web's web::Json works best with POST)
 */
export async function getItems(
  payload: GetItemsRequest
): Promise<GetItemsResponse> {
  const { data } = await apiClient.post<GetItemsResponse>('/constants/items', payload);
  return data;
}

/**
 * Update character inventory (used for equip/unequip operations)
 * 
 * Sends the entire inventory object to the backend via PUT request
 */
export async function updateInventory(inventory: Inventory): Promise<void> {
  await apiClient.put("/character/inventory", { inventory });
}