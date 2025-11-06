import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colorPallet } from "@/styles/variables";

type AlphabetSidebarProps = {
  letters: string[];
  activeLetter: string | null;
  onLetterPress: (letter: string) => void;
};

export const AlphabetSidebar: React.FC<AlphabetSidebarProps> = ({
  letters,
  activeLetter,
  onLetterPress,
}) => {
  return (
    <View style={styles.sidebar}>
      {letters.map((letter) => (
        <TouchableOpacity key={letter} onPress={() => onLetterPress(letter)}>
          <Text
            style={[
              styles.letter,
              activeLetter === letter && styles.activeLetter,
            ]}
          >
            {letter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 25,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 5,
    marginLeft: 5,
  },
  letter: {
    color: "#888",
    fontSize: 12,
    paddingVertical: 2,
  },
  activeLetter: {
    color: colorPallet.primary,
    fontWeight: "bold",
  },
});

export default AlphabetSidebar;
