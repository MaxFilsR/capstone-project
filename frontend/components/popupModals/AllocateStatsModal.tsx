import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";
import { typography, popupModalStyles } from "@/styles";
import { FormButton } from "@/components";
import Alert from "./Alert";

type AllocateStatsModalProps = {
  onClose: () => void;
  currentStats: {
    strength: number;
    endurance: number;
    flexibility: number;
  };
  availablePoints: number;
};

type StatType = "strength" | "endurance" | "flexibility";

const AllocateStatsModal: React.FC<AllocateStatsModalProps> = ({
  onClose,
  currentStats,
  availablePoints,
}) => {
  const [pointsToAllocate, setPointsToAllocate] = useState({
    strength: 0,
    endurance: 0,
    flexibility: 0,
  });

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

  const remainingPoints =
    availablePoints -
    (pointsToAllocate.strength +
      pointsToAllocate.endurance +
      pointsToAllocate.flexibility);

  const handleIncrement = (stat: StatType) => {
    if (remainingPoints > 0) {
      setPointsToAllocate((prev) => ({
        ...prev,
        [stat]: prev[stat] + 1,
      }));
    }
  };

  const handleDecrement = (stat: StatType) => {
    if (pointsToAllocate[stat] > 0) {
      setPointsToAllocate((prev) => ({
        ...prev,
        [stat]: prev[stat] - 1,
      }));
    }
  };

  const handleReset = () => {
    setPointsToAllocate({
      strength: 0,
      endurance: 0,
      flexibility: 0,
    });
  };

  const handleAllocate = () => {
    // Check if any points were allocated
    const totalAllocated =
      pointsToAllocate.strength +
      pointsToAllocate.endurance +
      pointsToAllocate.flexibility;

    if (totalAllocated === 0) {
      setAlert({
        visible: true,
        mode: "error",
        title: "No Changes",
        message: "You haven't allocated any points yet.",
      });
      return;
    }

    // TODO: Call backend API here
    // Example: await allocateStats(pointsToAllocate);

    // Show success message
    setAlert({
      visible: true,
      mode: "success",
      title: "Success!",
      message:
        `Stats allocated successfully!\n\n` +
        `Strength: +${pointsToAllocate.strength}\n` +
        `Endurance: +${pointsToAllocate.endurance}\n` +
        `Flexibility: +${pointsToAllocate.flexibility}`,
    });
  };

  const handleAlertConfirm = () => {
    setAlert({ ...alert, visible: false });
    if (alert.mode === "success") {
      onClose();
    }
  };

  const stats = [
    {
      key: "strength" as StatType,
      label: "Strength",
      color: "#D64545",
      icon: "fitness" as const,
    },
    {
      key: "endurance" as StatType,
      label: "Endurance",
      color: "#E9E34A",
      icon: "heart" as const,
    },
    {
      key: "flexibility" as StatType,
      label: "Flexibility",
      color: "#6DE66D",
      icon: "body" as const,
    },
  ];

  return (
    <View style={styles.modalSize}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[typography.h2, styles.headerTitle]}>
          Allocate Stat Points
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[popupModalStyles.closeText, styles.closeText]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Points Available Banner */}
      <View style={styles.pointsBanner}>
        <Ionicons name="star" size={20} color={colorPallet.primary} />
        <Text style={styles.pointsText}>
          <Text style={styles.pointsValue}>{remainingPoints}</Text>
          <Text style={styles.pointsLabel}> Points Available</Text>
        </Text>
      </View>

      {/* Stats List */}
      <ScrollView style={styles.statsList}>
        {stats.map((stat) => {
          const currentValue = currentStats[stat.key];
          const allocatedPoints = pointsToAllocate[stat.key];
          const newValue = currentValue + allocatedPoints;

          return (
            <View key={stat.key} style={styles.statRow}>
              {/* Stat Icon & Label */}
              <View style={styles.statInfo}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={[styles.statLabel, { color: stat.color }]}>
                    {stat.label}
                  </Text>
                  <Text style={styles.statValues}>
                    {currentValue}
                    {allocatedPoints > 0 && (
                      <Text style={{ color: colorPallet.primary }}>
                        {" "}
                        → {newValue}
                      </Text>
                    )}
                  </Text>
                </View>
              </View>

              {/* Controls */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    allocatedPoints === 0 && styles.controlButtonDisabled,
                  ]}
                  onPress={() => handleDecrement(stat.key)}
                  disabled={allocatedPoints === 0}
                >
                  <Ionicons
                    name="remove-circle"
                    size={32}
                    color={
                      allocatedPoints === 0
                        ? colorPallet.neutral_5
                        : colorPallet.critical
                    }
                  />
                </TouchableOpacity>

                <View style={styles.allocatedPointsContainer}>
                  <Text style={styles.allocatedPoints}>
                    {allocatedPoints > 0 ? `+${allocatedPoints}` : "0"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    remainingPoints === 0 && styles.controlButtonDisabled,
                  ]}
                  onPress={() => handleIncrement(stat.key)}
                  disabled={remainingPoints === 0}
                >
                  <Ionicons
                    name="add-circle"
                    size={32}
                    color={
                      remainingPoints === 0
                        ? colorPallet.neutral_5
                        : colorPallet.secondary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          disabled={
            pointsToAllocate.strength === 0 &&
            pointsToAllocate.endurance === 0 &&
            pointsToAllocate.flexibility === 0
          }
        >
          <Ionicons
            name="refresh"
            size={18}
            color={
              pointsToAllocate.strength === 0 &&
              pointsToAllocate.endurance === 0 &&
              pointsToAllocate.flexibility === 0
                ? colorPallet.neutral_5
                : colorPallet.neutral_2
            }
          />
          <Text
            style={[
              styles.resetButtonText,
              pointsToAllocate.strength === 0 &&
                pointsToAllocate.endurance === 0 &&
                pointsToAllocate.flexibility === 0 && {
                  color: colorPallet.neutral_5,
                },
            ]}
          >
            Reset
          </Text>
        </TouchableOpacity>

        <View style={styles.allocateButtonWrapper}>
          <FormButton title="Allocate Points" onPress={handleAllocate} />
        </View>
      </View>

      <Alert
        visible={alert.visible}
        mode={alert.mode}
        title={alert.title}
        message={alert.message}
        onConfirm={handleAlertConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalSize: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    flexGrow: 0,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_darkest,
    maxHeight: "80%",
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
  pointsBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 14,
    marginTop: 2,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    backgroundColor: colorPallet.neutral_6,
  },
  pointsText: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colorPallet.primary,
  },
  pointsLabel: {
    fontSize: 14,
    color: colorPallet.neutral_2,
    fontWeight: "600",
  },
  statsList: {
    maxHeight: 400,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.neutral_6,
    backgroundColor: colorPallet.neutral_6,
    padding: 12,
    marginBottom: 10,
  },
  statInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colorPallet.neutral_darkest,
    justifyContent: "center",
    alignItems: "center",
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  statValues: {
    fontSize: 13,
    color: colorPallet.neutral_3,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlButton: {
    padding: 2,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  allocatedPointsContainer: {
    minWidth: 40,
    alignItems: "center",
  },
  allocatedPoints: {
    fontSize: 18,
    fontWeight: "800",
    color: colorPallet.neutral_lightest,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colorPallet.neutral_6,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colorPallet.neutral_6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colorPallet.neutral_2,
  },
  allocateButtonWrapper: {
    flex: 1,
  },
});

export default AllocateStatsModal;
