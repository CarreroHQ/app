import { Client } from "~/lib/client";

const client = new Client();

await client.login();

export { client };
