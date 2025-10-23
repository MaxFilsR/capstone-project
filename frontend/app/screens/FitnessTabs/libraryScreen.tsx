import React, { useState, useMemo, useRef, useEffect } from "react";
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
} from "react-native";
import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { getWorkoutLibrary, Exercise } from "@/api/endpoints";
import Popup from "@/components/PopupModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "workout_library_cache";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
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
        // Add cache control for better performance
        defaultSource={require("@/assets/images/icon.png")} // optional placeholder
      />
    );
  }
);

// Memoized card component to prevent unnecessary re-renders
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

const LibraryScreen = () => {
  const [query, setQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const sectionListRef = useRef<SectionList>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Fetch exercises with caching
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from cache first
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);

        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const age = Date.now() - timestamp;

          // If cache is still valid, use it immediately
          if (age < CACHE_DURATION) {
            setExercises(data);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data
        const data = await getWorkoutLibrary();

        if (Array.isArray(data) && data.length > 0) {
          setExercises(data);

          // Cache the data
          await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data,
              timestamp: Date.now(),
            })
          );
        } else {
          console.warn("No exercises returned or invalid format");
          setExercises([]);
        }
      } catch (err) {
        console.error("Failed to fetch workout library:", err);
        setError("Failed to load exercises. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Extract unique muscle groups dynamically (memoized)
  const muscleGroups = useMemo(() => {
    if (!exercises || !Array.isArray(exercises)) {
      return ["All"];
    }

    const muscleSet = new Set<string>();
    exercises.forEach((ex) => {
      ex.primaryMuscles.forEach((muscle) => {
        const formatted = muscle.charAt(0).toUpperCase() + muscle.slice(1);
        muscleSet.add(formatted);
      });
    });

    return ["All", ...Array.from(muscleSet).sort()];
  }, [exercises]);

  // Filter & group (memoized)
  const sections = useMemo(() => {
    if (!exercises || !Array.isArray(exercises)) {
      return [];
    }

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

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleAllSections = () => {
    const allCollapsed = sections.every((s) => collapsedSections[s.title]);
    const newState: { [key: string]: boolean } = {};
    sections.forEach((s) => {
      newState[s.title] = !allCollapsed;
    });
    setCollapsedSections(newState);
  };

  const scrollToSection = (letter: string) => {
    const sectionIndex = sections.findIndex((s) => s.title[0] === letter);
    if (sectionIndex === -1) return;

    if (sectionListRef.current) {
      try {
        sectionListRef.current.scrollToLocation({
          sectionIndex: sectionIndex,
          itemIndex: 0,
          viewOffset: 0,
          animated: true,
        });
      } catch (error) {
        console.warn("scrollToLocation failed:", error);

        const SECTION_HEADER_HEIGHT = 52;
        const ITEM_HEIGHT = 76;

        let yOffset = 0;
        for (let i = 0; i < sectionIndex; i++) {
          yOffset += SECTION_HEADER_HEIGHT;
          if (!collapsedSections[sections[i].title]) {
            yOffset += sections[i].data.length * ITEM_HEIGHT;
          }
        }

        const scrollResponder = sectionListRef.current.getScrollResponder();
        if (scrollResponder && scrollResponder.scrollTo) {
          scrollResponder.scrollTo({ y: yOffset, animated: true });
        }
      }
    }
  };

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

  const handleExercisePress = (item: Exercise) => {
    setSelectedExercise(item);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[tabStyles.tabContent, styles.centerContainer]}>
        <Ionicons name="alert-circle" size={48} color={colorPallet.secondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await getWorkoutLibrary();
              setExercises(data);
              await AsyncStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                  data,
                  timestamp: Date.now(),
                })
              );
            } catch {
              setError("Failed to load exercises. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allCollapsed = sections.every((s) => collapsedSections[s.title]);

  return (
    <View style={[tabStyles.tabContent, { flex: 1, paddingBottom: 100 }]}>
      {/* Search Icon (Absolute Positioned) */}
      {!searchVisible && (
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={() => setSearchVisible(true)}
        >
          <Ionicons name="search" size={24} color={colorPallet.secondary} />
        </TouchableOpacity>
      )}

      {/* Search Bar (Collapsible) */}
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

      {/* Muscle Group Filter */}
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

      {/* Expand/Collapse All Button */}
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

      {/* Horizontal layout: SectionList + Alphabet */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          stickySectionHeadersEnabled={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={10}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              const SECTION_HEADER_HEIGHT = 52;
              const ITEM_HEIGHT = 76;

              let yOffset = 0;
              for (let i = 0; i < info.index && i < sections.length; i++) {
                yOffset += SECTION_HEADER_HEIGHT;
                if (!collapsedSections[sections[i].title]) {
                  yOffset += sections[i].data.length * ITEM_HEIGHT;
                }
              }

              const scrollResponder =
                sectionListRef.current?.getScrollResponder();
              if (scrollResponder && scrollResponder.scrollTo) {
                scrollResponder.scrollTo({ y: yOffset, animated: true });
              }
            }, 50);
          }}
          renderSectionHeader={({ section: { title } }) => (
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
          )}
          renderItem={({ item, section }) => {
            if (collapsedSections[section.title]) return null;
            return <ExerciseCard item={item} onPress={handleExercisePress} />;
          }}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewConfigRef.current}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises found</Text>
            </View>
          }
        />

        {/* Right-side alphabet scrollbar */}
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
  filterContainer: {
    marginBottom: 12,
    maxHeight: 42,
  },
  filterContent: {
    paddingRight: 8,
  },
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
  resultsCount: {
    color: colorPallet.neutral_3,
    fontSize: 14,
  },
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
  collapseIcon: {
    color: colorPallet.secondary,
    fontSize: 16,
  },
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
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  muscle: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
  },
  equipment: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
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
