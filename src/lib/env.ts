import { z } from "zod";

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
  DISCORD_APPLICATION_ID: z
    .string()
    .min(1, "DISCORD_APPLICATION_ID is required")
});

export const env = envSchema.parse(Bun.env);
