import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userWorkouts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userWorkoutRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        workoutId: z.number(),
        assignedDay: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, workoutId, assignedDay } = input;

      const userWorkout = await ctx.db
        .insert(userWorkouts)
        .values({
          userId,
          workoutId,
          assignedDay,
        })
        .returning();

      return userWorkout;
    }),

  //Only admins can get all user workouts if it's not admin, only get user workouts for the current user
  getUserWorkouts: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allWorkouts = await ctx.db.query.userWorkouts.findMany({
        with: {
          workout: true,
        },
        where: eq(userWorkouts.userId, input.userId),
      });

      return allWorkouts ?? [];
    }),
});
