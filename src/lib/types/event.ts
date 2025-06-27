import type { ClientEvents } from "discord.js";

export interface Event<E extends keyof ClientEvents = keyof ClientEvents> {
  type: "event";
  name: E;
  once?: boolean;
  execute(...args: ClientEvents[E]): void | Promise<void>;
}
