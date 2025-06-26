import { Collection, Client as DiscordClient } from "discord.js";

import { env } from "~/lib/env";
import type { Event, Item, SlashCommand } from "~/lib/registry";

import * as _core from "~/modules/core/commands";
import * as dummy from "~/modules/dummy";

export class Client extends DiscordClient {
  readonly modules = [_core, dummy];
  readonly commands = new Collection<string, Omit<SlashCommand, "type">>();

  constructor() {
    super({ intents: [] });
  }

  async run() {
    await this.loadModules();
    await this.login(env.DISCORD_TOKEN);
  }

  async loadModules(filter?: (item: Item) => boolean) {
    await Promise.all(this.modules.map((m) => this.registerModule(m, filter)));
  }

  unloadModules() {
    this.removeAllListeners();
    this.commands.clear();
  }

  registerModule(
    module: { registry: Item[] },
    filter?: (item: Item) => boolean
  ) {
    for (const item of module.registry) {
      if (filter && !filter(item)) continue;

      if (item.type === "command") {
        const { type: _, ...command } = item;
        this.commands.set(item.data.name, command);
      } else if (item.type === "event") {
        const handler = (...args: Parameters<Event["execute"]>) =>
          item.execute(...args);
        this[item.once ? "once" : "on"](item.name, handler);
      } else {
        console.warn("Unknown registry item", item);
      }
    }
  }
}
