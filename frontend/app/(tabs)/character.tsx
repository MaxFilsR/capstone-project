import { useState, useEffect } from "react";
import {
  Text,
  View,
  Button,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { containers, typography } from "@/styles/index";
import { useAuth } from "@/lib/auth-context";
import { getCharacter, CharacterProfile } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import QuickActionButton from "@/components/QuickActionButton";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
      <View style={[containers.container]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={typography.body}>Loading your character...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[containers.centerContainer]}>
        <Text style={typography.errorText}>{error || "No profile found"}</Text>
        <Button title="Retry" onPress={loadProfile} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[typography.header, { marginBottom: 24 }]}>
          Character Profile
        </Text>

        {/* Character Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>@{profile.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Class:</Text>
            <Text style={styles.classValue}>{profile.class.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Level:</Text>
            <Text style={styles.value}>{profile.level}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Streak:</Text>
            <Text style={styles.value}>{profile.streak} days</Text>
          </View>
        </View>

        {/* Experience Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.expContainer}>
            <Text style={styles.expText}>
              {profile.exp_leftover} / {profile.exp_needed} XP
            </Text>
            <View style={styles.expBarBackground}>
              <View
                style={[
                  styles.expBarFill,
                  {
                    width: `${
                      (profile.exp_leftover / profile.exp_needed) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Strength</Text>
              <Text style={styles.statValue}>
                {profile.class.stats.strength}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Endurance</Text>
              <Text style={styles.statValue}>
                {profile.class.stats.endurance}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Flexibility</Text>
              <Text style={styles.statValue}>
                {profile.class.stats.flexibility}
              </Text>
            </View>
          </View>
        </View>

        {/* Equipped Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipped Items</Text>
          <View style={styles.equippedGrid}>
            <View style={styles.equipmentItem}>
              <Text style={styles.equipmentLabel}>Head:</Text>
              <Text style={styles.equipmentValue}>{profile.equipped.head}</Text>
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
              <Text style={styles.equipmentValue}>{profile.equipped.arms}</Text>
            </View>
            <View style={styles.equipmentItem}>
              <Text style={styles.equipmentLabel}>Weapon:</Text>
              <Text style={styles.equipmentValue}>
                {profile.equipped.weapon}
              </Text>
            </View>
            <View style={styles.equipmentItem}>
              <Text style={styles.equipmentLabel}>Pet:</Text>
              <Text style={styles.equipmentValue}>{profile.equipped.pet}</Text>
            </View>
            <View style={styles.equipmentItem}>
              <Text style={styles.equipmentLabel}>Background:</Text>
              <Text style={styles.equipmentValue}>
                {profile.equipped.background}
              </Text>
            </View>
          </View>
        </View>

        {/* Inventory Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          <View style={styles.inventoryGrid}>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryLabel}>Heads:</Text>
              <Text style={styles.inventoryValue}>
                {profile.inventory.heads.length}
              </Text>
            </View>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryLabel}>Bodies:</Text>
              <Text style={styles.inventoryValue}>
                {profile.inventory.bodies.length}
              </Text>
            </View>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryLabel}>Arms:</Text>
              <Text style={styles.inventoryValue}>
                {profile.inventory.arms.length}
              </Text>
            </View>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryLabel}>Weapons:</Text>
              <Text style={styles.inventoryValue}>
                {profile.inventory.weapons.length}
              </Text>
            </View>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryLabel}>Pets:</Text>
              <Text style={styles.inventoryValue}>
                {profile.inventory.pets.length}
              </Text>
            </View>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryLabel}>Backgrounds:</Text>
              <Text style={styles.inventoryValue}>
                {profile.inventory.backgrounds.length}
              </Text>
            </View>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryLabel}>Head Accessories:</Text>
              <Text style={styles.inventoryValue}>
                {profile.inventory.head_accessories.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button title="Logout" onPress={handleLogout} color="#dc3545" />
        </View>
      </ScrollView>
      {/* Quick Action Button */}
      <QuickActionButton />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 100,
    backgroundColor: colorPallet.neutral_darkest,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    marginBottom: 16,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  section: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: colorPallet.neutral_lightest,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_1,
  },
  label: {
    fontSize: 16,
    color: colorPallet.neutral_lightest,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: colorPallet.neutral_lightest,
    fontWeight: "600",
  },
  classValue: {
    fontSize: 16,
    color: colorPallet.primary,
    fontWeight: "bold",
  },
  expContainer: {
    marginTop: 8,
  },
  expText: {
    fontSize: 16,
    color: colorPallet.neutral_lightest,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  expBarBackground: {
    height: 20,
    backgroundColor: colorPallet.neutral_4,
    borderRadius: 10,
    overflow: "hidden",
  },
  expBarFill: {
    height: "100%",
    backgroundColor: colorPallet.secondary,
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colorPallet.primary,
    flex: 1,
    marginHorizontal: 4,
    minWidth: "30%",
  },
  statLabel: {
    fontSize: 14,
    color: colorPallet.neutral_lightest,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colorPallet.secondary,
  },
  equippedGrid: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_1,
  },
  equipmentLabel: {
    fontSize: 14,
    color: colorPallet.neutral_lightest,
    fontWeight: "500",
  },
  equipmentValue: {
    fontSize: 14,
    color: colorPallet.secondary,
    fontWeight: "600",
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  inventoryItem: {
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flex: 1,
    minWidth: "30%",
    borderWidth: 1,
    borderColor: colorPallet.neutral_4,
  },
  inventoryLabel: {
    fontSize: 12,
    color: colorPallet.neutral_lightest,
    marginBottom: 4,
  },
  inventoryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colorPallet.primary,
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
  },
});
