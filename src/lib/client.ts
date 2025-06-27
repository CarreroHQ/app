import { Collection, Client as DiscordClient } from "discord.js";

import { env } from "~/lib/env";
import type { Command, Event, Item } from "~/lib/registry";

import * as commands from "~/modules/core/commands";
import * as dummy from "~/modules/dummy";

export class Client extends DiscordClient {
  readonly modules = [commands, dummy];
  readonly commands = new Collection<string, Omit<Command, "type">>();

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

  registerModule(module: { items: Item[] }, filter?: (item: Item) => boolean) {
    for (const item of module.items) {
      if (filter && !filter(item)) continue;

      if (item.type === "command") {
        const { type: _, ...command } = item;
        this.commands.set(item.data.name, command);
      } else if (item.type === "event") {
        const handler = (...args: Parameters<Event["execute"]>) =>
          item.execute(...args);
        this[item.once ? "once" : "on"](item.name, handler);
      } else {
        console.warn("Unknown item", item);
      }
    }
  }
}
