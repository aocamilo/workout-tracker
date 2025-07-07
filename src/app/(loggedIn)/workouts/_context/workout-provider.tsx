"use client";

import type { Exercise, Workout, WorkoutExercise } from "@/server/db/schema";
import { useReducer, type FC, type PropsWithChildren } from "react";
import { WorkoutContext } from "./workout-context";
import { workoutReducer } from "./workout-reducer";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export interface WorkoutState {
  name: string;
  duration: number;
  newExercises: (WorkoutExercise & Exercise)[];
  isEditing?: boolean;
  isPending: boolean;
}

const WORKOUT_INITIAL_STATE: WorkoutState = {
  name: "",
  duration: 45,
  newExercises: [],
  isEditing: false,
  isPending: false,
};

export type WorkoutProviderProps = {
  workouts: Workout[];
  exercises: Exercise[];
  isEditing?: boolean;
};

export const WorkoutProvider: FC<PropsWithChildren<WorkoutProviderProps>> = ({
  workouts,
  exercises,
  children,
  isEditing,
}) => {
  const [state, dispatch] = useReducer(workoutReducer, {
    ...WORKOUT_INITIAL_STATE,
    isEditing,
  });

  const router = useRouter();

  const utils = api.useUtils();

  const { mutate: createWorkout, isPending: isCreatingWorkout } =
    api.workout.create.useMutation({
      onSuccess: async () => {
        // Invalidate and refetch workouts data
        await utils.workout.getAll.invalidate();
        router.push("/workouts");
      },
    });

  const onSave = () => {
    if (state.isEditing) {
      console.log("update workout");
    } else {
      // Debug: Log the current state
      console.log("Current state:", {
        name: state.name,
        duration: state.duration,
        newExercises: state.newExercises,
        exercisesCount: state.newExercises?.length || 0,
      });

      // Validate that we have exercises before creating the workout
      if (!state.newExercises || state.newExercises.length === 0) {
        console.error("No exercises selected for the workout");
        return;
      }

      const exercises = state.newExercises.map((exercise) => ({
        exerciseId: exercise.id,
        sets: exercise.sets,
        reps: exercise.reps,
      }));

      createWorkout({
        name: state.name,
        duration: state.duration,
        exercises,
      });
    }
  };

  const setExercises = (exercises: (WorkoutExercise & Exercise)[]) => {
    dispatch({ type: "UPDATE_EXERCISES", payload: exercises });
  };

  const setWorkout = (workout: Partial<Workout>) => {
    dispatch({ type: "UPDATE_WORKOUT", payload: workout });
  };

  return (
    <WorkoutContext.Provider
      value={{
        ...state,
        setExercises,
        setWorkout,
        onSave,
        exercises,
        workouts,
        isPending: isCreatingWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};
