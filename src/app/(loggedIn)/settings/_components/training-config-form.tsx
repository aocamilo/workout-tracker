"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import type { TrainingConfig } from "@/server/db/schema";
import { Activity, AlertCircle, CheckCircle } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useActionState, useState } from "react";
import { addTrainingConfigAction } from "../actions/add-training-config";
import SaveFormButton from "./save-form-button";

export function TrainingConfigForm({
  trainingConfig,
}: {
  trainingConfig: TrainingConfig | null;
}) {
  const [state, formAction, isPending] = useActionState(
    addTrainingConfigAction,
    null,
  );
  const [trainingFrequency, setTrainingFrequency] = useState<number[]>([
    trainingConfig?.trainingFrequency ?? 3,
  ]);
  const [workoutDuration, setWorkoutDuration] = useState<number[]>([
    trainingConfig?.workoutDuration ?? 30,
  ]);

  // Helper function to get field errors
  const getFieldError = (fieldName: string): string | null => {
    if (!state?.error || typeof state.error !== "object") return null;

    const errorObj = state.error as Record<string, unknown>;
    const fieldError = errorObj[fieldName];

    if (Array.isArray(fieldError)) {
      return fieldError.join(", ");
    }

    if (
      fieldError &&
      typeof fieldError === "object" &&
      "_errors" in fieldError
    ) {
      const errors = (fieldError as { _errors?: unknown })._errors;
      if (Array.isArray(errors)) {
        return errors.join(", ");
      }
    }

    return null;
  };

  const hasFieldError = (fieldName: string) => {
    return !!getFieldError(fieldName);
  };

  return (
    <form id="training-config-form" action={formAction}>
      {state?.success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Training settings saved successfully!
            </span>
          </div>
        </div>
      )}
      {state?.error && getFieldError("general") && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getFieldError("general")}
            </span>
          </div>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Training Configuration
          </CardTitle>
          <CardDescription>
            Set your training frequency, duration, and experience level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>
              Training Frequency: {trainingFrequency[0]} days per week
            </Label>
            <Slider
              id="trainingFrequency"
              name="trainingFrequency"
              value={trainingFrequency}
              onValueChange={setTrainingFrequency}
              max={7}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>1 day</span>
              <span>7 days</span>
            </div>
            {getFieldError("trainingFrequency") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("trainingFrequency")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Preferred Workout Duration: {workoutDuration[0]} minutes
            </Label>
            <Slider
              id="workoutDuration"
              name="workoutDuration"
              value={workoutDuration}
              onValueChange={setWorkoutDuration}
              max={120}
              min={15}
              step={15}
              className="w-full"
            />
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>15 min</span>
              <span>2 hours</span>
            </div>
            {getFieldError("workoutDuration") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("workoutDuration")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <RadioGroup
              name="experienceLevel"
              defaultValue={trainingConfig?.experienceLevel}
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="flex-1">
                  <div>
                    <p className="font-medium">Beginner</p>
                    <p className="text-muted-foreground text-sm">0-6 months</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="intermediate" id="intermediate" />
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
                    <p className="text-muted-foreground text-sm">2+ years</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            {getFieldError("experienceLevel") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("experienceLevel")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Workout Preferences
          </CardTitle>
          <CardDescription>
            Customize your workout experience based on your preferences and
            available equipment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Preferred Workout Time</Label>
            <Select
              name="timePreference"
              defaultValue={trainingConfig?.timePreference}
            >
              <SelectTrigger
                className={
                  hasFieldError("timePreference") ? "border-red-500" : ""
                }
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (6AM - 10AM)</SelectItem>
                <SelectItem value="afternoon">
                  Afternoon (12PM - 5PM)
                </SelectItem>
                <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError("timePreference") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("timePreference")}
              </p>
            )}
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
                <div key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={type}
                    value={type}
                    defaultChecked={trainingConfig?.preferredWorkoutTypes.includes(
                      type,
                    )}
                    name="preferredWorkoutTypes"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={type} className="text-sm capitalize">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError("preferredWorkoutTypes") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("preferredWorkoutTypes")}
              </p>
            )}
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
                <div key={equipment} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={equipment}
                    value={equipment}
                    defaultChecked={trainingConfig?.availableEquipment.includes(
                      equipment,
                    )}
                    name="availableEquipment"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={equipment} className="text-sm capitalize">
                    {equipment.replace("_", " ")}
                  </Label>
                </div>
              ))}
            </div>
            {getFieldError("availableEquipment") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("availableEquipment")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <SaveFormButton form="training-config-form" isPending={isPending} />
    </form>
  );
}
