import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import { colorPallet } from "@/styles/variables";

export type AlertMode = "alert" | "success" | "error" | "action";

type AlertBoxProps = {
  visible: boolean;
  message: string | string[];
  onClose?: () => void; // optional if using action
  title?: string;
  mode?: AlertMode;
  containerStyle?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
  confirmAction?: () => void;
  cancelAction?: () => void;
};

export const AlertBox: React.FC<AlertBoxProps> = ({
  visible,
  message,
  onClose,
  title,
  mode = "alert",
  containerStyle,
  messageStyle,
  confirmAction,
  cancelAction,
}) => {
  const messages = Array.isArray(message) ? message : [message];

  const getBorderColor = () => {
    switch (mode) {
      case "success":
        return colorPallet.success;
      case "error":
        return colorPallet.critical;
      case "action":
        return colorPallet.critical; // actions use same style as error
      case "alert":
      default:
        return colorPallet.primary;
    }
  };

  const getTitleColor = () => {
    switch (mode) {
      case "success":
        return colorPallet.success;
      case "error":
        return colorPallet.critical;
      case "action":
        return colorPallet.critical;
      case "alert":
      default:
        return colorPallet.primary;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { borderColor: getBorderColor() },
            containerStyle,
          ]}
        >
          <Text style={[styles.title, { color: getTitleColor() }]}>
            {title || mode.toUpperCase()}
          </Text>
          {messages.map((msg, i) => (
            <Text key={i} style={[styles.message, messageStyle]}>
              {msg}
            </Text>
          ))}

          {mode === "action" ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colorPallet.neutral_5 },
                ]}
                onPress={cancelAction}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: colorPallet.neutral_darkest },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: getBorderColor() }]}
                onPress={confirmAction}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getBorderColor() }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: colorPallet.neutral_darkest,
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 350,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colorPallet.neutral_lightest,
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginHorizontal: 4,
  },
  buttonText: {
    color: colorPallet.neutral_darkest,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
