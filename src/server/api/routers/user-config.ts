import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userConfig } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userConfigSchema = z.object({
  weightUnit: z.enum(["kg", "lbs"]),
  heightUnit: z.enum(["cm", "ft"]),
  age: z.number(),
  gender: z.enum(["male", "female", "other"]),
  weight: z.number(),
  height: z.number(),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extremely_active",
  ]),
  lang: z.enum(["en", "es"]).optional(),
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
      const existingEntry = await ctx.db.query.userConfig.findFirst({
        where: eq(userConfig.userId, ctx.session.user.id),
      });

      if (existingEntry) {
        await ctx.db
          .update(userConfig)
          .set({ ...input, lang: input.lang ?? "en" })
          .where(eq(userConfig.userId, ctx.session.user.id));
      } else {
        await ctx.db.insert(userConfig).values({
          userId: ctx.session.user.id,
          ...input,
          lang: input.lang ?? "en",
        });
      }
    }),
});
