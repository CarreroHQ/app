import path from "node:path";
import emotes from "../assets/emotes/meta.json" with { type: "json" };
import { Client } from "../src/lib/client";
import { logger } from "../src/lib/logger";

const client = new Client();

client.on("ready", async () => {
  if (!client.application) {
    logger.error(
      "[create-emotes.ts] No application found. (How did you even do this?)"
    );
    process.exit(1);
  }

  const clientEmojis = await client.application.emojis.fetch();

  logger.info(
    "[create-emotes.ts] Searching for any missing application emotes.."
  );

  const emotesCreatePromises = emotes
    .filter(
      (emote: { name: string }) =>
        !clientEmojis.some((e) => e.name === emote.name)
    )
    .map(async (emote: { name: string; source: string }) => {
      return client.application?.emojis.create({
        name: emote.name,
        attachment: Buffer.from(
          await Bun.file(
            path.resolve(process.cwd(), "assets/emotes", emote.source)
          ).arrayBuffer()
        )
      });
    });

  if (emotesCreatePromises.length > 0) {
    logger.info(
      `[create-emotes.ts] Adding ${emotesCreatePromises.length} emote(s)..`
    );
    await Promise.all(emotesCreatePromises);
    logger.info("[create-emotes.ts] Done");
  } else {
    logger.info("[create-emotes.ts] All emotes match already");
  }

  process.exit(0);
});

client.login();
