import React, { useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { SetRow } from "./SetRow";

type ExerciseType = "strength" | "cardio" | "none";

type StatsViewProps = {
  title: string;
  currentIndex: number;
  setsData: Map<number, { reps: string; weight: string; distance: string }[]>;
  setSetsData: React.Dispatch<
    React.SetStateAction<
      Map<number, { reps: string; weight: string; distance: string }[]>
    >
  >;
  exerciseType: ExerciseType;
};

// Memoize the component to prevent unnecessary re-renders
function StatsViewComponent({
  title,
  currentIndex,
  setsData,
  setSetsData,
  exerciseType,
}: StatsViewProps) {
  const currentSets = setsData.get(currentIndex) || [
    { reps: "", weight: "", distance: "" },
  ];

  // Memoize callbacks with stable references
  const updateSet = useCallback(
    (index: number, key: "reps" | "weight" | "distance", val: string) => {
      const numericValue = val.replace(/[^0-9.]/g, "");

      setSetsData((prev) => {
        const newMap = new Map(prev);
        const currentSets = newMap.get(currentIndex) || [
          { reps: "", weight: "", distance: "" },
        ];
        const updatedSets = [...currentSets];
        updatedSets[index] = { ...updatedSets[index], [key]: numericValue };
        newMap.set(currentIndex, updatedSets);
        return newMap;
      });
    },
    [currentIndex, setSetsData]
  );

  const addSet = useCallback(() => {
    setSetsData((prev) => {
      const newMap = new Map(prev);
      const currentSets = newMap.get(currentIndex) || [
        { reps: "", weight: "", distance: "" },
      ];
      newMap.set(currentIndex, [
        ...currentSets,
        { reps: "", weight: "", distance: "" },
      ]);
      return newMap;
    });
  }, [currentIndex, setSetsData]);

  const removeSet = useCallback(
    (index: number) => {
      setSetsData((prev) => {
        const newMap = new Map(prev);
        const currentSets = newMap.get(currentIndex) || [];
        if (currentSets.length > 1) {
          newMap.set(
            currentIndex,
            currentSets.filter((_, i) => i !== index)
          );
        }
        return newMap;
      });
    },
    [currentIndex, setSetsData]
  );

  if (exerciseType === "none") {
    return (
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { marginBottom: 20 }]}>{title}</Text>
        <View style={styles.noInputMessage}>
          <Ionicons
            name="checkmark-circle"
            size={48}
            color={colorPallet.primary}
          />
          <Text style={styles.noInputText}>
            No metrics needed for this exercise type.
          </Text>
          <Text style={styles.noInputSubtext}>
            This exercise doesn't require tracking sets, reps, or distance.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 12 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { marginBottom: 20 }]}>{title}</Text>

        <View style={{ gap: 14, marginTop: 12 }}>
          {currentSets.map((s, i) => (
            <SetRow
              key={`set-${currentIndex}-${i}`}
              index={i}
              set={s}
              exerciseType={exerciseType}
              onChange={updateSet}
              onRemove={removeSet}
              canRemove={currentSets.length > 1}
            />
          ))}
        </View>

        <TouchableOpacity onPress={addSet} style={styles.addSetButton}>
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colorPallet.primary}
          />
          <Text style={styles.addSetText}>Add Set</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Export memoized version - let React handle the default comparison
export const StatsView = memo(StatsViewComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorPallet.neutral_darkest,
    paddingVertical: 16,
    paddingLeft: 0,
    paddingRight: 8,
    marginTop: 8,
  },
  cardTitle: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    marginBottom: 2,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    borderStyle: "dashed",
  },
  addSetText: {
    color: colorPallet.primary,
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 14,
  },
  noInputMessage: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noInputText: {
    color: colorPallet.neutral_lightest,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  noInputSubtext: {
    color: colorPallet.neutral_3,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
