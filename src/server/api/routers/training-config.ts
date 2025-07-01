import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { trainingConfig } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const trainingConfigSchema = z.object({
  trainingFrequency: z.number(),
  workoutDuration: z.number(),
  experienceLevel: z.string(),
  timePreference: z.string(),
  preferredWorkoutTypes: z.string(),
  availableEquipment: z.string(),
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
      await ctx.db.insert(trainingConfig).values({
        userId: ctx.session.user.id,
        ...input,
      });
    }),
});
