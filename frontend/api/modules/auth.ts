/**
 * Authentication Module
 * 
 * Handles user authentication operations including sign up and login.
 * All endpoints require email and password credentials.
 * Returns JWT tokens for authenticated sessions.
 */

import { apiClient } from "../client";

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// API Functions
// ============================================================================

/**
 * Register a new user account
 */
export async function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
  const response = await apiClient.post("/auth/sign-up", payload);
  return response.data;
}

/**
 * Authenticate an existing user
 */
export async function logIn(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}