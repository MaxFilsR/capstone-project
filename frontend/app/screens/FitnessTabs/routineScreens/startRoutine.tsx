//screens/FitnessTabs/routineScreens/startRoutine

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { tabStyles, typography, popupModalStyles } from "@/styles";
import { BackButton, FormButton } from "@/components";
import { colorPallet } from "@/styles/variables";
import { getWorkoutLibrary, Exercise } from "@/api/endpoints";
import Popup from "@/components/PopupModal";
import { HeaderTitle } from "@react-navigation/elements";
import { BlurView } from "expo-blur";

type Params = {
  id?: string;
  name?: string;
  exerciseName?: string;
  distanceLabel?: string;
  thumbnailUrl?: string;
  exercises?: string;
};


export default function StartRoutineScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<Params>();
  // modal visibility
  const [visible, setVisible] = useState(true);

  const pendingNav = useRef<{ id: string; name: string; thumbnailUrl: string; } | null>(null);

  const routineName = String(params?.name ?? "Routine");
  let parsedExercises: string[] = [];
  try {
    if (params?.exercises) parsedExercises = JSON.parse(String(params.exercises));
  } catch (e) {
    parsedExercises = [];
  }
  if (!parsedExercises.length) {
  const routineMap: Record<string, string[]> = {
    "Morning Run": ["Outdoor Run"],
    "Back and Biceps": ["Deadlift", "Seated Row", "Lat Pulldown", "Bicep Curl"],
    "Legs": ["Squat", "Leg Extension", "Flat Leg Raise", "Standing Calf Raise"],
  };

  parsedExercises = routineMap[String(params?.name ?? "")] || [];
}

  // first exercise shown as title
  const exerciseName =
    parsedExercises.length > 0 ? parsedExercises[0] : "Exercise";


  const distanceLabel =
    parsedExercises.length > 1
      ? parsedExercises.slice(1, 4).join(" • ")
      : parsedExercises.length === 1
      ? "1 Exercise"
      : "No exercises listed";

      const thumbnailUrl = String(
    params?.thumbnailUrl ??
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/assisted-dip/assisted-dip-1.png"
  );

  useEffect(() => {
    navigation.setOptions({
      presentation: "transparentModal",
      animation: "fade",
      headerShown: false,
      contentStyle: { backgroundColor: "transparent" },
    });
  }, [navigation]);

  // close pop up modal
  function close() {
    setVisible(false);
    setTimeout(() => router.back(), 10);
  }

  // go to ongoing or active routine screen
  function startWorkout() {
    const id = params?.id ? String(params.id) : "";
  pendingNav.current = {
    id,
    name: routineName,
    thumbnailUrl,
    exercises: params?.exercises ?? JSON.stringify(parsedExercises),
  };
    setVisible(false);
  }

  return (
    <View style={{ flex: 1 }}>
      {/* back arrow */}
      <BackButton onPress={close} />

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        onDismiss={() => {
          if (pendingNav.current) {
            const p = pendingNav.current;
            pendingNav.current = null;
            router.replace({
              pathname: "/screens/FitnessTabs/routineScreens/activeRoutine",
              params: p,
            });
          }
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BlurView
            intensity={20} // blur strength
            tint="dark" //dark frosted glass
            style={RNStyleSheet.absoluteFill} // cover full screen
          >
            <TouchableOpacity
              style={[
                RNStyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.25)"},
              ]}
              activeOpacity={1}
              onPress={close}
            />
          </BlurView>

          {/* popup content */}
          <View
            style={[
              popupModalStyles.contentWrapper,
              styles.modalSize,
              styles.contentCompact,
              styles.modalBorder,
              styles.modalShadow,
            ]}
          >
            {/* header */}
            <View style={styles.headerRow}>
              <Text style={[typography.h2, styles.headerTitle]}>{routineName}</Text>
              <TouchableOpacity onPress={close} style={styles.closeButton}>
                <Text style={[popupModalStyles.closeText, styles.closeText]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* summary card */}
            <View style={styles.summaryCard}>
              <View style={styles.thumbWrap}>
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseTitle}>Exercises</Text>
                <Text style={styles.subText}>{parsedExercises.length > 0
                  ? `${parsedExercises.length} Exercise${parsedExercises.length > 1 ? "s" : ""}`
                  : "No exercises listed"}
                </Text>
              </View>
            </View>

            {/* start button */}
            <View style={{ paddingHorizontal: 14, paddingBottom: 16 }}>
              <FormButton title="Start Workout" onPress={startWorkout} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* styling */
const styles = StyleSheet.create({
  modalSize: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    flexGrow: 0,
    flexShrink: 1,
  },
  modalBorder: {
    borderWidth: 1,
    borderColor: colorPallet.primary,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
  },
  contentCompact: {
    padding: 0,
    flex: 0,
    height: "auto",
    minHeight: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    color: colorPallet.neutral_lightest,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  summaryCard: {
    marginHorizontal: 14,
    marginTop: 2,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    backgroundColor: colorPallet.neutral_6,
    padding: 8,
    gap: 12,
  },
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
    borderWidth: 1,
    borderColor: colorPallet.neutral_darkest,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  exerciseTitle: {
    color: colorPallet.neutral_lightest,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  subText: {
    color: colorPallet.neutral_3,
    fontSize: 12,
  },
  closeText: {
    color: colorPallet.secondary,
    fontSize: 20,
    fontWeight: "400",
    includeFontPadding: false,
    textAlign: "center",
    marginTop: -2,
  },
});