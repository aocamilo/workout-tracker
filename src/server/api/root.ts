import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/user";
import { exerciseRouter } from "./routers/exercise";
import { userConfigRouter } from "./routers/user-config";
import { trainingConfigRouter } from "./routers/training-config";
import { userGoalRouter } from "./routers/user-goal";
import { workoutRouter } from "./routers/workout";
import { userWorkoutRouter } from "./routers/user-workout";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  exercise: exerciseRouter,
  post: postRouter,
  userConfig: userConfigRouter,
  trainingConfig: trainingConfigRouter,
  userGoal: userGoalRouter,
  workout: workoutRouter,
  userWorkout: userWorkoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
