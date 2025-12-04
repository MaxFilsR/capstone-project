/**
 * Inventory Context 
 * 
 * Manages character inventory and equipped items state with real backend data.
 * Handles fetching, caching, and synchronizing inventory state with the server.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ImageSourcePropType } from "react-native";
import { useAuth } from "./auth-context";
import { getCharacter } from "@/api/modules/character";
import {
  getItems,
  equipItem as apiEquipItem,
  unequipItem as apiUnequipItem,
  getAllItemIds,
  reconstructPngImage,
  ItemData,
  ItemCategory,
  ItemRarity,
} from "@/api/modules/inventory";

// ============================================================================
// Types
// ============================================================================

export type InventoryItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: "backgrounds" | "bodies" | "arms" | "heads" | "accessories" | "weapons" | "pets";
};

export type EquippedItems = {
  background: InventoryItem | null;
  body: InventoryItem | null;
  arms: InventoryItem | null;
  head: InventoryItem | null;
  headAccessory: InventoryItem | null;
  weapon: InventoryItem | null;
  pet: InventoryItem | null;
};

type InventoryContextType = {
  inventory: {
    backgrounds: InventoryItem[];
    bodies: InventoryItem[];
    arms: InventoryItem[];
    heads: InventoryItem[];
    accessories: InventoryItem[];
    weapons: InventoryItem[];
    pets: InventoryItem[];
  };
  equipped: EquippedItems;
  isLoading: boolean;
  error: string | null;
  equipItem: (item: InventoryItem) => Promise<void>;
  unequipItem: (slotName: keyof EquippedItems) => Promise<void>;
  isEquipped: (itemId: string) => boolean;
  refreshInventory: () => Promise<void>;
};

// ============================================================================
// Context
// ============================================================================

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// ============================================================================
// Empty Initial State
// ============================================================================

const EMPTY_INVENTORY = {
  backgrounds: [],
  bodies: [],
  arms: [],
  heads: [],
  accessories: [],
  weapons: [],
  pets: [],
};

const EMPTY_EQUIPPED: EquippedItems = {
  background: null,
  body: null,
  arms: null,
  head: null,
  headAccessory: null,
  weapon: null,
  pet: null,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map backend category to frontend category name
 */
function mapCategory(backendCategory: string): InventoryItem["category"] {
  const normalized = backendCategory.toLowerCase();
  
  const categoryMap: Record<string, InventoryItem["category"]> = {
    'head_accessories': 'accessories',
    'head_accessory': 'accessories',
    'accessories': 'accessories',
    'backgrounds': 'backgrounds',
    'background': 'backgrounds',
    'bodies': 'bodies',
    'body': 'bodies',
    'arms': 'arms',
    'arm': 'arms',
    'heads': 'heads',
    'head': 'heads',
    'weapons': 'weapons',
    'weapon': 'weapons',
    'pets': 'pets',
    'pet': 'pets',
  };
  
  return categoryMap[normalized] || 'accessories';
}

/**
 * Convert item data to InventoryItem
 */
function createInventoryItem(itemData: ItemData): InventoryItem {
  const imageUri = reconstructPngImage(itemData.bytes);
  
  // Map rarity, treating "default" as "common"
  let rarity: ItemRarity = itemData.rarity as ItemRarity;
  if (itemData.rarity === "default") {
    rarity = "common";
  }
  
  return {
    id: itemData.id.toString(),
    name: itemData.name,
    image: { uri: imageUri },
    rarity: rarity,
    category: mapCategory(itemData.category),
  };
}



