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
import AboutExerciseScreen from "@/app/screens/exerciseInfoTabs/aboutExcerciseScreen";
import InstructionsExerciseScreen from "@/app/screens/exerciseInfoTabs/instructionsExcerciseScreen";
import { images } from "@/styles";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.contentWrapper}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
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
                  outerContainerStyle={styles.tabOuterContainer}
                  tabBarContainerStyle={styles.tabBarContainer}
                  tabBarStyle={styles.tabBar}
                  tabButtonStyle={styles.tabButton}
                  pageTitleStyle={styles.pageTitle}
                />
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.text}>No exercise selected</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    height: SCREEN_HEIGHT * 0.85,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    height: "100%",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorPallet.neutral_6,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
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
  text: {
    color: colorPallet.neutral_3,
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  // TabBar style overrides
  tabOuterContainer: {
    paddingTop: 0,
    margin: 0,
    paddingBottom: 0,
    justifyContent: "center",
  },
  tabBarContainer: {
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  tabBar: {
    backgroundColor: colorPallet.neutral_darkest,
    margin: 0,
    borderRadius: 0,
    padding: 0,
    borderBottomColor: colorPallet.primary,
    borderBottomWidth: 1,
  },
  tabButton: {
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
  pageTitle: {
    alignSelf: "center",
    paddingTop: 16,
  },
});

export default Popup;
