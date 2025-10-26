import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Exercise } from "@/api/endpoints";
import TabBar, { Tab } from "@/components/TabBar";
import AboutExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/aboutExcerciseScreen";
import InstructionsExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/instructionsExcerciseScreen";
import { images } from "@/styles";
import { popupModalStyles } from "@/styles";
import { useWorkoutLibrary } from "@/lib/workout-library-context";

type ViewExerciseModalProps = {
  onClose: () => void;
  exercise?: Exercise | null;
  exerciseId?: string | null;
};

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

const ViewExerciseModal: React.FC<ViewExerciseModalProps> = ({
  onClose,
  exercise: exerciseProp,
  exerciseId,
}) => {
  const { exercises } = useWorkoutLibrary();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  // Rotate images if multiple exist
  useEffect(() => {
    if (!exercise?.images || exercise.images.length < 2) return;
    const interval = setInterval(
      () => setActiveImageIndex((i) => (i + 1) % exercise.images.length),
      1000
    );
    return () => clearInterval(interval);
  }, [exercise?.images]);

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

  if (!exercise) {
    return (
      <View style={popupModalStyles.emptyContainer}>
        <Text style={popupModalStyles.text}>No exercise selected</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity style={popupModalStyles.closeButton} onPress={onClose}>
        <Text style={popupModalStyles.closeText}>✕</Text>
      </TouchableOpacity>

      {exercise.images?.length > 0 && (
        <Image
          source={{
            uri: `${IMAGE_BASE_URL}${exercise.images[activeImageIndex]}`,
          }}
          style={images.thumbnail}
          resizeMode="cover"
        />
      )}

      <TabBar
        pageTitle={exercise.name}
        tabs={tabs}
        outerContainerStyle={popupModalStyles.tabOuterContainer}
        tabBarContainerStyle={popupModalStyles.tabBarContainer}
        tabBarStyle={popupModalStyles.tabBar}
        tabButtonStyle={popupModalStyles.tabButton}
        pageTitleStyle={popupModalStyles.pageTitle}
      />
    </>
  );
};

export default ViewExerciseModal;
