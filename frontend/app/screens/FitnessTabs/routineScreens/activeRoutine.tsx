/**
 * Active Routine Screen
 *
 * Main workout execution screen that guides users through their exercise routine.
 * Features an animated collapsing header with exercise images, tabbed content
 * (Stats, About, Instructions), and workout navigation controls. Tracks exercise
 * completion data including sets, reps, weight, and distance for both strength
 * and cardio exercises.
 */

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

// Import workout components
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

// ============================================================================
// Types
// ============================================================================

type Params = {
  /** Routine identifier */
  id?: string;
  /** Routine name */
  name?: string;
  /** Thumbnail URL for the routine */
  thumbnailUrl?: string;
  /** Serialized JSON array of exercises */
  exercises?: string;
  /** Starting exercise index */
  index?: string;
};

// ============================================================================
// Constants
// ============================================================================

/** Height of the header when fully expanded */
const HEADER_EXPANDED_HEIGHT = 340;

/** Height of the header when collapsed */
const HEADER_COLLAPSED_HEIGHT = 132;

/** Scroll distance before header collapses */
const SCROLL_THRESHOLD = 150;

// ============================================================================
// Component
// ============================================================================

export default function ActiveRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const navigation = useNavigation();
  const { exercises: library } = useWorkoutLibrary();

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** Alert modal configuration */
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

  /** Current exercise index in the routine */
  const [currentIndex, setCurrentIndex] = useState<number>(
    Math.max(0, Number(params?.index ?? 0))
  );

  /** Map of completed exercise data by index */
  const [completedExercises, setCompletedExercises] = useState<
    Map<number, CompletedExerciseData>
  >(new Map());

  /** Map of set data (reps, weight, distance) by exercise index */
  const [setsData, setSetsData] = useState<
    Map<number, { reps: string; weight: string; distance: string }[]>
  >(new Map());

  /** Currently active tab (0: Stats, 1: About, 2: Instructions) */
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  /** Current image index in the exercise image carousel */
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  /** Whether the header is in collapsed state */
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  /** Animated scroll position value */
  const scrollY = useRef(new Animated.Value(0)).current;

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  /**
   * Configure screen navigation options
   * Sets up card presentation and removes default header
   */
  useEffect(() => {
    navigation.setOptions({
      presentation: "card",
      animation: "slide_from_right",
      headerShown: false,
      contentStyle: { backgroundColor: "#0B0B0B" },
    } as any);
  }, [navigation]);

  /**
   * Parse exercises from route params
   * Supports both object arrays and string arrays
   * Falls back to workout library for exercise details
   */
  const exercisesLite: ExerciseLite[] = useMemo(() => {
    if (params?.exercises) {
      try {
        const arr = JSON.parse(String(params.exercises));
        if (Array.isArray(arr) && arr.length) {
          // Handle array of exercise objects
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
          // Handle array of exercise names (lookup from library)
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

  // Safely handle exercise access
  const hasExercises = exercisesLite.length > 0;
  const safeIndex = hasExercises
    ? Math.min(currentIndex, exercisesLite.length - 1)
    : 0;
  const currentLite = hasExercises ? exercisesLite[safeIndex] : undefined;

  /**
   * Get full exercise details from library
   * Matches by ID first, then falls back to name matching
   */
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

  /**
   * Get exercise images with absolute URLs
   * Combines images from full exercise data and lite data
   */
  const topImages = useMemo(() => {
    const imgs = fullExercise?.images ?? currentLite?.images ?? [];
    return imgs.map(abs).filter(Boolean) as string[];
  }, [fullExercise, currentLite]);

  /**
   * Reset image index when exercise changes
   * Prevents showing non-existent image indices
   */
  useEffect(() => {
    setActiveImageIndex(0);
  }, [fullExercise?.id]);

  /**
   * Auto-rotate exercise images
   * Cycles through images every second if multiple exist
   */
  useEffect(() => {
    if (topImages.length < 2) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % topImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [topImages.length]);

  /**
   * Initialize sets data for new exercise
   * Ensures each exercise has at least one empty set
   */
  useEffect(() => {
    if (!setsData.has(currentIndex)) {
      setSetsData((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentIndex, [{ reps: "", weight: "", distance: "" }]);
        return newMap;
      });
    }
  }, [currentIndex]);

  // --------------------------------------------------------------------------
  // Animated Header Values
  // --------------------------------------------------------------------------

  /** Interpolated header height based on scroll position */
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 1.5],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  /** Fade out exercise image as user scrolls */
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  /** Scale down exercise image as user scrolls */
  const imageScale = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });

  /** Shrink title font size as user scrolls */
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [24, 16],
    extrapolate: "clamp",
  });

  /** Fade in collapsed header */
  const collapsedHeaderOpacity = scrollY.interpolate({
    inputRange: [SCROLL_THRESHOLD - 20, SCROLL_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  /** Fade out expanded header */
  const expandedHeaderOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD - 20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  /**
   * Save current exercise data to completed exercises map
   * Filters out empty sets and calculates totals
   * Handles both strength (reps/weight) and cardio (distance) exercises
   */
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

    // Update setsData to remove empty sets
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

  /**
   * Navigate to previous exercise
   * Saves current exercise data before moving
   */
  function onPrev() {
    if (currentIndex > 0) {
      saveCurrentExercise();
      setCurrentIndex((i) => i - 1);
    }
  }

  /**
   * Navigate to next exercise or end workout
   * Saves current exercise data before moving
   */
  function onNext() {
    saveCurrentExercise();

    if (currentIndex < exercisesLite.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onEnd();
    }
  }

  /**
   * Complete workout and navigate to duration summary
   * Saves final exercise data and passes all completed exercises
   */
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

  /**
   * Navigate to workout duration summary screen
   * @param exercisesArray - Optional array of completed exercises
   */
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

  /**
   * Show confirmation alert before canceling workout
   * Warns user that progress will be lost
   */
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

  /**
   * Handle alert confirmation
   * Executes onConfirmAction if in confirmAction mode
   */
  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });

    if (alert.mode === "confirmAction" && alert.onConfirmAction) {
      alert.onConfirmAction();
    }
  };

  /**
   * Handle alert cancellation
   * Closes alert and clears action callback
   */
  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false, onConfirmAction: undefined });
  };

  /**
   * Handle scroll events for animated header
   * Updates collapse state and scroll position
   */
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

  // --------------------------------------------------------------------------
  // Memoized Components
  // --------------------------------------------------------------------------

  const exerciseType = getExerciseType(fullExercise?.category);

  /** Dynamic title for stats tab based on exercise type */
  const statsTitle = `Log ${
    exerciseType === "cardio"
      ? "Distance"
      : exerciseType === "strength"
      ? "Sets & Reps"
      : "Exercise"
  } — ${fullExercise?.name ?? currentLite?.name ?? ""}`;

  /**
   * Stats tab component with current exercise data
   * Memoized to prevent unnecessary re-renders
   */
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

  /** About tab component showing exercise details */
  const AboutTab = useMemo(
    () => () => <AboutExerciseScreen exercise={fullExercise as Exercise} />,
    [fullExercise]
  );

  /** Instructions tab component showing how to perform exercise */
  const InstructionsTab = useMemo(
    () => () =>
      <InstructionsExerciseScreen exercise={fullExercise as Exercise} />,
    [fullExercise]
  );

  /** Tab configuration array */
  const tabs: Tab[] = useMemo(
    () => [
      { name: "Stats", component: StatsTabComponent },
      { name: "About", component: AboutTab },
      { name: "Instructions", component: InstructionsTab },
    ],
    [StatsTabComponent, AboutTab, InstructionsTab]
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <View style={{ flex: 1, backgroundColor: colorPallet.neutral_darkest }}>
      {/* Sticky Animated Header */}
      <Animated.View style={[styles.stickyHeader, { height: headerHeight }]}>
        {/* Cancel Button - Always visible on top */}
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={colorPallet.secondary} />
        </TouchableOpacity>

        {/* Expanded Header (shows when scrolled up) */}
        <Animated.View
          style={[styles.expandedHeader, { opacity: expandedHeaderOpacity }]}
          pointerEvents={isHeaderCollapsed ? "none" : "auto"}
        >
          {/* Exercise Image Carousel */}
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
              {/* Image Pagination Dots */}
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
          {/* Exercise Title */}
          <Animated.Text
            style={[styles.expandedTitle, { fontSize: titleFontSize }]}
          >
            {fullExercise?.name ?? currentLite?.name ?? ""}
          </Animated.Text>
        </Animated.View>

        {/* Collapsed Header (shows when scrolled down) */}
        <Animated.View
          style={[styles.collapsedHeader, { opacity: collapsedHeaderOpacity }]}
          pointerEvents={isHeaderCollapsed ? "auto" : "none"}
        >
          {/* Small thumbnail image */}
          {topImages.length > 0 && (
            <Image
              source={{ uri: topImages[activeImageIndex] }}
              style={styles.collapsedImage}
              resizeMode="cover"
            />
          )}
          {/* Exercise name */}
          <View style={styles.collapsedContent}>
            <Text style={typography.h1} numberOfLines={2}>
              {fullExercise?.name ?? currentLite?.name ?? ""}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content Area */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: HEADER_EXPANDED_HEIGHT }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Tabbed Content (Stats, About, Instructions) */}
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

      {/* Workout Navigation Controls (only visible on Stats tab) */}
      {activeTabIndex === 0 && (
        <WorkoutControls
          currentIndex={currentIndex}
          totalExercises={exercisesLite.length}
          onPrev={onPrev}
          onNext={onNext}
          onEnd={onEnd}
        />
      )}

      {/* Confirmation Alert Modal */}
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

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  /** Fixed header that animates between expanded and collapsed states */
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
  
  /** Cancel button in top-right corner */
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
  
  // Expanded Header Styles (full-size view)
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
  
  /** Container for large exercise image */
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
  
  /** Exercise title in expanded state */
  expandedTitle: {
    color: colorPallet.primary,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Anton",
    paddingHorizontal: 16,
  },
  
  // Collapsed Header Styles (compact view)
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
  
  /** Small thumbnail in collapsed header */
  collapsedImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colorPallet.neutral_5,
    marginRight: 12,
  },
  
  /** Text content in collapsed header */
  collapsedContent: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 50, // Space for cancel button
  },
  
  /** Pagination dots for image carousel */
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
  
  /** Individual pagination dot (inactive) */
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colorPallet.neutral_3,
  },
  
  /** Active pagination dot */
  dotActive: {
    backgroundColor: colorPallet.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  /** Container for tab content */
  tabsContainer: {
    flex: 1,
    minHeight: 400,
  },
});