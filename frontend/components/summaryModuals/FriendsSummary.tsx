/**
 * Friends Summary Component
 * 
 * Displays a compact list of friends with avatar, level, and class info.
 * Shows loading, error, and empty states. Provides navigation to
 * friend details and full friends list.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useFriends } from "@/lib/friends-context";
import { FriendSummary } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { Ionicons } from "@expo/vector-icons";

interface FriendsSummaryProps {
  limit?: number;
}

const FriendsSummary: React.FC<FriendsSummaryProps> = ({ limit = 5 }) => {
  const { friends, loading, error, refreshFriends } = useFriends();

  const displayedFriends = friends.slice(0, limit);

  const handleFriendPress = (friend: FriendSummary) => {
    console.log("Friend pressed:", friend);
    // Navigate to friend profile if you have a route
  };

  const handleViewAll = () => {
    router.push("/(tabs)/social");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colorPallet.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={refreshFriends} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (displayedFriends.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={48}
            color={colorPallet.neutral_4}
          />
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Add friends to see their progress!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Pressable onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {displayedFriends.map((friend, index) => {
          const progress = (friend.exp_leftover / friend.exp_needed) * 100;

          return (
            <Pressable
              key={friend.user_id}
              onPress={() => handleFriendPress(friend)}
              style={[
                styles.friendCard,
                index % 2 === 0 ? styles.friendCardEven : styles.friendCardOdd,
              ]}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {friend.username.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.friendInfo}>
                <Text style={styles.friendName} numberOfLines={1}>
                  {friend.username}
                </Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.classText}>{friend.class.name}</Text>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.levelText}>Lvl {friend.level}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(progress, 100)}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {friend.class.stats.strength}
                  </Text>
                  <Text style={styles.statLabel}>STR</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {friend.class.stats.endurance}
                  </Text>
                  <Text style={styles.statLabel}>END</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {friend.class.stats.flexibility}
                  </Text>
                  <Text style={styles.statLabel}>FLX</Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colorPallet.neutral_4}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: colorPallet.primary,
  },
  title: {
    ...typography.h2,
    color: colorPallet.neutral_darkest,
  },
  viewAllText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 14,
    fontWeight: "600",
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  friendCardEven: {
    backgroundColor: colorPallet.neutral_6,
  },
  friendCardOdd: {
    backgroundColor: colorPallet.neutral_darkest,
  },
  avatarContainer: {
    marginRight: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colorPallet.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 16,
    fontWeight: "700",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...typography.body,
    color: colorPallet.secondary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  classText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
  },
  separator: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 12,
    marginHorizontal: 6,
  },
  levelText: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colorPallet.neutral_5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colorPallet.primary,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginRight: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...typography.body,
    color: colorPallet.neutral_1,
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 10,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 14,
  },
  errorText: {
    ...typography.body,
    color: colorPallet.critical,
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colorPallet.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    ...typography.body,
    color: colorPallet.neutral_darkest,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FriendsSummary;