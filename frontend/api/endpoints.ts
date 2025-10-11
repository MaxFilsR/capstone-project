import { apiClient } from "./client";

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
    vitality: number;
    strength: number;
    endurance: number;
    agility: number;
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
  return response.data;
}

export async function submitOnboarding(
  payload: OnboardingRequest
): Promise<void> {
  const response = await apiClient.post("/onboarding", payload);
  return response.data;
}
