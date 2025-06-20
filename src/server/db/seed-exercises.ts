import { db } from "./index";
import { exercises } from "./schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedExercises() {
  const filePath = path.join(__dirname, "./exercises.json");
  const data = fs.readFileSync(filePath, "utf-8");
  const exerciseList: (typeof exercises.$inferInsert)[] = JSON.parse(
    data,
  ) as (typeof exercises.$inferInsert)[];

  for (const exercise of exerciseList) {
    // Upsert: insert if not exists (by name)
    const existing = await db
      .select()
      .from(exercises)
      .where(eq(exercises.name, exercise.name));
    if (existing.length === 0) {
      await db.insert(exercises).values({
        name: exercise.name,
        image: exercise.image,
        videoUrl: exercise.videoUrl,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
      });
      console.log(`Inserted: ${exercise.name}`);
    } else {
      console.log(`Skipped (already exists): ${exercise.name}`);
    }
  }
  console.log("Seeding complete.");
  process.exit(0);
}

seedExercises().catch((err) => {
  console.error(err);
  process.exit(1);
});
