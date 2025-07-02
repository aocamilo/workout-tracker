import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userGoals } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userGoalSchema = z.object({
  primaryGoal: z.enum(
    [
      "lose_weight",
      "gain_muscle",
      "maintain",
      "improve_endurance",
      "general_fitness",
    ],
    {
      errorMap: () => ({ message: "Please select your primary goal" }),
    },
  ),
  targetDate: z.date({
    errorMap: () => ({ message: "Please enter a valid target date" }),
  }),
  targetWeight: z.number().min(0, "Target weight must be greater than 0"),
});

export const userGoalRouter = createTRPCRouter({
  getUserGoal: protectedProcedure.query(async ({ ctx }) => {
    const goal = await ctx.db.query.userGoals.findFirst({
      where: eq(userGoals.userId, ctx.session.user.id),
    });

    return goal ?? null;
  }),
  create: protectedProcedure
    .input(userGoalSchema)
    .mutation(async ({ ctx, input }) => {
      const existingGoal = await ctx.db.query.userGoals.findFirst({
        where: eq(userGoals.userId, ctx.session.user.id),
      });

      if (existingGoal) {
        await ctx.db
          .update(userGoals)
          .set(input)
          .where(eq(userGoals.id, existingGoal.id));
      } else {
        await ctx.db.insert(userGoals).values({
          userId: ctx.session.user.id,
          ...input,
        });
      }
    }),
});
