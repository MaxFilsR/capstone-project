import React, { useEffect, useState } from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { Exercise } from "@/api/endpoints";
import { popupModalStyles } from "@/styles";
import ViewExerciseModal from "./ViewExerciseModal";
import CreateRoutineModal from "./CreateRoutineModal";
import EditRoutineModal from "./EditRoutineModal";
import StartRoutineModal from "./StartRoutineModal";

import { BlurView } from "expo-blur";

export type Routine = {
  id: number;
  name: string;
  exercises: Array<
    Exercise & {
      uniqueId: string;
      sets?: number;
      reps?: number;
      weight?: number;
      distance?: number;
    }
  >;
};

type PopupProps = {
  visible: boolean;
  mode: "viewExercises" | "createRoutine" | "editRoutine" | "startRoutine";
  onClose: () => void;
  exercise?: Exercise | null;
  exerciseId?: string | null;
  routine?: Routine | null;
};

const Popup: React.FC<PopupProps> = ({
  visible,
  mode,
  onClose,
  exercise,
  exerciseId,
  routine,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={20} // blur strength
        tint="dark" //dark frosted glass
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }} // cover full screen
      >
        {mode === "startRoutine" ? (
          // StartRoutine has its own layout and styling
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              activeOpacity={1}
              onPress={onClose}
            />
            {/* Always render StartRoutineModal - it handles both cases (with/without routine) */}
            <StartRoutineModal onClose={onClose} routine={routine} />
          </View>
        ) : (
          // Other modals use the standard popup layout
          <View style={popupModalStyles.overlay}>
            <View style={popupModalStyles.modalContainer}>
              <TouchableOpacity
                style={popupModalStyles.backdrop}
                activeOpacity={1}
                onPress={onClose}
              />

              <View style={popupModalStyles.contentWrapper}>
                {/* Child modals */}
                {mode === "viewExercises" ? (
                  <ViewExerciseModal
                    onClose={onClose}
                    exercise={exercise}
                    exerciseId={exerciseId}
                  />
                ) : mode === "createRoutine" ? (
                  <CreateRoutineModal onClose={onClose} />
                ) : mode === "editRoutine" && routine ? (
                  <EditRoutineModal onClose={onClose} routine={routine} />
                ) : null}
              </View>
            </View>
          </View>
        )}
      </BlurView>
    </Modal>
  );
};

export default Popup;
