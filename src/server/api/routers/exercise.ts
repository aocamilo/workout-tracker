import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const exerciseRouter = createTRPCRouter({
  getExercises: publicProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.db.query.exercises.findMany();
    return exercises;
  }),
});
