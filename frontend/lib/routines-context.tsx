import React, { createContext, useContext, useState, useEffect } from "react";
import { getRoutines, RoutineResponse } from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";

type RoutinesContextType = {
  routines: RoutineResponse[];
  loading: boolean;
  error: string | null;
  refreshRoutines: () => Promise<void>;
  addRoutine: (routine: RoutineResponse) => void;
  updateRoutine: (id: number, routine: RoutineResponse) => void;
  removeRoutine: (id: number) => void;
};

const RoutinesContext = createContext<RoutinesContextType | undefined>(
  undefined
);

export const RoutinesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = async () => {
    if (!user) {
      setRoutines([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getRoutines();
      setRoutines(response.routines);
    } catch (err: any) {
      console.error("Error fetching routines:", err);
      setError(err?.response?.data?.message || "Failed to fetch routines");
    } finally {
      setLoading(false);
    }
  };

  // Optimistically add a routine without waiting for API
  const addRoutine = (routine: RoutineResponse) => {
    setRoutines((prev) => [...prev, routine]);
  };

  // Optimistically update a routine
  const updateRoutine = (id: number, updatedRoutine: RoutineResponse) => {
    setRoutines((prev) =>
      prev.map((routine) => (routine.id === id ? updatedRoutine : routine))
    );
  };

  // Optimistically remove a routine
  const removeRoutine = (id: number) => {
    setRoutines((prev) => prev.filter((routine) => routine.id !== id));
  };

  useEffect(() => {
    fetchRoutines();
  }, [user]);

  return (
    <RoutinesContext.Provider
      value={{
        routines,
        loading,
        error,
        refreshRoutines: fetchRoutines,
        addRoutine,
        updateRoutine,
        removeRoutine,
      }}
    >
      {children}
    </RoutinesContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutinesContext);
  if (context === undefined) {
    throw new Error("useRoutines must be used within a RoutinesProvider");
  }
  return context;
};
