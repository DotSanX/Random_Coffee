import { Bot } from "https://deno.land/x/grammy@v1.32.0/mod.ts";

export const bot = new Bot(Deno.env.get("BOT_TOKEN") || ""); // export нужен, чтобы воспользоваться ботом в другом файле

