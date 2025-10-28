import { apiClient } from "./client";

export type SignUpRequest = {
  email: string;
  password: string;
};

export type SignUpResponse = {
  access_token: string;
  refresh_token: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  onboarding_complete: boolean;
};

export async function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
  const response = await apiClient.post("/auth/sign-up", payload);
  return response.data;
}

export async function logIn(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

// Onboarding Types and Endpoints
export type CharacterClass = {
  id: number;
  name: string;
  stats: {
    strength: number;
    endurance: number;
    flexibility: number;
  };
};

export type OnboardingRequest = {
  first_name: string;
  last_name: string;
  class_id: number;
  workout_schedule: boolean[];
  username: string;
};

export async function getClasses(): Promise<CharacterClass[]> {
  const response = await apiClient.post("/constants/classes");
  return response.data.classes;
}

export async function submitOnboarding(
  payload: OnboardingRequest
): Promise<void> {
  const response = await apiClient.post("/onboarding", payload);
  return response.data;
}

// User Profile Types and Endpoints
export type UserProfile = {
  first_name: string;
  last_name: string;
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  workout_schedule: boolean[]; // 7 days
};

/**
 * Fetch the logged-in user's profile
 * GET /summary/me
 */
export async function getMe(): Promise<UserProfile> {
  const response = await apiClient.get("/summary/me");
  return response.data;
}

// Workout Library Types and Endpoints
export type Exercise = {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
};

/**
 * Fetch all exercises from the workout library
 * GET /workouts/library
 * Returns a JSON file containing an array of exercises
 */
export async function getWorkoutLibrary(): Promise<Exercise[]> {
  const response = await apiClient.get("/workouts/library");
  let data = response.data;
  return data;
}

/**
 * Fetch details of a specific workout by ID
 * GET /workouts/history/${id}
 */
export async function getWorkoutById(id: string): Promise<WorkoutSession> {
  const response = await apiClient.get(`/workouts/history/${id}`);
  return response.data;
}

// Routine Types and Endpoints
export type RoutineExercise = {
  id: string;
  sets: number;
  reps: number;
  weight: number;
  distance: number;
};

export type CreateRoutineRequest = {
  name: string;
  exercises: RoutineExercise[];
};

export type CreateRoutineResponse = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
};

/**
 * Create a new workout routine
 * POST /workout/routines
 */
export async function createRoutine(
  payload: CreateRoutineRequest
): Promise<CreateRoutineResponse> {
  const response = await apiClient.post("/workout/routines", payload);
  return response.data;
}

export type UpdateRoutineRequest = {
  id: number;
  name: string;
  exercises: RoutineExercise[];
};

export type UpdateRoutineResponse = {
  id: number;
  name: string;
  exercises: RoutineExercise[];
};

export type DeleteRoutineRequest = {
  id: number;
};

export type DeleteRoutineResponse = {
  success: boolean; // optional convenience field
};

/**
 * Edit an existing workout routine
 * PUT /workout/routines
 */
export async function updateRoutine(
  payload: UpdateRoutineRequest
): Promise<UpdateRoutineResponse> {
  const { data } = await apiClient.put<UpdateRoutineResponse>(
    "/workout/routines",
    payload
  );
  return data;
}

/**
 * Delete a workout routine
 * DELETE /workout/routines
 */
export async function deleteRoutine(
  payload: DeleteRoutineRequest
): Promise<void> {
  await apiClient.delete("/workout/routines", { data: payload });
}

export type RoutineResponse = {
  id?: number; // May or may not be returned by API
  name: string;
  exercises: RoutineExercise[];
};

export type GetRoutinesResponse = {
  routines: RoutineResponse[];
};

/**
 * Get all workout routines
 * GET /workout/routines
 */
export async function getRoutines(): Promise<GetRoutinesResponse> {
  const { data } = await apiClient.get<GetRoutinesResponse>(
    "/workout/routines"
  );
  return data;
}

// Workout History
export type WorkoutExercise = {
  id: number;
  sets: number;
  reps: number;
  weight: number;
  distance: number;
};

export type WorkoutSession = {
  id: number;
  name: string;
  exercises: WorkoutExercise[];
  date: string; // ISO 8601
  duration: number;
  points: number;
};

export type RecordWorkoutRequest = {
  name: string;
  exercises: WorkoutExercise[];
  date: string; // ISO 8601
  duration: number;
  points: number;
};

/**
 * Fetch workout history for the authenticated user
 * GET /workouts/history
 */
export async function getWorkoutHistory(): Promise<WorkoutSession[]> {
  const response = await apiClient.get("/workouts/history");
  return response.data;
}

/**
 * Record a new workout session
 * POST /workouts/history
 */
export async function recordWorkout(
  payload: RecordWorkoutRequest
): Promise<WorkoutSession> {
  const response = await apiClient.post("/workouts/history", payload);
  return response.data;
}
