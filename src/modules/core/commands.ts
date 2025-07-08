import { MessageFlags } from "discord.js";
import type { Client } from "~/lib/client";
import { defineEvent } from "~/lib/factories/event";

const commandRun = defineEvent("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const client = interaction.client as Client;

  const command = client.modules.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error running command ${interaction.commandName}:`, err);
    if (!(interaction.replied || interaction.deferred)) {
      await interaction.reply({
        content: "An error occurred.",
        flags: [MessageFlags.Ephemeral]
      });
    }
  }
});

export const items = [commandRun];

export const meta = {
  hidden: true
};
