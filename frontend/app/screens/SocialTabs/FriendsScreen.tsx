import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { FriendSummary } from "@/api/endpoints";
import { useFriends } from "@/lib/friends-context";
import { Ionicons } from "@expo/vector-icons";

const FriendsScreen = () => {
  const {
    friends,
    incomingRequests,
    loading,
    error,
    refreshFriends,
    refreshRequests,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriends();

  const [processingRequestId, setProcessingRequestId] = useState<number | null>(
    null
  );
  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null);

  // Refresh friends and requests on mount
  useEffect(() => {
    refreshFriends();
    refreshRequests();
  }, []);

  const handleFriendClick = (friend: FriendSummary) => {
    console.log("Friend card clicked:", friend);
    // Navigate to friend profile or show details
  };

  const handleAcceptRequest = async (requestId: number, username: string) => {
    try {
      setProcessingRequestId(requestId);
      await acceptRequest(requestId);
      Alert.alert("Success", `${username} is now your friend!`);
    } catch (err) {
      Alert.alert("Error", "Failed to accept friend request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      setProcessingRequestId(requestId);
      await declineRequest(requestId);
    } catch (err) {
      Alert.alert("Error", "Failed to decline friend request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRemoveFriend = (friendId: number, username: string) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${username} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingFriendId(friendId);
              await removeFriend(friendId);
              Alert.alert("Success", `${username} has been removed from your friends`);
            } catch (err) {
              Alert.alert("Error", "Failed to remove friend");
            } finally {
              setRemovingFriendId(null);
            }
          },
        },
      ]
    );
  };

  // Show loading state
  if (loading && friends.length === 0) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  if (error && friends.length === 0) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshFriends}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={styles.content}
    >
      {/* Incoming Friend Requests */}
      {incomingRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>
            Friend Requests ({incomingRequests.length})
          </Text>
          <View style={styles.requestsList}>
            {incomingRequests.map((request) => (
              <View key={request.request_id} style={styles.requestCard}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {request.sender_username.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.friendName}>
                    {request.sender_username}
                  </Text>
                  <Text style={styles.classText}>
                    {request.sender_class.name}
                  </Text>
                  <Text style={styles.levelText}>
                    Level {request.sender_level}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[
                      styles.acceptButton,
                      processingRequestId === request.request_id &&
                        styles.buttonDisabled,
                    ]}
                    onPress={() =>
                      handleAcceptRequest(
                        request.request_id,
                        request.sender_username
                      )
                    }
                    disabled={processingRequestId === request.request_id}
                  >
                    {processingRequestId === request.request_id ? (
                      <ActivityIndicator
                        size="small"
                        color={colorPallet.neutral_darkest}
                      />
                    ) : (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colorPallet.neutral_darkest}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.declineButton,
                      processingRequestId === request.request_id &&
                        styles.buttonDisabled,
                    ]}
                    onPress={() => handleDeclineRequest(request.request_id)}
                    disabled={processingRequestId === request.request_id}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={colorPallet.neutral_lightest}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Friends List */}
      {friends.length === 0 && incomingRequests.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Add friends to see their progress!
          </Text>
        </View>
      ) : (
        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>
            Friends ({friends.length})
          </Text>
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
                        style={[
                          styles.progressBarFill,
                          { width: `${progress}%` },
                        ]}
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
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFriend(friend.user_id, friend.username);
                    }}
                    disabled={removingFriendId === friend.user_id}
                  >
                    {removingFriendId === friend.user_id ? (
                      <ActivityIndicator
                        size="small"
                        color={colorPallet.critical}
                      />
                    ) : (
                      <Ionicons
                        name="person-remove"
                        size={20}
                        color={colorPallet.critical}
                      />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
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
    minHeight: 300,
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
  requestsSection: {
    marginBottom: 24,
  },
  friendsSection: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    marginBottom: 12,
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colorPallet.primary,
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colorPallet.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: colorPallet.critical,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
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
  removeButton: {
    marginLeft: 8,
    padding: 8,
  },
});

export default FriendsScreen;