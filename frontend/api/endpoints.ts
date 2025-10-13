import { apiClient } from "./client";
import { storage } from "@/utils/storageHelper"; // Update this path to match your project structure

// Example type
export type User = {
  email: string;
  password: string;
};

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
    flexability: number;
  };
};

export type OnboardingRequest = {
  first_name: string;
  last_name: string;
  class_id: number;
  workout_schedule: boolean[]; // Array of 7 booleans (Sun-Sat)
  username: string;
};

export async function getClasses(): Promise<CharacterClass[]> {
  const response = await apiClient.post("/constants/classes");
  return response.data.classes; // Extract the classes array from the response
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
  email: string;
  username: string;
  class: string;
  stats: {
    strength: number;
    endurance: number;
    flexability: number;
  };
  workout_schedule: boolean[]; // 7 days
};

// MOCK /me endpoint - will be replaced with real API call later
const MOCK_USER_PROFILE_KEY = "mock_user_profile";
const USE_MOCK_ME_ENDPOINT = true; // Set to false when backend is ready

/**
 * Fetch the logged-in user's profile
 * Currently uses mock data stored locally
 * TODO: Replace with real API call when backend /me endpoint is ready
 */
export async function getMe(): Promise<UserProfile> {
  if (USE_MOCK_ME_ENDPOINT) {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network delay

    const storedProfile = await storage.getItem(MOCK_USER_PROFILE_KEY);

    if (!storedProfile) {
      throw new Error(
        "User profile not found. Please complete onboarding first."
      );
    }

    return JSON.parse(storedProfile);
  } else {
    // Real API call (uncomment when backend is ready)
    const response = await apiClient.post("/me");
    return response.data;
  }
}

/**
 * Save user profile locally after onboarding (MOCK ONLY)
 * This is called internally after submitOnboarding succeeds
 */
export async function saveMockUserProfile(
  onboardingData: OnboardingRequest,
  email: string,
  selectedClass: CharacterClass
): Promise<void> {
  const profile: UserProfile = {
    first_name: onboardingData.first_name,
    last_name: onboardingData.last_name,
    email: email,
    username: onboardingData.username,
    class: selectedClass.name,
    stats: selectedClass.stats,
    workout_schedule: onboardingData.workout_schedule,
  };

  await storage.setItem(MOCK_USER_PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Clear mock user profile (called on logout)
 */
export async function clearMockUserProfile(): Promise<void> {
  await storage.deleteItem(MOCK_USER_PROFILE_KEY);
}
