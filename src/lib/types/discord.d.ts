/** biome-ignore-all lint/nursery/noImportCycles: invalid */

import type { PrismaClient } from "@prisma/client";
import type { Collection } from "discord.js";
import type { ModuleLoader } from "../loader";

declare module "discord.js" {
  interface Client {
    applicationEmojis: Collection<string, string>;
    modules: InstanceType<typeof ModuleLoader>;
    prisma: PrismaClient;
  }
}
