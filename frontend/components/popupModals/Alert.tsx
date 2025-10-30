import { typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type AlertProps = {
  visible: boolean;
  mode?: "alert" | "success" | "error" | "confirmAction";
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
};

const Alert: React.FC<AlertProps> = ({
  visible,
  mode = "alert",
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (mode) {
      case "success":
        return "#4CAF50";
      case "error":
        return colorPallet.critical;
      case "alert":
      case "confirmAction":
      default:
        return colorPallet.critical;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.alertBox}>
        {title && (
          <View
            style={[styles.header, { backgroundColor: getBackgroundColor() }]}
          >
            <Text
              style={[typography.h3, { color: colorPallet.neutral_lightest }]}
            >
              {title}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={typography.body}>{message}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {mode === "confirmAction" ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: getBackgroundColor() },
                ]}
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText]}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.singleButton,
                { backgroundColor: getBackgroundColor() },
              ]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
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
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  alertBox: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
  },
  header: {
    padding: 16,
  },

  content: {
    padding: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colorPallet.neutral_lightest,
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  singleButton: {
    borderRadius: 0,
  },
  cancelButton: {
    backgroundColor: colorPallet.neutral_lightest,
    borderRightWidth: 1,
    borderRightColor: colorPallet.neutral_lightest,
  },
  confirmButton: {
    borderRadius: 0,
  },
  buttonText: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colorPallet.neutral_darkest,
  },
  confirmButtonText: {
    color: colorPallet.neutral_lightest,
  },
});

export default Alert;
