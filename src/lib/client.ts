import { Client as DiscordClient } from "discord.js";

import { ModuleLoader } from "~/lib/loader";
import * as commands from "~/modules/core/commands";

export class Client extends DiscordClient {
  readonly modules = new ModuleLoader(this, [commands]);

  constructor() {
    super({ intents: [] });
    this.modules.load();
  }
}
