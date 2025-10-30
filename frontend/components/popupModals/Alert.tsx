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
        return "#F44336";
      case "alert":
      case "confirmAction":
      default:
        return "#2196F3";
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
            <Text style={styles.title}>{title}</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
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
    backgroundColor: "white",
    borderRadius: 8,
    width: "80%",
    maxWidth: 400,
    overflow: "hidden",
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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
    backgroundColor: "#F5F5F5",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  confirmButton: {
    borderRadius: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  confirmButtonText: {
    color: "white",
  },
});

export default Alert;
