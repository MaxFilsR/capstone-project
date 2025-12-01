import React, { createContext, useContext, useState, ReactNode } from "react";
import { ImageSourcePropType } from "react-native";

export type InventoryItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  rarity: "common" | "rare" | "epic" | "legendary";
  category:
    | "backgrounds"
    | "bodies"
    | "arms"
    | "heads"
    | "accessories"
    | "weapons"
    | "pets";
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
  equipItem: (item: InventoryItem) => void;
  unequipItem: (slotName: keyof EquippedItems) => void;
  isEquipped: (itemId: string) => boolean;
};

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

// Mock inventory
const INITIAL_INVENTORY = {
  backgrounds: [
    {
      id: "bg1",
      name: "Green Background",
      image: require("@/assets/images/equippedItems/backgrounds/green.png"),
      rarity: "common" as const,
      category: "backgrounds" as const,
    },
    {
      id: "bg2",
      name: "Blue Background",
      image: require("@/assets/images/equippedItems/backgrounds/blue.png"),
      rarity: "rare" as const,
      category: "backgrounds" as const,
    },
    {
      id: "bg3",
      name: "Purple Background",
      image: require("@/assets/images/equippedItems/backgrounds/purple.png"),
      rarity: "epic" as const,
      category: "backgrounds" as const,
    },
    ,
    {
      id: "bg4",
      name: "Pink Background",
      image: require("@/assets/images/equippedItems/backgrounds/pink.png"),
      rarity: "epic" as const,
      category: "backgrounds" as const,
    },
    ,
    {
      id: "bg5",
      name: "Red Background",
      image: require("@/assets/images/equippedItems/backgrounds/red.png"),
      rarity: "epic" as const,
      category: "backgrounds" as const,
    },
  ],
  bodies: [
    {
      id: "body1",
      name: "Black Male Body",
      image: require("@/assets/images/equippedItems/bodies/default-black-male-body.png"),
      rarity: "common" as const,
      category: "bodies" as const,
    },
    {
      id: "body2",
      name: "Black Female Body",
      image: require("@/assets/images/equippedItems/bodies/default-black-female-body.png"),
      rarity: "common" as const,
      category: "bodies" as const,
    },
    {
      id: "body3",
      name: "Brown Male Body",
      image: require("@/assets/images/equippedItems/bodies/default-brown-male-body.png"),
      rarity: "common" as const,
      category: "bodies" as const,
    },
    {
      id: "body4",
      name: "Brown Female Body",
      image: require("@/assets/images/equippedItems/bodies/default-brown-female-body.png"),
      rarity: "common" as const,
      category: "bodies" as const,
    },
    {
      id: "body5",
      name: "White Male Body",
      image: require("@/assets/images/equippedItems/bodies/default-white-male-body.png"),
      rarity: "common" as const,
      category: "bodies" as const,
    },
    {
      id: "body6",
      name: "White Female Body",
      image: require("@/assets/images/equippedItems/bodies/default-white-female-body.png"),
      rarity: "common" as const,
      category: "bodies" as const,
    },
    {
      id: "body7",
      name: "Ninja Body",
      image: require("@/assets/images/equippedItems/male-ninja-body-greenblack.png"),
      rarity: "rare" as const,
      category: "bodies" as const,
    },{
      id: "body8",
      name: "Warrior Body",
      image: require("@/assets/images/equippedItems/bodies/black-warrior-body.png"),
      rarity: "rare" as const,
      category: "bodies" as const,
    },{
      id: "body9",
      name: "Yellow Bikini",
      image: require("@/assets/images/equippedItems/brown-female-yellow-bikini.png"),
      rarity: "rare" as const,
      category: "bodies" as const,
    },
  ],
  arms: [
    {
      id: "arm1",
      name: "Black Arms",
      image: require("@/assets/images/equippedItems/arms/default-black-arm.png"),
      rarity: "common" as const,
      category: "arms" as const,
    },
    {
      id: "arm2",
      name: "Brown Arms",
      image: require("@/assets/images/equippedItems/arms/default-brown-arm.png"),
      rarity: "common" as const,
      category: "arms" as const,
    },
    {
      id: "arm3",
      name: "White Arms",
      image: require("@/assets/images/equippedItems/arms/default-white-arm.png"),
      rarity: "common" as const,
      category: "arms" as const,
    },
    {
      id: "arm4",
      name: "Ninja Arms",
      image: require("@/assets/images/equippedItems/black1-male-ninja-arm-green.png"),
      rarity: "rare" as const,
      category: "arms" as const,
    },
    {
      id: "arm5",
      name: "Sweat bands",
      image: require("@/assets/images/equippedItems/arms/black1-male-arm2.png"),
      rarity: "rare" as const,
      category: "arms" as const,
    },
  ],
  heads: [
    {
      id: "head1",
      name: "Black Head",
      image: require("@/assets/images/equippedItems/heads/black-head.png"),
      rarity: "common" as const,
      category: "heads" as const,
    },
    {
      id: "head2",
      name: "Brown Head",
      image: require("@/assets/images/equippedItems/heads/brown-head.png"),
      rarity: "common" as const,
      category: "heads" as const,
    },
    {
      id: "head3",
      name: "White Head",
      image: require("@/assets/images/equippedItems/heads/white-head.png"),
      rarity: "common" as const,
      category: "heads" as const,
    },
    {
      id: "head4",
      name: "Ninja Head",
      image: require("@/assets/images/equippedItems/black-head-eyepatch.png"),
      rarity: "rare" as const,
      category: "heads" as const,
    },
  ],
  accessories: [
    {
      id: "acc1",
      name: "Hair Style 1",
      image: require("@/assets/images/equippedItems/hair/default-hair1.png"),
      rarity: "common" as const,
      category: "accessories" as const,
    },
    {
      id: "acc2",
      name: "Hair Style 2",
      image: require("@/assets/images/equippedItems/hair/default-hair2.png"),
      rarity: "common" as const,
      category: "accessories" as const,
    },
    {
      id: "acc3",
      name: "Ninja Mask",
      image: require("@/assets/images/equippedItems/ninja-mask-6.png"),
      rarity: "epic" as const,
      category: "accessories" as const,
    },
    {
      id: "acc4",
      name: "Helm",
      image: require("@/assets/images/equippedItems/brown-head-no-hair18.png"),
      rarity: "epic" as const,
      category: "accessories" as const,
    },
    {
      id: "acc5",
      name: "Orange Hair",
      image: require("@/assets/images/equippedItems/orange-hair-tied.png"),
      rarity: "epic" as const,
      category: "accessories" as const,
    },
  ],
  weapons: [
    {
      id: "weapon1",
      name: "Ninja Star",
      image: require("@/assets/images/equippedItems/ninjastar1.png"),
      rarity: "rare" as const,
      category: "weapons" as const,
    },{
      id: "weapon2",
      name: "Bloody Staff",
      image: require("@/assets/images/equippedItems/staff1.png"),
      rarity: "rare" as const,
      category: "weapons" as const,
    },
  ],
  pets: [],
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory] = useState(INITIAL_INVENTORY);
  const [equipped, setEquipped] = useState<EquippedItems>({
    background: INITIAL_INVENTORY.backgrounds[0] || null,
    body: INITIAL_INVENTORY.bodies[0] || null,
    arms: INITIAL_INVENTORY.arms[0] || null,
    head: INITIAL_INVENTORY.heads[0] || null,
    headAccessory: null,
    weapon: null,
    pet: null,
  });

  const equipItem = (item: InventoryItem) => {
    const slotMap: Record<string, keyof EquippedItems> = {
      backgrounds: "background",
      bodies: "body",
      arms: "arms",
      heads: "head",
      accessories: "headAccessory",
      weapons: "weapon",
      pets: "pet",
    };

    const slotName = slotMap[item.category];
    if (slotName) {
      setEquipped((prev) => ({
        ...prev,
        [slotName]: item,
      }));
    }
  };

  const unequipItem = (slotName: keyof EquippedItems) => {
    // Only allow unequipping pet, headAccessory, and weapons
    if (
      slotName === "pet" ||
      slotName === "headAccessory" ||
      slotName === "weapon"
    ) {
      setEquipped((prev) => ({
        ...prev,
        [slotName]: null,
      }));
    }
  };

  const isEquipped = (itemId: string) => {
    return Object.values(equipped).some((item) => item?.id === itemId);
  };

  return (
    <InventoryContext.Provider
      value={{ inventory, equipped, equipItem, unequipItem, isEquipped }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
}
