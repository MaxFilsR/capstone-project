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

// Character Profile Types and Endpoints
export type CharacterEquipment = {
  arms: number;
  background: number;
  bodies: number;
  head: number;
  head_accessory: number;
  pet: number;
  weapon: number;
};

export type CharacterInventory = {
  arms: number[];
  backgrounds: number[];
  bodies: number[];
  heads: number[];
  head_accessories: number[];
  pets: number[];
  weapons: number[];
};

export type CharacterProfile = {
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
  pending_stat_points: number;
  streak: number;
  equipped: CharacterEquipment;
  inventory: CharacterInventory;
  coins: number;
};

/**
 * Fetch the logged-in user's character profile
 * GET /character
 */
export async function getCharacter(): Promise<CharacterProfile> {
  const response = await apiClient.get("/character");
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

export type GetWorkoutHistoryResponse = {
  history: WorkoutSession[];
};

/**
 * Fetch workout history for the authenticated user
 * GET /workouts/history
 * Returns: { history: WorkoutSession[] }
 */
export async function getWorkoutHistory(): Promise<WorkoutSession[]> {
  const response = await apiClient.get<GetWorkoutHistoryResponse>(
    "/workouts/history"
  );
  return response.data.history;
}

/**
 * Record a new workout session
 * POST /workouts/history
 * Returns: 200 OK (no body)
 */
export async function recordWorkout(
  payload: RecordWorkoutRequest
): Promise<void> {
  await apiClient.post("/workouts/history", payload);
}

// Social & Friends Types and Endpoints
export type FriendSummary = {
  user_id: number;
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
};

export type FriendProfile = {
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
  streak: number;
  equipped: CharacterEquipment;
};

export type UpdateFriendsRequest = {
  friend_ids: number[];
};

/**
 * Fetch list of friends
 * GET /social/friends
 */
export async function getFriends(): Promise<FriendSummary[]> {
  const response = await apiClient.get("/social/friends");
  return response.data;
}

/**
 * Fetch a specific friend's profile by ID
 * GET /social/friends/{id}
 */
export async function getFriendById(id: number): Promise<FriendProfile> {
  const response = await apiClient.get(`/social/friends/${id}`);
  return response.data;
}

/**
 * Update friends list (replace entire list)
 * PUT /social/friends
 */
export async function updateFriends(
  payload: UpdateFriendsRequest
): Promise<void> {
  await apiClient.put("/social/friends", payload);
}

/**
 * Helper: Add a friend by fetching current list and adding the new ID
 */
export async function addFriend(id: number): Promise<void> {
  const currentFriends = await getFriends();
  const friendIds = currentFriends.map((f) => f.user_id);

  if (!friendIds.includes(id)) {
    friendIds.push(id);
    await updateFriends({ friend_ids: friendIds });
  }
}

/**
 * Helper: Remove a friend by fetching current list and filtering out the ID
 */
export async function removeFriend(id: number): Promise<void> {
  const currentFriends = await getFriends();
  const friendIds = currentFriends
    .map((f) => f.user_id)
    .filter((friendId) => friendId !== id);

  await updateFriends({ friend_ids: friendIds });
}

// Leaderboard Types and Endpoints
export type LeaderboardEntry = {
  user_id: number;
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
};

export type LeaderboardProfile = {
  username: string;
  class: {
    name: string;
    stats: {
      strength: number;
      endurance: number;
      flexibility: number;
    };
  };
  level: number;
  exp_leftover: number;
  exp_needed: number;
  streak: number;
  equipped: CharacterEquipment;
};

/**
 * Fetch global leaderboard
 * GET /social/leaderboard
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await apiClient.get("/social/leaderboard");
  return response.data;
}

/**
 * Fetch a specific user's profile from leaderboard by ID
 * GET /social/leaderboard/{id}
 */
export async function getLeaderboardUserById(
  id: number
): Promise<LeaderboardProfile> {
  const response = await apiClient.get(`/social/leaderboard/${id}`);
  return response.data;
}

// Quests
export type Quest = {
  id: number;
  user_id: number;
  name: string;
  difficulty: string;
  status: string;
  number_of_workouts_needed: number;
  number_of_workouts_completed: number;
  workout_duration?: number;
  exercise_category?: string;
  exercise_muscle?: string;
};

export type GetQuestsRepsonse = {
  quests: Quest[];
};

/**
 * Fetch all quests the authenticated user
 * GET /quests
 * Returns: { quests: Quest[] }
 */

export async function getQuests(): Promise<Quest[]> {
  const response = await apiClient.get<GetQuestsRepsonse>(
    "/quests"
  );
  return response.data.quests;
}


export type CreateQuestRequest = {
  difficulty: string;
}

export type CreateQuestResponse = {
  name: string;
  difficulty: string;
  status: string;
  number_of_workouts_needed: number;
  number_of_workouts_completed: number;
  workout_duration?: number;
  exercise_category?: string;
  exercise_muscle?: string;
};

/**
 * Create a new quest
 * POST /quests
 * Request: { difficulty: string }
 * Returns: CreateQuestResponse with quest details
 */
export async function createQuest(
  payload: CreateQuestRequest
): Promise<CreateQuestResponse> {
  const response = await apiClient.post<CreateQuestResponse>("/quests", payload);
  return response.data;
}




















