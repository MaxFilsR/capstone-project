import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

// Memoized image component
const CachedExerciseImage = React.memo(
  ({ imageUrl }: { imageUrl: string | null }) => {
    if (!imageUrl) {
      return (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Ionicons name="barbell" size={32} color={colorPallet.neutral_3} />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: imageUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
    );
  }
);

type ExerciseCardProps = {
  item: Exercise;
  onPress: (item: Exercise) => void;
};

export const ExerciseCard = React.memo<ExerciseCardProps>(
  ({ item, onPress }) => {
    const imageUrl =
      item.images && item.images.length > 0
        ? `${IMAGE_BASE_URL}${item.images[0]}`
        : null;

    return (
      <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
        <CachedExerciseImage imageUrl={imageUrl} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.muscle}>{item.primaryMuscles.join(", ")}</Text>
          {item.level && (
            <Text style={styles.equipment}>Level: {item.level}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 8,
    overflow: "hidden",
    borderColor: colorPallet.primary,
    borderWidth: 1,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: colorPallet.neutral_darkest,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
  },
  info: { flex: 1 },
  name: { color: "#fff", fontSize: 16, fontWeight: "600" },
  muscle: { color: "#aaa", fontSize: 13, marginTop: 4 },
  equipment: { color: "#888", fontSize: 12, marginTop: 2 },
});

export default ExerciseCard;
