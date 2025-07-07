"use client";

import { cn } from "@/lib/utils";
import type { Exercise, Workout as WorkoutType } from "@/server/db/schema";
import { WorkoutProvider } from "../_context/workout-provider";
import WorkoutDetails from "./workout-details";
import WorkoutCurrent from "./workout-current";
import ExerciseLibrary from "./workout-exercise-library";

interface WorkoutProps {
  className?: string;
  workouts: WorkoutType[];
  exercises: Exercise[];
  isEditing?: boolean;
}
function Workout({ className, workouts, exercises, isEditing }: WorkoutProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <WorkoutProvider
        workouts={workouts}
        exercises={exercises}
        isEditing={isEditing}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <WorkoutDetails />
            <WorkoutCurrent />
          </div>

          <div className="lg:col-span-2">
            <ExerciseLibrary />
          </div>
        </div>
      </WorkoutProvider>
    </div>
  );
}
export default Workout;
