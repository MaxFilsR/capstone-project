import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export type Routine = {
  id: string;
  name: string;
  summary?: string;
  exercises?: string[];
};

const myRoutines: Routine[] = [
  { id: "my_routine_1", name: "Morning Run", summary: "Outdoor Run" }, //itemCount: 1. duration: 25}
  {
    id: "my_routine_2",
    name: "Back and Biceps",
    summary: "Deadlift • Seated Row • Lat Pulldown • Bicep Curl",
  },
];

const premadeRoutines: Routine[] = [
  {
    id: "routine_pre_legs",
    name: "Legs",
    exercises: [
      "Squat",
      "Leg Extension",
      "Flat Leg Raise",
      "Standing Calf Raise",
    ],
  },
];

function RoutineCard({
  routine,
  onOpen,
}: {
  routine: Routine;
  onOpen: (r: Routine) => void;
}) {
  const summary =
    routine.summary ??
    (routine.exercises && routine.exercises.length
      ? routine.exercises.join("  •  ")
      : undefined);

  return (
    <View style={{ position: "relative" }}>
      <View style={styles.card}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.cardTitle}>{routine.name}</Text>
          {!!summary && <Text style={styles.cardSummary}>{summary}</Text>}
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colorPallet.neutral_lightest}
        />
      </View>

      <Pressable
        style={styles.cardOverlay}
        hitSlop={10}
        onPress={() => onOpen(routine)}
      />
    </View>
  );
}

const RoutinesScreen = () => (
  <ScrollView style={tabStyles.tabContent}>
    <Image style={globalStyles.logo} source={logo} />

    <Text style={[globalStyles.h1, { alignSelf: "center" }]}>
      {" "}
      Routines Tab
    </Text>
  </ScrollView>
);

export default RoutinesScreen;
