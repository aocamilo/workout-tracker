import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  //TODO: Validate that user is admin
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.query.users.findMany({
      with: {
        userConfig: true,
        userGoals: true,
        trainingConfig: true,
      },
    });

    return users;
  }),
});
