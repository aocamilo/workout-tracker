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
import { api } from "@/trpc/server";
import { Activity } from "lucide-react";
import { revalidatePath } from "next/cache";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import SaveFormButton from "./save-form-button";

export async function TrainingConfigForm() {
  const trainingConfig = await api.trainingConfig.getTrainingConfig();

  return (
    <form
      id="training-config-form"
      action={async (formData) => {
        "use server";
        const config = Object.fromEntries(formData);
        await api.trainingConfig.create(config as unknown as TrainingConfig);
        revalidatePath("/settings");
      }}
    >
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
            {trainingConfig ? (
              <Label>
                Training Frequency: {trainingConfig?.trainingFrequency} days per
                week
              </Label>
            ) : (
              <Label>Configure your training frequency</Label>
            )}
            <Slider
              id="trainingFrequency"
              name="trainingFrequency"
              defaultValue={[trainingConfig?.trainingFrequency ?? 3]}
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
            {trainingConfig ? (
              <Label>
                Preferred Workout Duration: {trainingConfig?.workoutDuration}{" "}
                minutes
              </Label>
            ) : (
              <Label>Configure your preferred workout duration</Label>
            )}
            <Slider
              id="workoutDuration"
              name="workoutDuration"
              defaultValue={[trainingConfig?.workoutDuration ?? 30]}
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
            {trainingConfig ? (
              <Label>Experience Level: {trainingConfig?.experienceLevel}</Label>
            ) : (
              <Label>Configure your experience level</Label>
            )}
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
              <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>
      <SaveFormButton form="training-config-form" />
    </form>
  );
}
