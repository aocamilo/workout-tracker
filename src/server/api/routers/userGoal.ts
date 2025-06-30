import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userGoals } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const userGoalSchema = z.object({
  primaryGoal: z.string(),
  targetDate: z.date(),
  targetWeight: z.number(),
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
      await ctx.db.insert(userGoals).values({
        userId: ctx.session.user.id,
        ...input,
      });
    }),
});
