import { bigint, pgEnum, pgTable, timestamp } from "drizzle-orm/pg-core";

export const roles = pgEnum("roles", ["user", "admin"]);

export const users = pgTable("users", {
  id: bigint({ mode: "bigint" }).unique().primaryKey(),
  role: roles().default("user").notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull()
});
