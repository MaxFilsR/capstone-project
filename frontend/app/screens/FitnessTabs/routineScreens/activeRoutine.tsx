///screens/FitnessTabs/routineScreens/activeRoutine

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  StyleSheet as RNStyleSheet,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { tabStyles, typography, popupModalStyles } from "@/styles";
import { BackButton, FormButton } from "@/components";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { getWorkoutLibrary, Exercise } from "@/api/endpoints";
import Popup from "@/components/PopupModal";
import { HeaderTitle } from "@react-navigation/elements";
import AboutExerciseScreen from "../exerciseInfoTabs/aboutExcerciseScreen";
import InstructionsExerciseScreen from "../exerciseInfoTabs/instructionsExcerciseScreen";

type Params = {
  id?: string;
  name?: string;
  thumbnailUrl?: string;
  exercises?: string;
  index?: string;
};

type TabKey = "stats" | "about" | "instructions";

type ExerciseLite = {
  id?: string | number;
  name: string;
  thumbnailUrl?: string;
  images?: string[];
  gifUrl?: string;
};

type ExerciseForAbout = {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  category: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  images: string[];
};

const FALLBACK_IMG =
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/assisted-dip/assisted-dip-1.png";

function pickTopMedia(ex: ExerciseLite | null): string {
  if (!ex) return FALLBACK_IMG;
  const gifFromImages = ex.images?.find((u) => u?.toLowerCase().endsWith(".gif"));
  return ex.gifUrl || gifFromImages || ex.images?.[0] || ex.thumbnailUrl || FALLBACK_IMG;
}

export default function ActiveRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const navigation = useNavigation();

  //const routineName = String(params?.name ?? "Routine");

  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "slide_from_right",
      headerShown: false,
      contentStyle: { backgroundColor: "#0B0B0B" },
    });
  }, [navigation]);

  const exercises: ExerciseLite[] = useMemo(() => {
    try {
      if (params?.exercises) {
        const arr = JSON.parse(String(params.exercises));
        if (Array.isArray(arr) && arr.length) return arr as ExerciseLite[];
      }
    } catch {}
    return [
      {
        id: "1",
        name: "Bench Press",
        thumbnailUrl:
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/bench-press/bench-press-1.png",
        gifUrl: "https://.../bench-press.gif",
      },
      {
        id: "2",
        name: "Barbell Row",
        thumbnailUrl:
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-row/barbell-row-1.png",
        gifUrl: "https://.../bench-press.gif",
      },
      {
        id: "3",
        name: "Squat",
        thumbnailUrl:
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/squat/squat-1.png",
        gifUrl: "https://.../bench-press.gif",
      },
      {
        id: "4",
        name: "Overhead Press",
        thumbnailUrl:
          "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/overhead-press/overhead-press-1.png",
        gifUrl: "https://.../bench-press.gif",
      },
    ];
  }, [params]);

  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.max(0, Number(params?.index ?? 0))
  );

  const hasExercises = exercises.length > 0;
  const safeIndex = hasExercises ? Math.min(currentIndex, exercises.length -1): 0;
  const current: ExerciseLite | null = hasExercises ? exercises[safeIndex] : null;

  const topImage = pickTopMedia(current);

  // Tabs
  const [tab, setTab] = useState<TabKey>("stats");

  // Sets state for current exercise
  const [sets, setSets] = useState(
    Array.from({ length: 4}, () => ({ reps: "", weight: "" }))
  );


  function updateSet(
    index: number,
    key: "reps" | "weight",
    val: string
  ) {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ... set, [key]: val } : {...set}))
    );
  }

  //TAHAN SAAKKA TEHNY UNTIL RETURN

  // Navigate between exercises
  function onPrev() {
    if (!hasExercises) return;
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSets(Array.from({ length: 4 }, () => ({ reps: "", weight: ""})));
    }
  }

  function onNext() {
    if (!hasExercises) return;
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(i => i + 1);
      setSets(Array.from({ length: 4 }, () => ({ reps: "", weight: ""})));
    } else {
      onEnd();
    }
  }
  function onEnd() {
    router.back();
  }

  const currentExerciseForAbout: ExerciseForAbout = {
    id: String(current?.id ?? "0"),
    name: current?.name ?? "Exercise",
    force: "pull",              // put real values when you fetch them
    level: "beginner",
    mechanic: "compound",
    equipment: "body only",
    category: "strength",
    primaryMuscles: ["abdominals"],  // fill from API when available
    secondaryMuscles: [],
    images: current?.images ?? (current?.thumbnailUrl ? [current.thumbnailUrl] : []),
  }

  return (
    <View style={{ flex: 1, backgroundColor: colorPallet.neutral_darkest }}>
      {/* Top image */}
      <Image source={{ uri: topImage }} style={styles.routineImage} resizeMode="cover" />

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <View style={styles.tabsPill}>
          <TabButton label="Stats" active={tab === "stats"} onPress={() => setTab("stats")} />
          <TabButton label="About" active={tab === "about"} onPress={() => setTab("about")} />
          <TabButton label="Instructions" active={tab === "instructions"} onPress={() => setTab("instructions")} />
        </View>
      </View>

      {/* Content */}
      {tab === "about" ? (
        <AboutExerciseScreen exercise={currentExerciseForAbout} />
      ) : tab === "instructions" ? (
        <InstructionsExerciseScreen exercise={currentExerciseForAbout} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 12 }}
        >
          <StatsCard title={`Log Weight — ${current?.name ?? ""}`} sets={sets} onChange={updateSet} />
        </ScrollView>
      )}


      {tab !== "about" && ( // hide controls in About tab
        <View style={styles.transport}>
          <TouchableOpacity
            style={[styles.smallRound, currentIndex === 0 && { opacity: 0.4 }]}
            onPress={onPrev}
            disabled={currentIndex === 0}
          >
            <Ionicons name="play-back" size={20} color={colorPallet.neutral_lightest} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endRound} onPress={onEnd}>
            <Text style={styles.endText}>End</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.smallRound,
              currentIndex === exercises.length - 1 && { opacity: 0.4 },
            ]}
            onPress={onNext}
            disabled={currentIndex >= exercises.length - 1}
          >
            <Ionicons name="play-forward" size={20} color={colorPallet.neutral_lightest} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}


