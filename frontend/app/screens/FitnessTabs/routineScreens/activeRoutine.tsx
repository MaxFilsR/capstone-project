// activeRoutine.tsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { popupModalStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "@/api/endpoints";
import InstructionsExerciseScreen from "../exerciseInfoTabs/instructionsExcerciseScreen";
import AboutExerciseScreen from "../exerciseInfoTabs/aboutExerciseScreen";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import TabBar, { Tab } from "@/components/TabBar";
import Alert from "@/components/popupModals/Alert";

// Import new components
import { StatsView } from "@/components/activeRoutineComponents/StatsView";
import { WorkoutControls } from "@/components/activeRoutineComponents/WorkoutControls";
import {
  ExerciseLite,
  CompletedExerciseData,
  ExerciseForAbout,
} from "@/components/activeRoutineComponents/types";
import {
  abs,
  getExerciseType,
  IMAGE_BASE_URL,
} from "@/components/activeRoutineComponents/utils";

type Params = {
  id?: string;
  name?: string;
  thumbnailUrl?: string;
  exercises?: string;
  index?: string;
};

const HEADER_EXPANDED_HEIGHT = 340;
const HEADER_COLLAPSED_HEIGHT = 132;
const SCROLL_THRESHOLD = 150;

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

  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.max(0, Number(params?.index ?? 0))
  );

  const [completedExercises, setCompletedExercises] = useState<
    Map<number, CompletedExerciseData>
  >(new Map());

  const [setsData, setSetsData] = useState<
    Map<number, { reps: string; weight: string; distance: string }[]>
  >(new Map());

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

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

  const topImages = useMemo(() => {
    const imgs = fullExercise?.images ?? currentLite?.images ?? [];
    return imgs.map(abs).filter(Boolean) as string[];
  }, [fullExercise, currentLite]);

  // Reset image index when exercise changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [fullExercise?.id]);

  // Auto-rotate images
  useEffect(() => {
    if (topImages.length < 2) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % topImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [topImages.length]);

  useEffect(() => {
    if (!setsData.has(currentIndex)) {
      setSetsData((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentIndex, [{ reps: "", weight: "", distance: "" }]);
        return newMap;
      });
    }
  }, [currentIndex]);

  // Animated values for header transformation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 1.5],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  const titleFontSize = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [24, 16],
    extrapolate: "clamp",
  });

  const collapsedHeaderOpacity = scrollY.interpolate({
    inputRange: [SCROLL_THRESHOLD - 20, SCROLL_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const expandedHeaderOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD - 20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  function saveCurrentExercise() {
    if (!currentLite?.id) return;

    const currentSets = setsData.get(currentIndex) || [];
    const exerciseType = getExerciseType(fullExercise?.category);

    let completedSets;
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    let totalDistance = 0;

    if (exerciseType === "strength") {
      // Filter out empty sets (must have reps OR weight)
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
    } else if (exerciseType === "cardio") {
      // Filter out empty sets (must have distance)
      completedSets = currentSets.filter((s) => s.distance);
      totalSets = completedSets.length;
      totalDistance = completedSets.reduce(
        (sum, s) => sum + (Number(s.distance) || 0),
        0
      );
    } else {
      totalSets = currentSets.length;
    }

    // Also update the setsData to remove empty sets
    if (exerciseType === "strength" || exerciseType === "cardio") {
      setSetsData((prev) => {
        const newMap = new Map(prev);
        if (completedSets && completedSets.length > 0) {
          newMap.set(currentIndex, completedSets);
        } else {
          // Keep at least one empty set if all were removed
          newMap.set(currentIndex, [{ reps: "", weight: "", distance: "" }]);
        }
        return newMap;
      });
    }

    const avgWeight = totalSets > 0 ? totalWeight / totalSets : 0;

    const exerciseData: CompletedExerciseData = {
      id: currentLite.id,
      sets: totalSets,
      reps: totalReps,
      weight: Math.round(avgWeight * 10) / 10,
      distance: Math.round(totalDistance * 10) / 10,
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
    // Save current exercise first
    if (!currentLite?.id) {
      // If no current exercise, just use what we have
      navigateToDuration();
      return;
    }

    const currentSets = setsData.get(currentIndex) || [];
    const exerciseType = getExerciseType(fullExercise?.category);

    let completedSets;
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    let totalDistance = 0;

    if (exerciseType === "strength") {
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
    } else if (exerciseType === "cardio") {
      completedSets = currentSets.filter((s) => s.distance);
      totalSets = completedSets.length;
      totalDistance = completedSets.reduce(
        (sum, s) => sum + (Number(s.distance) || 0),
        0
      );
    } else {
      totalSets = currentSets.length;
    }

    const avgWeight = totalSets > 0 ? totalWeight / totalSets : 0;

    const exerciseData: CompletedExerciseData = {
      id: currentLite.id,
      sets: totalSets,
      reps: totalReps,
      weight: Math.round(avgWeight * 10) / 10,
      distance: Math.round(totalDistance * 10) / 10,
    };

    // Create the final exercises array directly without relying on state update
    const finalExercises = new Map(completedExercises);
    finalExercises.set(currentIndex, exerciseData);

    // Convert to array and navigate immediately
    navigateToDuration(Array.from(finalExercises.values()));
  }

  // Helper function to navigate
  function navigateToDuration(exercisesArray?: CompletedExerciseData[]) {
    const exercises = exercisesArray || Array.from(completedExercises.values());

    router.push({
      pathname: "/screens/FitnessTabs/routineScreens/durationRoutine",
      params: {
        routineName: params.name || "Workout",
        exercises: JSON.stringify(exercises),
      },
    });
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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsHeaderCollapsed(offsetY > SCROLL_THRESHOLD - 20);
      },
    }
  );

  const exerciseType = getExerciseType(fullExercise?.category);

  const statsTitle = `Log ${
    exerciseType === "cardio"
      ? "Distance"
      : exerciseType === "strength"
      ? "Sets & Reps"
      : "Exercise"
  } — ${fullExercise?.name ?? currentLite?.name ?? ""}`;

  // Include setsData in dependencies so we don't have stale closures
  const StatsTabComponent = useMemo(
    () => () =>
      (
        <StatsView
          title={statsTitle}
          currentIndex={currentIndex}
          setsData={setsData}
          setSetsData={setSetsData}
          exerciseType={exerciseType}
        />
      ),
    [statsTitle, currentIndex, exerciseType, setsData, setSetsData]
  );

  const AboutTab = useMemo(
    () => () => <AboutExerciseScreen exercise={fullExercise as Exercise} />,
    [fullExercise]
  );

  const InstructionsTab = useMemo(
    () => () =>
      <InstructionsExerciseScreen exercise={fullExercise as Exercise} />,
    [fullExercise]
  );

  const tabs: Tab[] = useMemo(
    () => [
      { name: "Stats", component: StatsTabComponent },
      { name: "About", component: AboutTab },
      { name: "Instructions", component: InstructionsTab },
    ],
    [StatsTabComponent, AboutTab, InstructionsTab]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colorPallet.neutral_darkest }}>
      {/* Sticky Animated Header */}
      <Animated.View style={[styles.stickyHeader, { height: headerHeight }]}>
        {/* Cancel Button - Always on top */}
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={colorPallet.secondary} />
        </TouchableOpacity>

        {/* Expanded Header */}
        <Animated.View
          style={[styles.expandedHeader, { opacity: expandedHeaderOpacity }]}
          pointerEvents={isHeaderCollapsed ? "none" : "auto"}
        >
          {topImages.length > 0 && (
            <Animated.View
              style={[
                styles.expandedImageContainer,
                { opacity: imageOpacity, transform: [{ scale: imageScale }] },
              ]}
            >
              <Image
                source={{ uri: topImages[activeImageIndex] }}
                style={styles.expandedImage}
                resizeMode="cover"
              />
              {topImages.length > 1 && (
                <View style={styles.imageDots}>
                  {topImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === activeImageIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </Animated.View>
          )}
          <Animated.Text
            style={[styles.expandedTitle, { fontSize: titleFontSize }]}
          >
            {fullExercise?.name ?? currentLite?.name ?? ""}
          </Animated.Text>
        </Animated.View>

        {/* Collapsed Header */}
        <Animated.View
          style={[styles.collapsedHeader, { opacity: collapsedHeaderOpacity }]}
          pointerEvents={isHeaderCollapsed ? "auto" : "none"}
        >
          {topImages.length > 0 && (
            <Image
              source={{ uri: topImages[activeImageIndex] }}
              style={styles.collapsedImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.collapsedContent}>
            <Text style={typography.h1} numberOfLines={2}>
              {fullExercise?.name ?? currentLite?.name ?? ""}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: HEADER_EXPANDED_HEIGHT }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Tabs Content */}
        <View style={styles.tabsContainer}>
          <TabBar
            tabs={tabs}
            initialTab={0}
            onTabChange={setActiveTabIndex}
            outerContainerStyle={popupModalStyles.tabOuterContainer}
            tabBarContainerStyle={popupModalStyles.tabBarContainer}
            tabBarStyle={popupModalStyles.tabBar}
            tabButtonStyle={popupModalStyles.tabButton}
            pageTitleStyle={popupModalStyles.pageTitle}
          />
        </View>
      </Animated.ScrollView>

      {/* Workout Controls */}
      {activeTabIndex === 0 && (
        <WorkoutControls
          currentIndex={currentIndex}
          totalExercises={exercisesLite.length}
          onPrev={onPrev}
          onNext={onNext}
          onEnd={onEnd}
        />
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colorPallet.neutral_darkest,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.primary,
    overflow: "hidden",
  },
  cancelButton: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 101,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colorPallet.neutral_6,
    alignItems: "center",
    justifyContent: "center",
  },
  // Expanded Header Styles
  expandedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_EXPANDED_HEIGHT,
    paddingHorizontal: 0,
    paddingTop: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  expandedImageContainer: {
    width: "100%",
    height: 280,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: colorPallet.neutral_5,
    position: "relative",
  },
  expandedImage: {
    width: "100%",
    height: "100%",
  },
  expandedTitle: {
    color: colorPallet.primary,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Anton",
    paddingHorizontal: 16,
  },
  // Collapsed Header Styles
  collapsedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_COLLAPSED_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 32,
  },
  collapsedImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colorPallet.neutral_5,
    marginRight: 12,
  },
  collapsedContent: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 50,
  },
  imageDots: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colorPallet.neutral_3,
  },
  dotActive: {
    backgroundColor: colorPallet.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabsContainer: {
    flex: 1,
    minHeight: 400,
  },
});
