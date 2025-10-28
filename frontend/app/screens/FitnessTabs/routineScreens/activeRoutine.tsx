import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image as RNImage,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { popupModalStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "@/api/endpoints";
import InstructionsExerciseScreen from "../exerciseInfoTabs/instructionsExcerciseScreen";
import AboutExerciseScreen from "../exerciseInfoTabs/aboutExerciseScreen";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import { Image as ExpoImage } from "expo-image";
import TabBar, { Tab } from "@/components/TabBar";

type Params = {
  id?: string;
  name?: string;
  thumbnailUrl?: string;
  exercises?: string;
  index?: string;
};

type ExerciseLite = {
  id?: string | number;
  name: string;
  thumbnailUrl?: string;
  images?: string[];
  gifUrl?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number;
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

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

const FALLBACK_IMG =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/assisted-dip/assisted-dip-1.png";

const abs = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `${IMAGE_BASE_URL}${u}`) : undefined;

const ImageCarousel = React.memo(({ images }: { images: string[] }) => {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % images.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const currentImage = images[imageIndex] ?? FALLBACK_IMG;

  return (
    <ExpoImage
      source={{ uri: currentImage }}
      style={styles.routineImage}
      contentFit="cover"
      transition={150}
    />
  );
});

function pickTopMedia(ex?: {
  images?: string[];
  thumbnailUrl?: string;
  gifUrl?: string;
}) {
  const gifFromImages = ex?.images?.find((u) =>
    u?.toLowerCase().endsWith(".gif")
  );
  return (
    abs(ex?.gifUrl) ||
    abs(gifFromImages) ||
    abs(ex?.images?.[0]) ||
    abs(ex?.thumbnailUrl) ||
    FALLBACK_IMG
  );
}

export default function ActiveRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const navigation = useNavigation();
  const { exercises: library } = useWorkoutLibrary();

  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "slide_from_right",
      headerShown: false,
      contentStyle: { backgroundColor: "#0B0B0B" },
    } as any);
  }, [navigation]);

  const exercisesLite: ExerciseLite[] = useMemo(() => {
    if (params?.exercises) {
      try {
        const arr = JSON.parse(String(params.exercises));
        if (Array.isArray(arr) && arr.length) {
          if (typeof arr[0] === "object" && arr[0].id) {
            return arr.map((ex) => ({
              id: ex.id,
              name: ex.name,
              images: ex.images,
              thumbnailUrl: ex.thumbnailUrl || ex.images?.[0],
              gifUrl:
                ex.gifUrl ||
                ex.images?.find((u: string) =>
                  u?.toLowerCase().endsWith(".gif")
                ),
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              distance: ex.distance,
            }));
          }
          if (typeof arr[0] === "string") {
            return (arr as string[]).map((name) => {
              const match = Array.isArray(library)
                ? library.find(
                    (e) => e.name?.toLowerCase() === String(name).toLowerCase()
                  )
                : undefined;

              return {
                id: match?.id ?? name,
                name,
                images: match?.images,
                thumbnailUrl: match?.images?.[0],
                gifUrl: match?.images?.find((u) =>
                  u.toLowerCase().endsWith(".gif")
                ),
              } as ExerciseLite;
            });
          }
        }
      } catch {}
    }
    return [];
  }, [params?.exercises, library]);

  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.max(0, Number(params?.index ?? 0))
  );

  const hasExercises = exercisesLite.length > 0;
  const safeIndex = hasExercises
    ? Math.min(currentIndex, exercisesLite.length - 1)
    : 0;
  const currentLite = hasExercises ? exercisesLite[safeIndex] : undefined;

  const fullExercise: Exercise | undefined = useMemo(() => {
    if (!currentLite) return undefined;
    const byId =
      library.find((e) => String(e.id) === String(currentLite.id)) ||
      library.find(
        (e) =>
          e.name?.toLowerCase() === String(currentLite.name || "").toLowerCase()
      );
    return byId;
  }, [currentLite?.id, currentLite?.name, library]);

  // ----- IMAGE CYCLE LOGIC -----
  const topImages = useMemo(() => {
    const imgs = fullExercise?.images ?? currentLite?.images ?? [];
    return imgs.map(abs).filter(Boolean) as string[];
  }, [fullExercise, currentLite]);
  // -------------------------------

  const [sets, setSets] = useState(
    Array.from({ length: 4 }, () => ({ reps: "", weight: "" }))
  );

  function updateSet(index: number, key: "reps" | "weight", val: string) {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: val } : s))
    );
  }

  function onPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSets(Array.from({ length: 4 }, () => ({ reps: "", weight: "" })));
    }
  }

  function onNext() {
    if (currentIndex < exercisesLite.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSets(Array.from({ length: 4 }, () => ({ reps: "", weight: "" })));
    } else {
      onEnd();
    }
  }

  function onEnd() {
    router.push("/screens/FitnessTabs/routineScreens/durationRoutine");
  }

  const aboutExercise: ExerciseForAbout = useMemo(
    () => ({
      id: String(fullExercise?.id ?? currentLite?.id ?? "0"),
      name: fullExercise?.name ?? currentLite?.name ?? "Exercise",
      force: fullExercise?.force ?? null,
      level: fullExercise?.level ?? null,
      mechanic: fullExercise?.mechanic ?? null,
      equipment: fullExercise?.equipment ?? null,
      category: fullExercise?.category ?? null,
      primaryMuscles: fullExercise?.primaryMuscles ?? [],
      secondaryMuscles: fullExercise?.secondaryMuscles ?? [],
      images: (fullExercise?.images ?? currentLite?.images ?? []).map(
        (p) => abs(p)!
      ) as string[],
    }),
    [fullExercise, currentLite]
  );

  const StatsTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 12 }}
    >
      <StatsCard
        title={`Log Weight — ${fullExercise?.name ?? currentLite?.name ?? ""}`}
        sets={sets}
        onChange={updateSet}
      />
    </ScrollView>
  );

  const AboutTab = () => (
    <AboutExerciseScreen exercise={fullExercise as Exercise} />
  );

  const InstructionsTab = () => (
    <InstructionsExerciseScreen exercise={fullExercise as Exercise} />
  );

  const tabs: Tab[] = [
    { name: "Stats", component: StatsTab },
    { name: "About", component: AboutTab },
    { name: "Instructions", component: InstructionsTab },
  ];

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: colorPallet.neutral_darkest }}>
      {/* Top image */}
      <ImageCarousel images={topImages} />

      {/* TabBar */}
      <TabBar
        tabs={tabs}
        pageTitle={fullExercise?.name ?? currentLite?.name ?? ""}
        initialTab={0}
        onTabChange={setActiveTabIndex}
        outerContainerStyle={popupModalStyles.tabOuterContainer}
        tabBarContainerStyle={popupModalStyles.tabBarContainer}
        tabBarStyle={popupModalStyles.tabBar}
        tabButtonStyle={popupModalStyles.tabButton}
        pageTitleStyle={popupModalStyles.pageTitle}
      />

      {/* Control buttons */}
      {activeTabIndex === 0 && (
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
              currentIndex === exercisesLite.length - 1 && { opacity: 0.4 },
            ]}
            onPress={onNext}
            disabled={currentIndex >= exercisesLite.length - 1}
          >
            <Ionicons
              name="play-forward"
              size={20}
              color={colorPallet.neutral_lightest}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
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
      <Text style={[styles.cardTitle, { marginBottom: 20 }]}>{title}</Text>

      <View style={{ gap: 14, marginTop: 12 }}>
        {sets.map((s, i) => (
          <View style={styles.setRow} key={i}>
            <Text style={styles.setIndex}>{i + 1}</Text>

            <View style={[styles.inputWrap, { marginRight: 10 }]}>
              <RNTextInput
                value={s.reps}
                onChangeText={(t) => onChange(i, "reps", t)}
                placeholder="Reps"
                placeholderTextColor={colorPallet.neutral_4}
                keyboardType="numeric"
                style={[styles.input, { color: colorPallet.neutral_lightest }]}
              />
            </View>

            <Text style={styles.times}>x</Text>

            <View style={[styles.inputWrap, { marginLeft: 10 }]}>
              <RNTextInput
                value={s.weight}
                onChangeText={(t) => onChange(i, "weight", t)}
                placeholder="Weight"
                placeholderTextColor={colorPallet.neutral_4}
                keyboardType="numeric"
                style={[styles.input, { color: colorPallet.neutral_lightest }]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  routineImage: {
    width: "100%",
    height: 340,
    backgroundColor: colorPallet.neutral_6,
  },
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
  tabText: {
    fontWeight: "700",
  },
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

const aboutStyles = StyleSheet.create({
  sectionTitle: {
    color: colorPallet.secondary,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: colorPallet.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagSecondary: {
    backgroundColor: colorPallet.secondary,
  },
  tagText: {
    color: colorPallet.neutral_darkest,
    fontWeight: "700",
  },
  muscleImage: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderRadius: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  infoCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
    borderRadius: 10,
    backgroundColor: colorPallet.neutral_darkest,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoLabel: {
    color: colorPallet.secondary,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoValue: {
    color: colorPallet.neutral_lightest,
    fontWeight: "400",
  },
});
