/**
 * Shop Context
 *
 * Manages shop state including available items, purchasing, and shop refresh.
 * Follows similar pattern to inventory-context for consistency.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ImageSourcePropType } from "react-native";
import { useAuth } from "./auth-context";
import {
  getShopItems,
  refreshShop,
  buyShopItem,
  ShopItem as BackendShopItem,
  ItemRarity,
} from "@/api/modules/shop";
import { getItems, reconstructPngImage } from "@/api/modules/inventory";

// ============================================================================
// Types
// ============================================================================

export type ShopItem = {
  id: string;
  name: string;
  category: string;
  rarity: ItemRarity;
  price: number;
  image: ImageSourcePropType;
};

type ShopContextType = {
  shopItems: ShopItem[];
  isLoading: boolean;
  error: string | null;
  purchaseItem: (itemId: string) => Promise<{ success: boolean; remainingCoins?: number; error?: string }>;
  refreshShopItems: () => Promise<void>;
  loadShop: () => Promise<void>;
};

// ============================================================================
// Context
// ============================================================================

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map backend category to display-friendly name
 */
function mapCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    'head_accessories': 'Accessory',
    'head_accessory': 'Accessory',
    'backgrounds': 'Background',
    'background': 'Background',
    'bodies': 'Body',
    'body': 'Body',
    'arms': 'Arms',
    'arm': 'Arms',
    'heads': 'Head',
    'head': 'Head',
    'weapons': 'Weapon',
    'weapon': 'Weapon',
    'pets': 'Pet',
    'pet': 'Pet',
  };

  return categoryMap[category.toLowerCase()] || category;
}

/**
 * Convert backend shop item to frontend shop item with image
 */
async function convertShopItem(backendItem: BackendShopItem): Promise<ShopItem> {
  try {
    // Fetch item image data
    const { items } = await getItems({ ids: [backendItem.id] });
    const itemData = items[0];

    if (!itemData) {
      throw new Error(`Item ${backendItem.id} not found`);
    }

    const imageUri = reconstructPngImage(itemData.bytes);

    return {
      id: backendItem.id.toString(),
      name: backendItem.name,
      category: mapCategoryName(backendItem.category),
      rarity: backendItem.rarity,
      price: backendItem.price,
      image: { uri: imageUri },
    };
  } catch (err) {
    console.error(`[Shop Context] Failed to convert item ${backendItem.id}:`, err);

    // Return fallback item without image
    return {
      id: backendItem.id.toString(),
      name: backendItem.name,
      category: mapCategoryName(backendItem.category),
      rarity: backendItem.rarity,
      price: backendItem.price,
      image: require("@/assets/images/gainz_logo_full.png"), // Fallback image
    };
  }
}

// ============================================================================
// Provider Component
// ============================================================================

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load shop items from backend
   */
  const loadShop = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const backendItems = await getShopItems();

      // Convert all items with images
      const convertedItems = await Promise.all(
        backendItems.map(item => convertShopItem(item))
      );

      setShopItems(convertedItems);
    } catch (err) {
      console.error("[Shop Context] Failed to load shop:", err);
      setError(err instanceof Error ? err.message : "Failed to load shop");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manually refresh shop with new items
   */
  const refreshShopItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await refreshShop();

      // Reload shop items after refresh
      await loadShop();
    } catch (err) {
      console.error("[Shop Context] Failed to refresh shop:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh shop");
      setIsLoading(false);
    }
  };

  /**
   * Purchase an item from the shop
   */
  const purchaseItem = async (itemId: string): Promise<{ success: boolean; remainingCoins?: number; error?: string }> => {
    try {
      setError(null);

      const result = await buyShopItem(parseInt(itemId));

      // Reload shop to update available items
      await loadShop();

      return {
        success: true,
        remainingCoins: result.remaining_coins,
      };
    } catch (err: any) {
      console.error("[Shop Context] Failed to purchase item:", err);

      let errorMessage = "Failed to purchase item";

      // Handle specific error cases
      if (err.response?.status === 400) {
        if (err.response.data?.includes?.("Insufficient")) {
          errorMessage = "Not enough coins";
        } else if (err.response.data?.includes?.("Already owned")) {
          errorMessage = "You already own this item";
        }
      } else if (err.response?.status === 404) {
        errorMessage = "Item not found";
      }

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Load shop on mount and when user changes
   */
  useEffect(() => {
    if (user) {
      loadShop();
    }
  }, [user?.profile?.username]);

  return (
    <ShopContext.Provider
      value={{
        shopItems,
        isLoading,
        error,
        purchaseItem,
        refreshShopItems,
        loadShop,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return context;
}