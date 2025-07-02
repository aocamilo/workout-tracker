import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { trainingConfig } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const trainingConfigSchema = z.object({
  trainingFrequency: z
    .number()
    .min(1, "Training frequency must be at least 1 day")
    .max(7, "Training frequency cannot exceed 7 days"),
  workoutDuration: z
    .number()
    .min(15, "Workout duration must be at least 15 minutes")
    .max(120, "Workout duration cannot exceed 120 minutes"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"], {
    errorMap: () => ({ message: "Please select your experience level" }),
  }),
  timePreference: z.enum(["morning", "afternoon", "evening", "flexible"], {
    errorMap: () => ({ message: "Please select your preferred workout time" }),
  }),
  preferredWorkoutTypes: z
    .array(
      z.enum([
        "strength",
        "cardio",
        "hiit",
        "yoga",
        "pilates",
        "crossfit",
        "bodyweight",
        "stretching",
      ]),
    )
    .min(1, "Please select at least one workout type"),
  availableEquipment: z
    .array(
      z.enum([
        "dumbbells",
        "barbell",
        "kettlebells",
        "resistance_bands",
        "pull_up_bar",
        "bench",
        "treadmill",
        "none",
      ]),
    )
    .min(1, "Please select your available equipment"),
});

export const trainingConfigRouter = createTRPCRouter({
  getTrainingConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await ctx.db.query.trainingConfig.findFirst({
      where: eq(trainingConfig.userId, ctx.session.user.id),
    });

    return config ?? null;
  }),
  create: protectedProcedure
    .input(trainingConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const existingConfig = await ctx.db.query.trainingConfig.findFirst({
        where: eq(trainingConfig.userId, ctx.session.user.id),
      });

      if (existingConfig) {
        await ctx.db
          .update(trainingConfig)
          .set({
            ...input,
            preferredWorkoutTypes: input.preferredWorkoutTypes.join(","),
            availableEquipment: input.availableEquipment.join(","),
          })
          .where(eq(trainingConfig.userId, ctx.session.user.id));
      } else {
        await ctx.db.insert(trainingConfig).values({
          userId: ctx.session.user.id,
          ...input,
          preferredWorkoutTypes: input.preferredWorkoutTypes.join(","),
          availableEquipment: input.availableEquipment.join(","),
        });
      }
    }),
});
