import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";

type EquipmentSlot = {
  name: string;
  image: ImageSourcePropType | null;
};

type CharacterCardInventoryProps = {
  username?: string;
  level?: number;
  equipment: {
    background?: ImageSourcePropType | null;
    body?: ImageSourcePropType | null;
    arms?: ImageSourcePropType | null;
    head?: ImageSourcePropType | null;
    headAccessory?: ImageSourcePropType | null;
    weapon?: ImageSourcePropType | null;
    pet?: ImageSourcePropType | null;
  };
  stats: {
    strength: number;
    endurance: number;
    flexibility: number;
  };
  availableStatPoints?: number;
  borderColor?: string;
  accentColor?: string;
  onSettingsPress?: () => void;
};

type EquipmentSlotItemProps = {
  slotName: string;
  image: ImageSourcePropType | null;
  accentColor?: string;
};

// Separate component for each equipment slot
function EquipmentSlotItem({
  slotName,
  image,
  accentColor = colorPallet.secondary,
}: EquipmentSlotItemProps) {
  return (
    <View style={styles.slotContainer}>
      <View style={[styles.slotImageContainer, { borderColor: accentColor }]}>
        {image ? (
          <Image source={image} style={styles.slotImage} />
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotText}>?</Text>
          </View>
        )}
      </View>
      <Text style={styles.slotLabel}>{slotName}</Text>
    </View>
  );
}

