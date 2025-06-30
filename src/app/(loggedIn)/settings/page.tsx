"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import {
  Activity,
  Calculator,
  Calendar,
  Clock,
  Dumbbell,
  RotateCcw,
  Save,
  Scale,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface UserProfile {
  // Personal Info
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  height: number;
  targetWeight: number;

  // Units
  weightUnit: "kg" | "lbs";
  heightUnit: "cm" | "ft";

  // Goals
  primaryGoal:
    | "lose_weight"
    | "gain_muscle"
    | "maintain"
    | "improve_endurance"
    | "general_fitness";
  targetDate: string;

  // Activity
  activityLevel:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";
  trainingFrequency: number;
  workoutDuration: number;
  experienceLevel: "beginner" | "intermediate" | "advanced";

  // Preferences
  preferredWorkoutTypes: string[];
  availableEquipment: string[];
  timePreference: "morning" | "afternoon" | "evening" | "flexible";
}

const user = {
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "/placeholder.svg?height=40&width=40",
};

export default function UserSettings() {
  const { data: userConfig } = api.userConfig.getUserConfig.useQuery();
  const { data: userGoal } = api.userGoal.getUserGoal.useQuery();
  const { data: trainingConfig } =
    api.trainingConfig.getTrainingConfig.useQuery();

  const saveUserConfig = api.userConfig.create.useMutation();
  const saveUserGoal = api.userGoal.create.useMutation();
  const saveTrainingConfig = api.trainingConfig.create.useMutation();

  const [profile, setProfile] = useState<UserProfile>({
    age: userConfig?.age ?? 28,
    gender: (userConfig?.gender as "male" | "female" | "other") ?? "male",
    weight: userConfig?.weight ?? 75,
    height: userConfig?.height ?? 175,
    targetWeight: userGoal?.targetWeight ?? 70,
    weightUnit: (userConfig?.weightUnit as "kg" | "lbs") ?? "kg",
    heightUnit: (userConfig?.heightUnit as "cm" | "ft") ?? "cm",
    primaryGoal:
      (userGoal?.primaryGoal as
        | "lose_weight"
        | "gain_muscle"
        | "maintain"
        | "improve_endurance"
        | "general_fitness") ?? "lose_weight",
    targetDate: userGoal?.targetDate.toISOString() ?? new Date().toISOString(),
    activityLevel:
      (userConfig?.activityLevel as
        | "sedentary"
        | "lightly_active"
        | "moderately_active"
        | "very_active"
        | "extremely_active") ?? "moderately_active",
    trainingFrequency: trainingConfig?.trainingFrequency ?? 4,
    workoutDuration: trainingConfig?.workoutDuration ?? 45,
    experienceLevel:
      (trainingConfig?.experienceLevel as
        | "beginner"
        | "intermediate"
        | "advanced") ?? "intermediate",
    timePreference:
      (trainingConfig?.timePreference as
        | "morning"
        | "afternoon"
        | "evening"
        | "flexible") ?? "evening",
    preferredWorkoutTypes:
      trainingConfig?.preferredWorkoutTypes.split(",") ?? [],
    availableEquipment: trainingConfig?.availableEquipment.split(",") ?? [],
  });

  const [calculations, setCalculations] = useState({
    bmr: 0,
    tdee: 0,
    recommendedCalories: 0,
    weeklyWeightChange: 0,
    estimatedTimeToGoal: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Calculate BMR, TDEE, and recommendations
  useEffect(() => {
    const calculateMetrics = () => {
      // BMR calculation (Mifflin-St Jeor Equation)
      let bmr = 0;
      const weightInKg =
        profile.weightUnit === "lbs"
          ? profile.weight * 0.453592
          : profile.weight;
      const heightInCm =
        profile.heightUnit === "ft" ? profile.height * 30.48 : profile.height;

      if (profile.gender === "male") {
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * profile.age + 5;
      } else {
        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * profile.age - 161;
      }

      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9,
      };

      const tdee = bmr * activityMultipliers[profile.activityLevel];

      // Goal-based calorie recommendations
      let recommendedCalories = tdee;
      let weeklyWeightChange = 0;

      switch (profile.primaryGoal) {
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
      const weightDifference = Math.abs(profile.targetWeight - profile.weight);
      const estimatedWeeks =
        weeklyWeightChange !== 0
          ? weightDifference / Math.abs(weeklyWeightChange)
          : 0;

      setCalculations({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        recommendedCalories: Math.round(recommendedCalories),
        weeklyWeightChange,
        estimatedTimeToGoal: Math.round(estimatedWeeks),
      });
    };

    calculateMetrics();
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveUserConfig.mutateAsync({
          weightUnit: profile.weightUnit,
          heightUnit: profile.heightUnit,
          age: profile.age,
          gender: profile.gender,
          weight: profile.weight,
          height: profile.height,
          activityLevel: profile.activityLevel,
          lang: "en",
        }),
        saveUserGoal.mutateAsync({
          primaryGoal: profile.primaryGoal,
          targetDate: new Date(profile.targetDate),
          targetWeight: profile.targetWeight,
        }),
        saveTrainingConfig.mutateAsync({
          trainingFrequency: profile.trainingFrequency,
          workoutDuration: profile.workoutDuration,
          experienceLevel: profile.experienceLevel,
          timePreference: profile.timePreference,
          preferredWorkoutTypes: profile.preferredWorkoutTypes.join(","),
          availableEquipment: profile.availableEquipment.join(","),
        }),
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setProfile({
      age: 28,
      gender: "male",
      weight: 75,
      height: 175,
      targetWeight: 70,
      weightUnit: "kg",
      heightUnit: "cm",
      primaryGoal: "lose_weight",
      targetDate: "",
      activityLevel: "moderately_active",
      trainingFrequency: 4,
      workoutDuration: 45,
      experienceLevel: "intermediate",
      preferredWorkoutTypes: ["strength", "cardio"],
      availableEquipment: ["dumbbells", "barbell"],
      timePreference: "evening",
    });
  };

  const convertWeight = (weight: number, fromUnit: string, toUnit: string) => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === "kg" && toUnit === "lbs") return weight * 2.20462;
    if (fromUnit === "lbs" && toUnit === "kg") return weight * 0.453592;
    return weight;
  };

  const convertHeight = (height: number, fromUnit: string, toUnit: string) => {
    if (fromUnit === toUnit) return height;
    if (fromUnit === "cm" && toUnit === "ft") return height / 30.48;
    if (fromUnit === "ft" && toUnit === "cm") return height * 30.48;
    return height;
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <main className="container flex-1 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your profile to get personalized workout and nutrition
              recommendations.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Settings Form */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Basic information used for calculating your metabolic
                        needs.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={profile.age}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setProfile({
                                ...profile,
                                age: Number.parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <RadioGroup
                            value={profile.gender}
                            onValueChange={(value: "male" | "female") =>
                              setProfile({ ...profile, gender: value })
                            }
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <Label htmlFor="male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <Label htmlFor="female">Female</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other">Other</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="weight">Weight</Label>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="weight-unit" className="text-sm">
                                kg
                              </Label>
                              <Switch
                                id="weight-unit"
                                checked={profile.weightUnit === "lbs"}
                                onCheckedChange={(checked) => {
                                  const newUnit = checked ? "lbs" : "kg";
                                  const convertedWeight = convertWeight(
                                    profile.weight,
                                    profile.weightUnit,
                                    newUnit,
                                  );
                                  const convertedTargetWeight = convertWeight(
                                    profile.targetWeight,
                                    profile.weightUnit,
                                    newUnit,
                                  );
                                  setProfile({
                                    ...profile,
                                    weightUnit: newUnit,
                                    weight:
                                      Math.round(convertedWeight * 10) / 10,
                                    targetWeight:
                                      Math.round(convertedTargetWeight * 10) /
                                      10,
                                  });
                                }}
                              />
                              <Label htmlFor="weight-unit" className="text-sm">
                                lbs
                              </Label>
                            </div>
                          </div>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={profile.weight}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setProfile({
                                ...profile,
                                weight: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="height">Height</Label>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="height-unit" className="text-sm">
                                cm
                              </Label>
                              <Switch
                                id="height-unit"
                                checked={profile.heightUnit === "ft"}
                                onCheckedChange={(checked) => {
                                  const newUnit = checked ? "ft" : "cm";
                                  const convertedHeight = convertHeight(
                                    profile.height,
                                    profile.heightUnit,
                                    newUnit,
                                  );
                                  setProfile({
                                    ...profile,
                                    heightUnit: newUnit,
                                    height:
                                      Math.round(convertedHeight * 10) / 10,
                                  });
                                }}
                              />
                              <Label htmlFor="height-unit" className="text-sm">
                                ft
                              </Label>
                            </div>
                          </div>
                          <Input
                            id="height"
                            type="number"
                            step="0.1"
                            value={profile.height}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setProfile({
                                ...profile,
                                height: Number.parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Activity Level</Label>
                        <Select
                          value={profile.activityLevel}
                          onValueChange={(
                            value:
                              | "sedentary"
                              | "lightly_active"
                              | "moderately_active"
                              | "very_active"
                              | "extremely_active",
                          ) => setProfile({ ...profile, activityLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">
                              Sedentary (little/no exercise)
                            </SelectItem>
                            <SelectItem value="lightly_active">
                              Lightly Active (light exercise 1-3 days/week)
                            </SelectItem>
                            <SelectItem value="moderately_active">
                              Moderately Active (moderate exercise 3-5
                              days/week)
                            </SelectItem>
                            <SelectItem value="very_active">
                              Very Active (hard exercise 6-7 days/week)
                            </SelectItem>
                            <SelectItem value="extremely_active">
                              Extremely Active (very hard exercise, physical
                              job)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Goals */}
                <TabsContent value="goals" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Fitness Goals
                      </CardTitle>
                      <CardDescription>
                        Define your primary fitness objective and target
                        metrics.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Primary Goal</Label>
                        <RadioGroup
                          value={profile.primaryGoal}
                          onValueChange={(value: UserProfile["primaryGoal"]) =>
                            setProfile({ ...profile, primaryGoal: value })
                          }
                          className="grid grid-cols-1 gap-4 md:grid-cols-2"
                        >
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem
                              value="lose_weight"
                              id="lose_weight"
                            />
                            <Label htmlFor="lose_weight" className="flex-1">
                              <div>
                                <p className="font-medium">Lose Weight</p>
                                <p className="text-muted-foreground text-sm">
                                  Reduce body fat and overall weight
                                </p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem
                              value="gain_muscle"
                              id="gain_muscle"
                            />
                            <Label htmlFor="gain_muscle" className="flex-1">
                              <div>
                                <p className="font-medium">Gain Muscle</p>
                                <p className="text-muted-foreground text-sm">
                                  Build lean muscle mass
                                </p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="maintain" id="maintain" />
                            <Label htmlFor="maintain" className="flex-1">
                              <div>
                                <p className="font-medium">Maintain Weight</p>
                                <p className="text-muted-foreground text-sm">
                                  Stay at current weight
                                </p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem
                              value="improve_endurance"
                              id="improve_endurance"
                            />
                            <Label
                              htmlFor="improve_endurance"
                              className="flex-1"
                            >
                              <div>
                                <p className="font-medium">Improve Endurance</p>
                                <p className="text-muted-foreground text-sm">
                                  Enhance cardiovascular fitness
                                </p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem
                              value="general_fitness"
                              id="general_fitness"
                            />
                            <Label htmlFor="general_fitness" className="flex-1">
                              <div>
                                <p className="font-medium">General Fitness</p>
                                <p className="text-muted-foreground text-sm">
                                  Overall health and wellness
                                </p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {(profile.primaryGoal === "lose_weight" ||
                        profile.primaryGoal === "gain_muscle") && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="target-weight">
                              Target Weight ({profile.weightUnit})
                            </Label>
                            <Input
                              id="target-weight"
                              type="number"
                              step="0.1"
                              value={profile.targetWeight}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                setProfile({
                                  ...profile,
                                  targetWeight:
                                    Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="target-date">
                              Target Date (Optional)
                            </Label>
                            <Input
                              id="target-date"
                              type="date"
                              value={profile.targetDate}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                setProfile({
                                  ...profile,
                                  targetDate: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Training */}
                <TabsContent value="training" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Training Configuration
                      </CardTitle>
                      <CardDescription>
                        Set your training frequency, duration, and experience
                        level.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>
                          Training Frequency: {profile.trainingFrequency} days
                          per week
                        </Label>
                        <Slider
                          value={[profile.trainingFrequency]}
                          onValueChange={(value: number[]) =>
                            setProfile({
                              ...profile,
                              trainingFrequency: value[0] ?? 0,
                            })
                          }
                          max={7}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-muted-foreground flex justify-between text-sm">
                          <span>1 day</span>
                          <span>7 days</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Preferred Workout Duration: {profile.workoutDuration}{" "}
                          minutes
                        </Label>
                        <Slider
                          value={[profile.workoutDuration]}
                          onValueChange={(value: number[]) =>
                            setProfile({
                              ...profile,
                              workoutDuration: value[0] ?? 0,
                            })
                          }
                          max={120}
                          min={15}
                          step={15}
                          className="w-full"
                        />
                        <div className="text-muted-foreground flex justify-between text-sm">
                          <span>15 min</span>
                          <span>2 hours</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <RadioGroup
                          value={profile.experienceLevel}
                          onValueChange={(
                            value: UserProfile["experienceLevel"],
                          ) =>
                            setProfile({ ...profile, experienceLevel: value })
                          }
                          className="grid grid-cols-1 gap-4 md:grid-cols-3"
                        >
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <Label htmlFor="beginner" className="flex-1">
                              <div>
                                <p className="font-medium">Beginner</p>
                                <p className="text-muted-foreground text-sm">
                                  0-6 months
                                </p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem
                              value="intermediate"
                              id="intermediate"
                            />
                            <Label htmlFor="intermediate" className="flex-1">
                              <div>
                                <p className="font-medium">Intermediate</p>
                                <p className="text-muted-foreground text-sm">
                                  6 months - 2 years
                                </p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <Label htmlFor="advanced" className="flex-1">
                              <div>
                                <p className="font-medium">Advanced</p>
                                <p className="text-muted-foreground text-sm">
                                  2+ years
                                </p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences */}
                <TabsContent value="preferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Workout Preferences
                      </CardTitle>
                      <CardDescription>
                        Customize your workout experience based on your
                        preferences and available equipment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Preferred Workout Time</Label>
                        <Select
                          value={profile.timePreference}
                          onValueChange={(
                            value: UserProfile["timePreference"],
                          ) =>
                            setProfile({ ...profile, timePreference: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">
                              Morning (6AM - 10AM)
                            </SelectItem>
                            <SelectItem value="afternoon">
                              Afternoon (12PM - 5PM)
                            </SelectItem>
                            <SelectItem value="evening">
                              Evening (6PM - 10PM)
                            </SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Preferred Workout Types</Label>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {[
                            "strength",
                            "cardio",
                            "hiit",
                            "yoga",
                            "pilates",
                            "crossfit",
                            "bodyweight",
                            "stretching",
                          ].map((type) => (
                            <div
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={type}
                                checked={profile.preferredWorkoutTypes.includes(
                                  type,
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProfile({
                                      ...profile,
                                      preferredWorkoutTypes: [
                                        ...profile.preferredWorkoutTypes,
                                        type,
                                      ],
                                    });
                                  } else {
                                    setProfile({
                                      ...profile,
                                      preferredWorkoutTypes:
                                        profile.preferredWorkoutTypes.filter(
                                          (t) => t !== type,
                                        ),
                                    });
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label
                                htmlFor={type}
                                className="text-sm capitalize"
                              >
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Available Equipment</Label>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {[
                            "dumbbells",
                            "barbell",
                            "kettlebells",
                            "resistance_bands",
                            "pull_up_bar",
                            "bench",
                            "treadmill",
                            "none",
                          ].map((equipment) => (
                            <div
                              key={equipment}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={equipment}
                                checked={profile.availableEquipment.includes(
                                  equipment,
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProfile({
                                      ...profile,
                                      availableEquipment: [
                                        ...profile.availableEquipment,
                                        equipment,
                                      ],
                                    });
                                  } else {
                                    setProfile({
                                      ...profile,
                                      availableEquipment:
                                        profile.availableEquipment.filter(
                                          (eq) => eq !== equipment,
                                        ),
                                    });
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label
                                htmlFor={equipment}
                                className="text-sm capitalize"
                              >
                                {equipment.replace("_", " ")}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Calculations & Recommendations */}
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
                      <span className="text-sm">
                        {calculations.bmr} cal/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        TDEE (Total Daily Energy)
                      </span>
                      <span className="text-sm">
                        {calculations.tdee} cal/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        Recommended Calories
                      </span>
                      <span className="text-primary text-sm font-bold">
                        {calculations.recommendedCalories} cal/day
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goal Progress */}
              {(profile.primaryGoal === "lose_weight" ||
                profile.primaryGoal === "gain_muscle") && (
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
                          {profile.weight} {profile.weightUnit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target Weight</span>
                        <span>
                          {profile.targetWeight} {profile.weightUnit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Weekly Change</span>
                        <span
                          className={
                            calculations.weeklyWeightChange > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {calculations.weeklyWeightChange > 0 ? "+" : ""}
                          {calculations.weeklyWeightChange} {profile.weightUnit}
                          /week
                        </span>
                      </div>
                      {calculations.estimatedTimeToGoal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Estimated Time</span>
                          <span>{calculations.estimatedTimeToGoal} weeks</span>
                        </div>
                      )}
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        Math.abs(
                          (profile.weight - profile.targetWeight) /
                            (profile.weight - profile.targetWeight),
                        ) * 100,
                      )}
                      className="w-full"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Workout Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Recommended Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="w-full justify-center py-2"
                    >
                      {profile.trainingFrequency} days/week •{" "}
                      {profile.workoutDuration} min sessions
                    </Badge>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Focus:</strong>{" "}
                        {profile.primaryGoal
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <p>
                        <strong>Level:</strong>{" "}
                        {profile.experienceLevel.charAt(0).toUpperCase() +
                          profile.experienceLevel.slice(1)}
                      </p>
                      <p>
                        <strong>Types:</strong>{" "}
                        {profile.preferredWorkoutTypes.join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
          </div>
        </div>
      </main>
    </div>
  );
}
