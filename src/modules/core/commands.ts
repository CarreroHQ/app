import { MessageFlags } from "discord.js";
import type { Client } from "~/lib/client";
import { defineEvent } from "~/lib/factories/event";

const registeredUsers: string[] = [];

const commandRun = defineEvent("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const client = interaction.client as Client;

  const command = client.modules.commands.get(interaction.commandName);
  if (!command) return;

  if (!registeredUsers.includes(interaction.user.id)) {
    const userData = await client.prisma.user.findUnique({
      where: {
        discordId: interaction.user.id
      }
    });

    if (!userData) {
      await client.prisma.user.create({
        data: {
          discordId: interaction.user.id
        }
      });
    }

    registeredUsers.push(interaction.user.id);
  }

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
