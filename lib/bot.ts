import { Bot } from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { commands } from "./router/commands.ts";
import { handlers } from "./router/messageHandlers.ts";
export interface User {
  name: string;
  age: number;
  interests: string[];
  geo: string;
  time: Date;
}

export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");

for (const command in commands) {
  bot.command(
    command,
    commands[command],
  );
}
for (const handler in handlers) {
    bot.command(
      handler,
      handlers[handler],
    );
  }

export const users = {};
