import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getRoutines,
  createRoutine,
  updateRoutine as apiUpdateRoutine,
  deleteRoutine as apiDeleteRoutine,
  RoutineResponse,
  CreateRoutineRequest,
  UpdateRoutineRequest,
  DeleteRoutineRequest,
} from "@/api/endpoints";
import { useAuth } from "@/lib/auth-context";

type RoutinesContextType = {
  routines: RoutineResponse[];
  loading: boolean;
  error: string | null;
  refreshRoutines: () => Promise<void>;
  addRoutine: (routine: CreateRoutineRequest) => Promise<void>;
  updateRoutine: (id: number, routine: UpdateRoutineRequest) => Promise<void>;
  removeRoutine: (id: number) => Promise<void>;
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

  // Add a routine and refresh the list
  const addRoutine = async (routine: CreateRoutineRequest) => {
    try {
      setError(null);
      await createRoutine(routine);
      // Refresh to get the updated list with the new routine
      await fetchRoutines();
    } catch (err: any) {
      console.error("Error creating routine:", err);
      setError(err?.response?.data?.message || "Failed to create routine");
      throw err;
    }
  };

  // Update a routine and refresh the list
  const updateRoutine = async (id: number, routine: UpdateRoutineRequest) => {
    try {
      setError(null);
      await apiUpdateRoutine(routine);
      // Refresh to get the updated list
      await fetchRoutines();
    } catch (err: any) {
      console.error("Error updating routine:", err);
      setError(err?.response?.data?.message || "Failed to update routine");
      throw err;
    }
  };

  // Remove a routine and refresh the list
  const removeRoutine = async (id: number) => {
    try {
      setError(null);
      await apiDeleteRoutine({ id });
      // Refresh to get the updated list
      await fetchRoutines();
    } catch (err: any) {
      console.error("Error deleting routine:", err);
      setError(err?.response?.data?.message || "Failed to delete routine");
      throw err;
    }
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