function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

function StatsCard({
  title,
  sets,
  onChange,
}: {
  title: string;
  sets: { reps: string; weight: string }[];
  onChange: (index: number, key: "reps" | "weight", val: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardTitle, { marginBottom: 20}]}>{title}</Text>

      <View style={{ gap: 14, marginTop: 12 }}>
        {sets.map((s, i) => (
          <View style={styles.setRow} key={i}>
            <Text style={styles.setIndex}>{i + 1}</Text>

            {/* Reps input */}

            <View style={[styles.inputWrap, { marginRight: 10 }]}>
              <RNTextInput
                value={s.reps}
                onChangeText={(t) => onChange(i, "reps", t)}
                placeholder="Reps"
                placeholderTextColor={colorPallet.neutral_4}
                keyboardType="numeric"
                style={[
                  styles.input,
                  { color: colorPallet.neutral_lightest }, //visible text
                ]}
              />
            </View>

            <Text style={styles.times}>x</Text>

            <View style={[styles.inputWrap, {marginLeft: 10 }]}>
              <RNTextInput
                value={s.weight}
                onChangeText={(t) => onChange(i, "weight", t)}
                placeholder="Weight"
                placeholderTextColor={colorPallet.neutral_4}
                keyboardType="numeric"
                style={[
                  styles.input,
                  { color: colorPallet.neutral_lightest }, //visible text
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function AboutLike({ exercise }: { exercise: ExerciseForAbout }) {
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

  const combinedMuscles = [
    ...(exercise.primaryMuscles || []).map((name) => ({ name, type: "primary" as const })),
    ...(exercise.secondaryMuscles || []).map((name) => ({ name, type: "secondary" as const })),
  ];

  const muscleImages =
    combinedMuscles
      .map((m) => {
        const normalized = m.name.charAt(0).toUpperCase() + m.name.slice(1).toLowerCase();
        const img = muscleImagesMap[normalized];
        return img ? { img, type: m.type } : null;
      })
      .filter(Boolean) as { img: any; type: "primary" | "secondary" }[];

  const infoCards = [
    { label: "Equipment", value: exercise.equipment },
    { label: "Force Type", value: exercise.force },
    { label: "Difficulty Level", value: exercise.level },
    { label: "Mechanic", value: exercise.mechanic },
    { label: "Category", value: exercise.category },
  ].filter((i) => i.value);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colorPallet.neutral_6 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      showsVerticalScrollIndicator
    >
      {/* MUSCLES */}
      {combinedMuscles.length > 0 && (
        <View style={{ marginBottom: 18 }}>
          <Text style={aboutStyles.sectionTitle}>MUSCLES</Text>

          {/* Muscle tags */}
          <View style={aboutStyles.tagWrap}>
            {combinedMuscles.map((m, i) => (
              <View
                key={`${m.name}-${i}`}
                style={[
                  aboutStyles.tag,
                  m.type === "secondary" && aboutStyles.tagSecondary,
                ]}
              >
                <Text
                  style={[
                    aboutStyles.tagText,
                    m.type === "secondary" && { color: colorPallet.secondary },
                  ]}
                >
                  {m.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Images */}
          {muscleImages.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12 }}
              contentContainerStyle={{ paddingRight: 8 }}
            >
              {muscleImages.map((m, idx) => (
                <Image
                  key={idx}
                  source={m.img}
                  resizeMode="contain"
                  style={[
                    aboutStyles.muscleImage,
                    {
                      borderColor:
                        m.type === "primary" ? colorPallet.primary : colorPallet.secondary,
                    },
                  ]}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Info */}
      {infoCards.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={aboutStyles.sectionTitle}>INFORMATION</Text>
          <View style={aboutStyles.infoGrid}>
            {infoCards.map((it, i) => (
              <View key={i} style={aboutStyles.infoCard}>
                <Text style={aboutStyles.infoLabel}>{it.label}</Text>
                <Text style={aboutStyles.infoValue as any}>{it.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function InstructionCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Instructions</Text>
      <Text style={styles.body}>
        xyz
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  routineImage: {
    width:"100%",
    height: 340,
    backgroundColor: colorPallet.neutral_6
  },

  /* tabs */
  tabsWrap: {
    paddingHorizontal: 8,
    marginHorizontal: 4,
    marginTop: 10,
    marginBottom: 5,
  },
  tabsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colorPallet.neutral_6,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colorPallet.primary,
  },
  tabText: {
    color: colorPallet.neutral_1,
    fontWeight: "700",
  },
  tabTextActive: {
    color: colorPallet.neutral_darkest,
    fontWeight: "700",
  },
  TabDivider: {
    width: 1,
    height: 20,
    backgroundColor: colorPallet.neutral_5,
    marginHorizontal: 6,
  },

  /* cards */
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
  body: {
    color: colorPallet.neutral_2,
    marginTop: 6,
    lineHeight: 20,
  },

  /* stats */
  setRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  setIndex: {
    width: 20,
    color: colorPallet.primary,
    fontWeight: "400",
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
    fontWeight: "400",
  },
  /* control buttons */
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