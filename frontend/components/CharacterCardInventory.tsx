import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { useInventory } from "@/lib/inventory-context";
import { useAuth } from "@/lib/auth-context";

type CharacterCardInventoryProps = {
  username?: string;
  level?: number;
  borderColor?: string;
  accentColor?: string;
  onSettingsPress?: () => void;
};

type EquipmentSlotItemProps = {
  slotName: string;
  slotKey:
    | "background"
    | "body"
    | "arms"
    | "head"
    | "headAccessory"
    | "weapon"
    | "pet";
  accentColor?: string;
  canUnequip?: boolean;
};

// Equipment slot component with conditional unequip functionality
function EquipmentSlotItem({
  slotName,
  slotKey,
  accentColor = colorPallet.secondary,
  canUnequip = false,
}: EquipmentSlotItemProps) {
  const { equipped, unequipItem } = useInventory();
  const item = equipped[slotKey];

  return (
    <TouchableOpacity
      style={styles.slotContainer}
      onPress={() => canUnequip && item && unequipItem(slotKey)}
      activeOpacity={canUnequip && item ? 0.7 : 1}
      disabled={!canUnequip || !item}
    >
      <View style={[styles.slotImageContainer, { borderColor: accentColor }]}>
        {item?.image ? (
          <Image
            source={item.image}
            style={styles.slotImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptySlotText}>?</Text>
          </View>
        )}
      </View>
      <Text style={styles.slotLabel} numberOfLines={1}>
        {slotName}
      </Text>
    </TouchableOpacity>
  );
}

export default function CharacterCardInventory({
  username,
  level,
  borderColor = colorPallet.primary,
  accentColor = colorPallet.secondary,
  onSettingsPress,
}: CharacterCardInventoryProps) {
  const { equipped } = useInventory();
  const { user } = useAuth();

  // Get stats and available points from user profile
  const stats = user?.profile?.class?.stats || {
    strength: 0,
    endurance: 0,
    flexibility: 0,
  };
  const availableStatPoints = user?.profile?.pending_stat_points || 0;

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Header */}
      {(username || level !== undefined) && (
        <View style={styles.headerContainer}>
          <View style={styles.headerInfo}>
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
          {equipped.background?.image && (
            <Image
              source={equipped.background.image}
              style={[styles.backgroundLayerImage, { zIndex: 1 }]}
              resizeMode="cover"
            />
          )}

          {/* Body Layer - z-index 2 */}
          {equipped.body?.image && (
            <Image
              source={equipped.body.image}
              style={[styles.layerImage, { zIndex: 2 }]}
              resizeMode="contain"
            />
          )}

          {/* Arms Layer - z-index 3 */}
          {equipped.arms?.image && (
            <Image
              source={equipped.arms.image}
              style={[styles.layerImage, { zIndex: 3 }]}
              resizeMode="contain"
            />
          )}

          {/* Head Layer - z-index 4 */}
          {equipped.head?.image && (
            <Image
              source={equipped.head.image}
              style={[styles.layerImage, { zIndex: 4 }]}
              resizeMode="contain"
            />
          )}

          {/* Head Accessory Layer - z-index 5 */}
          {equipped.headAccessory?.image && (
            <Image
              source={equipped.headAccessory.image}
              style={[styles.layerImage, { zIndex: 5 }]}
              resizeMode="contain"
            />
          )}

          {/* Weapon Layer - z-index 6 */}
          {equipped.weapon?.image && (
            <Image
              source={equipped.weapon.image}
              style={[styles.layerImage, { zIndex: 6 }]}
              resizeMode="contain"
            />
          )}

          {/* Pet Layer - z-index 7 */}
          {equipped.pet?.image && (
            <Image
              source={equipped.pet.image}
              style={[styles.layerImage, { zIndex: 7 }]}
              resizeMode="contain"
            />
          )}

          {/* Empty State */}
          {!equipped.background &&
            !equipped.body &&
            !equipped.arms &&
            !equipped.head &&
            !equipped.headAccessory &&
            !equipped.weapon &&
            !equipped.pet && (
              <View style={styles.emptyCharacter}>
                <Text style={styles.emptyCharacterText}>No Equipment</Text>
              </View>
            )}

          {/* Left Side Equipment Slots - z-index 100 */}
          <View style={styles.leftSlots}>
            <EquipmentSlotItem
              slotName="Head"
              slotKey="head"
              accentColor={accentColor}
              canUnequip={false}
            />
            <EquipmentSlotItem
              slotName="Accessory"
              slotKey="headAccessory"
              accentColor={accentColor}
              canUnequip={true}
            />
            <EquipmentSlotItem
              slotName="Body"
              slotKey="body"
              accentColor={accentColor}
              canUnequip={false}
            />
            <EquipmentSlotItem
              slotName="Arms"
              slotKey="arms"
              accentColor={accentColor}
              canUnequip={false}
            />
          </View>

          {/* Right Side Equipment Slots - z-index 100 */}
          <View style={styles.rightSlots}>
            <EquipmentSlotItem
              slotName="Weapon"
              slotKey="weapon"
              accentColor={accentColor}
              canUnequip={true}
            />
            <EquipmentSlotItem
              slotName="Pet"
              slotKey="pet"
              accentColor={accentColor}
              canUnequip={true}
            />
            <EquipmentSlotItem
              slotName="Background"
              slotKey="background"
              accentColor={accentColor}
              canUnequip={false}
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
    backgroundColor: colorPallet.neutral_6,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    backgroundColor: colorPallet.neutral_darkest,
  },
  headerInfo: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
    position: "absolute",
    top: -25,
    left: 0,
  },
  backgroundLayerImage: {
    width: "100%",
    height: "100%",
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
    top: "10%",
    zIndex: 100,
    gap: 8,
  },
  rightSlots: {
    position: "absolute",
    right: 8,
    top: "10%",
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
    backgroundColor: colorPallet.neutral_darkest,
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
    paddingVertical: 8,
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