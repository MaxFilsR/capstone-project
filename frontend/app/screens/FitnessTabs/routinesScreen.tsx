import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Button,
  TouchableOpacity,
} from "react-native";
import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Popup from "@/components/PopupModal";

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
          color={colorPallet.secondary}
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

const RoutinesScreen = () => {
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const handleOpen = (r: Routine) => {
    router.push({
      pathname: "/screens/FitnessTabs/routinesScreens/startRoutine",
      params: { id: r.id, name: r.name },
    });
  };

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16, // optional spacing below
        }}
      >
        {/* Header */}
        <Text style={[typography.h2]}>My Routines</Text>

        {/* + Button */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
          onPress={() => setShowCreateRoutine(true)}
        >
          <Text style={{ color: colorPallet.secondary, fontSize: 30 }}>+</Text>
        </TouchableOpacity>
      </View>

      <Popup
        visible={showCreateRoutine}
        mode="createRoutine"
        onClose={() => setShowCreateRoutine(false)}
      />
      <View style={{ gap: 12, marginBottom: 28 }}>
        {myRoutines.map((r) => (
          <RoutineCard key={r.id} routine={r} onOpen={handleOpen} />
        ))}
      </View>
      {/* Pre-made Routines */}
      <Text style={[typography.h2, styles.sectionTitle]}>
        Pre-made Routines
      </Text>
      <View style={{ gap: 12 }}>
        {premadeRoutines.map((r) => (
          <RoutineCard key={r.id} routine={r} onOpen={handleOpen} />
        ))}
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: colorPallet.neutral_lightest,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  cardTitle: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSummary: {
    color: colorPallet.neutral_3,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 2,
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
});

export default RoutinesScreen;
