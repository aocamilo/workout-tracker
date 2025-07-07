"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Trash2 } from "lucide-react";

import { useWorkoutContext } from "../_context/useWorkoutContext";
import Image from "next/image";

export default function WorkoutCurrent() {
  const { newExercises, setExercises, onSave, isEditing, isPending } =
    useWorkoutContext();

  const onUpdateExercise = (
    exerciseId: number,
    value: number,
    field: "reps" | "sets",
  ) => {
    const exercise = newExercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    exercise[field] = value;
    setExercises([...newExercises]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Current Workout ({newExercises.length} exercises)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {newExercises.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No exercises added yet. Select exercises from the right to build
              your workout.
            </p>
          ) : (
            <div className="space-y-4">
              {newExercises.map((exercise, index) => (
                <div
                  key={`${exercise.id}-${index}`}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={exercise.image || "/placeholder.svg"}
                        alt={exercise.name}
                        className="h-12 w-12 rounded-lg object-cover"
                        width={48}
                        height={48}
                      />
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {exercise.muscleGroups
                            .split(",")
                            .slice(0, 2)
                            .map((group) => (
                              <Badge
                                key={group}
                                variant="secondary"
                                className="text-xs"
                              >
                                {group.trim()}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExercises(
                          newExercises.filter((e) => e.id !== exercise.id),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Sets</Label>
                      <Input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) =>
                          onUpdateExercise(
                            exercise.id,
                            Number.parseInt(e.target.value) || 1,
                            "sets",
                          )
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Reps</Label>
                      <Input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) =>
                          onUpdateExercise(
                            exercise.id,
                            Number.parseInt(e.target.value) || 1,
                            "reps",
                          )
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {newExercises.length > 0 && (
          <>
            <Separator className="my-4" />
            <Button onClick={onSave} className="w-full" disabled={isPending}>
              {isEditing ? "Update Workout" : "Save Workout"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
