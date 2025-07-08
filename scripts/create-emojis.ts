import path from "node:path";
import emojis from "../assets/emojis/meta.json" with { type: "json" };
import { Client } from "../src/lib/client";
import { logger } from "../src/lib/logger";

const client = new Client();

client.on("ready", async () => {
  if (!client.application) {
    logger.error(
      "[create-emojis.ts] No application found. (How did you even do this?)"
    );
    process.exit(1);
  }

  const clientEmojis = await client.application.emojis.fetch();

  logger.info(
    "[create-emojis.ts] Searching for any missing application emojis.."
  );

  const emojisCreatePromises = emojis
    .filter(
      (emoji: { name: string }) =>
        !clientEmojis.some((e) => e.name === emoji.name)
    )
    .map(async (emoji: { name: string; source: string }) => {
      return client.application?.emojis.create({
        name: emoji.name,
        attachment: Buffer.from(
          await Bun.file(
            path.resolve(process.cwd(), "assets/emojis", emoji.source)
          ).arrayBuffer()
        )
      });
    });

  if (emojisCreatePromises.length > 0) {
    logger.info(
      `[create-emojis.ts] Adding ${emojisCreatePromises.length} emoji(s)..`
    );
    await Promise.all(emojisCreatePromises);
    logger.info("[create-emojis.ts] Done");
  } else {
    logger.info("[create-emojis.ts] All emojis match already");
  }

  process.exit(0);
});

client.login();
