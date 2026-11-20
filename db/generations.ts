import { desc, eq, type InferInsertModel } from "drizzle-orm";

import { generations } from "@/db/schema";
import { db } from "@/db/index";

export async function listUserGenerationSummaries(userId: string) {
  return db
    .select()
    .from(generations)
    .where(eq(generations.userId, userId))
    .orderBy(desc(generations.createdAt));
}

type InsertGenerationInput = Omit<InferInsertModel<typeof generations>, "id" | "createdAt">;

export async function createGeneration(input: InsertGenerationInput) {
  const [row] = await db.insert(generations).values(input).returning();

  return row;
}
