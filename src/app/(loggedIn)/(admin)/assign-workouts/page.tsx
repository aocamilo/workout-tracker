"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Workout } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useState } from "react";

const daysOfWeek = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

export default function AssignRoutinesPage() {
  const { data: users = [] } = api.user.getUsers.useQuery();
  const { data: workouts = [] } = api.workout.getAll.useQuery();
  const queryClient = useQueryClient();
  const { mutate: createUserWorkout } = api.userWorkout.create.useMutation({
    onSuccess: async () => {
      //should clear cache for user workouts
      await queryClient.invalidateQueries();
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(
    null,
  );
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterGoal, setFilterGoal] = useState("all");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [selectedDay, setSelectedDay] = useState("");

  const { data: userWorkouts = [] } = api.userWorkout.getUserWorkouts.useQuery(
    {
      userId: selectedUser?.id ?? "",
    },
    {
      enabled: !!selectedUser,
    },
  );

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getOccupiedDays = () => {
    return userWorkouts.map((uw) => uw.assignedDay);
  };

  const getAvailableDays = () => {
    const occupiedDays = getOccupiedDays();
    return daysOfWeek.filter((day) => !occupiedDays.includes(day.key));
  };

  const getWorkoutForDay = (userId: string, dayOfWeek: string) => {
    const userWorkout = userWorkouts.find(
      (uw) => uw.userId === userId && uw.assignedDay === dayOfWeek,
    );
    if (!userWorkout) return null;
    return {
      ...userWorkout,
      workout: workouts.find((w) => w.id === userWorkout.workoutId),
    };
  };

  const handleAssignWorkout = async () => {
    if (!selectedUser || !selectedWorkout || !selectedDay) return;

    setIsAssigning(true);

    createUserWorkout({
      userId: selectedUser.id,
      workoutId: selectedWorkout.id,
      assignedDay: selectedDay,
    });

    setIsAssigning(false);
    setIsAssignDialogOpen(false);
    setSelectedWorkout(null);
    setSelectedDay("");
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <main className="container flex-1 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Assign Workout Routines
            </h1>
            <p className="text-muted-foreground">
              Search for users and assign personalized workout routines based on
              their goals and preferences.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* User Selection */}
            <div className="space-y-6 lg:col-span-2">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Find Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterGoal} onValueChange={setFilterGoal}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Goals</SelectItem>
                        <SelectItem value="lose_weight">Lose Weight</SelectItem>
                        <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                        <SelectItem value="general_fitness">
                          General Fitness
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users ({filteredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          selectedUser?.id === user.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={user.image ?? "/placeholder.svg"}
                                alt={user.email}
                              />
                              <AvatarFallback>
                                {user.email
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-muted-foreground text-sm">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {user.trainingConfig?.experienceLevel ??
                                "Not set"}
                            </Badge>
                            <Badge variant="secondary">
                              {user.userGoals?.primaryGoal.replace("_", " ") ??
                                "No goal"}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {selectedUser?.id === user.id && (
                          <div className="mt-4 border-t pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                              <div>
                                <p className="text-muted-foreground">Age</p>
                                <p className="font-medium">
                                  {user.userConfig?.age ?? "Not set"} years
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Training Frequency
                                </p>
                                <p className="font-medium">
                                  {user.trainingConfig?.trainingFrequency ??
                                    "Not set"}
                                  x/week
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Session Duration
                                </p>
                                <p className="font-medium">
                                  {user.trainingConfig?.workoutDuration ??
                                    "Not set"}{" "}
                                  min
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Activity Level
                                </p>
                                <p className="font-medium">
                                  {user.userConfig?.activityLevel.replace(
                                    "_",
                                    " ",
                                  ) ?? "Not set"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Details & Workout Assignment */}
            <div className="space-y-6">
              {selectedUser ? (
                <>
                  {/* Selected User Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Selected User
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={selectedUser.image ?? "/placeholder.svg"}
                            alt={selectedUser.name ?? ""}
                          />
                          <AvatarFallback>
                            {selectedUser.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedUser.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Goal:</span>
                          <span className="font-medium">
                            {selectedUser.userGoals?.primaryGoal.replace(
                              "_",
                              " ",
                            ) ?? "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Experience:
                          </span>
                          <span className="font-medium">
                            {selectedUser.trainingConfig?.experienceLevel ??
                              "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Target Weight:
                          </span>
                          <span className="font-medium">
                            {selectedUser.userGoals?.targetWeight ?? "Not set"}{" "}
                            kg
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Assignments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Weekly Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {daysOfWeek.map((day) => {
                          const dayWorkout = getWorkoutForDay(
                            selectedUser.id,
                            day.key,
                          );
                          return (
                            <div
                              key={day.key}
                              className={`flex items-center justify-between rounded border p-3 ${
                                dayWorkout
                                  ? "bg-primary/5 border-primary/20"
                                  : "bg-muted/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 text-sm font-medium">
                                  {day.short}
                                </div>
                                <div>
                                  {dayWorkout ? (
                                    <>
                                      <p className="text-sm font-medium">
                                        {dayWorkout.workout?.name}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {dayWorkout.workout?.duration} min
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-muted-foreground text-sm">
                                      Rest day
                                    </p>
                                  )}
                                </div>
                              </div>
                              {dayWorkout && (
                                <Badge variant="outline" className="text-xs">
                                  Assigned
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4">
                        <Dialog
                          open={isAssignDialogOpen}
                          onOpenChange={setIsAssignDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              disabled={getAvailableDays().length === 0}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Assign New Workout
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                Assign Workout to {selectedUser.name}
                              </DialogTitle>
                              <DialogDescription>
                                Select a workout routine and assign it to an
                                available day of the week.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                              {/* Day Selection */}
                              <div className="space-y-4">
                                <Label>Select Day of Week</Label>
                                <div className="grid grid-cols-7 gap-2">
                                  {daysOfWeek.map((day) => {
                                    const isOccupied =
                                      getOccupiedDays().includes(day.key);
                                    const isSelected = selectedDay === day.key;

                                    return (
                                      <button
                                        key={day.key}
                                        type="button"
                                        disabled={isOccupied}
                                        onClick={() => setSelectedDay(day.key)}
                                        className={`cursor-pointer rounded-lg border p-1 text-center transition-colors ${
                                          isOccupied
                                            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                            : isSelected
                                              ? "border-primary bg-primary text-primary-foreground"
                                              : "hover:bg-muted/50 border-border"
                                        }`}
                                      >
                                        <div className="text-xs font-medium">
                                          {day.short}
                                        </div>
                                        <div className="mt-1 text-xs">
                                          {isOccupied
                                            ? "Occupied"
                                            : "Available"}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                                {getAvailableDays().length === 0 && (
                                  <p className="text-muted-foreground py-2 text-center text-sm">
                                    All days are occupied. Remove existing
                                    workouts to assign new ones.
                                  </p>
                                )}
                              </div>

                              {/* Workout Selection */}
                              <div className="space-y-4">
                                <Label>Select Workout</Label>
                                <div className="grid max-h-96 gap-3 overflow-y-auto">
                                  {workouts.map((workout) => {
                                    return (
                                      <div
                                        key={workout.id}
                                        className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                                          selectedWorkout?.id === workout.id
                                            ? "border-primary bg-primary/5"
                                            : "hover:bg-muted/50"
                                        }`}
                                        onClick={() =>
                                          setSelectedWorkout(workout)
                                        }
                                      >
                                        <div className="mb-2 flex items-center justify-between">
                                          <h4 className="font-medium">
                                            {workout.name}
                                          </h4>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                              <Clock className="mr-1 h-3 w-3" />
                                              {workout.duration} min
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-muted-foreground text-sm">
                                            {workout.workoutExercises.length}{" "}
                                            exercises
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {Array.from(
                                              new Set(
                                                ...workout.workoutExercises.map(
                                                  (exercise) => {
                                                    return exercise.exercise.muscleGroups.split(
                                                      ",",
                                                    );
                                                  },
                                                ),
                                              ),
                                            )
                                              .flat()
                                              .map((muscleGroup) => (
                                                <Badge
                                                  key={muscleGroup}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {muscleGroup}
                                                </Badge>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                onClick={handleAssignWorkout}
                                disabled={
                                  !selectedWorkout ||
                                  !selectedDay ||
                                  isAssigning
                                }
                              >
                                {isAssigning ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Assigning...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Assign to{" "}
                                    {selectedDay &&
                                      daysOfWeek.find(
                                        (d) => d.key === selectedDay,
                                      )?.label}
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {getAvailableDays().length === 0 && (
                        <p className="text-muted-foreground mt-2 text-center text-xs">
                          All days are occupied. Remove existing workouts to
                          assign new ones.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="text-muted-foreground mb-4 h-12 w-12" />
                    <p className="text-muted-foreground text-center">
                      Select a user from the list to view their details and
                      assign workouts
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
