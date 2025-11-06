import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  style?: any;
  zIndex?: number;
};

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  style,
  zIndex = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const buttonRef = useRef<View>(null);

  const handleOpen = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonLayout({ x, y, width, height });
      setIsOpen(true);
    });
  };

  return (
    <>
      <View
        style={[styles.dropdownContainer, style, { zIndex }]}
        ref={buttonRef}
      >
        <TouchableOpacity style={styles.dropdownButton} onPress={handleOpen}>
          <Text style={styles.dropdownLabel}>{label}</Text>
          <View style={styles.dropdownValueRow}>
            <Text style={styles.dropdownValue} numberOfLines={1}>
              {value}
            </Text>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={colorPallet.neutral_lightest}
            />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.dropdownMenu,
                {
                  position: "absolute",
                  top: buttonLayout.y + buttonLayout.height + 4,
                  left: buttonLayout.x,
                  width: buttonLayout.width,
                },
              ]}
            >
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownItem,
                      value === option && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        value === option && styles.dropdownItemTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {value === option && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colorPallet.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flex: 1,
  },
  dropdownButton: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
  },
  dropdownLabel: {
    color: colorPallet.neutral_3,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  dropdownValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  dropdownMenu: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorPallet.neutral_5,
  },
  dropdownItemActive: {
    backgroundColor: colorPallet.neutral_5,
  },
  dropdownItemText: {
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    fontWeight: "400",
  },
  dropdownItemTextActive: {
    color: colorPallet.primary,
    fontWeight: "600",
  },
});

export default Dropdown;
