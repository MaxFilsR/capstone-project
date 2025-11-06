import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";

// Fake leaderboard data
const LEADERBOARD_DATA = [
  {
    id: "1",
    rank: 1,
    name: "Jordan Lee",
    username: "@jlee",
    level: 20,
    totalXP: 25000,
  },
  {
    id: "2",
    rank: 2,
    name: "Marcus Rodriguez",
    username: "@mrodriguez",
    level: 15,
    totalXP: 18500,
  },
  {
    id: "3",
    rank: 3,
    name: "Alex Thompson",
    username: "@alexthompson",
    level: 12,
    totalXP: 14200,
  },
  {
    id: "4",
    rank: 4,
    name: "Sarah Chen",
    username: "@sarahc",
    level: 8,
    totalXP: 9800,
  },
  {
    id: "5",
    rank: 5,
    name: "Emma Williams",
    username: "@emmaw",
    level: 5,
    totalXP: 6500,
  },
  {
    id: "6",
    rank: 6,
    name: "Tyler Brooks",
    username: "@tbrooks",
    level: 4,
    totalXP: 5200,
  },
  {
    id: "7",
    rank: 7,
    name: "Maya Patel",
    username: "@mayap",
    level: 3,
    totalXP: 4100,
  },
  {
    id: "8",
    rank: 8,
    name: "Chris Anderson",
    username: "@canderson",
    level: 2,
    totalXP: 3000,
  },
];

const LeaderboardScreen = () => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return colorPallet.primary;
      case 2:
        return colorPallet.secondary;
      case 3:
        return "#CD7F32";
      default:
        return colorPallet.neutral_3;
    }
  };

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={styles.content}
    >
      <View style={styles.leaderboardList}>
        {LEADERBOARD_DATA.map((player) => (
          <View
            key={player.id}
            style={[
              styles.leaderboardCard,
              player.rank === 1 && styles.firstPlaceCard,
            ]}
          >
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: getRankColor(player.rank) },
              ]}
            >
              <Text style={styles.rankText}>{player.rank}</Text>
            </View>

            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>

            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.levelText}>Level {player.level}</Text>
            </View>

            <View style={styles.xpContainer}>
              <Text style={styles.xpValue}>
                {player.totalXP.toLocaleString()}
              </Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  leaderboardList: {
    gap: 16,
  },
  leaderboardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colorPallet.neutral_4,
  },
  firstPlaceCard: {
    borderColor: colorPallet.primary,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "bold",
    color: colorPallet.neutral_darkest,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colorPallet.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    ...typography.h3,
    color: colorPallet.neutral_darkest,
    fontSize: 18,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...typography.h3,
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    marginBottom: 4,
  },
  levelText: {
    ...typography.body,
    color: colorPallet.secondary,
    fontSize: 14,
  },
  xpContainer: {
    alignItems: "flex-end",
  },
  xpValue: {
    ...typography.h3,
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    fontWeight: "600",
  },
  xpLabel: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
  },
});

export default LeaderboardScreen;
