import { MessageFlags } from "discord.js";
import { client } from "~/index";
import { defineEvent } from "~/lib/registry";

const commandRun = defineEvent("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
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

export const registry = [commandRun];
