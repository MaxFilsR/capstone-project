import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Exercise } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";

type AboutExerciseScreenProps = {
  exercise: Exercise;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const muscleImagesMap: Record<string, any> = {
  Abdominals: require("@/assets/images/muscleGroups/Abdominals.png"),
  Abductors: require("@/assets/images/muscleGroups/Abductors.png"),
  Adductors: require("@/assets/images/muscleGroups/Adductors.png"),
  Biceps: require("@/assets/images/muscleGroups/Biceps.png"),
  Calves: require("@/assets/images/muscleGroups/Calves.png"),
  Chest: require("@/assets/images/muscleGroups/Chest.png"),
  Forearms: require("@/assets/images/muscleGroups/Forearms.png"),
  Glutes: require("@/assets/images/muscleGroups/Glutes.png"),
  Hamstrings: require("@/assets/images/muscleGroups/Hamstrings.png"),
  Lats: require("@/assets/images/muscleGroups/Lats.png"),
  Neck: require("@/assets/images/muscleGroups/Neck.png"),
  Shoulders: require("@/assets/images/muscleGroups/Shoulders.png"),
  Triceps: require("@/assets/images/muscleGroups/Triceps.png"),
};

const AboutExerciseScreen: React.FC<AboutExerciseScreenProps> = ({
  exercise,
}) => {
  const combinedMuscles = [
    ...(exercise.primaryMuscles || []).map((name) => ({
      name,
      type: "primary",
    })),
    ...(exercise.secondaryMuscles || []).map((name) => ({
      name,
      type: "secondary",
    })),
  ];

  const muscleImages = combinedMuscles
    .map((muscle) => {
      const normalizedName =
        muscle.name.charAt(0).toUpperCase() +
        muscle.name.slice(1).toLowerCase();
      const img = muscleImagesMap[normalizedName];
      return img ? { img, type: muscle.type } : null;
    })
    .filter(Boolean) as { img: any; type: "primary" | "secondary" }[];

  const infoCards = [
    { label: "Equipment", value: exercise.equipment },
    { label: "Force Type", value: exercise.force },
    { label: "Difficulty Level", value: exercise.level },
    { label: "Mechanic", value: exercise.mechanic },
    { label: "Category", value: exercise.category },
  ].filter((item) => item.value);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (SCREEN_WIDTH * 0.8 + 16));
    setCurrentIndex(index);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator
      bounces
      style={[styles.scrollView, { backgroundColor: colorPallet.neutral_6 }]}
      contentContainerStyle={styles.scrollContent}
    >
      {combinedMuscles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Muscles</Text>
          <View style={styles.tagContainer}>
            {combinedMuscles.map((muscle, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  muscle.type === "secondary" && styles.tagSecondary,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    muscle.type === "secondary" && {
                      color: colorPallet.secondary,
                    },
                  ]}
                >
                  {muscle.name}
                </Text>
              </View>
            ))}
          </View>

          {muscleImages.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12, overflow: "visible" }}
              contentContainerStyle={{ alignItems: "center" }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {muscleImages.map((m, index) => (
                <Image
                  key={index}
                  source={m.img}
                  style={[
                    styles.muscleImage,
                    {
                      borderColor:
                        m.type === "primary"
                          ? colorPallet.primary
                          : colorPallet.secondary,
                    },
                  ]}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {infoCards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Information</Text>
          <View style={styles.infoGrid}>
            {infoCards.map((item, index) => (
              <View key={index} style={styles.infoCard}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  label: {
    color: colorPallet.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: colorPallet.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagSecondary: {
    backgroundColor: colorPallet.neutral_darkest,
    borderWidth: 1,
    borderColor: colorPallet.neutral_3,
  },
  tagText: { fontSize: 14, fontWeight: "600", textTransform: "capitalize" },
  muscleImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 16,
    alignSelf: "center",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  infoCard: {
    backgroundColor: colorPallet.neutral_darkest,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
    borderRadius: 10,
    padding: 12,
    width: "48%",
  },
  infoLabel: {
    color: colorPallet.secondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    color: colorPallet.neutral_lightest,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default AboutExerciseScreen;
