import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { tabStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { typography } from "@/styles";

// Fake friends data
const FAKE_FRIENDS = [
  {
    id: "1",
    name: "Alex Thompson",
    username: "@alexthompson",
    level: 12,
    xp: 750,
    xpToNextLevel: 1000,
  },
  {
    id: "2",
    name: "Sarah Chen",
    username: "@sarahc",
    level: 8,
    xp: 320,
    xpToNextLevel: 800,
  },
  {
    id: "3",
    name: "Marcus Rodriguez",
    username: "@mrodriguez",
    level: 15,
    xp: 1200,
    xpToNextLevel: 1500,
  },
  {
    id: "4",
    name: "Emma Williams",
    username: "@emmaw",
    level: 5,
    xp: 180,
    xpToNextLevel: 500,
  },
  {
    id: "5",
    name: "Jordan Lee",
    username: "@jlee",
    level: 20,
    xp: 1800,
    xpToNextLevel: 2000,
  },
];

const FriendsScreen = () => {
  const handleFriendClick = (friend: (typeof FAKE_FRIENDS)[0]) => {
    console.log("Friend card clicked:", friend);
  };

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={styles.content}
    >
      <View style={styles.friendsList}>
        {FAKE_FRIENDS.map((friend) => {
          const progress = (friend.xp / friend.xpToNextLevel) * 100;

          return (
            <TouchableOpacity
              key={friend.id}
              style={styles.friendCard}
              onPress={() => handleFriendClick(friend)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.levelText}>Level {friend.level}</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.xpText}>
                  {friend.xp} / {friend.xpToNextLevel} XP
                </Text>
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
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...typography.h3,
    color: colorPallet.neutral_lightest,
    fontSize: 18,
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
});

export default FriendsScreen;
