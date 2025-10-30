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
import Alert from "@/components/popupModals/Alert";

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

// Type for storing completed exercise data
type CompletedExerciseData = {
  id: string | number;
  sets: number;
  reps: number;
  weight: number;
  distance: number;
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
  const [alert, setAlert] = useState<{
    visible: boolean;
    mode: "alert" | "success" | "error" | "confirmAction";
    title: string;
    message: string;
    onConfirmAction?: () => void;
  }>({
    visible: false,
    mode: "alert",
    title: "",
    message: "",
    onConfirmAction: undefined,
  });

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

  // Store all exercise data as user progresses through workout
  const [completedExercises, setCompletedExercises] = useState<
    Map<number, CompletedExerciseData>
  >(new Map());

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

  // Store sets data per exercise index to maintain state when navigating
  const [setsData, setSetsData] = useState<
    Map<number, { reps: string; weight: string; distance: string }[]>
  >(new Map());

  // Get or initialize sets for current exercise (start with 1 set)
  const sets = useMemo(() => {
    const existing = setsData.get(currentIndex);
    if (existing) {
      return existing;
    }
    return [{ reps: "", weight: "", distance: "" }]; // Start with 1 empty set
  }, [currentIndex, setsData]);

  function updateSet(
    index: number,
    key: "reps" | "weight" | "distance",
    val: string
  ) {
    // Only allow numeric input
    const numericValue = val.replace(/[^0-9.]/g, "");

    setSetsData((prev) => {
      const newMap = new Map(prev);
      const currentSets = newMap.get(currentIndex) || [
        { reps: "", weight: "", distance: "" },
      ];
      const updatedSets = currentSets.map((s, i) =>
        i === index ? { ...s, [key]: numericValue } : s
      );
      newMap.set(currentIndex, updatedSets);
      return newMap;
    });
  }

  function addSet() {
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
  }

  function removeSet(index: number) {
    setSetsData((prev) => {
      const newMap = new Map(prev);
      const currentSets = newMap.get(currentIndex) || [];
      if (currentSets.length > 1) {
        // Keep at least one set
        newMap.set(
          currentIndex,
          currentSets.filter((_, i) => i !== index)
        );
      }
      return newMap;
    });
  }

  // Save current exercise data before moving to next
  function saveCurrentExercise() {
    if (!currentLite?.id) return;

    const currentSets = setsData.get(currentIndex) || [];

    // Determine exercise type
    const isStrength =
      fullExercise?.category?.toLowerCase() === "strength" ||
      fullExercise?.category?.toLowerCase() === "powerlifting" ||
      fullExercise?.category?.toLowerCase() === "olympic weightlifting";
    const isCardio =
      fullExercise?.category?.toLowerCase() === "cardio" ||
      fullExercise?.category?.toLowerCase() === "running";

    // Calculate totals based on exercise type
    let completedSets;
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    let totalDistance = 0;

    if (isStrength) {
      completedSets = currentSets.filter((s) => s.reps || s.weight);
      totalSets = completedSets.length;
      totalReps = completedSets.reduce(
        (sum, s) => sum + (Number(s.reps) || 0),
        0
      );
      totalWeight = completedSets.reduce(
        (sum, s) => sum + (Number(s.weight) || 0),
        0
      );
    } else if (isCardio) {
      completedSets = currentSets.filter((s) => s.distance);
      totalSets = completedSets.length;
      totalDistance = completedSets.reduce(
        (sum, s) => sum + (Number(s.distance) || 0),
        0
      );
    } else {
      // Default: accept any filled set
      completedSets = currentSets.filter(
        (s) => s.reps || s.weight || s.distance
      );
      totalSets = completedSets.length;
      totalReps = completedSets.reduce(
        (sum, s) => sum + (Number(s.reps) || 0),
        0
      );
      totalWeight = completedSets.reduce(
        (sum, s) => sum + (Number(s.weight) || 0),
        0
      );
      totalDistance = completedSets.reduce(
        (sum, s) => sum + (Number(s.distance) || 0),
        0
      );
    }

    const avgWeight = totalSets > 0 ? totalWeight / totalSets : 0;

    const exerciseData: CompletedExerciseData = {
      id: currentLite.id,
      sets: totalSets,
      reps: totalReps,
      weight: Math.round(avgWeight * 10) / 10, // Round to 1 decimal
      distance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
    };

    setCompletedExercises((prev) =>
      new Map(prev).set(currentIndex, exerciseData)
    );
  }

  function onPrev() {
    if (currentIndex > 0) {
      saveCurrentExercise();
      setCurrentIndex((i) => i - 1);
    }
  }

  function onNext() {
    saveCurrentExercise();

    if (currentIndex < exercisesLite.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onEnd();
    }
  }

  function onEnd() {
    // Save current exercise before ending
    saveCurrentExercise();

    // Use setTimeout to ensure state updates are complete
    setTimeout(() => {
      // Convert Map to array for passing to next screen
      const exercisesArray = Array.from(completedExercises.values());

      // Pass workout data to duration screen
      router.push({
        pathname: "/screens/FitnessTabs/routineScreens/durationRoutine",
        params: {
          routineName: params.name || "Workout",
          exercises: JSON.stringify(exercisesArray),
        },
      });
    }, 100);
  }

  function onCancel() {
    setAlert({
      visible: true,
      mode: "confirmAction",
      title: "Cancel Workout?",
      message:
        "Are you sure you want to cancel this workout? Your progress will be lost.",
      onConfirmAction: () => {
        router.back();
      },
    });
  }

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });

    if (alert.mode === "confirmAction" && alert.onConfirmAction) {
      alert.onConfirmAction();
    }
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });
  };

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

  const StatsTab = () => {
    // Determine exercise type
    const isStrength =
      fullExercise?.category?.toLowerCase() === "strength" ||
      fullExercise?.category?.toLowerCase() === "powerlifting" ||
      fullExercise?.category?.toLowerCase() === "olympic weightlifting";
    const isCardio =
      fullExercise?.category?.toLowerCase() === "cardio" ||
      fullExercise?.category?.toLowerCase() === "running";

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 12 }}
      >
        <StatsCard
          title={`Log ${isCardio ? "Distance" : "Weight"} — ${
            fullExercise?.name ?? currentLite?.name ?? ""
          }`}
          sets={sets}
          onChange={updateSet}
          onAddSet={addSet}
          onRemoveSet={removeSet}
          isStrength={isStrength}
          isCardio={isCardio}
        />
      </ScrollView>
    );
  };

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

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={24} color={colorPallet.secondary} />
      </TouchableOpacity>

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

      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
        confirmText={alert.mode === "confirmAction" ? "Cancel Workout" : "OK"}
        cancelText="Keep Going"
      />
    </View>
  );
}

