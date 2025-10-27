import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { tabStyles, typography } from "@/styles";
import { colorPallet } from "@/styles/variables";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Popup from "@/components/Popup";
import { useRoutines } from "@/lib/routines-context";
import { useWorkoutLibrary } from "@/lib/workout-library-context";

export type Routine = {
  id?: number;
  name: string;
  summary?: string;
  exercises: Array<{
    id: string;
    sets?: number;
    reps?: number;
    weight?: number;
    distance?: number;
  }>;
};

function RoutineCard({
  routine,
  onEdit,
}: {
  routine: Routine;
  onEdit: (r: Routine) => void;
}) {
  return (
    <View style={{ position: "relative" }}>
      <View style={styles.card}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.cardTitle}>{routine.name}</Text>
          {routine.summary && (
            <Text style={styles.cardSummary}>{routine.summary}</Text>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colorPallet.secondary}
        />
      </View>

      <Pressable
        style={styles.cardOverlay}
        hitSlop={10}
        onPress={() => onEdit(routine)}
      />
    </View>
  );
}

const RoutinesScreen = () => {
  const { routines, loading, error, refreshRoutines } = useRoutines();
  const { exercises } = useWorkoutLibrary();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"createRoutine" | "editRoutine">(
    "createRoutine"
  );
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleEditRoutine = (routine: Routine) => {
    // Transform routine to include full exercise details for editing
    const routineWithDetails = {
      ...routine,
      exercises: routine.exercises.map((ex: any) => {
        const fullExercise = exercises.find((e) => e.id === ex.id);
        return {
          ...fullExercise,
          ...ex, // Merge with sets, reps, weight, distance
          uniqueId: `${ex.id}-${Date.now()}-${Math.random()}`,
        };
      }),
    };

    setModalMode("editRoutine");
    setSelectedRoutine(routineWithDetails);
    setShowModal(true);
  };

  const handleCreateRoutine = () => {
    setModalMode("createRoutine");
    setSelectedRoutine(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRoutine(null);
    // Refresh the list after closing modal
    refreshRoutines();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRoutines();
    setRefreshing(false);
  };

  // Generate summary for each routine
  const routinesWithSummary = routines.map((routine, index) => {
    const exerciseNames = routine.exercises
      .map((ex) => {
        const fullExercise = exercises.find((e) => e.id === ex.id);
        return fullExercise?.name || ex.id;
      })
      .slice(0, 4); // Show first 4 exercises

    const summary =
      exerciseNames.length > 0
        ? exerciseNames.join(" • ") +
          (routine.exercises.length > 4
            ? ` • +${routine.exercises.length - 4} more`
            : "")
        : "No exercises";

    return {
      ...routine,
      // Ensure we have an id (use index as fallback if API doesn't provide one)
      id: routine.id ?? index,
      summary,
    };
  });

  return (
    <ScrollView
      style={tabStyles.tabContent}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colorPallet.primary}
        />
      }
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        {/* Header */}
        <Text style={[typography.h2]}>My Routines</Text>

        {/* + Button */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
          onPress={handleCreateRoutine}
        >
          <Text style={{ color: colorPallet.secondary, fontSize: 30 }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && routines.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colorPallet.primary} />
          <Text style={styles.loadingText}>Loading routines...</Text>
        </View>
      ) : error ? (
        /* Error State */
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshRoutines}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : routines.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No routines yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first workout routine!
          </Text>
        </View>
      ) : (
        /* Routines List */
        <View style={{ gap: 12, marginBottom: 28 }}>
          {routinesWithSummary.map((r, index) => (
            <RoutineCard
              key={r.id ? `routine-${r.id}` : `routine-${index}`}
              routine={r}
              onEdit={handleEditRoutine}
            />
          ))}
        </View>
      )}

      {/* Modal */}
      <Popup
        visible={showModal}
        mode={modalMode}
        onClose={handleModalClose}
        routine={modalMode === "editRoutine" ? selectedRoutine : null}
      />

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: colorPallet.neutral_lightest,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorPallet.neutral_6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colorPallet.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  cardTitle: {
    ...typography.h2,
    color: colorPallet.neutral_lightest,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSummary: {
    color: colorPallet.neutral_3,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 2,
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  centerContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: colorPallet.neutral_3,
    fontSize: 16,
  },
  errorText: {
    color: colorPallet.secondary,
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: colorPallet.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colorPallet.neutral_1,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: colorPallet.neutral_3,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: colorPallet.neutral_4,
    fontSize: 14,
  },
});

export default RoutinesScreen;
