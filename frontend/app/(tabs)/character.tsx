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
import { getMe, UserProfile } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Index() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMe();
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
      <View style={[containers.container]}>
        <Text style={typography.errorText}>{error || "No profile found"}</Text>
        <Button title="Retry" onPress={loadProfile} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={[typography.header, { marginBottom: 24 }]}>
        Account Profile
      </Text>

      {/* Character Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Character Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {profile.first_name} {profile.last_name}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>@{profile.username}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Class:</Text>
          <Text style={styles.classValue}>{profile.class.name}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Strength</Text>
            <Text style={styles.statValue}>{profile.class.stats.strength}</Text>
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

      {/* Workout Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Schedule</Text>
        <View style={styles.scheduleGrid}>
          {profile.workout_schedule.map((isActive, index) => (
            <View
              key={index}
              style={[
                styles.dayCard,
                isActive ? styles.dayActive : styles.dayInactive,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isActive ? styles.dayTextActive : styles.dayTextInactive,
                ]}
              >
                {DAYS[index]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#dc3545" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 100, // Extra padding for bottom tab navigation
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap", 
    justifyContent: "space-between",
  },
  statCard: {
    width: "32%", // Orignally 48% but changed to fit 3 in a row
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colorPallet.primary,
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
  scheduleGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  dayActive: {
    backgroundColor: colorPallet.primary,
  },
  dayInactive: {
    backgroundColor: colorPallet.neutral_4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  dayTextActive: {
    color: colorPallet.neutral_darkest,
  },
  dayTextInactive: {
    color: colorPallet.neutral_1,
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
  },
});
