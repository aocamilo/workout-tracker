import { inArray } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { exercises, workoutExercises, workouts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const workoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  duration: z
    .number()
    .min(15, "Workout duration must be at least 15 minutes")
    .max(120, "Workout duration cannot exceed 120 minutes"),
});

export const createWorkoutSchema = workoutSchema.extend({
  exercises: z
    .array(
      z.object({
        exerciseId: z.number().min(1, "Exercise ID is required"),
        sets: z
          .number()
          .min(1, "Sets must be at least 1")
          .max(10, "Sets cannot exceed 10"),
        reps: z
          .number()
          .min(1, "Reps must be at least 1")
          .max(100, "Reps cannot exceed 100"),
      }),
    )
    .min(1, "At least one exercise is required"),
});

export const workoutRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allWorkouts = await ctx.db.query.workouts.findMany({
      with: {
        workoutExercises: {
          with: {
            exercise: true,
          },
        },
      },
    });

    return allWorkouts;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const workout = await ctx.db.query.workouts.findFirst({
        where: eq(workouts.id, input.id),
        with: {
          workoutExercises: {
            with: {
              exercise: true,
            },
          },
        },
      });

      if (!workout) {
        throw new Error("Workout not found");
      }

      return workout;
    }),

  create: protectedProcedure
    .input(createWorkoutSchema)
    .mutation(async ({ ctx, input }) => {
      const exerciseIds = input.exercises.map((e) => e.exerciseId);

      const existingExercises = await ctx.db.query.exercises.findMany({
        where: inArray(exercises.id, exerciseIds),
      });

      const foundExerciseIds = existingExercises.map((e) => e.id);
      const missingExerciseIds = exerciseIds.filter(
        (id) => !foundExerciseIds.includes(id),
      );

      if (missingExerciseIds.length > 0) {
        throw new Error(
          `Exercises not found with IDs: ${missingExerciseIds.join(", ")}`,
        );
      }

      const newWorkout = await ctx.db
        .insert(workouts)
        .values({
          name: input.name,
          duration: input.duration,
        })
        .returning({
          id: workouts.id,
          name: workouts.name,
          duration: workouts.duration,
        });

      if (!newWorkout[0]) {
        throw new Error("Failed to create workout");
      }

      const workoutId = newWorkout[0].id;

      const exercisesToInsert = input.exercises.map((exerciseInput) => {
        const dbExercise = existingExercises.find(
          (e) => e.id === exerciseInput.exerciseId,
        );
        if (!dbExercise) {
          throw new Error(
            `Exercise with ID ${exerciseInput.exerciseId} not found`,
          );
        }
        return {
          workoutId: workoutId,
          exerciseId: dbExercise.id,
          name: dbExercise.name,
          sets: exerciseInput.sets,
          reps: exerciseInput.reps,
        };
      });

      await ctx.db.insert(workoutExercises).values(exercisesToInsert);

      return newWorkout[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(workoutExercises)
        .where(eq(workoutExercises.workoutId, input.id));

      await ctx.db.delete(workouts).where(eq(workouts.id, input.id));

      return { success: true };
    }),
});
