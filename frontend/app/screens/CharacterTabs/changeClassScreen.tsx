/**
 * Change Class Screen
 *
 * Settings screen for changing character class with swipeable carousel.
 * Displays all available classes with images, descriptions, and base stats.
 */

import { useState, useEffect, useRef } from "react";
import { View, Text, Image, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colorPallet } from "@/styles/variables";
import { typography, containers } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { BackButton, FormButton } from "@/components";
import { getClasses, getCharacter, CharacterClass, updateClass } from "@/api/endpoints";
import axios from "axios";

// import class character images
import assassin from "@/assets/images/assassin-male-green.png";
import warrior from "@/assets/images/warrior-male-full.png";
import monk from "@/assets/images/monk-male-full-brown.png";
import wizard from "@/assets/images/wizard-male-full-blue.png";
import gladiator from "@/assets/images/gladiator-male-full.png";

// ============================================================================
// Constants
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_GAP = 16;

const classImages: Record<string, any> = {
  Assassin: assassin,
  Warrior: warrior,
  Monk: monk,
  Wizard: wizard,
  Gladiator: gladiator,
};

const statColors = {
  Strength: "#D64545",
  Endurance: "#E9E34A",
  Flexibility: "#6DE66D",
};

// ============================================================================
// Component
// ============================================================================

