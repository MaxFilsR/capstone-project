import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { BackButton, FormButton } from "@/components";
import { useOnboarding } from "@/lib/onboarding-context";
import { getClasses, CharacterClass } from "@/api/endpoints";
import { containers, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";

// Import class images
import assassin from "@/assets/images/assassin-male-green.png";
import warrior from "@/assets/images/warrior-male-full.png";
import monk from "@/assets/images/monk-male-full-brown.png";
import wizard from "@/assets/images/wizard-male-full-blue.png";
import gladiator from "@/assets/images/gladiator-male-full.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 64; // Account for padding on both sides
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
  Flexability: "#6DE66D",
};

export const screenOptions = {
  headerShown: false,
};

export default function SwipeableClassSelector() {
  const { updateClassId } = useOnboarding();
  const [classes, setClasses] = useState<CharacterClass[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await getClasses();
        setClasses(data);
      } catch (err) {
        console.error("Failed to load classes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClasses();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardTotalWidth = CARD_WIDTH + CARD_GAP;
    const index = Math.round(offsetX / cardTotalWidth);
    setCurrentIndex(index);
  };

  const handleConfirm = () => {
    if (classes[currentIndex]) {
      updateClassId(classes[currentIndex].id);
      router.push("/auth/onboarding/workoutSchedule");
    }
  };

  const scrollToClass = (index: number) => {
    const cardTotalWidth = CARD_WIDTH + CARD_GAP;
    scrollViewRef.current?.scrollTo({
      x: index * cardTotalWidth,
      animated: true,
    });
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
    <ScrollView
      contentContainerStyle={[containers.centerContainer]}
      style={{ backgroundColor: "#0C0C0C" }}
    >
      <BackButton />

      {/* Container with consistent spacing */}
      <View style={{ width: "100%", gap: 24 }}>
        {/* Title */}
        <Text
          style={[
            typography.h1,
            { color: colorPallet.neutral_lightest, textAlign: "center" },
          ]}
        >
          Choose Your Class
        </Text>

        {/* Swipeable class cards */}
        <View style={{ width: "100%" }}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
          >
            {classes.map((classItem, index) => (
              <View
                key={classItem.id}
                style={{
                  width: CARD_WIDTH,
                  marginRight: index === classes.length - 1 ? 0 : CARD_GAP,
                }}
              >
                <ClassCard classItem={classItem} />
              </View>
            ))}
          </ScrollView>

          {/* Pagination dots */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            {classes.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToClass(index)}
                style={{
                  width: currentIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    currentIndex === index ? colorPallet.primary : "#444",
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>

          {/* Class name indicator */}
          <Text
            style={[
              typography.h1,
              {
                color: colorPallet.primary,
                textAlign: "center",
                marginTop: 12,
              },
            ]}
          >
            {classes[currentIndex]?.name}
          </Text>
        </View>

        {/* Confirm button */}
        <FormButton title="Confirm Class" onPress={handleConfirm} />
      </View>
    </ScrollView>
  );
}

function ClassCard({ classItem }: { classItem: CharacterClass }) {
  const classImage = classImages[classItem.name] || assassin;

  return (
    <View
      style={{
        width: "100%",
        height: 550, // Fixed height for consistency
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#96F200",
        overflow: "hidden",
        backgroundColor: "#121212",
      }}
    >
      {/* Image container */}
      <View
        style={{
          height: 370, // Fixed height for image area
          padding: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F0F0F",
        }}
      >
        <Image
          source={classImage}
          style={{
            height: 350,
            width: "100%",
            resizeMode: "contain",
          }}
        />
      </View>

      {/* Character name + description */}
      <View style={{ padding: 16, paddingVertical: 12, flex: 1 }}>
        <Text
          style={[
            typography.h1,
            {
              color: colorPallet.primary,
              fontWeight: "800",
              fontSize: 18,
              marginBottom: 6,
            },
          ]}
        >
          {classItem.name}
        </Text>
        <Text style={[typography.body, { color: "#DADADA" }]}>
          {getClassDescription(classItem.name)}
        </Text>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: colorPallet.primary,
          paddingVertical: 14,
          paddingHorizontal: 12,
          justifyContent: "space-between",
        }}
      >
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
            label: "Flexability",
            value: classItem.stats.flexability,
            color: statColors.Flexability,
          },
        ].map((s) => (
          <View key={s.label} style={{ alignItems: "center", width: "25%" }}>
            <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 18 }}>
              {s.value}
            </Text>
            <Text style={{ color: s.color, marginTop: 2, fontSize: 12 }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getClassDescription(className: string): string {
  const descriptions: Record<string, string> = {
    Assassin: "Swift and relentless. Specializes in endurance training, running, and outdoor cardio.",
    Warrior: "Powerful and disciplined. Focused on lifting, strength, and short, intense workouts.",
    Monk: "Calm and precise. Master of form, flexibility, and body control through mindful movement.",
    Wizard: "Swift and relentless. Specializes in endurance training, running, and outdoor cardio.",
    Gladiator: "Fierce and competitive. Thrives in fast-paced, high-endurance, and agile challenges.",
  };
  return descriptions[className] || "A powerful character class";
}
