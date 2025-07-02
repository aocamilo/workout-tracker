"use server";
import { userConfigSchema } from "@/server/api/routers/user-config";
import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addUserConfigAction(state: unknown, formData: FormData) {
  const payload = userConfigSchema.safeParse({
    ...Object.fromEntries(formData),
    age: parseInt(formData.get("age") as string, 10),
    weight: parseFloat(formData.get("weight") as string),
    height: parseFloat(formData.get("height") as string),
  });

  if (!payload.success) {
    return {
      error: payload.error.format(),
    };
  }

  try {
    await api.userConfig.create(payload.data);
    revalidatePath("/settings");
  } catch (error) {
    console.error("Error adding user config:", error);
    return {
      error: {
        general: ["An unexpected error occurred. Please try again."],
      },
    };
  }
  redirect("/settings?tab=goals");
}
