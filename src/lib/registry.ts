import type {
  ChatInputCommandInteraction,
  ClientEvents,
  SlashCommandBuilder
} from "discord.js";

interface BaseItem<T extends "command" | "event"> {
  type: T;
}

export interface Command extends BaseItem<"command"> {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): void | Promise<void>;
}

export interface Event<E extends keyof ClientEvents = keyof ClientEvents>
  extends BaseItem<"event"> {
  name: E;
  once?: boolean;
  execute(...args: ClientEvents[E]): void | Promise<void>;
}

export type Item = Command | Event;

export function defineCommand(
  data: SlashCommandBuilder,
  execute: Command["execute"]
): Command {
  return { type: "command", data, execute };
}

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
