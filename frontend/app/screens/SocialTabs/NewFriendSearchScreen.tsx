import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";
import { getLeaderboard, type LeaderboardEntry } from "@/api/endpoints";
import { useFriends } from "@/lib/friends-context";
import { Ionicons } from "@expo/vector-icons";

const NewFriendSearchScreen = () => {
  const { sendRequest, outgoingRequests, friends } = useFriends();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequestTo, setSendingRequestTo] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a username to search");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get leaderboard and filter by search query
      const allUsers = await getLeaderboard();
      const filtered = allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filtered);

      if (filtered.length === 0) {
        setError("No users found matching your search");
      }
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: number, username: string) => {
    try {
      setSendingRequestTo(userId);
      await sendRequest(userId);

      Alert.alert(
        "Request Sent!",
        `Friend request sent to ${username}.`,
        [{ text: "OK" }]
      );
    } catch (err) {
      console.error("Error sending friend request:", err);
      Alert.alert(
        "Error",
        "Failed to send friend request. They may have already received a request from you.",
        [{ text: "OK" }]
      );
    } finally {
      setSendingRequestTo(null);
    }
  };

  const isAlreadyFriend = (userId: number) => {
    return friends.some((friend) => friend.user_id === userId);
  };

  const hasOutgoingRequest = (userId: number) => {
    return outgoingRequests.some((request) => request.sender_id === userId);
  };

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={styles.content}
    >
      <View style={styles.searchContainer}>
        <Text style={styles.title}>Add Friends</Text>
        <Text style={styles.subtitle}>
          Search for users by username to send friend requests
        </Text>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter username..."
            placeholderTextColor={colorPallet.neutral_4}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={colorPallet.neutral_darkest}
              />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <View style={styles.outgoingSection}>
          <Text style={styles.sectionTitle}>
            Pending Requests ({outgoingRequests.length})
          </Text>
          <View style={styles.outgoingList}>
            {outgoingRequests.map((request) => (
              <View key={request.request_id} style={styles.pendingCard}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {request.sender_username.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{request.sender_username}</Text>
                  <Text style={styles.pendingText}>Request pending...</Text>
                </View>
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={colorPallet.neutral_4}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {searchResults.length > 0 && (
          <>
            <Text style={styles.resultsTitle}>
              Found {searchResults.length} user
              {searchResults.length !== 1 ? "s" : ""}
            </Text>
            <View style={styles.resultsList}>
              {searchResults.map((user) => {
                const alreadyFriend = isAlreadyFriend(user.user_id);
                const hasPendingRequest = hasOutgoingRequest(user.user_id);

                return (
                  <View key={user.user_id} style={styles.userCard}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user.username.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.userInfo}>
                      <Text style={styles.username}>{user.username}</Text>
                      <Text style={styles.classText}>{user.class.name}</Text>
                      <Text style={styles.levelText}>Level {user.level}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>STR</Text>
                        <Text style={styles.statValue}>
                          {user.class.stats.strength}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>END</Text>
                        <Text style={styles.statValue}>
                          {user.class.stats.endurance}
                        </Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>FLX</Text>
                        <Text style={styles.statValue}>
                          {user.class.stats.flexibility}
                        </Text>
                      </View>
                    </View>

                    {alreadyFriend ? (
                      <View style={styles.alreadyFriendBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colorPallet.secondary}
                        />
                        <Text style={styles.alreadyFriendText}>Friend</Text>
                      </View>
                    ) : hasPendingRequest ? (
                      <View style={styles.pendingBadge}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={colorPallet.neutral_4}
                        />
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          sendingRequestTo === user.user_id &&
                            styles.addButtonDisabled,
                        ]}
                        onPress={() =>
                          handleSendRequest(user.user_id, user.username)
                        }
                        disabled={sendingRequestTo === user.user_id}
                      >
                        {sendingRequestTo === user.user_id ? (
                          <ActivityIndicator
                            size="small"
                            color={colorPallet.neutral_darkest}
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="person-add"
                              size={16}
                          color={colorPallet.neutral_darkest}
                        />
                        <Text style={styles.addButtonText}>Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </>
    )}
  </View>
</ScrollView>

);
};
const styles = StyleSheet.create({
content: {
paddingBottom: 100,
},
searchContainer: {
marginBottom: 24,
},
title: {
...typography.h1,
color: colorPallet.neutral_lightest,
marginBottom: 8,
},
subtitle: {
...typography.body,
color: colorPallet.neutral_3,
marginBottom: 20,
},
searchBar: {
flexDirection: "row",
gap: 12,
},
searchInput: {
flex: 1,
...typography.body,
backgroundColor: colorPallet.neutral_6,
borderRadius: 8,
paddingHorizontal: 16,
paddingVertical: 12,
borderWidth: 2,
borderColor: colorPallet.neutral_4,
color: colorPallet.neutral_lightest,
fontSize: 16,
},
searchButton: {
backgroundColor: colorPallet.primary,
paddingHorizontal: 24,
paddingVertical: 12,
borderRadius: 8,
justifyContent: "center",
alignItems: "center",
minWidth: 80,
},
searchButtonText: {
...typography.h3,
color: colorPallet.neutral_darkest,
fontSize: 16,
},
errorContainer: {
marginTop: 12,
padding: 12,
backgroundColor: colorPallet.critical + "20",
borderRadius: 8,
borderWidth: 1,
borderColor: colorPallet.critical,
},
errorText: {
...typography.body,
color: colorPallet.critical,
textAlign: "center",
},
outgoingSection: {
marginBottom: 24,
},
sectionTitle: {
...typography.h2,
color: colorPallet.neutral_lightest,
marginBottom: 12,
},
outgoingList: {
gap: 12,
},
pendingCard: {
flexDirection: "row",
alignItems: "center",
backgroundColor: colorPallet.neutral_6,
borderRadius: 12,
padding: 16,
borderWidth: 2,
borderColor: colorPallet.neutral_4,
},
pendingText: {
...typography.body,
color: colorPallet.neutral_4,
fontSize: 12,
fontStyle: "italic",
},
resultsContainer: {
flex: 1,
},
resultsTitle: {
...typography.h3,
color: colorPallet.neutral_3,
marginBottom: 16,
},
resultsList: {
gap: 16,
},
userCard: {
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
userInfo: {
flex: 1,
},
username: {
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
},
statsContainer: {
marginRight: 12,
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
addButton: {
backgroundColor: colorPallet.primary,
paddingHorizontal: 16,
paddingVertical: 10,
borderRadius: 8,
minWidth: 80,
flexDirection: "row",
gap: 6,
justifyContent: "center",
alignItems: "center",
},
addButtonDisabled: {
opacity: 0.6,
},
addButtonText: {
...typography.h3,
color: colorPallet.neutral_darkest,
fontSize: 14,
},
alreadyFriendBadge: {
flexDirection: "row",
alignItems: "center",
gap: 6,
paddingHorizontal: 12,
paddingVertical: 8,
},
alreadyFriendText: {
...typography.body,
color: colorPallet.secondary,
fontSize: 14,
fontWeight: "600",
},
pendingBadge: {
flexDirection: "row",
alignItems: "center",
gap: 6,
paddingHorizontal: 12,
paddingVertical: 8,
},
pendingBadgeText: {
...typography.body,
color: colorPallet.neutral_4,
fontSize: 14,
fontStyle: "italic",
},
});
export default NewFriendSearchScreen;