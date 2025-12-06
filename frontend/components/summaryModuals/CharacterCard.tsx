/**
 * Character Card Summary Component
 * 
 * Compact card version of character display for summary screens.
 * Shows equipped items and stats in a fixed-width card layout without settings.
 */

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { useInventory } from "@/lib/inventory-context";
import { useAuth } from "@/lib/auth-context";

type CharacterCardSummaryProps = {
  username?: string;
  level?: number;
  borderColor?: string;
  accentColor?: string;
};



export default function CharacterCardSummary({
  username,
  level,
  borderColor = colorPallet.primary,
  accentColor = colorPallet.secondary,
}: CharacterCardSummaryProps) {
  const router = useRouter();
  const { equipped } = useInventory();
  const { user } = useAuth();

  const stats = user?.profile?.class?.stats || {
    strength: 0,
    endurance: 0,
    flexibility: 0,
  };
  const availableStatPoints = user?.profile?.pending_stat_points || 0;

  const handlePress = () => {
    router.push("/(tabs)/character");
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {(username || level !== undefined) && (
        <View style={styles.headerContainer}>
          <View style={styles.headerInfo}>
            {username && <Text style={styles.username}>{username}</Text>}
            {level !== undefined && (
              <Text style={styles.level}>Level {level}</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.characterPreview}>
        <View style={styles.characterLayers}>
          {equipped.background?.image && (
            <Image
              source={equipped.background.image}
              style={[styles.backgroundLayerImage, { zIndex: 1 }]}
              resizeMode="cover"
            />
          )}

          {equipped.body?.image && (
            <Image
              source={equipped.body.image}
              style={[styles.layerImage, { zIndex: 2 }]}
              resizeMode="contain"
            />
          )}

          {equipped.arms?.image && (
            <Image
              source={equipped.arms.image}
              style={[styles.layerImage, { zIndex: 3 }]}
              resizeMode="contain"
            />
          )}

          {equipped.head?.image && (
            <Image
              source={equipped.head.image}
              style={[styles.layerImage, { zIndex: 4 }]}
              resizeMode="contain"
            />
          )}

          {equipped.headAccessory?.image && (
            <Image
              source={equipped.headAccessory.image}
              style={[styles.layerImage, { zIndex: 5 }]}
              resizeMode="contain"
            />
          )}

          {equipped.weapon?.image && (
            <Image
              source={equipped.weapon.image}
              style={[styles.layerImage, { zIndex: 6 }]}
              resizeMode="contain"
            />
          )}

          {equipped.pet?.image && (
            <Image
              source={equipped.pet.image}
              style={[styles.layerImage, { zIndex: 7 }]}
              resizeMode="contain"
            />
          )}

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
        </View>
      </View>

      <View style={[styles.statsContainer, { borderTopColor: accentColor }]}>
        {availableStatPoints > 0 && (
          <View style={styles.availablePointsContainer}>
            <Ionicons name="add-circle" size={20} color={colorPallet.primary} />
            <Text style={styles.availablePointsText}>
              {availableStatPoints}{" "}
              {availableStatPoints === 1 ? "Point" : "Points"} Available
            </Text>
          </View>
        )}

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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,

  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
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