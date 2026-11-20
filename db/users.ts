import { eq, InferInsertModel } from "drizzle-orm";
import { db } from "@/db/index";
import { users } from "@/db/schema";

export type InsertUserInput = InferInsertModel<typeof users>;

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
    })
    .returning();

  return user;
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  return user ?? null;
}

export async function findUserById(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  return user ?? null;
}
