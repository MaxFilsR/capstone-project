import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { colorPallet } from "@/styles/variables";

const FALLBACK_IMG =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/assisted-dip/assisted-dip-1.png";

type ImageCarouselProps = {
  images: string[];
  height?: number;
  showDots?: boolean;
};

export const ImageCarousel = React.memo(
  ({ images, height = 340, showDots = true }: ImageCarouselProps) => {
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
      if (images.length > 1) {
        const interval = setInterval(() => {
          setImageIndex((prev) => (prev + 1) % images.length);
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [images.length]);

    const currentImage = images[imageIndex] ?? FALLBACK_IMG;

    return (
      <View style={[styles.container, { height }]}>
        <Image
          source={{ uri: currentImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {showDots && images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === imageIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colorPallet.neutral_6,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colorPallet.neutral_3,
  },
  dotActive: {
    backgroundColor: colorPallet.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
