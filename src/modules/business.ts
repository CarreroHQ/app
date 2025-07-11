import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";
import { defineCommand } from "~/lib/factories/command";
import { defineEvent } from "~/lib/factories/event";

const business = defineCommand(
  new SlashCommandBuilder()
    .setName("business")
    .setDescription("Check a user's business details.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a new business.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Name of your business")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Type of business")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View your business details.")
        .addStringOption((option) =>
          option
            .setName("business")
            .setDescription("Select a business to view")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete one of your businesses.")
        .addStringOption((option) =>
          option
            .setName("business")
            .setDescription("Select a business to delete")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("collect")
        .setDescription("Collect income from your business.")
        .addStringOption((option) =>
          option
            .setName("business")
            .setDescription("Select a business to collect income from")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("workers")
        .setDescription("Manage your business workers.")
    ),
  async (interaction) => {
    switch (interaction.options.getSubcommand()) {
      case "create": {
        const name = interaction.options.getString("name", true);
        const type = interaction.options.getString("type", true);
        const prisma = interaction.client.prisma;

        const userData = await prisma.user.findUnique({
          where: { discordId: interaction.user.id },
          select: { id: true }
        });

        const profileData = await prisma.profile.findUnique({
          where: { userId: userData?.id },
          select: { id: true }
        });

        const business = await prisma.business.create({
          data: {
            name,
            type,
            owner: {
              connect: { id: profileData?.id }
            },
            dividendRate: 0,
            collectedAt: new Date()
          }
        });

        await businessInfo(interaction, business.id);
        break;
      }
      case "view": {
        const prisma = interaction.client.prisma;
        const user = await prisma.user.findUnique({
          where: { discordId: interaction.user.id },
          include: {
            profile: {
              include: {
                businesses: true,
                shares: { include: { business: true } },
                memberships: { include: { organization: true } }
              }
            }
          }
        });

        if (!(user && user.profile)) {
          await interaction.reply("You do not have a profile.");
          return;
        }

        const businessName = interaction.options.getString("business", true);
        const business = user.profile.businesses.find(
          (b) => b.name.toLowerCase() === businessName.toLowerCase()
        );

        if (!business) {
          await interaction.reply("Business not found.");
          return;
        }

        await businessInfo(interaction, business.id);
        break;
      }
    }
  }
);

async function businessInfo(
  interaction: CommandInteraction,
  businessId: number
) {
  const business = await interaction.client.prisma.business.findUnique({
    where: { id: businessId },
    select: {
      name: true,
      type: true,
      dividendRate: true,
      collectedAt: true,
      owner: { select: { user: { select: { discordId: true } } } }
    }
  });

  if (!business || business.owner.user.discordId !== interaction.user.id) {
    return null;
  }

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("#f8791f")
        .setTitle(`${business.name}`)
        .addFields([
          { name: "Type", value: business.type, inline: true },
          {
            name: "Dividend Rate",
            value: `${business.dividendRate}`,
            inline: true
          },
          {
            name: "Collect Income",
            value: `<t:${Math.floor(new Date(business.collectedAt).getTime() / 1000 + 86_400)}:R>`,
            inline: true
          }
        ])
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`show_workers:${businessId}`)
          .setLabel("Workers")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`upgrades:${businessId}`)
          .setLabel("Upgrades")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`settings_business:${businessId}`)
          .setLabel("⚙️")
          .setStyle(ButtonStyle.Danger)
      )
    ]
  });
}

const events = defineEvent("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    const user = await interaction.client.prisma.user.findUnique({
      where: { discordId: interaction.user.id },
      include: {
        profile: {
          include: {
            businesses: true
          }
        }
      }
    });
    if (!(user && user.profile)) {
      await interaction.respond([]);
      return;
    }
    const focusedValue = interaction.options.getFocused();
    const filtered = user?.profile?.businesses.filter((b) =>
      b.name.toLowerCase().includes(focusedValue.toLowerCase())
    );
    await interaction.respond(
      filtered.map((b) => ({ name: b.name, value: b.name }))
    );
  }
});

export const items = [business, events];
