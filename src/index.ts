import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "~/lib/client";
import { env } from "~/lib/env";

const client = new Client();
const db = drizzle(env.DATABASE_URL);

await client.login();

export { client, db };