export default function CharacterCardInventory({
  username,
  level,
  equipment,
  stats,
  availableStatPoints = 0,
  borderColor = colorPallet.primary,
  accentColor = colorPallet.secondary,
  onSettingsPress,
}: CharacterCardInventoryProps) {
  const equipmentSlots: EquipmentSlot[] = [
    { name: "Background", image: equipment.background },
    { name: "Body", image: equipment.body },
    { name: "Arms", image: equipment.arms },
    { name: "Head", image: equipment.head },
    { name: "Accessory", image: equipment.headAccessory },
    { name: "Weapon", image: equipment.weapon },
    { name: "Pet", image: equipment.pet },
  ];

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Header */}
      {(username || level !== undefined) && (
        <View style={styles.headerContainer}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
            }}
          >
            {username && <Text style={styles.username}>{username}</Text>}
            {level !== undefined && (
              <Text style={styles.level}>Level {level}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onSettingsPress} activeOpacity={0.7}>
            <Ionicons name="settings" size={24} color={colorPallet.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Layered Character Preview */}
      <View style={styles.characterPreview}>
        <View style={styles.characterLayers}>
          {/* Background Layer - z-index 1 */}
          {equipment.background && (
            <Image
              source={equipment.background}
              style={[styles.layerImage, { zIndex: 1 }]}
            />
          )}

          {/* Body Layer - z-index 2 */}
          {equipment.body && (
            <Image
              source={equipment.body}
              style={[styles.layerImage, { zIndex: 2 }]}
            />
          )}

          {/* Arms Layer - z-index 3 */}
          {equipment.arms && (
            <Image
              source={equipment.arms}
              style={[styles.layerImage, { zIndex: 3 }]}
            />
          )}

          {/* Head Layer - z-index 4 */}
          {equipment.head && (
            <Image
              source={equipment.head}
              style={[styles.layerImage, { zIndex: 4 }]}
            />
          )}

          {/* Head Accessory Layer - z-index 5 */}
          {equipment.headAccessory && (
            <Image
              source={equipment.headAccessory}
              style={[styles.layerImage, { zIndex: 5 }]}
            />
          )}

          {/* Weapon Layer - z-index 6 */}
          {equipment.weapon && (
            <Image
              source={equipment.weapon}
              style={[styles.layerImage, { zIndex: 6 }]}
            />
          )}

          {/* Pet Layer - z-index 7 */}
          {equipment.pet && (
            <Image
              source={equipment.pet}
              style={[styles.layerImage, { zIndex: 7 }]}
            />
          )}

          {/* Empty State */}
          {!equipment.background &&
            !equipment.body &&
            !equipment.arms &&
            !equipment.head &&
            !equipment.headAccessory &&
            !equipment.weapon &&
            !equipment.pet && (
              <View style={styles.emptyCharacter}>
                <Text style={styles.emptyCharacterText}>No Equipment</Text>
              </View>
            )}

          {/* Left Side Equipment Slots - z-index 100 */}
          <View style={styles.leftSlots}>
            <EquipmentSlotItem
              slotName="Head"
              image={equipment.head}
              accentColor={accentColor}
            />
            <EquipmentSlotItem
              slotName="Accessory"
              image={equipment.headAccessory}
              accentColor={accentColor}
            />
            <EquipmentSlotItem
              slotName="Body"
              image={equipment.body}
              accentColor={accentColor}
            />
            <EquipmentSlotItem
              slotName="Arms"
              image={equipment.arms}
              accentColor={accentColor}
            />
          </View>

          {/* Right Side Equipment Slots - z-index 100 */}
          <View style={styles.rightSlots}>
            <EquipmentSlotItem
              slotName="Weapon"
              image={equipment.weapon}
              accentColor={accentColor}
            />
            <EquipmentSlotItem
              slotName="Pet"
              image={equipment.pet}
              accentColor={accentColor}
            />
            <EquipmentSlotItem
              slotName="Background"
              image={equipment.background}
              accentColor={accentColor}
            />
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={[styles.statsContainer, { borderTopColor: accentColor }]}>
        {/* Available Stat Points */}
        {availableStatPoints > 0 && (
          <View style={styles.availablePointsContainer}>
            <Ionicons name="add-circle" size={20} color={colorPallet.primary} />
            <Text style={styles.availablePointsText}>
              {availableStatPoints}{" "}
              {availableStatPoints === 1 ? "Point" : "Points"} Available
            </Text>
          </View>
        )}

        {/* Stat Items */}
        <View style={styles.statsRow}>
          {[
            { label: "Strength", value: stats.strength, color: "#D64545" },
            { label: "Endurance", value: stats.endurance, color: "#E9E34A" },
            {
              label: "Flexibility",
              value: stats.flexibility,
              color: "#6DE66D",
            },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: stat.color }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colorPallet.neutral_darkest,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    backgroundColor: colorPallet.neutral_darkest,
  },
  username: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    fontSize: 20,
  },
  level: {
    ...typography.body,
    color: colorPallet.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  characterPreview: {
    width: "100%",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  characterLayers: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  layerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    position: "absolute",
    top: 0,
    left: 0,
  },
  emptyCharacter: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_5,
    borderRadius: 8,
  },
  emptyCharacterText: {
    color: colorPallet.neutral_3,
    fontSize: 16,
    fontWeight: "600",
  },
  leftSlots: {
    position: "absolute",
    left: 8,
    top: "25%",
    transform: [{ translateY: -50 }],
    zIndex: 100,
    gap: 8,
  },
  rightSlots: {
    position: "absolute",
    right: 8,
    top: "25%",
    transform: [{ translateY: -50 }],
    zIndex: 100,
    gap: 8,
  },
  slotContainer: {
    width: 60,
    alignItems: "center",
    marginBottom: 4,
  },
  slotImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: colorPallet.neutral_6,
    overflow: "hidden",
    marginBottom: 4,
  },
  slotImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    alignSelf: "center",
  },
  emptySlot: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  emptySlotText: {
    color: colorPallet.neutral_4,
    fontSize: 24,
    fontWeight: "300",
  },
  slotLabel: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 9,
    textAlign: "center",
    fontWeight: "600",
  },
  statsContainer: {
    borderTopWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  availablePointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_5,
  },
  availablePointsText: {
    ...typography.body,
    color: colorPallet.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    width: "25%",
  },
  statValue: {
    color: colorPallet.neutral_lightest,
    fontWeight: "800",
    fontSize: 18,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
  },
});
