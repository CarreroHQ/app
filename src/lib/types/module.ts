import type { Item } from "./item";

export interface Module {
  items: Item[];
  meta?: Record<string, unknown>;
}
