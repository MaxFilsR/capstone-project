/**
 * Search Bar Component
 * 
 * Toggleable search input for filtering exercises or muscles. Displays as a
 * search icon when collapsed and expands to a full search input with close
 * button when active. Auto-focuses on expansion for immediate text entry.
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorPallet } from "@/styles/variables";

// ============================================================================
// Types
// ============================================================================

type SearchBarProps = {
  visible: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onToggle: () => void;
  onClose: () => void;
};

// ============================================================================
// Component
// ============================================================================

export const SearchBar: React.FC<SearchBarProps> = ({
  visible,
  query,
  onQueryChange,
  onToggle,
  onClose,
}) => {
  // Collapsed state - show search icon only
  if (!visible) {
    return (
      <TouchableOpacity style={styles.searchIcon} onPress={onToggle}>
        <Ionicons name="search" size={24} color={colorPallet.secondary} />
      </TouchableOpacity>
    );
  }

  // Expanded state - show full search input
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search"
        size={20}
        color={colorPallet.secondary}
        style={{ marginRight: 8 }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises or muscles..."
        placeholderTextColor={colorPallet.neutral_3}
        value={query}
        onChangeText={onQueryChange}
        autoFocus
      />
      <TouchableOpacity onPress={onClose} style={{ paddingLeft: 8 }}>
        <Ionicons name="close" size={24} color={colorPallet.neutral_3} />
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  searchIcon: {
    position: "absolute",
    top: -125,
    right: 12,
    zIndex: 22,
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colorPallet.neutral_lightest,
  },
  searchInput: {
    flex: 1,
    color: colorPallet.neutral_lightest,
    paddingVertical: 12,
  },
});

export default SearchBar;