import { SlashCommandBuilder } from "discord.js";
import { defineCommand } from "~/lib/registry";

const dummy = defineCommand(
  new SlashCommandBuilder()
    .setName("dummy")
    .setDescription("A dummy command for testing purposes"),
  (interaction) => {
    interaction.reply("Hi!");
  }
);

export const registry = [dummy];
