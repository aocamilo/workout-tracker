"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useWorkoutContext } from "../_context/useWorkoutContext";

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");

  const { exercises, setExercises, newExercises, isPending } =
    useWorkoutContext();

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.muscleGroups.split(",").forEach((group) => {
        groups.add(group.trim());
      });
    });
    return Array.from(groups).sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesMuscleGroup =
        selectedMuscleGroup === "all" ||
        exercise.muscleGroups
          .toLowerCase()
          .includes(selectedMuscleGroup.toLowerCase());
      return matchesSearch && matchesMuscleGroup;
    });
  }, [searchTerm, selectedMuscleGroup, exercises]);

  return (
    <div className="lg:col-span-2">
      <Card className="flex h-[calc(100vh-12rem)] flex-col">
        <CardHeader>
          <CardTitle>Exercise Library</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isPending}
              />
            </div>
            <Select
              value={selectedMuscleGroup}
              onValueChange={setSelectedMuscleGroup}
              disabled={isPending}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by muscle group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Muscle Groups</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <Image
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.name}
                      className="h-16 w-16 rounded-lg object-cover"
                      width={64}
                      height={64}
                    />
                    <div className="flex-1">
                      <h3 className="mb-1 font-medium">{exercise.name}</h3>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {exercise.muscleGroups.split(",").map((group) => (
                          <Badge
                            key={group}
                            variant="outline"
                            className="text-xs"
                          >
                            {group.trim()}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {exercise.equipment}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setExercises([
                        ...newExercises,
                        {
                          ...exercise,
                          workoutId: (newExercises.at(-1)?.workoutId ?? -1) + 1,
                          exerciseId: exercise.id,
                          sets: 0,
                          reps: 0,
                        },
                      ]);
                    }}
                    className="w-full"
                    size="sm"
                    disabled={
                      newExercises.some((ex) => ex.id === exercise.id) ||
                      isPending
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {newExercises.some((ex) => ex.id === exercise.id)
                      ? "Added"
                      : "Add to Workout"}
                  </Button>
                </div>
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No exercises found matching your criteria.
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
