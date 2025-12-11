/**
 * Shop API Module
 *
 * Handles shop-related API calls including fetching shop items,
 * purchasing items, and manually refreshing the shop.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

/**
 * Item category from backend
 */
export type ItemCategory =
  | "backgrounds"
  | "bodies"
  | "arms"
  | "heads"
  | "head_accessories"
  | "weapons"
  | "pets";

/**
 * Item rarity from backend
 */
export type ItemRarity = "common" | "rare" | "epic" | "legendary";

/**
 * Shop item structure from backend
 */
export type ShopItem = {
  id: number;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  path: string;
  price: number;
};

/**
 * Response from shop refresh endpoint
 */
export type ShopRefreshResponse = {
  message: string;
  item_count: number;
};

/**
 * Response from shop buy endpoint
 */
export type ShopBuyResponse = {
  message: string;
  item_id: number;
  price: number;
  rarity: ItemRarity;
  remaining_coins: number;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get current shop items
 *
 * GET /shop
 */
export async function getShopItems(): Promise<ShopItem[]> {
  const response = await apiClient.get<ShopItem[]>("/shop");
  return response.data;
}

/**
 * Manually refresh shop with new random items
 *
 * PUT /shop/refresh
 */
export async function refreshShop(): Promise<ShopRefreshResponse> {
  const response = await apiClient.put<ShopRefreshResponse>("/shop/refresh");
  return response.data;
}

/**
 * Purchase an item from the shop
 *
 * POST /shop/buy
 */
export async function buyShopItem(itemId: number): Promise<ShopBuyResponse> {
  const response = await apiClient.post<ShopBuyResponse>("/shop/buy", {
    item_id: itemId,
  });
  return response.data;
}