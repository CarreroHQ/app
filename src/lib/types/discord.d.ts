/** biome-ignore-all lint/nursery/noImportCycles: invalid */

import type { Collection } from "discord.js";
import type { ModuleLoader } from "../loader";
import type { PrismaClient } from "@prisma/client";

declare module "discord.js" {
  interface Client {
    config: Collection<string, unknown>;
    applicationEmojis: Collection<string, string>;
    modules: InstanceType<typeof ModuleLoader>;
    prisma: PrismaClient;
  }
}
