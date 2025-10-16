import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewToken,
} from "react-native";
import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";

// --- Mock Exercise Data ---
const exercises = [
  {
    id: "Alternate_Incline_Dumbbell_Curl",
    name: "Alternate Incline Dumbbell Curl",
    primaryMuscles: ["biceps"],
  },
  {
    id: "Barbell_Bicep_Curl",
    name: "Barbell Bicep Curl",
    primaryMuscles: ["biceps"],
  },
  { id: "Hammer_Curl", name: "Hammer Curl", primaryMuscles: ["biceps"] },
  {
    id: "Concentration_Curl",
    name: "Concentration Curl",
    primaryMuscles: ["biceps"],
  },
  { id: "Bench_Press", name: "Bench Press", primaryMuscles: ["chest"] },
  {
    id: "Incline_Bench_Press",
    name: "Incline Bench Press",
    primaryMuscles: ["chest"],
  },
  { id: "Chest_Fly", name: "Chest Fly", primaryMuscles: ["chest"] },
  { id: "Push_Up", name: "Push Up", primaryMuscles: ["chest"] },
  { id: "Squat", name: "Squat", primaryMuscles: ["quadriceps"] },
  { id: "Lunge", name: "Lunge", primaryMuscles: ["quadriceps"] },
  { id: "Leg_Press", name: "Leg Press", primaryMuscles: ["quadriceps"] },
  {
    id: "Leg_Extension",
    name: "Leg Extension",
    primaryMuscles: ["quadriceps"],
  },
  { id: "Deadlift", name: "Deadlift", primaryMuscles: ["hamstrings"] },
  {
    id: "Romanian_Deadlift",
    name: "Romanian Deadlift",
    primaryMuscles: ["hamstrings"],
  },
  {
    id: "Hamstring_Curl",
    name: "Hamstring Curl",
    primaryMuscles: ["hamstrings"],
  },
  { id: "Glute_Bridge", name: "Glute Bridge", primaryMuscles: ["glutes"] },
  { id: "Hip_Thrust", name: "Hip Thrust", primaryMuscles: ["glutes"] },
  { id: "Pull_Up", name: "Pull Up", primaryMuscles: ["back"] },
  { id: "Lat_Pulldown", name: "Lat Pulldown", primaryMuscles: ["back"] },
  { id: "Barbell_Row", name: "Barbell Row", primaryMuscles: ["back"] },
  { id: "Dumbbell_Row", name: "Dumbbell Row", primaryMuscles: ["back"] },
  {
    id: "Overhead_Press",
    name: "Overhead Press",
    primaryMuscles: ["shoulders"],
  },
  { id: "Lateral_Raise", name: "Lateral Raise", primaryMuscles: ["shoulders"] },
  { id: "Front_Raise", name: "Front Raise", primaryMuscles: ["shoulders"] },
  { id: "Rear_Delt_Fly", name: "Rear Delt Fly", primaryMuscles: ["shoulders"] },
  {
    id: "Tricep_Pushdown",
    name: "Tricep Pushdown",
    primaryMuscles: ["triceps"],
  },
  {
    id: "Overhead_Tricep_Extension",
    name: "Overhead Tricep Extension",
    primaryMuscles: ["triceps"],
  },
  { id: "Skullcrusher", name: "Skullcrusher", primaryMuscles: ["triceps"] },
  {
    id: "Cable_Tricep_Kickback",
    name: "Cable Tricep Kickback",
    primaryMuscles: ["triceps"],
  },
  { id: "Calf_Raise", name: "Calf Raise", primaryMuscles: ["calves"] },
  {
    id: "Seated_Calf_Raise",
    name: "Seated Calf Raise",
    primaryMuscles: ["calves"],
  },
  {
    id: "Standing_Calf_Raise",
    name: "Standing Calf Raise",
    primaryMuscles: ["calves"],
  },
  { id: "Farmer_Carry", name: "Farmer Carry", primaryMuscles: ["forearms"] },
  { id: "Wrist_Curl", name: "Wrist Curl", primaryMuscles: ["forearms"] },
  {
    id: "Reverse_Wrist_Curl",
    name: "Reverse Wrist Curl",
    primaryMuscles: ["forearms"],
  },
];

// --- Group exercises alphabetically by primary muscle ---
const groupByPrimaryMuscle = (list: typeof exercises) => {
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

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LibraryScreen = () => {
  const [query, setQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const sectionListRef = useRef<SectionList>(null);

  // Filter & group
  const sections = useMemo(() => {
    const filtered = exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.primaryMuscles.some((m) =>
          m.toLowerCase().includes(query.toLowerCase())
        )
    );
    return groupByPrimaryMuscle(filtered);
  }, [query]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const scrollToSection = (letter: string) => {
    const index = sections.findIndex((s) => s.title[0] === letter);
    if (index !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: index,
        itemIndex: 1,
        animated: true,
      });
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

  return (
    <View style={[tabStyles.tabContent, { flex: 1, paddingBottom: 100 }]}>
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
        />
      </View>
      {/* Horizontal layout: SectionList + Alphabet */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* SectionList takes most of the width */}
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }} // make it take remaining space
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
            const imageUrl = `https://picsum.photos/seed/${item.id}/100/100`;
            return (
              <TouchableOpacity style={styles.card}>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.muscle}>
                    {item.primaryMuscles.join(", ")}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewConfigRef.current}
        />

        {/* Right-side alphabet scrollbar */}
        <View style={styles.sidebar}>
          {alphabet.map((letter) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
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
  sectionHeader: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  collapseIcon: {
    color: colorPallet.secondary,
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    marginVertical: 5,
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: "hidden",
    borderColor: colorPallet.primary,
    borderWidth: 1,
    paddingVertical: 16,
  },

  info: {
    flex: 1,
    paddingHorizontal: 10,
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
  sidebar: {
    width: 25,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 5,
    marginLeft: 5, // small gap from SectionList
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

export default LibraryScreen;
