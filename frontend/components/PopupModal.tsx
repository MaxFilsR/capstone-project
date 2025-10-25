import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { Exercise } from "@/api/endpoints";
import TabBar, { Tab } from "@/components/TabBar";
import AboutExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/aboutExcerciseScreen";
import InstructionsExerciseScreen from "@/app/screens/FitnessTabs/exerciseInfoTabs/instructionsExcerciseScreen";
import { containers, images, typography } from "@/styles";
import { popupModalStyles } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { FormTextInput } from "./FormTextInput";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import { FormButton } from "./FormButton";

type PopupProps = {
  visible: boolean;
  mode: "viewExercises" | "createRoutine";
  onClose: () => void;
  exercise?: Exercise | null;
  exerciseId?: string | null;
};

const Popup: React.FC<PopupProps> = ({
  visible,
  mode,
  onClose,
  exercise: exerciseProp,
  exerciseId,
}) => {
  const { exercises } = useWorkoutLibrary();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [exerciseMetrics, setExerciseMetrics] = useState<Record<string, any>>(
    {}
  );

  // Routine creation state
  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    Array<Exercise & { uniqueId: string }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine the exercise to display
  const exercise = useMemo(() => {
    if (exerciseProp) return exerciseProp;
    if (exerciseId) {
      return exercises.find((ex) => ex.id === exerciseId) || null;
    }
    return null;
  }, [exerciseProp, exerciseId, exercises]);

  // Filter exercises for search
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return exercises
      .filter(
        (ex) =>
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.primaryMuscles.some((m) =>
            m.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      .slice(0, 20); // Limit results
  }, [searchQuery, exercises]);

  // Reset image index when exercise changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [exercise?.id]);

  // Rotate images if multiple exist
  useEffect(() => {
    if (!exercise?.images || exercise.images.length < 2) return;
    const interval = setInterval(
      () => setActiveImageIndex((i) => (i + 1) % exercise.images.length),
      1000
    );
    return () => clearInterval(interval);
  }, [exercise?.images]);

  // Reset routine state when modal closes
  useEffect(() => {
    if (!visible) {
      setRoutineName("");
      setSelectedExercises([]);
      setSearchQuery("");
    }
  }, [visible]);

  const IMAGE_BASE_URL =
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

  const AboutTab = useMemo(
    () => () => exercise ? <AboutExerciseScreen exercise={exercise} /> : null,
    [exercise]
  );

  const InstructionsTab = useMemo(
    () => () =>
      exercise ? <InstructionsExerciseScreen exercise={exercise} /> : null,
    [exercise]
  );

  const tabs: Tab[] = [
    { name: "About", component: AboutTab },
    { name: "Instructions", component: InstructionsTab },
  ];

  const handleSave = () => {
    if (!routineName.trim()) {
      Alert.alert("Error", "Please enter a routine name");
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise");
      return;
    }

    console.log("Saving routine:", {
      name: routineName,
      exercises: selectedExercises.map((ex) => ex.id),
    });

    Alert.alert("Success", "Routine saved successfully!");
    onClose();
  };

  const addExercise = (exercise: Exercise) => {
    const uniqueId = `${exercise.id}-${Date.now()}`;
    setSelectedExercises([...selectedExercises, { ...exercise, uniqueId }]);
    setSearchQuery("");
  };

  const removeExercise = (uniqueId: string) => {
    setSelectedExercises(
      selectedExercises.filter((ex) => ex.uniqueId !== uniqueId)
    );
  };

  const moveExercise = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= selectedExercises.length) return;

    const newList = [...selectedExercises];
    [newList[fromIndex], newList[toIndex]] = [
      newList[toIndex],
      newList[fromIndex],
    ];
    setSelectedExercises(newList);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={popupModalStyles.overlay}>
        <View style={popupModalStyles.modalContainer}>
          <TouchableOpacity
            style={popupModalStyles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={popupModalStyles.contentWrapper}>
            {mode === "viewExercises" && exercise ? (
              <>
                <TouchableOpacity
                  style={popupModalStyles.closeButton}
                  onPress={onClose}
                >
                  <Text style={popupModalStyles.closeText}>✕</Text>
                </TouchableOpacity>

                {exercise.images?.length > 0 && (
                  <Image
                    source={{
                      uri: `${IMAGE_BASE_URL}${exercise.images[activeImageIndex]}`,
                    }}
                    style={images.thumbnail}
                    resizeMode="cover"
                  />
                )}

                <TabBar
                  pageTitle={exercise.name}
                  tabs={tabs}
                  outerContainerStyle={popupModalStyles.tabOuterContainer}
                  tabBarContainerStyle={popupModalStyles.tabBarContainer}
                  tabBarStyle={popupModalStyles.tabBar}
                  tabButtonStyle={popupModalStyles.tabButton}
                  pageTitleStyle={popupModalStyles.pageTitle}
                />
              </>
            ) : mode === "createRoutine" ? (
              <View style={{ flex: 1 }}>
                {/* Header Bar */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colorPallet.neutral_5,
                    backgroundColor: colorPallet.neutral_darkest,
                  }}
                >
                  <TouchableOpacity onPress={onClose}>
                    <Text style={popupModalStyles.closeText}>✕</Text>
                  </TouchableOpacity>

                  <Text
                    style={{
                      color: colorPallet.neutral_1,
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    New Routine
                  </Text>

                  <TouchableOpacity onPress={handleSave}>
                    <Text
                      style={{
                        color: colorPallet.primary,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={{
                    flex: 1,
                    padding: 16,
                    backgroundColor: colorPallet.neutral_darkest,
                  }}
                >
                  {/* Routine Name Input */}
                  <View style={{ marginBottom: 16 }}>
                    <FormTextInput
                      label="Routine Name"
                      value={routineName}
                      placeholder="Enter routine name..."
                      onChangeText={setRoutineName}
                      labelStyle={typography.h2}
                    />
                  </View>

                  {/* Search Section */}
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ position: "relative" }}>
                      <FormTextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onBlur={() => setSearchQuery("")}
                        label="Add a excercise"
                        placeholder="Search exercises..."
                        labelStyle={typography.h2}
                      />

                      {searchQuery.trim() && (
                        <TouchableOpacity
                          onPress={() => setSearchQuery("")}
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
                                onPress={() => addExercise(item)}
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

                  {/* Selected Exercises */}
                  <View>
                    <Text
                      style={{
                        color: colorPallet.neutral_1,
                        marginBottom: 8,
                        fontWeight: "600",
                      }}
                    >
                      Exercises ({selectedExercises.length})
                    </Text>

                    {selectedExercises.length === 0 ? (
                      <Text
                        style={{
                          color: colorPallet.neutral_3,
                          textAlign: "center",
                          padding: 20,
                        }}
                      >
                        No exercises added yet
                      </Text>
                    ) : (
                      selectedExercises.map((ex, index) => {
                        const hasMetrics =
                          ex.category === "strength" ||
                          ex.category === "running";

                        return (
                          <View key={ex.uniqueId}>
                            <View
                              style={
                                hasMetrics
                                  ? popupModalStyles.selectedExerciseCardWithMetrics
                                  : popupModalStyles.selectedExerciseCard
                              }
                            >
                              <Image
                                source={
                                  ex.images?.[0]
                                    ? {
                                        uri: `${IMAGE_BASE_URL}${ex.images[0]}`,
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
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {ex.name}
                                </Text>
                                <Text
                                  style={{
                                    color: colorPallet.neutral_3,
                                    fontSize: 12,
                                    marginTop: 2,
                                  }}
                                >
                                  {ex.primaryMuscles.join(", ")}
                                </Text>
                              </View>

                              <View style={{ flexDirection: "row", gap: 8 }}>
                                {/* Move Up */}
                                <TouchableOpacity
                                  onPress={() => moveExercise(index, "up")}
                                  disabled={index === 0}
                                  style={{
                                    padding: 8,
                                    opacity: index === 0 ? 0.3 : 1,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: colorPallet.neutral_1,
                                      fontSize: 18,
                                    }}
                                  >
                                    ↑
                                  </Text>
                                </TouchableOpacity>

                                {/* Move Down */}
                                <TouchableOpacity
                                  onPress={() => moveExercise(index, "down")}
                                  disabled={
                                    index === selectedExercises.length - 1
                                  }
                                  style={{
                                    padding: 8,
                                    opacity:
                                      index === selectedExercises.length - 1
                                        ? 0.3
                                        : 1,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: colorPallet.neutral_1,
                                      fontSize: 18,
                                    }}
                                  >
                                    ↓
                                  </Text>
                                </TouchableOpacity>

                                {/* Remove */}
                                <TouchableOpacity
                                  onPress={() => removeExercise(ex.uniqueId)}
                                  style={{ padding: 8 }}
                                >
                                  <Text
                                    style={{
                                      color: colorPallet.secondary,
                                      fontSize: 18,
                                    }}
                                  >
                                    ✕
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>

                            {hasMetrics && (
                              <View style={popupModalStyles.metricsContainer}>
                                {ex.category === "strength" && (
                                  <View
                                    style={{ flexDirection: "row", gap: 8 }}
                                  >
                                    <TextInput
                                      style={popupModalStyles.metricInput}
                                      placeholder="Sets"
                                      placeholderTextColor={
                                        colorPallet.neutral_3
                                      }
                                      keyboardType="numeric"
                                      value={
                                        exerciseMetrics[ex.uniqueId]?.sets || ""
                                      }
                                      onChangeText={(text) =>
                                        setExerciseMetrics((prev) => ({
                                          ...prev,
                                          [ex.uniqueId]: {
                                            ...prev[ex.uniqueId],
                                            sets: text,
                                          },
                                        }))
                                      }
                                    />
                                    <TextInput
                                      style={popupModalStyles.metricInput}
                                      placeholder="Reps"
                                      placeholderTextColor={
                                        colorPallet.neutral_3
                                      }
                                      keyboardType="numeric"
                                      value={
                                        exerciseMetrics[ex.uniqueId]?.reps || ""
                                      }
                                      onChangeText={(text) =>
                                        setExerciseMetrics((prev) => ({
                                          ...prev,
                                          [ex.uniqueId]: {
                                            ...prev[ex.uniqueId],
                                            reps: text,
                                          },
                                        }))
                                      }
                                    />
                                  </View>
                                )}

                                {ex.category === "running" && (
                                  <TextInput
                                    style={popupModalStyles.metricInput}
                                    placeholder="Distance (km)"
                                    placeholderTextColor={colorPallet.neutral_3}
                                    keyboardType="numeric"
                                    value={
                                      exerciseMetrics[ex.uniqueId]?.distance ||
                                      ""
                                    }
                                    onChangeText={(text) =>
                                      setExerciseMetrics((prev) => ({
                                        ...prev,
                                        [ex.uniqueId]: {
                                          ...prev[ex.uniqueId],
                                          distance: text,
                                        },
                                      }))
                                    }
                                  />
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <View style={popupModalStyles.emptyContainer}>
                <Text style={popupModalStyles.text}>No exercise selected</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;
