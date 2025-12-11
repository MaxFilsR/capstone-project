export type ExerciseLite = {
  id?: string | number;
  name: string;
  thumbnailUrl?: string;
  images?: string[];
  gifUrl?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number;
};

export type CompletedExerciseData = {
  id: string | number;
  sets: number;
  reps: number;
  weight: number;
  distance: number;
};

export type ExerciseType = "strength" | "cardio" | "none";

export type ExerciseForAbout = {
  id: string;
  name: string;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  category: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  images: string[];
};
