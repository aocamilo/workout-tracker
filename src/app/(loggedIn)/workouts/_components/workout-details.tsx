"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkoutContext } from "../_context/useWorkoutContext";

export default function WorkoutDetails() {
  const { name, duration, setWorkout, isPending } = useWorkoutContext();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Workout Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="workout-name">Workout Name</Label>
          <Input
            id="workout-name"
            placeholder="e.g., Upper Body Strength"
            value={name}
            onChange={(e) => setWorkout({ name: e.target.value })}
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="workout-duration">Duration (minutes)</Label>
          <Input
            id="workout-duration"
            type="number"
            placeholder="45"
            value={duration}
            onChange={(e) => setWorkout({ duration: Number(e.target.value) })}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
