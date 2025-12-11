/**
 * Exercise Search List Component
 * 
 * Searchable exercise list with real-time filtering. Displays a text input
 * for search queries and shows matching exercises in a scrollable list.
 * Allows users to add exercises by tapping on search results.
 */

import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Exercise } from "@/api/endpoints";
import { typography } from "@/styles";
import { popupModalStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { FormTextInput } from "./FormTextInput";

// ============================================================================
// Constants
// ============================================================================

const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_LIBRARY_IMAGES_BASE_URL;

// ============================================================================
// Types
// ============================================================================

type ExerciseSearchListProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
};

// ============================================================================
// Component
// ============================================================================

const ExerciseSearchList: React.FC<ExerciseSearchListProps> = ({
  searchQuery,
  onSearchChange,
  filteredExercises,
  onAddExercise,
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {/* Search input with clear button */}
      <View style={{ position: "relative" }}>
        <FormTextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onBlur={() => onSearchChange("")}
          label="Add an exercise"
          placeholder="Search exercises..."
          labelStyle={typography.h2}
        />

        {searchQuery.trim() && (
          <TouchableOpacity
            onPress={() => onSearchChange("")}
            style={{
              position: "absolute",
              right: 12,
              top: 42,
              padding: 4,
            }}
          >
            <Text
              style={{
                color: colorPallet.secondary,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search results list */}
      {searchQuery.trim() && (
        <>
          <Text
            style={[
              typography.h3,
              {
                textAlign: "center",
                marginTop: 8,
                color: colorPallet.neutral_lightest,
              },
            ]}
          >
            Search Results
          </Text>
          <ScrollView
            style={{
              maxHeight: 300,
              backgroundColor: colorPallet.neutral_darkest,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colorPallet.neutral_3,
              overflow: "hidden",
              marginTop: 12,
            }}
            nestedScrollEnabled
          >
            {filteredExercises.length === 0 ? (
              <Text
                style={{
                  color: colorPallet.secondary,
                  textAlign: "center",
                  padding: 20,
                }}
              >
                No exercises match your criteria
              </Text>
            ) : (
              filteredExercises.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => onAddExercise(item)}
                  style={popupModalStyles.exerciseCard}
                >
                  <Image
                    source={
                      item.images?.[0]
                        ? {
                            uri: `${IMAGE_BASE_URL}${item.images[0]}`,
                          }
                        : require("@/assets/images/icon.png")
                    }
                    style={popupModalStyles.exerciseThumbnail}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colorPallet.neutral_1,
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        color: colorPallet.neutral_3,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {item.primaryMuscles.join(", ")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default ExerciseSearchList;