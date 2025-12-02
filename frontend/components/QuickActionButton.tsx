/**
 * Quick Action Button Component
 * 
 * Floating action button (FAB) that expands to reveal quick action menu items.
 * Provides animated buttons for creating routines and starting workouts. Uses
 * blur overlay and spring animations for smooth transitions. Opens modal popup
 * for selected actions.
 */

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

// ============================================================================
// Component
// ============================================================================

const QuickActionButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"createRoutine" | "startRoutine">(
    "startRoutine"
  );

  /**
   * Toggle expansion of action menu with animations
   */
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

  /**
   * Handle action button press with menu closure delay
   */
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

  // Animation interpolations
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
      {/* Blur overlay when menu is expanded */}
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

      {/* Action buttons and FAB */}
      <View style={styles.container} pointerEvents="box-none">
        {/* Create Routine action */}
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

        {/* Start Workout action */}
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

        {/* Main FAB */}
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

      {/* Modal popup for actions */}
      <Popup
        visible={showModal}
        mode={modalMode}
        onClose={handleModalClose}
        routine={null}
      />
    </>
  );
};

// ============================================================================
// Styles
// ============================================================================

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