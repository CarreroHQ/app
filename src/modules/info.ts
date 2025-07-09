import { Octokit } from "@octokit/rest";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";
import { LRUCache } from "lru-cache";
import { defineCommand } from "~/lib/factories/command";

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
            .setURL(interaction.client.config.get("discordUrl") as string)
        )
      ]
    });
  }
);

export const items = [application];
