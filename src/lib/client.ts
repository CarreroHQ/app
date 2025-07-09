import { Collection, Client as DiscordClient } from "discord.js";

import { ModuleLoader } from "~/lib/loader";
import * as commands from "~/modules/core/commands";
import * as emojis from "~/modules/core/emojis";
import * as ws from "~/modules/core/ws";
import * as info from "~/modules/info";
import config from "../../assets/config.json" with { type: "json" };

export class Client extends DiscordClient {
  // Whenever editing client properties, remember to reflect
  // changes in src/lib/types/discord.d.ts
  override readonly config = new Collection<string, unknown>(
    Object.entries(config)
  );
  override readonly applicationEmojis = new Collection<string, string>();
  override readonly modules: InstanceType<typeof ModuleLoader> =
    new ModuleLoader(this, [commands, emojis, ws, info]);

  constructor() {
    super({ intents: [] });
    this.modules.load();
  }
}
