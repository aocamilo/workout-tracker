import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userConfig } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const userConfigSchema = z.object({
  weightUnit: z.string(),
  heightUnit: z.string(),
  age: z.number(),
  gender: z.string(),
  weight: z.number(),
  height: z.number(),
  activityLevel: z.string(),
  lang: z.string(),
});

export const userConfigRouter = createTRPCRouter({
  getUserConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await ctx.db.query.userConfig.findFirst({
      where: eq(userConfig.userId, ctx.session.user.id),
    });

    return config ?? null;
  }),
  create: protectedProcedure
    .input(userConfigSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(userConfig).values({
        userId: ctx.session.user.id,
        ...input,
      });
    }),
});
