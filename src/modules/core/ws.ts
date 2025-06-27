import prettyMilliseconds from "pretty-ms";
import { defineEvent } from "~/lib/factories/event";
import { logger } from "~/lib/logger";

const levels = {
  debug: [
    "Connecting to",
    "Preparing first heartbeat of the connection",
    "Heartbeat acknowledged, latency of",
    "First heartbeat sent, starting to beat every "
  ],
  info: ["Provided token:", "Preparing to connect to the gateway..."]
};

const debug = defineEvent("debug", (message: string) => {
  for (const [level, patterns] of Object.entries(levels)) {
    if (patterns.some((p) => message.includes(p))) {
      logger[level as "debug" | "info"](message);
      break;
    }
  }
});

const ready = defineEvent("ready", () => {
  logger.info(
    `Application started in a whopping ${prettyMilliseconds(process.uptime() * 1000, { secondsDecimalDigits: 2 })}`
  );
});

export const items = [debug, ready];

export const meta = {
  hidden: true
};
