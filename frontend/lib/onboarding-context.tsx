/**
 * Onboarding Context
 * 
 * Manages user onboarding flow state across multiple steps. Stores user input
 * including personal information, character class selection, and workout schedule
 * preferences. Data persists across onboarding screens until submission or reset.
 */

import React, { createContext, useContext, useState, ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

/**
 * Onboarding form data structure
 */
type OnboardingData = {
  firstName: string;
  lastName: string;
  classId: number | null;
  workoutSchedule: boolean[];
  username: string;
};

/**
 * Context value providing onboarding state and update methods
 */
type OnboardingContextType = {
  data: OnboardingData;
  updateFirstName: (name: string) => void;
  updateLastName: (name: string) => void;
  updateClassId: (id: number) => void;
  updateWorkoutSchedule: (schedule: boolean[]) => void;
  updateUsername: (username: string) => void;
  resetData: () => void;
};

// ============================================================================
// Initial State
// ============================================================================

/**
 * Default onboarding data with empty values
 */
const initialData: OnboardingData = {
  firstName: "",
  lastName: "",
  classId: null,
  workoutSchedule: [false, false, false, false, false, false, false],
  username: "",
};

// ============================================================================
// Context
// ============================================================================

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Onboarding Provider component that wraps the onboarding flow
 */
export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);

  /**
   * Update user's first name
   */
  const updateFirstName = (name: string) => {
    setData((prev) => ({ ...prev, firstName: name }));
  };

  /**
   * Update user's last name
   */
  const updateLastName = (name: string) => {
    setData((prev) => ({ ...prev, lastName: name }));
  };

  /**
   * Update selected character class ID
   */
  const updateClassId = (id: number) => {
    setData((prev) => ({ ...prev, classId: id }));
  };

  /**
   * Update workout schedule (7 days: Sunday through Saturday)
   */
  const updateWorkoutSchedule = (schedule: boolean[]) => {
    setData((prev) => ({ ...prev, workoutSchedule: schedule }));
  };

  /**
   * Update user's chosen username
   */
  const updateUsername = (username: string) => {
    setData((prev) => ({ ...prev, username: username }));
  };

  /**
   * Reset all onboarding data to initial state
   */
  const resetData = () => {
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateFirstName,
        updateLastName,
        updateClassId,
        updateWorkoutSchedule,
        updateUsername,
        resetData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access onboarding context
 */
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  return context;
};