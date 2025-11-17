import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { getFriends, type FriendSummary } from "@/api/endpoints";

const FriendsScreen = () => {
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const friendsData = await getFriends();
      setFriends(friendsData);
    } catch (err) {
      console.error("Error loading friends:", err);
      setError("Failed to load friends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFriendClick = (friend: FriendSummary) => {
    console.log("Friend card clicked:", friend);
    // Navigate to friend profile or show details
  };

  if (loading) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFriends}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Text style={styles.emptyText}>No friends yet</Text>
        <Text style={styles.emptySubtext}>
          Add friends to see their progress!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={styles.content}
    >
      <View style={styles.friendsList}>
        {friends.map((friend) => {
          const progress = (friend.exp_leftover / friend.exp_needed) * 100;

          return (
            <TouchableOpacity
              key={friend.user_id}
              style={styles.friendCard}
              onPress={() => handleFriendClick(friend)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {friend.username.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.username}</Text>
                <Text style={styles.classText}>{friend.class.name}</Text>
                <Text style={styles.levelText}>Level {friend.level}</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.xpText}>
                  {friend.exp_leftover} / {friend.exp_needed} XP
                </Text>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>STR</Text>
                  <Text style={styles.statValue}>
                    {friend.class.stats.strength}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>END</Text>
                  <Text style={styles.statValue}>
                    {friend.class.stats.endurance}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>FLX</Text>
                  <Text style={styles.statValue}>
                    {friend.class.stats.flexibility}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
  friendsList: {
    gap: 16,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colorPallet.neutral_4,
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...typography.h3,
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    marginBottom: 2,
  },
  classText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    marginBottom: 4,
  },
  levelText: {
    ...typography.body,
    color: colorPallet.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colorPallet.neutral_2,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colorPallet.primary,
    borderRadius: 4,
  },
  xpText: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
  },
  statsContainer: {
    marginLeft: 12,
    gap: 6,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    ...typography.body,
    color: colorPallet.neutral_4,
    fontSize: 11,
    width: 28,
  },
  statValue: {
    ...typography.h3,
    color: colorPallet.primary,
    fontSize: 14,
  },
});

export default FriendsScreen;
