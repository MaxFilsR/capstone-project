import { useState, useEffect } from "react";
import {
  Text,
  View,
  Button,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { containers, typography } from "@/styles/index";
import { useAuth } from "@/lib/auth-context";
import { getCharacter, CharacterProfile } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import QuickActionButton from "@/components/QuickActionButton";
import warrior from "@/assets/images/warrior-male-full.png";
import CharacterCardInventory from "@/components/CharacterCardInventory";
import TabBar, { Tab } from "@/components/TabBar";
import InventoryScreen from "../screens/CharacterTabs/inventoryScreen";
import ShopScreen from "../screens/CharacterTabs/ShopScreen";
import Popup from "@/components/popupModals/Popup";

export default function Index() {
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMode, setPopupMode] = useState<"allocateStats" | "settings">(
    "allocateStats"
  );

  const tabs: Tab[] = [
    { name: "Inventory", component: InventoryScreen },
    {
      name: "Shop",
      component: () => <ShopScreen coins={profile?.coins ?? 0} />,
    },
  ];

  const handleTabChange = (index: number) => {};

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

  const handleSettingsPress = () => {
    router.push("/screens/CharacterTabs/settingsScreen");
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

  console.log(profile?.inventory);

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
          {/* Character Card */}
          <TouchableOpacity
            onPress={() => {
              setPopupMode("allocateStats");
              setPopupVisible(true);
            }}
          >
            <CharacterCardInventory
              username={profile.username}
              level={profile.level}
              equipment={{
                headAccessory: require("@/assets/images/equippedItems/ninja-mask-6.png"),
                background: require("@/assets/images/equippedItems/green.png"),
                body: require("@/assets/images/equippedItems/male-ninja-body-greenblack.png"),
                arms: require("@/assets/images/equippedItems/black1-male-ninja-arm-green.png"),
                head: require("@/assets/images/equippedItems/black-head-eyepatch.png"),
                weapon: require("@/assets/images/equippedItems/ninjastar1.png"),
              }}
              stats={profile.class.stats}
              availableStatPoints={profile.pending_stat_points}
              onSettingsPress={handleSettingsPress}
            />
          </TouchableOpacity>

          <Popup
            visible={popupVisible}
            mode={popupMode}
            onClose={() => setPopupVisible(false)}
            onLogout={handleLogout}
            currentStats={profile?.class.stats}
            availablePoints={profile?.pending_stat_points}
          />

          <TabBar
            tabs={tabs}
            initialTab={0}
            onTabChange={handleTabChange}
            outerContainerStyle={{
              paddingTop: 0,
              margin: 0,
              paddingBottom: 0,
              justifyContent: "center",
            }}
            tabBarContainerStyle={{
              paddingTop: 0,
              paddingBottom: 0,
              paddingHorizontal: 0,
            }}
            tabBarStyle={{ margin: 0, padding: 0, borderRadius: 0 }}
            tabButtonStyle={{ borderRadius: 0 }}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
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
