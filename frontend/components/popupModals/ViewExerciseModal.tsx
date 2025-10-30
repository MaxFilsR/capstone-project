import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { Exercise } from "@/api/endpoints";
import TabBar, { Tab } from "@/components/TabBar";
import AboutExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/aboutExerciseScreen";
import InstructionsExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/instructionsExcerciseScreen";
import { popupModalStyles, typography } from "@/styles";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import { FormButton } from "../FormButton";
import { AddToRoutineModal } from "./AddToRoutineModal";
import Alert from "./Alert";
import { colorPallet } from "@/styles/variables";

export type ViewExerciseModalProps = {
  onClose: () => void;
  exercise?: Exercise | null;
  exerciseId?: string | null;
};

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

const HEADER_EXPANDED_HEIGHT = 260;
const HEADER_COLLAPSED_HEIGHT = 80;
const SCROLL_THRESHOLD = 100;

const ViewExerciseModal: React.FC<ViewExerciseModalProps> = ({
  onClose,
  exercise: exerciseProp,
  exerciseId,
}) => {
  const { exercises } = useWorkoutLibrary();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    mode: "alert" | "success" | "error" | "confirmAction";
    title: string;
    message: string;
  }>({
    visible: false,
    mode: "alert",
    title: "",
    message: "",
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  // Determine the exercise to display
  const exercise = useMemo(() => {
    if (exerciseProp) return exerciseProp;
    if (exerciseId) {
      return exercises.find((ex) => ex.id === exerciseId) || null;
    }
    return null;
  }, [exerciseProp, exerciseId, exercises]);

  // Reset image index when exercise changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [exercise?.id]);

  // Auto-rotate images
  useEffect(() => {
    if (!exercise?.images || exercise.images.length < 2) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % exercise.images.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [exercise?.images]);

  // Animated values for header transformation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
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

  // Memoized tab components
  const AboutTab = useMemo(
    () => () => exercise ? <AboutExerciseScreen exercise={exercise} /> : null,
    [exercise]
  );

  const InstructionsTab = useMemo(
    () => () =>
      exercise ? <InstructionsExerciseScreen exercise={exercise} /> : null,
    [exercise]
  );

  const tabs: Tab[] = [
    { name: "About", component: AboutTab },
    { name: "Instructions", component: InstructionsTab },
  ];

  // Handlers
  const handleAddToRoutine = () => {
    if (!exercise) {
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message: "No exercise selected.",
      });
      return;
    }
    setShowRoutineModal(true);
  };

  const handleAlertConfirm = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const handleAlertCancel = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
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

  // Empty state
  if (!exercise) {
    return (
      <View style={popupModalStyles.emptyContainer}>
        <Text style={popupModalStyles.text}>No exercise selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Animated Header */}
      <Animated.View style={[styles.stickyHeader, { height: headerHeight }]}>
        {/* Close Button - Always on top */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Expanded Header */}
        <Animated.View
          style={[styles.expandedHeader, { opacity: expandedHeaderOpacity }]}
          pointerEvents={isHeaderCollapsed ? "none" : "auto"}
        >
          {exercise.images?.length > 0 && (
            <Animated.View
              style={[
                styles.expandedImageContainer,
                { opacity: imageOpacity, transform: [{ scale: imageScale }] },
              ]}
            >
              <Image
                source={{
                  uri: `${IMAGE_BASE_URL}${exercise.images[activeImageIndex]}`,
                }}
                style={styles.expandedImage}
                resizeMode="cover"
              />
              {exercise.images.length > 1 && (
                <View style={styles.imageDots}>
                  {exercise.images.map((_, index) => (
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
            {exercise.name}
          </Animated.Text>
        </Animated.View>

        {/* Collapsed Header */}
        <Animated.View
          style={[styles.collapsedHeader, { opacity: collapsedHeaderOpacity }]}
          pointerEvents={isHeaderCollapsed ? "auto" : "none"}
        >
          {exercise.images?.length > 0 && (
            <Image
              source={{
                uri: `${IMAGE_BASE_URL}${exercise.images[activeImageIndex]}`,
              }}
              style={styles.collapsedImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.collapsedContent}>
            <Text style={typography.h1} numberOfLines={2}>
              {exercise.name}
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
            outerContainerStyle={popupModalStyles.tabOuterContainer}
            tabBarContainerStyle={popupModalStyles.tabBarContainer}
            tabBarStyle={popupModalStyles.tabBar}
            tabButtonStyle={popupModalStyles.tabButton}
            pageTitleStyle={popupModalStyles.pageTitle}
          />
        </View>
      </Animated.ScrollView>

      {/* Sticky Add to Routine Button */}
      <View style={styles.stickyButtonContainer}>
        <FormButton
          title="Add to routine"
          onPress={handleAddToRoutine}
          style={{ borderTopStartRadius: 0, borderTopEndRadius: 0 }}
        />
      </View>

      {/* Add to Routine Modal */}
      <AddToRoutineModal
        visible={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        exerciseId={exercise.id}
      />

      {/* Alert Modal */}
      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingBottom: 10,
  },
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
  closeButton: {
    position: "absolute",
    top: 24,
    right: 12,
    zIndex: 101,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
  },
  closeText: {
    color: colorPallet.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },
  // Expanded Header Styles
  expandedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_EXPANDED_HEIGHT,
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  expandedImageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 12,
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
    paddingRight: 40, // Space for close button
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
  stickyButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default ViewExerciseModal;
