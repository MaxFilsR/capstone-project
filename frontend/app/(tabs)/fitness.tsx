import React from "react";
import { View, Text } from "react-native";
import TabBar, { Tab } from "@/components/TabBar";
import HistoryScreen from "../screens/FitnessTabs/historyScreen";
import StatsScreen from "../screens/FitnessTabs/statsScreen";
import LibraryScreen from "../screens/FitnessTabs/libraryScreen";
import RoutinesScreen from "../screens/FitnessTabs/routinesScreen";

const FitnessScreen = () => {
  const tabs: Tab[] = [
    { name: "History", component: HistoryScreen },
    { name: "Stats", component: StatsScreen },
    { name: "Routines", component: RoutinesScreen },
    { name: "Library", component: LibraryScreen },
  ];

  const handleTabChange = (index: number) => {};

  return (
    <TabBar
      pageTitle="Fitness"
      tabs={tabs}
      initialTab={0}
      onTabChange={handleTabChange}
    />
  );
};

export default FitnessScreen;
