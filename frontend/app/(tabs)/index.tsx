import React from "react";
import { Text, View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QuickActionButton from "@/components/QuickActionButton";
import RecentWorkouts from "@/components/summaryModuals/RecentWorkouts";
import { colorPallet } from "@/styles/variables";
import { containers, typography } from "@/styles";

export default function HomeScreen() {
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
          contentContainerStyle={containers.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Text style={[typography.h1, { marginBottom: 16 }]}>Home Screen</Text>

          {/* Recent Workouts Module */}
          <View style={containers.moduleContainer}>
            <RecentWorkouts limit={5} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
