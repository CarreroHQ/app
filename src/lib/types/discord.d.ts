/** biome-ignore-all lint/nursery/noImportCycles: invalid */

import { Collection } from "discord.js";
import type { ModuleLoader } from "../loader";

declare module "discord.js" {
  interface Client {
    applicationEmojis: Collection<string, string>;
    modules: InstanceType<typeof ModuleLoader>;
  }
}
