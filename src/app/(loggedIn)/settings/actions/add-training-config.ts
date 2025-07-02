"use server";
import { trainingConfigSchema } from "@/server/api/routers/training-config";
import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";

export async function addTrainingConfigAction(
  state: unknown,
  formData: FormData,
) {
  const payload = trainingConfigSchema.safeParse({
    ...Object.fromEntries(formData),
    trainingFrequency: parseInt(
      formData.get("trainingFrequency") as string,
      10,
    ),
    workoutDuration: parseFloat(formData.get("workoutDuration") as string),
    experienceLevel: formData.get("experienceLevel") as string,
    timePreference: formData.get("timePreference") as string,
    preferredWorkoutTypes: formData.getAll("preferredWorkoutTypes"),
    availableEquipment: formData.getAll("availableEquipment"),
  });

  if (!payload.success) {
    return {
      error: payload.error.format(),
    };
  }

  try {
    await api.trainingConfig.create(payload.data);
    revalidatePath("/settings");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error adding training config:", error);
    return {
      error: {
        general: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}
