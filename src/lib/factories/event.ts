import type { ClientEvents } from "discord.js";
import type { Event } from "~/lib/types/event";

export function defineEvent<E extends keyof ClientEvents>(
  name: E,
  execute: Event<E>["execute"],
  options?: { once?: boolean }
): Event<E> {
  return {
    type: "event",
    name,
    once: options?.once ?? false,
    execute
  };
}
