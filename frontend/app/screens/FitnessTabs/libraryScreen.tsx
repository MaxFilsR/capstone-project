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

import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "@/api/endpoints";
import Popup from "@/components/popupModals/Popup";
import { useWorkoutLibrary } from "@/lib/workout-library-context";
import { Dropdown } from "@/components/Dropdown";
import { ExerciseCard } from "@/components/ExerciseCard";
import { SearchBar } from "@/components/SearchBar";
import { AlphabetSidebar } from "@/components/AlphabetSidebar";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Group exercises alphabetically by primary muscle
const groupByPrimaryMuscle = (list: Exercise[]) => {
  const grouped = list.reduce((acc: any, ex) => {
    ex.primaryMuscles.forEach((muscle) => {
      const key = muscle[0].toUpperCase() + muscle.slice(1);
      if (!acc[key]) acc[key] = [];
      acc[key].push(ex);
    });
    return acc;
  }, {});
  return Object.keys(grouped)
    .sort()
    .map((muscle) => ({ title: muscle, data: grouped[muscle] }));
};

const SECTION_HEADER_HEIGHT = 10;
const ITEM_HEIGHT = 85;

const LibraryScreen = () => {
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const { exercises, loading, error, refresh } = useWorkoutLibrary();
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [searchVisible, setSearchVisible] = useState(false);
  const sectionListRef = useRef<SectionList>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Extract unique muscle groups dynamically
  const muscleGroups = useMemo(() => {
    if (!exercises || !Array.isArray(exercises)) return ["All"];
    const muscleSet = new Set<string>();
    exercises.forEach((ex) => {
      ex.primaryMuscles.forEach((muscle) => {
        const formatted = muscle.charAt(0).toUpperCase() + muscle.slice(1);
        muscleSet.add(formatted);
      });
    });
    return ["All", ...Array.from(muscleSet).sort()];
  }, [exercises]);

  // Extract unique levels dynamically
  const levels = useMemo(() => {
    if (!exercises || !Array.isArray(exercises)) return ["All"];
    const levelSet = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.level) {
        const formatted = ex.level.charAt(0).toUpperCase() + ex.level.slice(1);
        levelSet.add(formatted);
      }
    });
    return ["All", ...Array.from(levelSet).sort()];
  }, [exercises]);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    if (!exercises || !Array.isArray(exercises)) return ["All"];
    const categorySet = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.category) {
        const formatted =
          ex.category.charAt(0).toUpperCase() + ex.category.slice(1);
        categorySet.add(formatted);
      }
    });
    return ["All", ...Array.from(categorySet).sort()];
  }, [exercises]);

  // Extract unique equipment dynamically
  const equipment = useMemo(() => {
    if (!exercises || !Array.isArray(exercises)) return ["All"];
    const equipmentSet = new Set<string>();
    exercises.forEach((ex) => {
      if (Array.isArray(ex.equipment)) {
        ex.equipment.forEach((eq) => {
          const formatted = eq.charAt(0).toUpperCase() + eq.slice(1);
          equipmentSet.add(formatted);
        });
      } else if (ex.equipment) {
        const formatted =
          ex.equipment.charAt(0).toUpperCase() + ex.equipment.slice(1);
        equipmentSet.add(formatted);
      }
    });
    return ["All", ...Array.from(equipmentSet).sort()];
  }, [exercises]);

  // Filter & group
  const sections = useMemo(() => {
    if (!exercises || !Array.isArray(exercises)) return [];

    const filtered = exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.primaryMuscles.some((m) =>
          m.toLowerCase().includes(query.toLowerCase())
        );

      const matchesMuscle =
        selectedMuscle === "All" ||
        ex.primaryMuscles.some(
          (m) => m.toLowerCase() === selectedMuscle.toLowerCase()
        );

      const matchesLevel =
        selectedLevel === "All" ||
        ex.level?.toLowerCase() === selectedLevel.toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        ex.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesEquipment =
        selectedEquipment === "All" ||
        (Array.isArray(ex.equipment)
          ? ex.equipment.some(
              (eq) => eq.toLowerCase() === selectedEquipment.toLowerCase()
            )
          : ex.equipment?.toLowerCase() === selectedEquipment.toLowerCase());

      return (
        matchesSearch &&
        matchesMuscle &&
        matchesLevel &&
        matchesCategory &&
        matchesEquipment
      );
    });

    return groupByPrimaryMuscle(filtered);
  }, [
    query,
    exercises,
    selectedMuscle,
    selectedLevel,
    selectedCategory,
    selectedEquipment,
  ]);

  // Filter alphabet to only show letters that exist in sections
  const availableLetters = useMemo(() => {
    const letters = new Set(sections.map((s) => s.title[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [sections]);

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  const toggleAllSections = useCallback(() => {
    const allCollapsed = sections.every((s) => collapsedSections[s.title]);
    const newState: { [key: string]: boolean } = {};
    sections.forEach((s) => {
      newState[s.title] = !allCollapsed;
    });
    setCollapsedSections(newState);
  }, [sections, collapsedSections]);

  const handleExercisePress = useCallback((item: Exercise) => {
    setSelectedExercise(item);
  }, []);

  // Collapsed-data sections
  const sectionsWithCollapsedData = useMemo(() => {
    return sections.map((s) => ({
      ...s,
      data: collapsedSections[s.title] ? [] : s.data,
    }));
  }, [sections, collapsedSections]);

  // scrollToSection using scrollToLocation
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

  // Viewable items for active letter
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0) {
        const firstVisibleSection = viewableItems.find(
          (v) => v.section
        )?.section;
        if (firstVisibleSection) {
          setActiveLetter(firstVisibleSection.title[0].toUpperCase());
        }
      }
    }
  );

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 30 });

  const renderItem = ({ item }: { item: Exercise }) => (
    <ExerciseCard item={item} onPress={handleExercisePress} />
  );

  // Memoized renderSectionHeader
  const renderSectionHeader = useCallback(
    (info: { section: SectionListData<Exercise> }) => {
      const title = info.section.title;
      return (
        <TouchableOpacity
          onPress={() => toggleSection(title)}
          style={styles.sectionHeaderContainer}
        >
          <Text
            style={[typography.h2, { color: colorPallet.neutral_lightest }]}
          >
            {title}
          </Text>
          <Text style={styles.collapseIcon}>
            {collapsedSections[title] ? "+" : "-"}
          </Text>
        </TouchableOpacity>
      );
    },
    [collapsedSections, toggleSection]
  );

  // getItemLayout for SectionList
  const getItemLayout = useCallback(
    (_: any, index: number) => {
      let offset = 0;
      let itemIndex = index;

      for (let i = 0; i < sectionsWithCollapsedData.length; i++) {
        const section = sectionsWithCollapsedData[i];
        const sectionLength = section.data.length;
        if (itemIndex < sectionLength) {
          offset += SECTION_HEADER_HEIGHT + itemIndex * ITEM_HEIGHT;
          break;
        } else {
          offset += SECTION_HEADER_HEIGHT + sectionLength * ITEM_HEIGHT;
          itemIndex -= sectionLength;
        }
      }

      return { length: ITEM_HEIGHT, offset, index };
    },
    [sectionsWithCollapsedData]
  );

  const handleSearchClose = useCallback(() => {
    setSearchVisible(false);
    setQuery("");
  }, []);

  if (loading) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

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

  const allCollapsed = sections.every((s) => collapsedSections[s.title]);

  const toggleFilters = useCallback(() => {
    setFiltersVisible((prev) => !prev);
  }, []);

  return (
    <View style={[tabStyles.tabContent, { flex: 1, paddingBottom: 100 }]}>
      <SearchBar
        visible={searchVisible}
        query={query}
        onQueryChange={setQuery}
        onToggle={() => setSearchVisible(true)}
        onClose={handleSearchClose}
      />
      {/* Controls Row (Filters + Expand/Collapse) */}
      <View style={styles.topControlsRow}>
        {/* Filter Toggle */}
        <TouchableOpacity style={styles.filterToggle} onPress={toggleFilters}>
          <Ionicons
            name={filtersVisible ? "filter" : "filter-outline"}
            size={18}
            color={colorPallet.secondary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.filterToggleText}>
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </Text>
        </TouchableOpacity>

        {/* Expand/Collapse All */}
        <TouchableOpacity
          style={styles.expandCollapseButton}
          onPress={toggleAllSections}
        >
          <Ionicons
            name={allCollapsed ? "expand" : "contract"}
            size={18}
            color={colorPallet.secondary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.expandCollapseText}>
            {allCollapsed ? "Expand All" : "Collapse All"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Filters (collapsible) */}
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

            <View style={[styles.filtersRow, { marginTop: -4 }]}>
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

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedMuscle("All");
                setSelectedLevel("All");
                setSelectedCategory("All");
                setSelectedEquipment("All");
              }}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={colorPallet.secondary}
                style={{ marginRight: 6 }}
              />
              <Text style={typography.body}>Reset Filters</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={{ flex: 1, flexDirection: "row" }}>
        <SectionList
          ref={sectionListRef}
          sections={sectionsWithCollapsedData}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `item-${index}`
          }
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          stickySectionHeadersEnabled={false}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewConfigRef.current}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises found</Text>
            </View>
          }
          getItemLayout={getItemLayout}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />

        <AlphabetSidebar
          letters={availableLetters}
          activeLetter={activeLetter}
          onLetterPress={scrollToSection}
        />
      </View>

      <Popup
        visible={!!selectedExercise}
        mode="viewExercises"
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filtersRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expandCollapseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
  },
  expandCollapseText: {
    color: colorPallet.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
  resultsCount: { color: colorPallet.neutral_3, fontSize: 14 },
  sectionHeaderContainer: {
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
  collapseIcon: { color: colorPallet.secondary, fontSize: 16 },
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
  emptyContainer: { padding: 20, alignItems: "center" },
  emptyText: { color: colorPallet.neutral_3, fontSize: 16 },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
  },
  filterToggleText: {
    color: colorPallet.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
  topControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
});

export default LibraryScreen;
