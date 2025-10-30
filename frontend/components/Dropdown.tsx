import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  style?: any;
};

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.dropdownContainer, style]}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
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

      {isOpen && (
        <View style={styles.dropdownMenu}>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flex: 1,
    position: "relative",
    zIndex: 1,
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
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
    maxHeight: 200,
    zIndex: 1000,
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
