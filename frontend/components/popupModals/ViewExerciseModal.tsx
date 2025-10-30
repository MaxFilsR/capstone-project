import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Exercise } from "@/api/endpoints";
import TabBar, { Tab } from "@/components/TabBar";
import AboutExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/aboutExerciseScreen";
import InstructionsExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/instructionsExcerciseScreen";
import { images } from "@/styles";
import { popupModalStyles } from "@/styles";
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

const ViewExerciseModal: React.FC<ViewExerciseModalProps> = ({
  onClose,
  exercise: exerciseProp,
  exerciseId,
}) => {
  const { exercises } = useWorkoutLibrary();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
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

  // Determine the exercise to display
  const exercise = useMemo(() => {
    if (exerciseProp) return exerciseProp;
    if (exerciseId) {
      return exercises.find((ex) => ex.id === exerciseId) || null;
    }
    return null;
  }, [exerciseProp, exerciseId, exercises]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [exercise?.id]);

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
    setAlert({ ...alert, visible: false });
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false });
  };

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

      <View
        style={{ padding: 12, backgroundColor: colorPallet.neutral_darkest }}
      >
        <Text
          style={{
            color: colorPallet.primary,
            textAlign: "center",
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "Anton",
            marginBottom: 8,
          }}
        >
          {exercise.name}
        </Text>

        <FormButton title="Add to routine" onPress={handleAddToRoutine} />

        <AddToRoutineModal
          visible={showRoutineModal}
          onClose={() => setShowRoutineModal(false)}
          exerciseId={exercise.id}
        />
      </View>

      <TabBar
        tabs={tabs}
        outerContainerStyle={popupModalStyles.tabOuterContainer}
        tabBarContainerStyle={popupModalStyles.tabBarContainer}
        tabBarStyle={popupModalStyles.tabBar}
        tabButtonStyle={popupModalStyles.tabButton}
        pageTitleStyle={popupModalStyles.pageTitle}
      />

      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
        onCancel={handleAlertCancel}
      />
    </>
  );
};

export default ViewExerciseModal;
