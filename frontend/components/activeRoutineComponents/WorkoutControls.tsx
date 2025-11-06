import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";

type WorkoutControlsProps = {
  currentIndex: number;
  totalExercises: number;
  onPrev: () => void;
  onNext: () => void;
  onEnd: () => void;
};

export function WorkoutControls({
  currentIndex,
  totalExercises,
  onPrev,
  onNext,
  onEnd,
}: WorkoutControlsProps) {
  return (
    <View style={styles.transport}>
      <TouchableOpacity
        style={[styles.smallRound, currentIndex === 0 && { opacity: 0.4 }]}
        onPress={onPrev}
        disabled={currentIndex === 0}
      >
        <Ionicons
          name="play-back"
          size={20}
          color={colorPallet.neutral_lightest}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.endRound} onPress={onEnd}>
        <Text style={styles.endText}>End</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.smallRound,
          currentIndex === totalExercises - 1 && { opacity: 0.4 },
        ]}
        onPress={onNext}
        disabled={currentIndex >= totalExercises - 1}
      >
        <Ionicons
          name="play-forward"
          size={20}
          color={colorPallet.neutral_lightest}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  transport: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    height: 150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 28,
  },
  smallRound: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colorPallet.neutral_6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  endRound: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colorPallet.neutral_6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colorPallet.neutral_darkest,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  endText: {
    color: colorPallet.neutral_lightest,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
