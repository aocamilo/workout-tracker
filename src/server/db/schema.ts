import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `workout-tracker_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  userConfig: one(userConfig, {
    fields: [users.id],
    references: [userConfig.userId],
  }),
  userGoals: one(userGoals, {
    fields: [users.id],
    references: [userGoals.userId],
  }),
  trainingConfig: one(trainingConfig, {
    fields: [users.id],
    references: [trainingConfig.userId],
  }),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const userConfig = createTable("user_config", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .unique()
    .references(() => users.id),
  weightUnit: d.varchar({ length: 255 }).notNull(),
  heightUnit: d.varchar({ length: 255 }).notNull(),
  age: d.integer().notNull(),
  gender: d.varchar({ length: 255 }).notNull(),
  weight: d.doublePrecision().notNull(),
  height: d.doublePrecision().notNull(),
  lang: d.varchar({ length: 255 }).notNull(),
  activityLevel: d.varchar({ length: 255 }).notNull(),
}));

export const userConfigRelations = relations(userConfig, ({ one }) => ({
  user: one(users, { fields: [userConfig.userId], references: [users.id] }),
}));

export const userGoals = createTable("user_goal", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .unique()
    .references(() => users.id),
  primaryGoal: d.varchar({ length: 255 }).notNull(),
  targetDate: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  targetWeight: d.doublePrecision().notNull(),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, { fields: [userGoals.userId], references: [users.id] }),
}));

export const trainingConfig = createTable("training_config", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .unique()
    .references(() => users.id),
  trainingFrequency: d.integer().notNull(),
  workoutDuration: d.integer().notNull(),
  experienceLevel: d.varchar({ length: 255 }).notNull(),
  timePreference: d.varchar({ length: 255 }).notNull(),
  preferredWorkoutTypes: d.varchar({ length: 255 }).notNull(),
  availableEquipment: d.varchar({ length: 255 }).notNull(),
}));

export const trainingConfigRelations = relations(trainingConfig, ({ one }) => ({
  user: one(users, { fields: [trainingConfig.userId], references: [users.id] }),
}));

export const exercises = createTable("exercise", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 255 }).notNull(),
  image: d.varchar({ length: 255 }).notNull(),
  videoUrl: d.varchar({ length: 255 }).notNull(),
  muscleGroups: d.varchar({ length: 255 }).notNull(),
  equipment: d.varchar({ length: 255 }).notNull(),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workouts = createTable("workout", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 255 }).notNull(),
  duration: d.integer().notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercises = createTable("workout_exercise", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 255 }).notNull(),
  workoutId: d
    .integer()
    .notNull()
    .references(() => workouts.id),
  exerciseId: d
    .integer()
    .notNull()
    .references(() => exercises.id),
  sets: d.integer().notNull(),
  reps: d.integer().notNull(),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);

export const userWorkouts = createTable("user_workout", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
  workoutId: d
    .integer()
    .notNull()
    .references(() => workouts.id),
  assignedDay: d.varchar({ length: 255 }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => new Date())
    .notNull(),
}));

export const userWorkoutsRelations = relations(userWorkouts, ({ one }) => ({
  user: one(users, { fields: [userWorkouts.userId], references: [users.id] }),
  workout: one(workouts, {
    fields: [userWorkouts.workoutId],
    references: [workouts.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type UserConfig = typeof userConfig.$inferSelect;
export type UserGoal = typeof userGoals.$inferSelect;
export type TrainingConfig = typeof trainingConfig.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type UserWorkout = typeof userWorkouts.$inferSelect;