// ============================================================================
// Provider Component
// ============================================================================

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [inventory, setInventory] = useState(EMPTY_INVENTORY);
  const [equipped, setEquipped] = useState<EquippedItems>(EMPTY_EQUIPPED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch and process inventory from backend
   */
  const refreshInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const characterData = await getCharacter();
      const itemIds = getAllItemIds(characterData.inventory, characterData.equipped);
      const { items } = await getItems({ ids: itemIds });

      // Create a map for quick lookup
      const itemMap = new Map<number, ItemData>();
      items.forEach(item => itemMap.set(item.id, item));

      // Helper to create inventory item from ID
      const createItem = (itemId: number): InventoryItem | null => {
        const itemData = itemMap.get(itemId);
        if (!itemData) return null;
        return createInventoryItem(itemData);
      };

      // Process inventory by category
      const processedInventory = {
        backgrounds: characterData.inventory.backgrounds
          .map(createItem)
          .filter((item): item is InventoryItem => item !== null),
        bodies: characterData.inventory.bodies
          .map(createItem)
          .filter((item): item is InventoryItem => item !== null),
        arms: characterData.inventory.arms
          .map(createItem)
          .filter((item): item is InventoryItem => item !== null),
        heads: characterData.inventory.heads
          .map(createItem)
          .filter((item): item is InventoryItem => item !== null),
        accessories: characterData.inventory.head_accessories
          .map(createItem)
          .filter((item): item is InventoryItem => item !== null),
        weapons: characterData.inventory.weapons
          .map(createItem)
          .filter((item): item is InventoryItem => item !== null),
        pets: characterData.inventory.pets
          .map(createItem)
          .filter((item): item is InventoryItem => item !== null),
      };

      // Process equipped items
      const processedEquipped: EquippedItems = {
        background: createItem(characterData.equipped.background) || null,
        body: createItem(characterData.equipped.body) || null,
        arms: createItem(characterData.equipped.arms) || null,
        head: createItem(characterData.equipped.head) || null,
        headAccessory: characterData.equipped.head_accessory
          ? createItem(characterData.equipped.head_accessory)
          : null,
        weapon: characterData.equipped.weapon
          ? createItem(characterData.equipped.weapon)
          : null,
        pet: characterData.equipped.pet
          ? createItem(characterData.equipped.pet)
          : null,
      };

      setInventory(processedInventory);
      setEquipped(processedEquipped);
    } catch (err) {
      console.error("[Inventory Context] Failed to load inventory:", err);
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load inventory on mount and when user changes
   */
  useEffect(() => {
    if (user) {
      refreshInventory();
    }
  }, [user?.profile?.username]);

  /**
   * Equip an item to the appropriate slot
   * 
   * TODO: Replace local state update with backend API call using apiEquipItem
   * when /character/equip endpoint is ready. Then call refreshInventory() to sync state.
   */
  const equipItem = async (item: InventoryItem) => {
    const slotMap: Record<InventoryItem["category"], keyof EquippedItems> = {
      backgrounds: "background",
      bodies: "body",
      arms: "arms",
      heads: "head",
      accessories: "headAccessory",
      weapons: "weapon",
      pets: "pet",
    };

    const slotName = slotMap[item.category];
    if (!slotName) return;

    // Update local state only (no backend call)
    setEquipped((prev) => ({
      ...prev,
      [slotName]: item,
    }));
  };

  /**
   * Unequip an item from the specified slot
   * 
   * TODO: Replace local state update with backend API call using apiUnequipItem
   * when /character/unequip endpoint is ready. Then call refreshInventory() to sync state.
   */
  const unequipItem = async (slotName: keyof EquippedItems) => {
    // Only allow unequipping optional slots
    if (
      slotName !== "pet" &&
      slotName !== "headAccessory" &&
      slotName !== "weapon"
    ) {
      return;
    }

    // Update local state only (no backend call)
    setEquipped((prev) => ({
      ...prev,
      [slotName]: null,
    }));
  };

  /**
   * Check if an item is currently equipped
   */
  const isEquipped = (itemId: string) => {
    return Object.values(equipped).some((item) => item?.id === itemId);
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        equipped,
        isLoading,
        error,
        equipItem,
        unequipItem,
        isEquipped,
        refreshInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
}