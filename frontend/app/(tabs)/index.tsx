import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QuickActionButton from "@/components/QuickActionButton";
import RecentWorkouts from "@/components/summaryModuals/RecentWorkouts";
import { colorPallet } from "@/styles/variables";
import { containers, typography } from "@/styles";
import CharacterCard from "@/components/CharacterCard";
import { getCharacter, CharacterProfile } from "@/api/endpoints";
import warrior from "@/assets/images/warrior-male-full.png";
import CharacterCardSummary from "@/components/summaryModuals/CharacterCard";
import ActiveQuests from "@/components/summaryModuals/ActiveQuests";
import FriendsSummary from "@/components/summaryModuals/FriendsSummary";

export default function HomeScreen() {
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCharacter();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Quick Action Button */}
      <QuickActionButton />
      <SafeAreaView
        style={containers.safeArea}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={colorPallet.neutral_darkest}
        />
        <ScrollView
  style={containers.scrollView}
  contentContainerStyle={[containers.scrollContent, { gap: 24 }]}
  showsVerticalScrollIndicator={false}
  bounces={true}
>
  <Text style={typography.h1}>Summary</Text>

  {/* Character Card */}
  {loading ? (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      <ActivityIndicator size="large" color={colorPallet.primary} />
    </View>
  ) : profile ? (
    <CharacterCardSummary
      username={profile.username}
      level={profile.level}
      borderColor={colorPallet.primary}
      accentColor={colorPallet.secondary}
    />
  ) : null}

  {/* Recent Workouts Module */}
  <RecentWorkouts limit={5} />

  {/* Active Quests Module */}
  <ActiveQuests limit={3} />

  <FriendsSummary limit={5} />
</ScrollView>
      </SafeAreaView>
    </>
  );
}