function StatsCard({
  title,
  sets,
  onChange,
  onAddSet,
  onRemoveSet,
  isStrength,
  isCardio,
}: {
  title: string;
  sets: { reps: string; weight: string; distance: string }[];
  onChange: (
    index: number,
    key: "reps" | "weight" | "distance",
    val: string
  ) => void;
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  isStrength: boolean;
  isCardio: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardTitle, { marginBottom: 20 }]}>{title}</Text>

      <View style={{ gap: 14, marginTop: 12 }}>
        {sets.map((s, i) => (
          <View style={styles.setRow} key={i}>
            <Text style={styles.setIndex}>{i + 1}</Text>

            {isStrength && (
              <>
                {/* Reps Input */}
                <View style={[styles.inputWrap, { marginRight: 10 }]}>
                  <RNTextInput
                    value={s.reps}
                    onChangeText={(t) => onChange(i, "reps", t)}
                    placeholder="Reps"
                    placeholderTextColor={colorPallet.neutral_4}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      { color: colorPallet.neutral_lightest },
                    ]}
                  />
                </View>

                <Text style={styles.times}>x</Text>

                {/* Weight Input */}
                <View style={[styles.inputWrap, { marginLeft: 10 }]}>
                  <RNTextInput
                    value={s.weight}
                    onChangeText={(t) => onChange(i, "weight", t)}
                    placeholder="Weight"
                    placeholderTextColor={colorPallet.neutral_4}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      { color: colorPallet.neutral_lightest },
                    ]}
                  />
                </View>
              </>
            )}

            {isCardio && (
              <>
                {/* Distance Input */}
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <RNTextInput
                    value={s.distance}
                    onChangeText={(t) => onChange(i, "distance", t)}
                    placeholder="Distance (km)"
                    placeholderTextColor={colorPallet.neutral_4}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      { color: colorPallet.neutral_lightest },
                    ]}
                  />
                </View>
              </>
            )}

            {!isStrength && !isCardio && (
              <>
                {/* Default: Show all fields */}
                <View style={[styles.inputWrap, { marginRight: 6, flex: 1 }]}>
                  <RNTextInput
                    value={s.reps}
                    onChangeText={(t) => onChange(i, "reps", t)}
                    placeholder="Reps"
                    placeholderTextColor={colorPallet.neutral_4}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      { color: colorPallet.neutral_lightest },
                    ]}
                  />
                </View>

                <View
                  style={[styles.inputWrap, { marginHorizontal: 6, flex: 1 }]}
                >
                  <RNTextInput
                    value={s.weight}
                    onChangeText={(t) => onChange(i, "weight", t)}
                    placeholder="Weight"
                    placeholderTextColor={colorPallet.neutral_4}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      { color: colorPallet.neutral_lightest },
                    ]}
                  />
                </View>

                <View style={[styles.inputWrap, { marginLeft: 6, flex: 1 }]}>
                  <RNTextInput
                    value={s.distance}
                    onChangeText={(t) => onChange(i, "distance", t)}
                    placeholder="Dist"
                    placeholderTextColor={colorPallet.neutral_4}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      { color: colorPallet.neutral_lightest },
                    ]}
                  />
                </View>
              </>
            )}

            {/* Delete Set Button (only show if more than 1 set) */}
            {sets.length > 1 && (
              <TouchableOpacity
                onPress={() => onRemoveSet(i)}
                style={styles.deleteButton}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={colorPallet.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Add Set Button */}
      <TouchableOpacity onPress={onAddSet} style={styles.addSetButton}>
        <Ionicons
          name="add-circle-outline"
          size={20}
          color={colorPallet.primary}
        />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  routineImage: {
    width: "100%",
    height: 340,
    backgroundColor: colorPallet.neutral_6,
  },
  cancelButton: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colorPallet.neutral_6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
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
  deleteButton: {
    marginLeft: 8,
    padding: 4,
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
});
