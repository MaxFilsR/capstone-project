export const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/";

export const abs = (u?: string | null) =>
  u ? (u.startsWith("http") ? u : `${IMAGE_BASE_URL}${u}`) : undefined;

export function getExerciseType(
  category: string | null | undefined
): "strength" | "cardio" | "none" {
  if (!category) return "none";

  const cat = category.toLowerCase();

  if (
    cat === "strength" ||
    cat === "olympic weightlifting" ||
    cat === "powerlifting" ||
    cat === "strongman"
  ) {
    return "strength";
  }

  if (cat === "cardio") {
    return "cardio";
  }

  return "none";
}
