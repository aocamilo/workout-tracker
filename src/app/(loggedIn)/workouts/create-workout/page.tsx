import { Button } from "@/components/ui/button";
import Link from "next/link";

import Workout from "../_components/workout";
import { api } from "@/trpc/server";

export default async function CreateWorkoutPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const isEditing = !!searchParams.edit;

  const exercises = await api.exercise.getExercises();

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">
            {isEditing ? "Edit Workout" : "Create New Workout"}
          </h1>
          <p className="text-muted-foreground">
            Build your custom workout by selecting exercises and configuring
            sets and reps.
          </p>
        </div>
        <Link href="/workouts">
          <Button variant="outline">← Back to Workouts</Button>
        </Link>
      </div>
      <Workout workouts={[]} exercises={exercises} isEditing={isEditing} />
    </div>
  );
}
