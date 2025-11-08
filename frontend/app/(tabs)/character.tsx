import { useState, useEffect } from "react";
import {
  Text,
  View,
  Button,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { containers, typography } from "@/styles/index";
import { useAuth } from "@/lib/auth-context";
import { getCharacter, CharacterProfile } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import QuickActionButton from "@/components/QuickActionButton";
import CharacterCard from "@/components/CharacterCard";
import warrior from "@/assets/images/warrior-male-full.png";

export default function Index() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCharacter();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={[typography.body, { marginTop: 12 }]}>
          Loading your character...
        </Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "No profile found"}</Text>
        <Button title="Retry" onPress={loadProfile} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

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
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Text style={[typography.header, { marginBottom: 24 }]}>
            Character Profile
          </Text>

          {/* Character Card */}
          <CharacterCard
            image={warrior}
            stats={profile.class.stats}
            username={profile.username}
            level={profile.level}
            currentExp={profile.exp_leftover}
            expNeeded={profile.exp_needed}
          />

          {/* Character Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Character Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Class:</Text>
              <Text style={styles.classValue}>{profile.class.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Streak:</Text>
              <Text style={styles.value}>{profile.streak} days 🔥</Text>
            </View>
            {profile.pending_stat_points > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Pending Stat Points:</Text>
                <Text style={styles.highlightValue}>
                  {profile.pending_stat_points}
                </Text>
              </View>
            )}
          </View>

          {/* Equipped Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipped Items</Text>
            <View style={styles.equippedGrid}>
              <View style={styles.equipmentItem}>
                <Text style={styles.equipmentLabel}>Head:</Text>
                <Text style={styles.equipmentValue}>
                  {profile.equipped.head}
                </Text>
              </View>
              <View style={styles.equipmentItem}>
                <Text style={styles.equipmentLabel}>Head Accessory:</Text>
                <Text style={styles.equipmentValue}>
                  {profile.equipped.head_accessory}
                </Text>
              </View>
              <View style={styles.equipmentItem}>
                <Text style={styles.equipmentLabel}>Body:</Text>
                <Text style={styles.equipmentValue}>
                  {profile.equipped.bodies}
                </Text>
              </View>
              <View style={styles.equipmentItem}>
                <Text style={styles.equipmentLabel}>Arms:</Text>
                <Text style={styles.equipmentValue}>
                  {profile.equipped.arms}
                </Text>
              </View>
              <View style={styles.equipmentItem}>
                <Text style={styles.equipmentLabel}>Weapon:</Text>
                <Text style={styles.equipmentValue}>
                  {profile.equipped.weapon}
                </Text>
              </View>
              <View style={styles.equipmentItem}>
                <Text style={styles.equipmentLabel}>Pet:</Text>
                <Text style={styles.equipmentValue}>
                  {profile.equipped.pet}
                </Text>
              </View>
              <View style={styles.equipmentItem}>
                <Text style={styles.equipmentLabel}>Background:</Text>
                <Text style={styles.equipmentValue}>
                  {profile.equipped.background}
                </Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <Button title="Logout" onPress={handleLogout} color="#dc3545" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
  },
  errorText: {
    ...typography.body,
    color: colorPallet.critical,
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_4,
  },
  label: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontWeight: "500",
  },
  value: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontWeight: "600",
  },
  classValue: {
    ...typography.body,
    color: colorPallet.primary,
    fontWeight: "700",
  },
  highlightValue: {
    ...typography.body,
    color: colorPallet.secondary,
    fontWeight: "700",
  },
  equippedGrid: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_4,
  },
  equipmentLabel: {
    ...typography.body,
    color: colorPallet.neutral_2,
    fontWeight: "500",
  },
  equipmentValue: {
    ...typography.body,
    color: colorPallet.secondary,
    fontWeight: "600",
  },
  logoutContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
});
