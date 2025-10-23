import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Exercise } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import TabBar, { Tab } from "@/components/TabBar";
import AboutExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/aboutExcerciseScreen";
import InstructionsExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/instructionsExcerciseScreen";
import { images } from "@/styles";
import { popupModalStyles } from "@/styles";

type PopupProps = {
  visible: boolean;
  mode: "viewExercises";
  onClose: () => void;
  exercise?: Exercise | null;
};

const Popup: React.FC<PopupProps> = ({ visible, mode, onClose, exercise }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cycle between first two exercise images if available
  useEffect(() => {
    if (!exercise?.images || exercise.images.length < 2) return;
    const interval = setInterval(
      () => setActiveImageIndex((i) => (i === 0 ? 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [exercise]);

  const IMAGE_BASE_URL =
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

  // Wrapper components that pass the exercise prop
  const AboutTab: React.FC = () =>
    exercise ? <AboutExerciseScreen exercise={exercise} /> : null;

  const InstructionsTab: React.FC = () =>
    exercise ? <InstructionsExerciseScreen exercise={exercise} /> : null;

  const tabs: Tab[] = [
    { name: "About", component: AboutTab },
    { name: "Instructions", component: InstructionsTab },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={popupModalStyles.overlay}>
        <View style={popupModalStyles.modalContainer}>
          <TouchableOpacity
            style={popupModalStyles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={popupModalStyles.contentWrapper}>
            <TouchableOpacity
              style={popupModalStyles.closeButton}
              onPress={onClose}
            >
              <Text style={popupModalStyles.closeText}>✕</Text>
            </TouchableOpacity>

            {mode === "viewExercises" && exercise ? (
              <>
                {/* Exercise image (auto-cycling) */}
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
            ) : (
              <View style={popupModalStyles.emptyContainer}>
                <Text style={popupModalStyles.text}>No exercise selected</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;
