import { Client } from "../src/lib/client";
import { logger } from "../src/lib/logger";

const client = new Client();

client.on("ready", async () => {
  const commands = client.modules.commands.map((command) =>
    command.data.toJSON()
  );

  await client.application?.commands
    .set(commands)
    .catch((err) => {
      logger.error(err instanceof Error ? err.message : err);
      process.exit(1);
    })
    .then(() => {
      logger.info(
        `[register-commands.ts] Successfully deployed ${commands.length} command(s).`
      );
      process.exit(0);
    });
});

client.login();
