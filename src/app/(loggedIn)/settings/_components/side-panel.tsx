import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Calendar,
  Dumbbell,
  Scale,
  Target,
  TrendingUp,
} from "lucide-react";

export async function SidePanel() {
  const goal = await api.userGoal.getUserGoal();
  const config = await api.userConfig.getUserConfig();
  const trainingConfig = await api.trainingConfig.getTrainingConfig();

  const calculateMetrics = () => {
    if (!goal || !config || !trainingConfig)
      return {
        bmr: 0,
        tdee: 0,
        recommendedCalories: 0,
        weeklyWeightChange: 0,
        estimatedTimeToGoal: 0,
      };

    // BMR calculation (Mifflin-St Jeor Equation)
    let bmr = 0;
    const weightInKg =
      config.weightUnit === "lbs" ? config.weight * 0.453592 : config.weight;
    const heightInCm =
      config.heightUnit === "ft" ? config.height * 30.48 : config.height;

    if (config.gender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * config.age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * config.age - 161;
    }

    const tdee =
      bmr *
      {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9,
      }[config?.activityLevel ?? "sedentary"]!;

    // Goal-based calorie recommendations
    let recommendedCalories = tdee;
    let weeklyWeightChange = 0;

    switch (goal?.primaryGoal) {
      case "lose_weight":
        recommendedCalories = tdee - 500; // 1 lb per week deficit
        weeklyWeightChange = -0.5; // kg per week
        break;
      case "gain_muscle":
        recommendedCalories = tdee + 300; // Moderate surplus
        weeklyWeightChange = 0.25; // kg per week
        break;
      case "maintain":
        recommendedCalories = tdee;
        weeklyWeightChange = 0;
        break;
      default:
        recommendedCalories = tdee;
    }

    // Estimate time to goal
    const weightDifference = Math.abs(goal?.targetWeight - config?.weight);
    const estimatedWeeks =
      weeklyWeightChange !== 0
        ? weightDifference / Math.abs(weeklyWeightChange)
        : 0;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommendedCalories: Math.round(recommendedCalories),
      weeklyWeightChange,
      estimatedTimeToGoal: Math.round(estimatedWeeks),
    };
  };

  const {
    bmr,
    tdee,
    recommendedCalories,
    weeklyWeightChange,
    estimatedTimeToGoal,
  } = calculateMetrics();

  return (
    <div className="space-y-6">
      {/* Metabolic Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Your Metrics
          </CardTitle>
          <CardDescription>
            Calculated based on your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">
                BMR (Basal Metabolic Rate)
              </span>
              <span className="text-sm">{bmr} cal/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">
                TDEE (Total Daily Energy)
              </span>
              <span className="text-sm">{tdee} cal/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Recommended Calories</span>
              <span className="text-primary text-sm font-bold">
                {recommendedCalories} cal/day
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress */}
      {(goal?.primaryGoal === "lose_weight" ||
        goal?.primaryGoal === "gain_muscle") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Goal Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Weight</span>
                <span>
                  {config?.weight} {config?.weightUnit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Target Weight</span>
                <span>
                  {goal?.targetWeight} {config?.weightUnit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Weekly Change</span>
                <span
                  className={
                    weeklyWeightChange > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {weeklyWeightChange > 0 ? "+" : ""}
                  {weeklyWeightChange} {config?.weightUnit}
                  /week
                </span>
              </div>
              {estimatedTimeToGoal > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Estimated Time</span>
                  <span>{estimatedTimeToGoal} weeks</span>
                </div>
              )}
            </div>
            {config?.weight && goal?.targetWeight && (
              <Progress
                defaultValue={Math.min(
                  100,
                  Math.abs(
                    (config?.weight - goal?.targetWeight) /
                      (config?.weight - goal?.targetWeight),
                  ) * 100,
                )}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Workout Recommendations */}
      {trainingConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Recommended Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center py-2">
                {trainingConfig?.trainingFrequency} days/week •{" "}
                {trainingConfig?.workoutDuration} min sessions
              </Badge>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Focus:</strong>{" "}
                  {goal?.primaryGoal
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                <p>
                  <strong>Level:</strong>{" "}
                  {trainingConfig?.experienceLevel.charAt(0).toUpperCase() +
                    trainingConfig?.experienceLevel.slice(1)}
                </p>
                <p>
                  <strong>Types:</strong>{" "}
                  {Array.isArray(trainingConfig?.preferredWorkoutTypes)
                    ? trainingConfig.preferredWorkoutTypes.join(", ")
                    : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Generate Workout Plan
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Scale className="mr-2 h-4 w-4" />
            Set Nutrition Goals
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Track Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
