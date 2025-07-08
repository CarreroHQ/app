# bot

[![License](https://img.shields.io/badge/License-BSD%203--Clause-%23f95740.svg?logo=freebsd&logoColor=959DA5&labelColor=343B42)](https://spdx.org/licenses/BSD-3-Clause.html)
[![Runtime](https://img.shields.io/badge/Runtime-Bun-%23f472b6.svg?logo=bun&logoColor=959DA5&labelColor=343B42)](https://bun.sh/docs)
[![Typescript version](https://img.shields.io/github/package-json/dependency-version/martwypoeta/bot/peer/typescript?logo=typescript&logoColor=959DA5&label=Typescript&labelColor=343B42)](https://github.com/martwypoeta/bot/blob/main/package.json)
[![Code quality](https://github.com/martwypoeta/bot/actions/workflows/quality.yml/badge.svg)](https://github.com/martwypoeta/bot/actions/workflows/quality.yml)
[![Typecheck](https://github.com/martwypoeta/bot/actions/workflows/typecheck.yml/badge.svg)](https://github.com/martwypoeta/bot/actions/workflows/typecheck.yml)

Modular discord bot written in [Bun](https://bun.sh/)

## What do we mean by modular?

In [`src/modules`](https://github.com/martwypoeta/bot/tree/main/src/modules) each file is individual module that can define various things like commands or events. This keeps the code organized because everything related to a specific module is contained within its own file.

Many bots separate commands and events into different folders, which can scatter related code and make it harder to understand.

### Read more

- [TypeScript: Modules - Introduction](https://www.typescriptlang.org/docs/handbook/modules/introduction.html)
- [Wikipedia: Separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
- [Wikipedia: Cohesion (computer science)](https://en.wikipedia.org/wiki/Cohesion_(computer_science))

## Usage

To run the bot, you'll need to have [Bun](https://bun.sh/) installed. Ensure that Bun is set up correctly before continuting.

### Environment setup

First, configure environment variables:

1. Copy `.env.example` file to `.env`.
2. Fill in every empty variable.
3. Voilà!

### Using scripts

This project includes the following scripts:

- [create-emotes.ts](./scripts/create-emotes.ts)
- [register-commands.ts](./scripts/register-commands.ts)

You can invoke any script with the command: `bun run scripts/{...}.ts`.

#### create-emotes.ts

Run this script when setting up a new application or if you're missing emotes.

#### register-commands.ts

Run this script whenever there are changes to the command structure. It ensures commands are properly synchronized with Discord API.

### Running

To start the bot, run following:

```sh
bun start
```

If you wish to have hot-reloading, run following:

```sh
bun dev
```

## License

This project is licensed under the BSD 3-Clause License. See the [LICENSE](LICENSE) file for details.
