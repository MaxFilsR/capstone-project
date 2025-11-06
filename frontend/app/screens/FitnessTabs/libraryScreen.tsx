import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewToken,
  SectionListData,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Exercise } from "@/api/endpoints";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import Popup from "@/components/popupModals/Popup";
import { Dropdown } from "@/components/Dropdown";
import { ExerciseCard } from "@/components/ExerciseCard";
import { SearchBar } from "@/components/SearchBar";
import { AlphabetSidebar } from "@/components/AlphabetSidebar";

// Enable layout animations for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constants
const SECTION_HEADER_HEIGHT = 10;
const ITEM_HEIGHT = 85;
const INITIAL_NUM_TO_RENDER = 15;
const MAX_TO_RENDER_PER_BATCH = 10;
const UPDATE_CELLS_BATCHING_PERIOD = 50;
const WINDOW_SIZE = 10;
const VIEWABILITY_THRESHOLD = 30;

// Types
interface CollapsedSections {
  [key: string]: boolean;
}

interface GroupedExercises {
  title: string;
  data: Exercise[];
}

// Helper Functions
const formatString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const groupExercisesByPrimaryMuscle = (
  exercises: Exercise[]
): GroupedExercises[] => {
  const grouped = exercises.reduce(
    (acc: Record<string, Exercise[]>, exercise) => {
      exercise.primaryMuscles.forEach((muscle) => {
        const key = formatString(muscle);
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(exercise);
      });
      return acc;
    },
    {}
  );

  return Object.keys(grouped)
    .sort()
    .map((muscle) => ({
      title: muscle,
      data: grouped[muscle],
    }));
};

const extractUniqueValues = (
  exercises: Exercise[],
  extractFn: (ex: Exercise) => string | string[] | null | undefined
): string[] => {
  const valueSet = new Set<string>();

  exercises.forEach((exercise) => {
    const value = extractFn(exercise);
    if (Array.isArray(value)) {
      value.forEach((v) => valueSet.add(formatString(v)));
    } else if (value) {
      valueSet.add(formatString(value));
    }
  });

  return ["All", ...Array.from(valueSet).sort()];
};

