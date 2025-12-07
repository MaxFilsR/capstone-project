/**
 * Authentication Context
 *
 * Manages user authentication state and provides authentication methods
 * throughout the application. Handles login, logout, token storage, and
 * user profile management. Automatically restores user session on app start.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { router } from "expo-router";
import { getCharacter, CharacterProfile } from "@/api/endpoints";
import { storage } from "@/utils/storageHelper";
import { setLogoutCallback } from "@/api/client";

// ============================================================================
// Types
// ============================================================================

/**
 * User object containing authentication and profile information
 */
type User = {
  onboarded?: boolean;
  profile?: CharacterProfile;
};

/**
 * Context value providing authentication state and methods
 */
type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, onboarded: boolean) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  fetchUserProfile: () => Promise<CharacterProfile>;
};

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Authentication Provider component that wraps the app
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Log out the user and clear all stored authentication data
   */
  const logout = async () => {
    console.log("Logging out user...");
    await storage.deleteItem("accessToken");
    await storage.deleteItem("onboarded");
    setUser(null);
    router.replace("/auth/logIn");
  };

  /**
   * Register logout callback with API client on mount
   */
  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  /**
   * Auto-login on app start if valid token exists
   */
  useEffect(() => {
    async function loadUser() {
      const token = await storage.getItem("accessToken");
      const onboardedStr = await storage.getItem("onboarded");

      if (token) {
        setUser({
          onboarded: onboardedStr === "true",
        });
      }
    }
    loadUser();
  }, []);

  /**
   * Log in user and store authentication token
   */
  const login = async (token: string, onboarded: boolean) => {
    await storage.setItem("accessToken", token);
    await storage.setItem("onboarded", String(onboarded));

    setUser({
      onboarded,
    });
  };

  /**
   * Mark user onboarding as complete
   */
  const completeOnboarding = async () => {
    await storage.setItem("onboarded", "true");
    setUser((prev) => (prev ? { ...prev, onboarded: true } : null));
  };

  /**
   * Fetch and store user's character profile
   */
  const fetchUserProfile = async (): Promise<CharacterProfile> => {
    const profile = await getCharacter();
    setUser((prev) => (prev ? { ...prev, profile } : null));
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        completeOnboarding,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};