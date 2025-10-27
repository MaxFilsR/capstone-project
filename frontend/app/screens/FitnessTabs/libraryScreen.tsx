import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewToken,
  ScrollView,
  Image,
  SectionListData,
} from "react-native";
import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "@/api/endpoints";
import Popup from "@/components/popupModals/Popup";
import { useWorkoutLibrary } from "@/lib/workout-library-context";

const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

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

// Memoized image component with better caching
const CachedExerciseImage = React.memo(
  ({ imageUrl }: { imageUrl: string | null }) => {
    if (!imageUrl) {
      return (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Ionicons name="barbell" size={32} color={colorPallet.neutral_3} />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: imageUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
        defaultSource={require("@/assets/images/icon.png")}
      />
    );
  }
);

// Memoized card component
const ExerciseCard = React.memo(
  ({
    item,
    onPress,
  }: {
    item: Exercise;
    onPress: (item: Exercise) => void;
  }) => {
    const imageUrl =
      item.images && item.images.length > 0
        ? `${IMAGE_BASE_URL}${item.images[0]}`
        : null;

    return (
      <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
        <CachedExerciseImage imageUrl={imageUrl} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.muscle}>{item.primaryMuscles.join(", ")}</Text>
          {item.equipment && (
            <Text style={styles.equipment}>Level: {item.level}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

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

      return matchesSearch && matchesMuscle;
    });

    return groupByPrimaryMuscle(filtered);
  }, [query, exercises, selectedMuscle]);

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

  // Memoized renderItem for SectionList
  const renderExerciseItem = useCallback(
    ({ item, section }: { item: Exercise; section: any }) => {
      if (collapsedSections[section.title]) return null;
      return <ExerciseCard item={item} onPress={handleExercisePress} />;
    },
    [collapsedSections, handleExercisePress]
  );

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

  return (
    <View style={[tabStyles.tabContent, { flex: 1, paddingBottom: 100 }]}>
      {!searchVisible && (
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={() => setSearchVisible(true)}
        >
          <Ionicons name="search" size={24} color={colorPallet.secondary} />
        </TouchableOpacity>
      )}

      {searchVisible && (
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
            onChangeText={setQuery}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => {
              setSearchVisible(false);
              setQuery("");
            }}
            style={{ paddingLeft: 8 }}
          >
            <Ionicons name="close" size={24} color={colorPallet.neutral_3} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {muscleGroups.map((muscle) => (
          <TouchableOpacity
            key={muscle}
            style={[
              styles.filterButton,
              selectedMuscle === muscle && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedMuscle(muscle)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedMuscle === muscle && styles.filterButtonTextActive,
              ]}
            >
              {muscle}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.controlsContainer}>
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
        <Text style={styles.resultsCount}>
          {sections.reduce((sum, s) => sum + s.data.length, 0)} exercises
        </Text>
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
          getItemLayout={getItemLayout} // fixed
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />

        <View style={styles.sidebar}>
          {availableLetters.map((letter) => (
            <TouchableOpacity
              key={letter}
              onPress={() => scrollToSection(letter)}
            >
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
  filterContainer: { marginBottom: 12, maxHeight: 42 },
  filterContent: { paddingRight: 8 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colorPallet.neutral_6,
    borderWidth: 1,
    borderColor: colorPallet.neutral_lightest,
  },
  filterButtonActive: {
    backgroundColor: colorPallet.primary,
    borderColor: colorPallet.primary,
  },
  filterButtonText: {
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: colorPallet.neutral_darkest,
    fontWeight: "600",
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 8,
    overflow: "hidden",
    borderColor: colorPallet.primary,
    borderWidth: 1,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: colorPallet.neutral_darkest,
    marginRight: 12,
  },
  thumbnailPlaceholder: { justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  name: { color: "#fff", fontSize: 16, fontWeight: "600" },
  muscle: { color: "#aaa", fontSize: 13, marginTop: 4 },
  equipment: { color: "#888", fontSize: 12, marginTop: 2 },
  sidebar: {
    width: 25,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 5,
    marginLeft: 5,
  },
  letter: { color: "#888", fontSize: 12, paddingVertical: 2 },
  activeLetter: { color: colorPallet.primary, fontWeight: "bold" },
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
});

export default LibraryScreen;
