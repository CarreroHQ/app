import { defineConfig } from "drizzle-kit";
import { env } from "./src/lib/env";

// biome-ignore lint/style/noDefaultExport: drizzle requirement
export default defineConfig({
  out: "./drizzle",
  schema: "./src/tables",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL
  }
});
