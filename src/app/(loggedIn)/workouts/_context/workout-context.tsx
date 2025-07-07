import type { Exercise, Workout, WorkoutExercise } from "@/server/db/schema";
import { createContext } from "react";

interface WorkoutContextProps {
  exercises: Exercise[];
  workouts: Workout[];
  name: string;
  duration: number;
  newExercises: (WorkoutExercise & Exercise)[];
  setExercises: (exercises: (WorkoutExercise & Exercise)[]) => void;
  setWorkout: (workout: Partial<Workout>) => void;
  onSave: () => void;
  isEditing?: boolean;
  isPending: boolean;
}

export const WorkoutContext = createContext({} as WorkoutContextProps);
