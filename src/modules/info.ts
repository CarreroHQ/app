import { Octokit } from "@octokit/rest";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} from "discord.js";
import { LRUCache } from "lru-cache";
import { config } from "~/lib/config";
import { defineCommand } from "~/lib/factories/command";
import { defineEvent } from "~/lib/factories/event";
import { levelForXp, xpForLevel } from "~/lib/utils";

const octokit = new Octokit();
const octokitCache = new LRUCache({ max: 10, ttl: 1000 * 60 * 5 });

async function fetchWithCache<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const cached = octokitCache.get(key);
  if (cached !== undefined) return cached as T;
  const data = await fn();
  octokitCache.set(key, data as Record<string, unknown>);
  return data;
}

const application = defineCommand(
  new SlashCommandBuilder()
    .setName("application")
    .setDescription("List all major informations about application."),
  async (interaction) => {
    const hasCachedValues =
      octokitCache.has("repo") && octokitCache.has("repo");
    if (!hasCachedValues)
      interaction.reply({ content: "Crunching latest data, just for you!" });

    const owner = "martwypoeta";
    const repo = "bot";

    const [repoData, commitData] = await Promise.all([
      fetchWithCache("repo", () =>
        octokit.repos.get({ owner, repo }).then((r) => r.data)
      ),
      fetchWithCache("commit", () =>
        octokit.repos
          .getCommit({ owner, repo, ref: "main" })
          .then((r) => r.data)
      )
    ]);

    interaction[hasCachedValues ? "reply" : "editReply"]({
      content: "",
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Greyple)
          .setTitle(
            `${interaction.client.applicationEmojis.get("Github")} ${interaction.client.user.displayName}[${repoData.name}]`
          )
          .setURL(repoData.url)
          .addFields([
            {
              name: "Uptime",
              value: `<t:${Math.floor(Date.now() / 1000 - process.uptime())}:R>`,
              inline: true
            },
            {
              name: "Memory",
              value: `${(process.memoryUsage.rss() / 1024 / 1024).toFixed(2)} MiB`,
              inline: true
            },
            {
              name: "Guilds",
              value: String(interaction.client.guilds.cache.size),
              inline: true
            },
            {
              name: "Latest commit",
              value: // TODO: make it fetch current commit instead of latest one
              `[\`${commitData.sha.slice(0, 7)}\`](${commitData.html_url})${commitData.commit.verification?.verified ? ` ${interaction.client.applicationEmojis.get("Signed_Commit")}` : ""} ${commitData.commit.message} - ${commitData.commit.author?.name}`
            }
          ])
          .setFooter({
            text: `${repoData.stargazers_count} Stars`
          })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Github")
            .setURL(repoData.url),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Chat with us")
            .setURL(config.discordUrl)
        )
      ]
    });
  }
);

const profile = defineCommand(
  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Check a user's profile details.")
    .addUserOption((option) =>
      option.setName("target").setDescription("Target user").setRequired(false)
    ),
  async (interaction) => {
    const target = interaction.options.getUser("target") || interaction.user;
    const prisma = interaction.client.prisma;

    let user = await prisma.user.findUnique({
      where: { discordId: target.id },
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

    if (!user) {
      await interaction.reply("User not found in database.");
      return;
    }

    if (!user.profile && target.id === interaction.user.id) {
      await prisma.profile.create({ data: { userId: user.id } });
      user = (await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          profile: {
            include: {
              businesses: true,
              shares: { include: { business: true } },
              memberships: { include: { organization: true } }
            }
          }
        }
      }))!;
    }

    if (!user?.profile) {
      await interaction.reply(
        `${target.id === interaction.user.id ? "You" : "That user"} do not have a profile.`
      );
      return;
    }

    const { xp = 0, bank = 0, purse = 0 } = user.profile;
    const level = levelForXp(xp);
    const currentLevelXp = xp - xpForLevel(level);
    const xpToNextLevel = xpForLevel(level + 1) - xpForLevel(level);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#f8791f")
          .setAuthor({
            name: `${target.username} (${user.profile.id})`,
            iconURL: target.displayAvatarURL()
          })
          .addFields([
            { name: "Bank", value: `$${bank}`, inline: true },
            { name: "Purse", value: `$${purse}`, inline: true },
            {
              name: "Level (XP)",
              value: `${level} (${currentLevelXp}/${xpToNextLevel})`,
              inline: true
            }
          ])
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Businesses")
            .setCustomId(`show_businesses:${target.id}`),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Shares")
            .setCustomId(`show_shares:${target.id}`),
          ...(target.id === interaction.user.id
            ? [
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Primary)
                  .setLabel("⚙️")
                  .setCustomId("show_settings")
              ]
            : [])
        )
      ]
    });
  }
);

const events = defineEvent("interactionCreate", async (interaction) => {
  if (
    interaction.isButton() &&
    interaction.customId.startsWith("show_businesses:")
  ) {
    const userId = interaction.customId.split(":")[1];
    const prisma = interaction.client.prisma;

    const user = await interaction.client.users.fetch(`${userId}`);

    const userData = await prisma.user.findUnique({
      where: { discordId: userId },
      include: {
        profile: {
          include: {
            businesses: true
          }
        }
      }
    });

    if (!userData?.profile) {
      await interaction.reply("User not found or has no profile.");
      return;
    }

    if (
      !userData.profile.businesses ||
      userData.profile.businesses.length === 0
    ) {
      await interaction.reply("This user has no businesses.");
      return;
    }

    const businesses = userData.profile.businesses;

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle(`${user.username}'s Business`)
      .addFields([
        {
          name: "Name",
          value: String(businesses[0].name),
          inline: true
        },
        {
          name: "Type",
          value: String(businesses[0].type),
          inline: true
        }
      ]);

    const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
    if (businesses.length > 1) {
      components.push(
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`select_business:${userId}`)
            .setPlaceholder("Select a business")
            .addOptions(
              businesses
                .map((business) => ({
                  label: business.name,
                  value: `check_business:${userId}:${business.id}`
                }))
                .concat([
                  {
                    label: "Go Back",
                    value: `back_businesses:${userId}`,
                    emoji: "⬅️"
                  }
                ])
            )
        )
      );
    }
    await interaction.reply({
      embeds: [embed],
      components: components.length > 0 ? components.flat() : []
    });
  } else if (
    interaction.isStringSelectMenu() &&
    interaction.customId.startsWith("select_business:")
  ) {
    if (interaction.values[0]?.startsWith("back_businesses:")) {
      interaction.reply({
        content: "feenko zrub bo ja nie umiem"
      });
    }

    const businessId = interaction.values[0].split(":")[2];

    const prisma = interaction.client.prisma;
    const business = await prisma.business.findUnique({
      where: { id: Number(businessId) },
      include: { owner: true }
    });

    if (!business) {
      await interaction.reply("Business not found.");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("Business Details")
      .addFields([
        { name: "Name", value: business.name, inline: true },
        { name: "Type", value: business.type, inline: true }
      ]);

    await interaction.update({ embeds: [embed] });
  }
});

export const items = [application, profile, events];
