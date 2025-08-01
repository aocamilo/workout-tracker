"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  Target,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

export default function WorkoutsPage() {
  const { data: workouts = [] } = api.workout.getAll.useQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { mutate: deleteWorkout } = api.workout.delete.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const getTotalExercises = (workout: (typeof workouts)[0]) => {
    return workout.workoutExercises.length;
  };

  const getTotalSets = (workout: (typeof workouts)[0]) => {
    return workout.workoutExercises.reduce(
      (total, exercise) => total + exercise.sets,
      0,
    );
  };

  const getUniqueMuscleGroups = (workout: (typeof workouts)[0]) => {
    const muscleGroups = new Set<string>();
    workout.workoutExercises.forEach((exercise) => {
      exercise.exercise.muscleGroups.split(",").forEach((group) => {
        muscleGroups.add(group.trim());
      });
    });
    return Array.from(muscleGroups).slice(0, 3); // Show only first 3
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold">My Workouts</h1>
          <p className="text-muted-foreground">
            Manage your saved workouts. Edit, duplicate, or delete existing
            routines.
          </p>
        </div>
        <Link href="/workouts/create-workout">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Workout
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Workouts Grid */}
      {filteredWorkouts.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">
              {searchTerm ? "No workouts found" : "No workouts yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first workout to get started with your fitness journey"}
            </p>
            {!searchTerm && (
              <Link href="/create-workout">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Workout
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-1 text-lg">
                      {workout.name}
                    </CardTitle>
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {workout.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {getTotalExercises(workout)} exercises
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Muscle Groups */}
                <div>
                  <p className="mb-2 text-sm font-medium">Target Muscles:</p>
                  <div className="flex flex-wrap gap-1">
                    {getUniqueMuscleGroups(workout).map((group) => (
                      <Badge
                        key={group}
                        variant="secondary"
                        className="text-xs"
                      >
                        {group.charAt(0).toUpperCase() + group.slice(1)}
                      </Badge>
                    ))}
                    {getUniqueMuscleGroups(workout).length <
                      Array.from(
                        new Set(
                          workout.workoutExercises.flatMap((ex) =>
                            ex.exercise.muscleGroups.split(","),
                          ),
                        ),
                      ).length && (
                      <Badge variant="outline" className="text-xs">
                        +
                        {Array.from(
                          new Set(
                            workout.workoutExercises.flatMap((ex) =>
                              ex.exercise.muscleGroups.split(","),
                            ),
                          ),
                        ).length - 3}{" "}
                        more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Exercise Preview */}
                <div>
                  <p className="mb-2 text-sm font-medium">Exercises:</p>
                  <ScrollArea className="h-20">
                    <div className="space-y-1">
                      {workout.workoutExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {exercise.name}
                          </span>
                          <span className="text-xs">
                            {exercise.sets}×{exercise.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Stats */}
                <div className="text-muted-foreground flex justify-between border-t pt-2 text-sm">
                  <span>Total Sets: {getTotalSets(workout)}</span>
                  <span>
                    Created: {new Date(workout.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/create-workout?edit=${workout.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full bg-transparent">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workout</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{workout.name}
                          &quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteWorkout({ id: workout.id })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
