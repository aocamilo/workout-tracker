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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserConfig } from "@/server/db/schema";
import { AlertCircle, CheckCircle, User } from "lucide-react";

import { useActionState } from "react";
import { addUserConfigAction } from "../actions/add-user-config";
import SaveFormButton from "./save-form-button";

//Example: https://github.com/t3dotgg/server-actions-trpc-examples/blob/main/src/app/rsc-trpc-action/page.tsx
export function UserConfigForm({
  userConfig,
}: {
  userConfig: UserConfig | null;
}) {
  const [state, formAction, isPending] = useActionState(
    addUserConfigAction,
    null,
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

  const hasFieldError = (fieldName: string) => {
    return !!getFieldError(fieldName);
  };

  return (
    <form id="user-config-form" action={formAction}>
      {state?.error && getFieldError("general") && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{getFieldError("general")}</span>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Basic information used for calculating your metabolic needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                defaultValue={userConfig?.age ?? 28}
                required
                className={
                  hasFieldError("age")
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {getFieldError("age") && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("age")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                name="gender"
                defaultValue={userConfig?.gender ?? "male"}
                className="flex space-x-4"
                required
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
              {getFieldError("gender") && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("gender")}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weight">Weight</Label>
                <Select
                  name="weightUnit"
                  defaultValue={userConfig?.weightUnit ?? "kg"}
                >
                  <SelectTrigger
                    className={`w-20 ${hasFieldError("weightUnit") ? "border-red-500" : ""}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {getFieldError("weightUnit") && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("weightUnit")}
                </p>
              )}
              <Input
                id="weight"
                defaultValue={userConfig?.weight ?? 70}
                type="number"
                step="0.1"
                name="weight"
                required
                className={
                  hasFieldError("weight")
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {getFieldError("weight") && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("weight")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="height">Height</Label>
                <Select
                  name="heightUnit"
                  defaultValue={userConfig?.heightUnit ?? "cm"}
                >
                  <SelectTrigger
                    className={`w-20 ${hasFieldError("heightUnit") ? "border-red-500" : ""}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="ft">ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {getFieldError("heightUnit") && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("heightUnit")}
                </p>
              )}
              <Input
                id="height"
                defaultValue={userConfig?.height ?? 170}
                type="number"
                step="0.1"
                name="height"
                required
                className={
                  hasFieldError("height")
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {getFieldError("height") && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("height")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Activity Level</Label>
            <Select
              name="activityLevel"
              defaultValue={userConfig?.activityLevel ?? "lightly_active"}
              required
            >
              <SelectTrigger
                className={
                  hasFieldError("activityLevel") ? "border-red-500" : ""
                }
              >
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
                  Moderately Active (moderate exercise 3-5 days/week)
                </SelectItem>
                <SelectItem value="very_active">
                  Very Active (hard exercise 6-7 days/week)
                </SelectItem>
                <SelectItem value="extremely_active">
                  Extremely Active (very hard exercise, physical job)
                </SelectItem>
              </SelectContent>
            </Select>
            {getFieldError("activityLevel") && (
              <p className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("activityLevel")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <SaveFormButton form="user-config-form" isPending={isPending} />
    </form>
  );
}
