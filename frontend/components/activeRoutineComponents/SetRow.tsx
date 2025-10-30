import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput as RNTextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";

type ExerciseType = "strength" | "cardio" | "none";

type SetRowProps = {
  index: number;
  set: { reps: string; weight: string; distance: string };
  exerciseType: ExerciseType;
  onChange: (
    index: number,
    key: "reps" | "weight" | "distance",
    val: string
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
};

export const SetRow = React.memo(
  function SetRow({
    index,
    set,
    exerciseType,
    onChange,
    onRemove,
    canRemove,
  }: SetRowProps) {
    const handleRepsChange = useCallback(
      (val: string) => {
        onChange(index, "reps", val);
      },
      [index, onChange]
    );

    const handleWeightChange = useCallback(
      (val: string) => {
        onChange(index, "weight", val);
      },
      [index, onChange]
    );

    const handleDistanceChange = useCallback(
      (val: string) => {
        onChange(index, "distance", val);
      },
      [index, onChange]
    );

    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    return (
      <View style={styles.setRow}>
        <Text style={styles.setIndex}>{index + 1}</Text>

        {exerciseType === "strength" && (
          <>
            <View style={[styles.inputWrap, { marginRight: 10 }]}>
              <RNTextInput
                value={set.reps}
                onChangeText={handleRepsChange}
                placeholder="Reps"
                placeholderTextColor={colorPallet.neutral_4}
                keyboardType="numeric"
                style={[styles.input, { color: colorPallet.neutral_lightest }]}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.times}>x</Text>

            <View style={[styles.inputWrap, { marginLeft: 10 }]}>
              <RNTextInput
                value={set.weight}
                onChangeText={handleWeightChange}
                placeholder="Weight (lbs)"
                placeholderTextColor={colorPallet.neutral_4}
                keyboardType="numeric"
                style={[styles.input, { color: colorPallet.neutral_lightest }]}
                returnKeyType="done"
              />
            </View>
          </>
        )}

        {exerciseType === "cardio" && (
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <RNTextInput
              value={set.distance}
              onChangeText={handleDistanceChange}
              placeholder="Distance (km)"
              placeholderTextColor={colorPallet.neutral_4}
              keyboardType="numeric"
              style={[styles.input, { color: colorPallet.neutral_lightest }]}
              returnKeyType="done"
            />
          </View>
        )}

        {canRemove && (
          <TouchableOpacity onPress={handleRemove} style={styles.deleteButton}>
            <Ionicons
              name="close-circle"
              size={24}
              color={colorPallet.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the actual values or exerciseType change
    return (
      prevProps.index === nextProps.index &&
      prevProps.set.reps === nextProps.set.reps &&
      prevProps.set.weight === nextProps.set.weight &&
      prevProps.set.distance === nextProps.set.distance &&
      prevProps.exerciseType === nextProps.exerciseType &&
      prevProps.canRemove === nextProps.canRemove
    );
  }
);

const styles = StyleSheet.create({
  setRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  setIndex: {
    width: 20,
    color: colorPallet.primary,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 8,
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: colorPallet.neutral_1,
    borderRadius: 10,
    backgroundColor: colorPallet.neutral_darkest,
    height: 50,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: 38,
    textAlignVertical: "center",
    lineHeight: 18,
    paddingTop: 0,
    paddingBottom: 2,
    paddingHorizontal: 14,
    color: colorPallet.neutral_lightest,
    fontWeight: "300",
    fontSize: 14,
    backgroundColor: "transparent",
    borderRadius: 10,
  },
  times: {
    width: 16,
    textAlign: "center",
    color: colorPallet.primary,
    fontWeight: "bold",
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
});
