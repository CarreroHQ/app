import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from "discord.js";

export interface Command {
  type: "command";
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): void | Promise<void>;
}
