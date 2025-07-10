import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, { error: "DATABASE_URL is required" }),
  DISCORD_TOKEN: z.string().min(1, { error: "DISCORD_TOKEN is required" })
});

export const env = envSchema.parse(Bun.env);
