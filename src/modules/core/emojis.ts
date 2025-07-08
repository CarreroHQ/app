import { defineEvent } from "~/lib/factories/event";
import { logger } from "~/lib/logger";

const setEmojis = defineEvent("ready", (client) => {
  if (!client.application) {
    logger.fatal("what the fuck");
    return;
  }

  client.application.emojis.fetch().then((emojis) =>
    emojis.forEach((emoji) => {
      if (emoji.name)
        client.applicationEmojis.set(emoji.name, `<:${emoji.identifier}>`);
    })
  );
});

export const items = [setEmojis];

export const meta = {
  hidden: true
};