const LibraryScreen: React.FC = () => {
  // Context
  const { exercises, loading, error, refresh } = useWorkoutLibrary();

  // State - UI
  const [searchVisible, setSearchVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>(
    {}
  );
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // State - Filters
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");

  // Refs
  const sectionListRef = useRef<SectionList>(null);
  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: VIEWABILITY_THRESHOLD,
  });

  // Memoized filter options
  const muscleGroups = useMemo(() => {
    if (!exercises?.length) return ["All"];
    return extractUniqueValues(exercises, (ex) => ex.primaryMuscles);
  }, [exercises]);

  const levels = useMemo(() => {
    if (!exercises?.length) return ["All"];
    return extractUniqueValues(exercises, (ex) => ex.level);
  }, [exercises]);

  const categories = useMemo(() => {
    if (!exercises?.length) return ["All"];
    return extractUniqueValues(exercises, (ex) => ex.category);
  }, [exercises]);

  const equipment = useMemo(() => {
    if (!exercises?.length) return ["All"];
    return extractUniqueValues(exercises, (ex) => ex.equipment);
  }, [exercises]);

  // Filtered and grouped sections
  const sections = useMemo(() => {
    if (!exercises?.length) return [];

    const filtered = exercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(query.toLowerCase()) ||
        exercise.primaryMuscles.some((m) =>
          m.toLowerCase().includes(query.toLowerCase())
        );

      const matchesMuscle =
        selectedMuscle === "All" ||
        exercise.primaryMuscles.some(
          (m) => m.toLowerCase() === selectedMuscle.toLowerCase()
        );

      const matchesLevel =
        selectedLevel === "All" ||
        exercise.level?.toLowerCase() === selectedLevel.toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        exercise.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesEquipment =
        selectedEquipment === "All" ||
        (Array.isArray(exercise.equipment)
          ? exercise.equipment.some(
              (eq) => eq.toLowerCase() === selectedEquipment.toLowerCase()
            )
          : exercise.equipment?.toLowerCase() ===
            selectedEquipment.toLowerCase());

      return (
        matchesSearch &&
        matchesMuscle &&
        matchesLevel &&
        matchesCategory &&
        matchesEquipment
      );
    });

    return groupExercisesByPrimaryMuscle(filtered);
  }, [
    query,
    exercises,
    selectedMuscle,
    selectedLevel,
    selectedCategory,
    selectedEquipment,
  ]);

  // Sections with collapsed data
  const sectionsWithCollapsedData = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      data: collapsedSections[section.title] ? [] : section.data,
    }));
  }, [sections, collapsedSections]);

  // Available alphabet letters
  const availableLetters = useMemo(() => {
    const letters = new Set(sections.map((s) => s.title[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [sections]);

  // Check if all sections are collapsed
  const allSectionsCollapsed = useMemo(() => {
    return sections.every((s) => collapsedSections[s.title]);
  }, [sections, collapsedSections]);

  // Callbacks - Section Management
  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const toggleAllSections = useCallback(() => {
    const shouldCollapse = !allSectionsCollapsed;
    const newState: CollapsedSections = {};
    sections.forEach((section) => {
      newState[section.title] = shouldCollapse;
    });
    setCollapsedSections(newState);
  }, [sections, allSectionsCollapsed]);

  // Callbacks - Filter Management
  const toggleFilters = useCallback(() => {
    setFiltersVisible((prev) => !prev);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedMuscle("All");
    setSelectedLevel("All");
    setSelectedCategory("All");
    setSelectedEquipment("All");
  }, []);

  // Callbacks - Search Management
  const handleSearchClose = useCallback(() => {
    setSearchVisible(false);
    setQuery("");
  }, []);

  // Callbacks - Exercise Management
  const handleExercisePress = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
  }, []);

  const handleExerciseModalClose = useCallback(() => {
    setSelectedExercise(null);
  }, []);

  // Callbacks - Scrolling
  const scrollToSection = useCallback(
    (letter: string) => {
      const sectionIndex = sectionsWithCollapsedData.findIndex(
        (s) => s.title[0] === letter
      );
      if (sectionIndex === -1) return;

      sectionListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewOffset: 0,
        animated: true,
      });
    },
    [sectionsWithCollapsedData]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (!viewableItems.length) return;

      const firstVisibleSection = viewableItems.find((v) => v.section)?.section;
      if (firstVisibleSection) {
        setActiveLetter(firstVisibleSection.title[0].toUpperCase());
      }
    }
  );

  // Render Functions
  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseCard item={item} onPress={handleExercisePress} />
    ),
    [handleExercisePress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<Exercise> }) => {
      const { title } = section;
      const isCollapsed = collapsedSections[title];

      return (
        <TouchableOpacity
          onPress={() => toggleSection(title)}
          style={styles.sectionHeader}
        >
          <Text style={[typography.h2, styles.sectionHeaderText]}>{title}</Text>
          <Text style={styles.collapseIcon}>{isCollapsed ? "+" : "-"}</Text>
        </TouchableOpacity>
      );
    },
    [collapsedSections, toggleSection]
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No exercises found</Text>
      </View>
    ),
    []
  );

  // Layout calculation for performance
  const getItemLayout = useCallback(
    (_: any, index: number) => {
      let offset = 0;
      let itemIndex = index;

      for (const section of sectionsWithCollapsedData) {
        const sectionLength = section.data.length;
        if (itemIndex < sectionLength) {
          offset += SECTION_HEADER_HEIGHT + itemIndex * ITEM_HEIGHT;
          break;
        }
        offset += SECTION_HEADER_HEIGHT + sectionLength * ITEM_HEIGHT;
        itemIndex -= sectionLength;
      }

      return { length: ITEM_HEIGHT, offset, index };
    },
    [sectionsWithCollapsedData]
  );

  // Loading State
  if (loading) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Ionicons name="alert-circle" size={48} color={colorPallet.secondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main Render
  return (
    <View style={[tabStyles.tabContent, styles.container]}>
      {/* Search Bar */}
      <SearchBar
        visible={searchVisible}
        query={query}
        onQueryChange={setQuery}
        onToggle={() => setSearchVisible(true)}
        onClose={handleSearchClose}
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleFilters}>
          <Ionicons
            name={filtersVisible ? "filter" : "filter-outline"}
            size={18}
            color={colorPallet.secondary}
            style={styles.controlIcon}
          />
          <Text style={styles.controlButtonText}>
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleAllSections}
        >
          <Ionicons
            name={allSectionsCollapsed ? "expand" : "contract"}
            size={18}
            color={colorPallet.secondary}
            style={styles.controlIcon}
          />
          <Text style={styles.controlButtonText}>
            {allSectionsCollapsed ? "Expand All" : "Collapse All"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View
        style={[
          styles.filtersContainer,
          filtersVisible ? styles.filtersVisible : styles.filtersHidden,
        ]}
      >
        {filtersVisible && (
          <>
            <View style={styles.filtersRow}>
              <Dropdown
                label="Muscle Group"
                value={selectedMuscle}
                options={muscleGroups}
                onSelect={setSelectedMuscle}
                zIndex={4}
              />
              <Dropdown
                label="Level"
                value={selectedLevel}
                options={levels}
                onSelect={setSelectedLevel}
                zIndex={3}
              />
            </View>

            <View style={styles.filtersRow}>
              <Dropdown
                label="Category"
                value={selectedCategory}
                options={categories}
                onSelect={setSelectedCategory}
                zIndex={2}
              />
              <Dropdown
                label="Equipment"
                value={selectedEquipment}
                options={equipment}
                onSelect={setSelectedEquipment}
                zIndex={1}
              />
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Ionicons
                name="refresh"
                size={16}
                color={colorPallet.secondary}
                style={styles.controlIcon}
              />
              <Text style={typography.body}>Reset Filters</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Exercise List with Alphabet Sidebar */}
      <View style={styles.listContainer}>
        <SectionList
          ref={sectionListRef}
          sections={sectionsWithCollapsedData}
          keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
          showsVerticalScrollIndicator={false}
          style={styles.sectionList}
          stickySectionHeadersEnabled={false}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewConfigRef.current}
          ListEmptyComponent={renderEmptyList}
          getItemLayout={getItemLayout}
          initialNumToRender={INITIAL_NUM_TO_RENDER}
          maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
          updateCellsBatchingPeriod={UPDATE_CELLS_BATCHING_PERIOD}
          windowSize={WINDOW_SIZE}
        />

        <AlphabetSidebar
          letters={availableLetters}
          activeLetter={activeLetter}
          onLetterPress={scrollToSection}
        />
      </View>

      {/* Exercise Details Modal */}
      <Popup
        visible={!!selectedExercise}
        mode="viewExercises"
        exercise={selectedExercise}
        onClose={handleExerciseModalClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: colorPallet.neutral_lightest,
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: colorPallet.neutral_lightest,
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colorPallet.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colorPallet.neutral_darkest,
    fontSize: 16,
    fontWeight: "600",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
  },
  controlIcon: {
    marginRight: 6,
  },
  controlButtonText: {
    color: colorPallet.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
  filtersContainer: {
    overflow: "hidden",
    marginBottom: 12,
  },
  filtersVisible: {
    opacity: 1,
    height: "auto",
  },
  filtersHidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.secondary,
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sectionList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_darkest,
    borderBottomWidth: 1,
    borderBottomColor: colorPallet.neutral_lightest,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  sectionHeaderText: {
    color: colorPallet.neutral_lightest,
  },
  collapseIcon: {
    color: colorPallet.secondary,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: colorPallet.neutral_3,
    fontSize: 16,
  },
});

export default LibraryScreen;
