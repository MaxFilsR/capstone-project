import React from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { Exercise } from "@/api/endpoints";
import { popupModalStyles } from "@/styles";
import ViewExerciseModal from "./ViewExerciseModal";
import CreateRoutineModal from "./CreateRoutineModal";

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
  mode: "viewExercises" | "createRoutine" | "editRoutine";
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
}) => {
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
            {mode === "viewExercises" ? (
              <ViewExerciseModal
                onClose={onClose}
                exercise={exercise}
                exerciseId={exerciseId}
              />
            ) : mode === "createRoutine" ? (
              <CreateRoutineModal onClose={onClose} />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;
