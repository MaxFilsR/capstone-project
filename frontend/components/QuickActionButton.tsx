import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import Popup from "@/components/popupModals/Popup";

const QuickActionButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"createRoutine" | "startRoutine">(
    "startRoutine"
  );

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;

    if (!isExpanded) {
      setShowOverlay(true);
    }

    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isExpanded) {
        setShowOverlay(false);
      }
    });

    setIsExpanded(!isExpanded);
  };

  const handleActionPress = (action: () => void) => {
    toggleMenu();
    setTimeout(action, 150);
  };

  const handleStartWorkout = () => {
    setModalMode("startRoutine");
    setShowModal(true);
  };

  const handleCreateRoutine = () => {
    setModalMode("createRoutine");
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const actionButton1TranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -55],
  });

  const actionButton2TranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -32],
  });

  const actionButtonOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <>
      {/* Blur Overlay */}
      {showOverlay && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          >
            <BlurView
              intensity={20}
              style={StyleSheet.absoluteFill}
              tint="dark"
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      )}

      <View style={styles.container} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: actionButton1TranslateY }],
              opacity: actionButtonOpacity,
            },
          ]}
          pointerEvents={isExpanded ? "auto" : "none"}
        >
          <TouchableOpacity
            style={styles.actionButtonTouchable}
            onPress={() => handleActionPress(handleCreateRoutine)}
            activeOpacity={0.8}
          >
            <Ionicons name="create" size={24} color={colorPallet.neutral_1} />
            <Text style={styles.actionButtonLabel}>Create Routine</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: actionButton2TranslateY }],
              opacity: actionButtonOpacity,
            },
          ]}
          pointerEvents={isExpanded ? "auto" : "none"}
        >
          <TouchableOpacity
            style={styles.actionButtonTouchable}
            onPress={() => handleActionPress(handleStartWorkout)}
            activeOpacity={0.8}
          >
            <Ionicons name="barbell" size={24} color={colorPallet.neutral_1} />
            <Text style={styles.actionButtonLabel}>Start Workout</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.fab}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={32} color={colorPallet.neutral_1} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Popup
        visible={showModal}
        mode={modalMode}
        onClose={handleModalClose}
        routine={null}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
  },
  container: {
    position: "absolute",
    bottom: 120,
    right: 20,
    alignItems: "flex-end",
    zIndex: 999,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorPallet.primary,
  },
  actionButton: {
    bottom: 0,
    alignItems: "center",
  },
  actionButtonTouchable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: colorPallet.secondary,
  },
  actionButtonLabel: {
    color: colorPallet.neutral_1,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default QuickActionButton;
