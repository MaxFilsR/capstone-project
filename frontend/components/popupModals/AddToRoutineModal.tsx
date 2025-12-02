/**
 * Add to Routine Modal Component
 * 
 * Modal for adding an exercise to one or more existing routines. Fetches user's
 * routines, allows multi-selection, and updates selected routines with the new
 * exercise. Shows loading, success, and error states with alerts.
 */

import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { getRoutines, updateRoutine, RoutineResponse } from "@/api/endpoints";
import { colorPallet } from "@/styles/variables";
import { FormButton } from "@/components";
import Alert from "./Alert";

// ============================================================================
// Types
// ============================================================================

type AddToRoutineModalProps = {
  visible: boolean;
  exerciseId: string;
  onClose: () => void;
};

// ============================================================================
// Component
// ============================================================================

export const AddToRoutineModal: React.FC<AddToRoutineModalProps> = ({
  visible,
  exerciseId,
  onClose,
}) => {
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (visible) fetchRoutines();
  }, [visible]);

  /**
   * Fetch user's routines from API
   */
  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const data = await getRoutines();
      setRoutines(data.routines || []);
    } catch (e) {
      console.error("Failed to fetch routines:", e);
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message: "Failed to fetch routines. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle routine selection
   */
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  /**
   * Add exercise to selected routines
   */
  const handleAdd = async () => {
    try {
      setSaving(true);

      for (const routineId of selected) {
        const routine = routines.find((r) => r.id === routineId);
        if (!routine) continue;

        const alreadyInRoutine = routine.exercises.some(
          (e) => e.id === exerciseId
        );
        if (alreadyInRoutine) continue;

        const updatedExercises = [
          ...routine.exercises,
          { id: exerciseId, sets: 3, reps: 10, weight: 0, distance: 0 },
        ];

        await updateRoutine({
          id: routineId,
          name: routine.name,
          exercises: updatedExercises,
        });
      }

      setAlert({
        visible: true,
        mode: "success",
        title: "Success",
        message: "Exercise added to routine(s) successfully!",
      });
    } catch (error) {
      console.error("Error adding exercise to routine:", error);
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message: "Failed to add exercise to routine. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false });

    if (alert.mode === "success") {
      setTimeout(() => onClose(), 100);
    }
  };

  const handleAlertCancel = () => {
    setAlert({ ...alert, visible: false });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Routine(s)</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colorPallet.secondary, fontSize: 18 }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Routine list */}
          {loading ? (
            <ActivityIndicator color={colorPallet.primary} />
          ) : (
            <FlatList
              data={routines}
              keyExtractor={(item) => item.id?.toString() ?? ""}
              renderItem={({ item }) => {
                const isSelected = selected.includes(item.id!);
                return (
                  <TouchableOpacity
                    style={[
                      styles.routineItem,
                      isSelected && styles.routineItemSelected,
                    ]}
                    onPress={() => toggleSelect(item.id!)}
                  >
                    <Text
                      style={[
                        styles.routineText,
                        isSelected && styles.routineTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Action button */}
          <View style={styles.actions}>
            <FormButton
              title={saving ? "Saving..." : "Add"}
              disabled={saving || selected.length === 0}
              onPress={handleAdd}
            />
          </View>
        </View>

        {/* Alert dialog */}
        <Alert
          visible={alert.visible}
          mode={alert.mode}
          title={alert.title}
          message={alert.message}
          onConfirm={handleAlertConfirm}
          onCancel={handleAlertCancel}
        />
      </View>
    </Modal>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: colorPallet.neutral_darkest,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colorPallet.neutral_1,
  },
  closeText: {
    fontSize: 22,
    color: colorPallet.neutral_3,
    fontWeight: "600",
  },
  routineItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  routineItemSelected: {
    borderColor: colorPallet.primary,
    color: colorPallet.primary,
  },
  routineText: {
    color: colorPallet.neutral_1,
    fontSize: 16,
    fontWeight: "500",
  },
  routineTextSelected: {
    color: colorPallet.primary,
    fontWeight: "600",
  },
  actions: {
    marginTop: 16,
  },
});