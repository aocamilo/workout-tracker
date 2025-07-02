"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { UserConfig, UserGoal } from "@/server/db/schema";

import { AlertCircle, CheckCircle, Target } from "lucide-react";
import { useActionState, useState } from "react";
import { addUserGoalAction } from "../actions/add-user-goal";
import SaveFormButton from "./save-form-button";

export function GoalForm({
  goals,
  userConfig,
}: {
  goals: UserGoal | null;
  userConfig: UserConfig | null;
}) {
  const [state, formAction, isPending] = useActionState(
    addUserGoalAction,
    null,
  );
  const [selectedPrimaryGoal, setSelectedPrimaryGoal] = useState<string>(
    goals?.primaryGoal ?? "",
  );

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

  console.log(state);

  const hasFieldError = (fieldName: string) => {
    return !!getFieldError(fieldName);
  };

  return (
    <form id="goal-form" action={formAction}>
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
            <Target className="h-5 w-5" />
            Fitness Goals
          </CardTitle>
          <CardDescription>
            Define your primary fitness objective and target metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Primary Goal</Label>
            <RadioGroup
              name="primaryGoal"
              required
              defaultValue={goals?.primaryGoal}
              value={selectedPrimaryGoal}
              onValueChange={setSelectedPrimaryGoal}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="lose_weight" id="lose_weight" />
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
                <RadioGroupItem value="gain_muscle" id="gain_muscle" />
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
                <Label htmlFor="improve_endurance" className="flex-1">
                  <div>
                    <p className="font-medium">Improve Endurance</p>
                    <p className="text-muted-foreground text-sm">
                      Enhance cardiovascular fitness
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="general_fitness" id="general_fitness" />
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
            {getFieldError("primaryGoal") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("primaryGoal")}
              </p>
            )}
          </div>

          {(selectedPrimaryGoal === "lose_weight" ||
            selectedPrimaryGoal === "gain_muscle") && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-weight">
                  Target Weight ({userConfig?.weightUnit})
                </Label>
                <Input
                  name="targetWeight"
                  id="target-weight"
                  type="number"
                  step="0.1"
                  defaultValue={Number(goals?.targetWeight)}
                  required
                  className={
                    hasFieldError("targetWeight")
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {getFieldError("targetWeight") && (
                  <p className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("targetWeight")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  name="targetDate"
                  defaultValue={goals?.targetDate?.toISOString().split("T")[0]}
                  className={
                    hasFieldError("targetDate")
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {getFieldError("targetDate") && (
                  <p className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("targetDate")}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <SaveFormButton form="goal-form" isPending={isPending} />
    </form>
  );
}
