// Popup.tsx
import React, { useEffect, useState } from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { Exercise } from "@/api/endpoints";
import { popupModalStyles } from "@/styles";
import ViewExerciseModal from "./ViewExerciseModal";
import CreateRoutineModal from "./CreateRoutineModal";
import EditRoutineModal from "./EditRoutineModal";
import { AlertBox, AlertMode } from "./AlertBox";

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
  routine,
}) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | string[]>("");
  const [alertMode, setAlertMode] = useState<AlertMode>("alert");
  const [alertConfirmAction, setAlertConfirmAction] = useState<() => void>();
  const [alertCancelAction, setAlertCancelAction] = useState<() => void>();

  const showAlert = (
    msg: string | string[],
    mode: AlertMode = "alert",
    confirmAction?: () => void,
    cancelAction?: () => void
  ) => {
    setAlertMessage(msg);
    setAlertMode(mode);
    setAlertConfirmAction(() => confirmAction);
    setAlertCancelAction(() => cancelAction);
    setAlertVisible(true);
  };

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
            {/* Child modals */}
            {mode === "viewExercises" ? (
              <ViewExerciseModal
                onClose={onClose}
                exercise={exercise}
                exerciseId={exerciseId}
                showAlert={showAlert} // pass showAlert to child
              />
            ) : mode === "createRoutine" ? (
              <CreateRoutineModal onClose={onClose} showAlert={showAlert} />
            ) : mode === "editRoutine" && routine ? (
              <EditRoutineModal
                onClose={onClose}
                routine={routine}
                showAlert={showAlert}
              />
            ) : null}

            {/* Centralized alert */}
            <AlertBox
              visible={alertVisible}
              message={alertMessage}
              mode={alertMode}
              onClose={() => setAlertVisible(false)}
              confirmAction={alertConfirmAction}
              cancelAction={alertCancelAction}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;
