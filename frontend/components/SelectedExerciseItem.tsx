import React from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Exercise } from "@/api/endpoints";
import { popupModalStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";

type SelectedExerciseItemProps = {
  exercise: Exercise & { uniqueId: string };
  index: number;
  isFirst: boolean;
  isLast: boolean;
  metrics: any;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (uniqueId: string) => void;
  onUpdateMetric: (uniqueId: string, field: string, value: string) => void;
};

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

const SelectedExerciseItem: React.FC<SelectedExerciseItemProps> = ({
  exercise,
  index,
  isFirst,
  isLast,
  metrics,
  onMove,
  onRemove,
  onUpdateMetric,
}) => {
  const hasMetrics =
    exercise.category === "strength" || exercise.category === "running";

  return (
    <View key={exercise.uniqueId}>
      <View
        style={
          hasMetrics
            ? popupModalStyles.selectedExerciseCardWithMetrics
            : popupModalStyles.selectedExerciseCard
        }
      >
        <Image
          source={
            exercise.images?.[0]
              ? {
                  uri: `${IMAGE_BASE_URL}${exercise.images[0]}`,
                }
              : require("@/assets/images/icon.png")
          }
          style={popupModalStyles.exerciseThumbnail}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colorPallet.neutral_1,
              fontWeight: "600",
              fontSize: 16,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {exercise.name}
          </Text>
          <Text
            style={{
              color: colorPallet.neutral_3,
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {exercise.primaryMuscles.join(", ")}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Move Up */}
          <TouchableOpacity
            onPress={() => onMove(index, "up")}
            disabled={isFirst}
            style={{
              padding: 8,
              opacity: isFirst ? 0.3 : 1,
            }}
          >
            <Text
              style={{
                color: colorPallet.neutral_1,
                fontSize: 18,
              }}
            >
              ↑
            </Text>
          </TouchableOpacity>

          {/* Move Down */}
          <TouchableOpacity
            onPress={() => onMove(index, "down")}
            disabled={isLast}
            style={{
              padding: 8,
              opacity: isLast ? 0.3 : 1,
            }}
          >
            <Text
              style={{
                color: colorPallet.neutral_1,
                fontSize: 18,
              }}
            >
              ↓
            </Text>
          </TouchableOpacity>

          {/* Remove */}
          <TouchableOpacity
            onPress={() => onRemove(exercise.uniqueId)}
            style={{ padding: 8 }}
          >
            <Text
              style={{
                color: colorPallet.secondary,
                fontSize: 18,
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {hasMetrics && (
        <View style={popupModalStyles.metricsContainer}>
          {exercise.category === "strength" && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={popupModalStyles.metricInput}
                placeholder="Sets"
                placeholderTextColor={colorPallet.neutral_3}
                keyboardType="numeric"
                value={metrics.sets || ""}
                onChangeText={(text) =>
                  onUpdateMetric(exercise.uniqueId, "sets", text)
                }
              />
              <TextInput
                style={popupModalStyles.metricInput}
                placeholder="Reps"
                placeholderTextColor={colorPallet.neutral_3}
                keyboardType="numeric"
                value={metrics.reps || ""}
                onChangeText={(text) =>
                  onUpdateMetric(exercise.uniqueId, "reps", text)
                }
              />
            </View>
          )}

          {exercise.category === "running" && (
            <TextInput
              style={popupModalStyles.metricInput}
              placeholder="Distance (km)"
              placeholderTextColor={colorPallet.neutral_3}
              keyboardType="numeric"
              value={metrics.distance || ""}
              onChangeText={(text) =>
                onUpdateMetric(exercise.uniqueId, "distance", text)
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

export default SelectedExerciseItem;
