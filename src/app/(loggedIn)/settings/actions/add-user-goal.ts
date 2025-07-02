"use server";
import { userGoalSchema } from "@/server/api/routers/user-goal";
import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";

export async function addUserGoalAction(state: unknown, formData: FormData) {
  const targetDateValue = formData.get("targetDate") as string;
  const targetWeightValue = formData.get("targetWeight") as string;
  const primaryGoal = formData.get("primaryGoal") as string;

  // For goals that don't need target weight/date, provide defaults
  const needsTargetWeight =
    primaryGoal === "lose_weight" || primaryGoal === "gain_muscle";

  const payload = userGoalSchema.safeParse({
    ...Object.fromEntries(formData),
    targetDate: targetDateValue
      ? new Date(targetDateValue)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    targetWeight:
      needsTargetWeight && targetWeightValue
        ? parseFloat(targetWeightValue)
        : 70,
  });

  if (!payload.success) {
    return {
      error: payload.error.format(),
    };
  }

  try {
    await api.userGoal.create(payload.data);
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
