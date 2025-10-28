import React from "react";
import TabBar, { Tab } from "@/components/TabBar";
import HistoryScreen from "../screens/FitnessTabs/historyScreen";
import RecordsScreen from "../screens/FitnessTabs/recordsScreen";
import LibraryScreen from "../screens/FitnessTabs/libraryScreen";
import RoutinesScreen from "../screens/FitnessTabs/routinesScreen";

const FitnessScreen = () => {
  const tabs: Tab[] = [
    { name: "History", component: HistoryScreen },
    { name: "Records", component: RecordsScreen },
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
