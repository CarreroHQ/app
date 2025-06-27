import type { SlashCommandBuilder } from "discord.js";
import type { Command } from "~/lib/types/command";

export function defineCommand(
  data: SlashCommandBuilder,
  execute: Command["execute"]
): Command {
  return { type: "command", data, execute };
}
