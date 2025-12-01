import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabBar, { Tab } from "@/components/TabBar";
import HistoryScreen from "../screens/FitnessTabs/historyScreen";
import RecordsScreen from "../screens/FitnessTabs/recordsScreen";
import LibraryScreen from "../screens/FitnessTabs/libraryScreen";
import RoutinesScreen from "../screens/FitnessTabs/routinesScreen";
import QuickActionButton from "@/components/QuickActionButton";
import { colorPallet } from "@/styles/variables";
import { containers } from "@/styles";

const FitnessScreen = () => {
  const tabs: Tab[] = [
    { name: "History", component: HistoryScreen },
    // { name: "Records", component: RecordsScreen },
    { name: "Routines", component: RoutinesScreen },
    { name: "Library", component: LibraryScreen },
  ];

  const handleTabChange = (index: number) => {};

  return (
    <SafeAreaView style={containers.safeArea} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colorPallet.neutral_darkest}
      />
      <View style={containers.container}>
        <TabBar
          pageTitle="Fitness"
          tabs={tabs}
          initialTab={0}
          onTabChange={handleTabChange}
        />
        {/* Quick Action Button */}
        <QuickActionButton />
      </View>
    </SafeAreaView>
  );
};

export default FitnessScreen;
