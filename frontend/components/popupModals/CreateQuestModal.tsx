/**
 * Create Quest Modal Component
 * 
 * Modal for creating a new quest with selectable difficulty levels (Easy, Medium, Hard).
 * Displays difficulty options with icons, descriptions, and XP rewards. Validates
 * selection before creation and shows alerts for errors. Uses blur overlay and
 * disabled state during quest creation.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography, popupModalStyles } from "@/styles";
import { FormButton } from "@/components";
import Alert from "./Alert";
import { BlurView } from "expo-blur";

// ============================================================================
// Types
// ============================================================================

type CreateQuestModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateQuest: (difficulty: "Easy" | "Medium" | "Hard") => Promise<void>;
  creating: boolean;
};

type DifficultyOption = {
  value: "Easy" | "Medium" | "Hard";
  label: string;
  color: string;
  backgroundColor: string;
  reward: number;
  icon: string;
  description: string;
};

// ============================================================================
// Component
// ============================================================================

const CreateQuestModal: React.FC<CreateQuestModalProps> = ({
  visible,
  onClose,
  onCreateQuest,
  creating,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Easy" | "Medium" | "Hard" | null
  >(null);
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

  const difficultyOptions: DifficultyOption[] = [
    {
      value: "Easy",
      label: "Easy Quest",
      color: colorPallet.primary,
      backgroundColor: colorPallet.neutral_6,
      reward: 100,
      icon: "flame",
      description: "A simple workout challenge",
    },
    {
      value: "Medium",
      label: "Medium Quest",
      color: colorPallet.secondary,
      backgroundColor: colorPallet.neutral_6,
      reward: 500,
      icon: "flame",
      description: "A moderate workout challenge",
    },
    {
      value: "Hard",
      label: "Hard Quest",
      color: colorPallet.critical,
      backgroundColor: colorPallet.neutral_6,
      reward: 1500,
      icon: "flame",
      description: "An intense workout challenge",
    },
  ];

  /**
   * Validate selection and create quest
   */
  const handleCreateQuest = async () => {
    if (!selectedDifficulty) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Difficulty Selected",
        message: "Please select a difficulty level for your quest.",
      });
      return;
    }

    try {
      await onCreateQuest(selectedDifficulty);
      onClose();
    } catch (error) {
      setAlert({
        visible: true,
        mode: "error",
        title: "Error",
        message: "Failed to create quest. Please try again.",
      });
    }
  };

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
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

        <View style={styles.modalSize}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[typography.h2, styles.headerTitle]}>New Quest</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={creating}
            >
              <Text style={[popupModalStyles.closeText, styles.closeText]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Select a difficulty level</Text>
          </View>

          {/* Difficulty options */}
          <View style={styles.optionsContainer}>
            {difficultyOptions.map((option) => {
              const isSelected = selectedDifficulty === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.difficultyCard,
                    isSelected && styles.difficultyCardSelected,
                    isSelected && { borderColor: option.color },
                  ]}
                  onPress={() => setSelectedDifficulty(option.value)}
                  activeOpacity={0.7}
                  disabled={creating}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: option.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={32}
                      color={option.color}
                    />
                  </View>

                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.difficultyLabel,
                        isSelected && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.description}>{option.description}</Text>

                    <View style={styles.rewardContainer}>
                      <Ionicons
                        name="star"
                        size={16}
                        color={colorPallet.secondary}
                      />
                      <Text style={styles.rewardText}>
                        +{option.reward} XP
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={28}
                        color={option.color}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info box */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colorPallet.primary}
            />
            <Text style={styles.infoText}>
              Complete workouts to progress on your quest and earn XP rewards!
            </Text>
          </View>

          {/* Create button */}
          <View style={styles.buttonContainer}>
            <FormButton
              title={creating ? "Creating Quest..." : "Create Quest"}
              onPress={handleCreateQuest}
              disabled={creating || selectedDifficulty === null}
            />
          </View>

          <Alert
            visible={alert.visible}
            mode={alert.mode}
            title={alert.title}
            message={alert.message}
            onConfirm={handleAlertConfirm}
          />
        </View>
      </BlurView>
    </Modal>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  modalSize: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    flexGrow: 0,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
    maxHeight: "85%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    color: colorPallet.neutral_lightest,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  closeText: {
    color: colorPallet.secondary,
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    marginTop: -2,
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colorPallet.neutral_3,
    fontWeight: "500",
  },
  optionsContainer: {
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 16,
  },
  difficultyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colorPallet.neutral_6,
    backgroundColor: colorPallet.neutral_6,
    padding: 14,
    gap: 14,
  },
  difficultyCardSelected: {
    backgroundColor: colorPallet.neutral_darkest,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  difficultyLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colorPallet.neutral_lightest,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: colorPallet.neutral_3,
    marginBottom: 6,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "700",
    color: colorPallet.secondary,
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 14,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colorPallet.neutral_6,
    borderLeftWidth: 3,
    borderLeftColor: colorPallet.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colorPallet.neutral_2,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colorPallet.neutral_6,
  },
});

export default CreateQuestModal;