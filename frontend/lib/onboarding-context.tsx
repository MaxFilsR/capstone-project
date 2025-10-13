import React, { createContext, useContext, useState, ReactNode } from "react";

type OnboardingData = {
  firstName: string;
  lastName: string;
  classId: number | null;
  workoutSchedule: boolean[]; // 7 days: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  username: string;
};

type OnboardingContextType = {
  data: OnboardingData;
  updateFirstName: (name: string) => void;
  updateLastName: (name: string) => void;
  updateClassId: (id: number) => void;
  updateWorkoutSchedule: (schedule: boolean[]) => void;
  updateUsername: (username: string) => void;
  resetData: () => void;
};

const initialData: OnboardingData = {
  firstName: "",
  lastName: "",
  classId: null,
  workoutSchedule: [false, false, false, false, false, false, false],
  username: "",
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateFirstName = (name: string) => {
    setData((prev) => ({ ...prev, firstName: name }));
  };

  const updateLastName = (name: string) => {
    setData((prev) => ({ ...prev, lastName: name }));
  };

  const updateClassId = (id: number) => {
    setData((prev) => ({ ...prev, classId: id }));
  };

  const updateWorkoutSchedule = (schedule: boolean[]) => {
    setData((prev) => ({ ...prev, workoutSchedule: schedule }));
  };

  const updateUsername = (username: string) => {
    setData((prev) => ({ ...prev, username: username }));
  };

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

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  return context;
};
