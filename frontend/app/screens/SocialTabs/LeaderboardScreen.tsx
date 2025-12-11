import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { getLeaderboard, type LeaderboardEntry } from "@/api/endpoints";

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const leaderboardData = await getLeaderboard();
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError("Failed to load leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const calculateTotalXP = (entry: LeaderboardEntry) => {
    // Calculate total XP based on level and current progress
    // Assuming each level requires progressively more XP
    const baseXPPerLevel = 1000;
    const previousLevelsXP =
      ((entry.level - 1) * entry.level * baseXPPerLevel) / 2;
    return previousLevelsXP + entry.exp_leftover;
  };

  if (loading) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLeaderboard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Text style={styles.emptyText}>No players yet</Text>
        <Text style={styles.emptySubtext}>
          Be the first to compete on the leaderboard!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={styles.content}
    >
      <View style={styles.leaderboardList}>
        {leaderboard.map((player, index) => {
          const rank = index + 1;
          const totalXP = calculateTotalXP(player);

          return (
            <View
              key={player.user_id}
              style={[
                styles.leaderboardCard,
                rank === 1 && styles.firstPlaceCard,
              ]}
            >
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: getRankColor(rank) },
                ]}
              >
                <Text style={styles.rankText}>{rank}</Text>
              </View>

              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {player.username.substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.username}</Text>
                <Text style={styles.classText}>{player.class.name}</Text>
                <Text style={styles.levelText}>Level {player.level}</Text>
              </View>

              <View style={styles.statsAndXP}>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>STR</Text>
                    <Text style={styles.statValue}>
                      {player.class.stats.strength}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>END</Text>
                    <Text style={styles.statValue}>
                      {player.class.stats.endurance}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>FLX</Text>
                    <Text style={styles.statValue}>
                      {player.class.stats.flexibility}
                    </Text>
                  </View>
                </View>
                <View style={styles.xpContainer}>
                  <Text style={styles.xpValue}>{totalXP.toLocaleString()}</Text>
                  <Text style={styles.xpLabel}>Total XP</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    marginTop: 16,
  },
  errorText: {
    ...typography.h3,
    color: colorPallet.critical,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colorPallet.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.h3,
    color: colorPallet.neutral_darkest,
  },
  emptyText: {
    ...typography.h2,
    color: colorPallet.neutral_3,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body,
    color: colorPallet.neutral_4,
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
    fontWeight: "bold",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...typography.h3,
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    marginBottom: 2,
  },
  classText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    marginBottom: 2,
  },
  levelText: {
    ...typography.body,
    color: colorPallet.secondary,
    fontSize: 14,
  },
  statsAndXP: {
    alignItems: "flex-end",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 10,
  },
  statValue: {
    ...typography.h3,
    color: colorPallet.primary,
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