export default function ChangeClassScreen() {
  const [classes, setClasses] = useState<CharacterClass[]>([]);
  const [currentClassId, setCurrentClassId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);


  // Load classes and current character class
  useEffect(() => {
    async function loadData() {
      try {
        const classesData = await getClasses();
        setClasses(classesData);

        const profile = await getCharacter();
        const currentClass = classesData.find(
          (c) => c.name === profile.class.name
        );

        if (currentClass) {
          setCurrentClassId(currentClass.id);
          const currentClassIndex = classesData.findIndex(
            (c) => c.id === currentClass.id
          );
          if (currentClassIndex !== -1) {
            setCurrentIndex(currentClassIndex);
            setTimeout(() => {
              scrollToClass(currentClassIndex, false);
            }, 100);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Failed to load classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update current index based on scroll position
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardTotalWidth = CARD_WIDTH + CARD_GAP;
    const index = Math.round(offsetX / cardTotalWidth);
    setCurrentIndex(index);
  };


  // scroll to specific class index
  const scrollToClass = (index: number, animated: boolean = true) => {
    const cardTotalWidth = CARD_WIDTH + CARD_GAP;
    scrollViewRef.current?.scrollTo({
      x: index * cardTotalWidth,
      animated,
    });
  };

  // Submit class change
  const handleSubmit = async () => {
    const selectedClass = classes[currentIndex];

    // select class
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    // class must be different than current class
    if (selectedClass.id === currentClassId) {
      setError("Please select a different class");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await updateClass({ class_id: selectedClass.id });
      router.back();
    } catch (err: unknown) {
      console.error("Class update error:", err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const serverMessage =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
          setError(`${serverMessage}`);
        } else if (err.request) {
          setError("No response from server. Please try again.");
        } else {
          setError(`Request setup error: ${err.message}`);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[containers.centerContainer, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colorPallet.primary} />
        <Text
          style={[
            typography.body,
            { color: colorPallet.neutral_lightest, marginTop: 16 },
          ]}
        >
          Loading classes...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <BackButton />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* title with icon */}
          <View style={styles.titleContainer}>
            <Ionicons
              name="shield-outline"
              size={28}
              color={colorPallet.primary}
              style={styles.titleIcon}
            />
            <Text style={[typography.h1, styles.title]}>Change Class</Text>
          </View>

          {/* current class display */}
          {currentClassId && (
            <View style={styles.currentClassCard}>
              <Text style={styles.currentClassLabel}>CURRENT CLASS</Text>
              <Text style={styles.currentClassValue}>
                {classes.find((c) => c.id === currentClassId)?.name}
              </Text>
            </View>
          )}

          {/* error message */}
          {error && (
            <Text style={[typography.errorText, { marginBottom: 16 }]}>
              {error}
            </Text>
          )}

          {/* swipeable class selector carousel */}
          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={styles.scrollContent}
            >
              {classes.map((classItem, index) => (
                <View
                  key={classItem.id}
                  style={[
                    styles.cardWrapper,
                    { marginRight: index === classes.length - 1 ? 0 : CARD_GAP },
                  ]}
                >
                  <ClassCard
                    classItem={classItem}
                    isCurrent={classItem.id === currentClassId}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.paginationContainer}>
              {classes.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => scrollToClass(index)}
                  style={[
                    styles.paginationDot,
                    currentIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            {/* class name indicator */}
            <Text style={[typography.h1, styles.className]}>
              {classes[currentIndex]?.name}
              {classes[currentIndex]?.id === currentClassId && " (Current)"}
            </Text>
          </View>

          {/* submit button */}
          <View style={{ paddingHorizontal: 20 }}>
            <FormButton
              mode="contained"
              title={saving ? "Saving..." : "Save Changes"}
              onPress={handleSubmit}
              disabled={saving}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Class Card Component
// ============================================================================

// class card displaying character image, description and stats
function ClassCard({
  classItem,
  isCurrent,
}: {
  classItem: CharacterClass;
  isCurrent: boolean;
}) {
  const classImage = classImages[classItem.name] || assassin;

  return (
    <View style={styles.classCard}>
      {/* character image */}
      <View style={styles.imageContainer}>
        <Image source={classImage} style={styles.classImage} />
      </View>

      {/* class name and description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.classCardName}>{classItem.name}</Text>
        <Text style={styles.classDescription}>
          {getClassDescription(classItem.name)}
        </Text>
      </View>

      {/* base stats display */}
      <View style={styles.statsContainer}>
        {[
          {
            label: "Strength",
            value: classItem.stats.strength,
            color: statColors.Strength,
          },
          {
            label: "Endurance",
            value: classItem.stats.endurance,
            color: statColors.Endurance,
          },
          {
            label: "Flexibility",
            value: classItem.stats.flexibility,
            color: statColors.Flexibility,
          },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: s.color }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

// description text for each class
function getClassDescription(className: string): string {
  const descriptions: Record<string, string> = {
    Assassin:
      "Swift and relentless. Specializes in endurance training, running, and outdoor cardio.",
    Warrior:
      "Powerful and disciplined. Focused on lifting, strength, and short, intense workouts.",
    Monk: "Calm and precise. Master of form, flexibility, and body control through mindful movement.",
    Wizard:
      "Mystical and balanced. Combines mental focus with physical training for complete wellness.",
    Gladiator:
      "Fierce and competitive. Thrives in fast-paced, high-endurance, and agile challenges.",
  };
  return descriptions[className] || "A powerful character class";
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colorPallet.neutral_darkest,
    paddingTop: 80,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  content: {
    width: "100%",
    gap: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    color: colorPallet.neutral_lightest,
  },
  currentClassCard: {
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colorPallet.neutral_5,
  },
  currentClassLabel: {
    ...typography.body,
    color: colorPallet.neutral_3,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentClassValue: {
    ...typography.body,
    color: colorPallet.neutral_lightest,
    fontSize: 18,
    fontWeight: "700",
  },
  carouselContainer: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  classCard: {
    width: "100%",
    height: 480,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    overflow: "hidden",
    backgroundColor: colorPallet.neutral_6,
  },
  imageContainer: {
    height: 300,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorPallet.neutral_5,
  },
  classImage: {
    height: 280,
    width: "100%",
    resizeMode: "contain",
  },
  descriptionContainer: {
    padding: 16,
    paddingVertical: 12,
    flex: 1,
  },
  classCardName: {
    ...typography.h1,
    color: colorPallet.primary,
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 6,
  },
  classDescription: {
    ...typography.body,
    color: colorPallet.neutral_2,
  },
  statsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: colorPallet.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    width: "25%",
  },
  statValue: {
    color: colorPallet.neutral_lightest,
    fontWeight: "800",
    fontSize: 18,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colorPallet.neutral_4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colorPallet.primary,
  },
  className: {
    color: colorPallet.primary,
    textAlign: "center",
    marginTop: 12,
  },
});
