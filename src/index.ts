import { REST, Routes } from "discord.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "~/lib/client";
import { env } from "~/lib/env";

const client = new Client();
const db = drizzle(env.DATABASE_URL);

/**
 * While in deploy mode, we load only slash commands into memory using
 * existing module handlers and register them using Discord's REST API.
 *
 * This mode skips event registration and does not start the client.
 */
if (process.argv.includes("deploy")) {
  const rest = new REST().setToken(env.DISCORD_TOKEN);
  const payload = client.modules.commands.map((command) =>
    command.data.toJSON()
  );

  try {
    await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
      body: payload
    });
    console.log(`Successfully deployed ${payload.length} command(s).`);
    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to deploy commands:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

await client.login();

export { client, db };
