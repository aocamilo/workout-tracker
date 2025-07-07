import { useContext } from "react";
import { WorkoutContext } from "./workout-context";

export function useWorkoutContext() {
  const context = useContext(WorkoutContext);
  if (!context)
    throw new Error("useWorkoutContext must be used within WorkoutProvider");
  return context;
}
