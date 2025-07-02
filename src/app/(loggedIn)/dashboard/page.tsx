import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  BarChart3,
  Calendar,
  CalendarIcon,
  CheckCircle,
  Clock,
  Dumbbell,
  FlameIcon as Fire,
  Play,
  Plus,
  Target,
  Timer,
  Trophy,
  Weight,
  Zap,
} from "lucide-react";
import { WelcomeBack } from "./_components/welcome-back";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

// Mock data
const mockUser = {
  currentStreak: 12,
  totalWorkouts: 156,
  weeklyGoal: 4,
  completedThisWeek: 3,
};

const todayWorkout = {
  name: "Upper Body Strength",
  duration: "45 min",
  exercises: [
    { name: "Bench Press", sets: "4x8", weight: "185 lbs" },
    { name: "Pull-ups", sets: "3x10", weight: "Bodyweight" },
    { name: "Overhead Press", sets: "3x8", weight: "135 lbs" },
    { name: "Barbell Rows", sets: "4x8", weight: "155 lbs" },
  ],
  completed: false,
};

const upcomingWorkouts = [
  {
    date: "Tomorrow",
    name: "Lower Body Power",
    duration: "50 min",
    type: "Strength",
  },
  {
    date: "Thu, Dec 19",
    name: "HIIT Cardio",
    duration: "30 min",
    type: "Cardio",
  },
  {
    date: "Fri, Dec 20",
    name: "Upper Body Hypertrophy",
    duration: "60 min",
    type: "Strength",
  },
  {
    date: "Sat, Dec 21",
    name: "Full Body Circuit",
    duration: "40 min",
    type: "Circuit",
  },
];

const recentWorkouts = [
  {
    date: "Yesterday",
    name: "Lower Body Strength",
    duration: "48 min",
    completed: true,
  },
  { date: "Dec 16", name: "Push Day", duration: "52 min", completed: true },
  { date: "Dec 15", name: "Pull Day", duration: "45 min", completed: true },
  { date: "Dec 14", name: "Leg Day", duration: "55 min", completed: true },
];

const personalRecords = [
  { exercise: "Bench Press", weight: "225 lbs", date: "Dec 10" },
  { exercise: "Deadlift", weight: "315 lbs", date: "Dec 8" },
  { exercise: "Squat", weight: "275 lbs", date: "Dec 5" },
];

const weeklyStats = [
  { day: "Mon", completed: true },
  { day: "Tue", completed: true },
  { day: "Wed", completed: true },
  { day: "Thu", completed: false },
  { day: "Fri", completed: false },
  { day: "Sat", completed: false },
  { day: "Sun", completed: false },
];

export default async function WorkoutDashboard() {
  const userConfig = await api.userConfig.getUserConfig();
  const userGoal = await api.userGoal.getUserGoal();
  const trainingConfig = await api.trainingConfig.getTrainingConfig();

  if (!userConfig || !userGoal || !trainingConfig) {
    redirect("/settings");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <main className="container flex-1 py-6">
        <div className="flex flex-col space-y-6">
          <WelcomeBack />

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
                <Fire className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 days</div>
                <p className="text-muted-foreground text-xs">Keep it going!</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Workouts
                </CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUser.totalWorkouts}
                </div>
                <p className="text-muted-foreground text-xs">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockUser.completedThisWeek}/{mockUser.weeklyGoal}
                </div>
                <Progress
                  value={
                    (mockUser.completedThisWeek / mockUser.weeklyGoal) * 100
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Duration
                </CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47 min</div>
                <p className="text-muted-foreground text-xs">Per workout</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Today's Workout */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        Today&apos;s Workout
                      </CardTitle>
                      <CardDescription>
                        {todayWorkout.name} • {todayWorkout.duration}
                      </CardDescription>
                    </div>
                    <Button className="flex items-center gap-2">
                      {false ? (
                        <>
                          <Timer className="h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start Workout
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayWorkout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {exercise.sets}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{exercise.weight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    This Week&apos;s Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {weeklyStats.map((day, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center space-y-2"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            day.completed
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {day.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        <span className="text-xs font-medium">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentWorkouts.map((workout, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">{workout.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {workout.date}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{workout.duration}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Log Custom Workout
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Progress
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Workout
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Workouts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingWorkouts.slice(0, 3).map((workout, index) => (
                      <div
                        key={index}
                        className="flex flex-col space-y-1 rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{workout.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {workout.type}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground flex items-center justify-between text-xs">
                          <span>{workout.date}</span>
                          <span>{workout.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Personal Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Recent PRs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {personalRecords.map((pr, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{pr.exercise}</p>
                          <p className="text-muted-foreground text-xs">
                            {pr.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Weight className="text-muted-foreground h-3 w-3" />
                          <span className="text-sm font-bold">{pr.weight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Motivation */}
              <Card className="from-primary/10 to-primary/5 border-primary/20 bg-gradient-to-br">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="text-primary h-5 w-5" />
                    Daily Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic">
                    &quot;The only bad workout is the one that didn&apos;t
                    happen. You&apos;ve got this! 💪&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
