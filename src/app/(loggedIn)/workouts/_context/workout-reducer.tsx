import type { Exercise, Workout, WorkoutExercise } from "@/server/db/schema";
import type { WorkoutState } from "./workout-provider";

type WorkoutActionType =
  | { type: "UPDATE_WORKOUT"; payload: Partial<Workout> }
  | { type: "UPDATE_EXERCISES"; payload: (WorkoutExercise & Exercise)[] };

export const workoutReducer = (
  state: WorkoutState,
  action: WorkoutActionType,
): WorkoutState => {
  switch (action.type) {
    case "UPDATE_WORKOUT":
      return {
        ...state,
        ...action.payload,
      };

    case "UPDATE_EXERCISES":
      return {
        ...state,
        newExercises: action.payload,
      };

    default:
      return state;
  }
};
