import { Client as DiscordClient } from "discord.js";

import { ModuleLoader } from "~/lib/loader";
import * as commands from "~/modules/core/commands";
import * as ws from "~/modules/core/ws";
import * as info from "~/modules/info";

export class Client extends DiscordClient {
  readonly modules = new ModuleLoader(this, [commands, ws, info]);

  constructor() {
    super({ intents: [] });
    this.modules.load();
  }
}
