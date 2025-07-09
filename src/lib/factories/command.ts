import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import type { Command } from "~/lib/types/command";

export function defineCommand(
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandSubcommandGroupBuilder
    | SlashCommandOptionsOnlyBuilder,
  execute: Command["execute"]
): Command {
  return { type: "command", data, execute };
}
