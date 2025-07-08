/** biome-ignore-all lint/nursery/noImportCycles: invalid */

import { type Client, Collection } from "discord.js";

import type { Command } from "~/lib/types/command";
import type { Event } from "~/lib/types/event";
import type { Item } from "~/lib/types/item";
import type { Module } from "~/lib/types/module";

export class ModuleLoader {
  readonly commands = new Collection<string, Omit<Command, "type">>();

  constructor(
    private readonly client: Client,
    readonly sources: Module[]
  ) {}

  load(filter?: (item: Item) => boolean) {
    for (const module of this.sources) {
      for (const item of module.items) {
        if (filter && !filter(item)) continue;

        if (item.type === "command") {
          this.commands.set(item.data.name, item);
        } else if (item.type === "event") {
          const handler = (...args: Parameters<Event["execute"]>) =>
            item.execute(...args);
          this.client[item.once ? "once" : "on"](item.name, handler);
        } else {
          console.warn("Unknown item", item);
        }
      }
    }
  }

  unload() {
    this.client.removeAllListeners();
    this.commands.clear();
  }
}
