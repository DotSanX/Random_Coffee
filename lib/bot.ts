import { Bot } from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import dotenv from "npm:dotenv"

dotenv.config()

export const bot = new Bot(Deno.env.get("BOT_TOKEN") || ""); // export нужен, чтобы воспользоваться ботом в другом файле

bot.command(
    "start",
    (ctx) => ctx.reply("Привет!👋🏻 \n Вижу, ты тут впервые. Я - бот Коффи. А как зовут тебя? \n Учти, что твое имя увидят другие пользователи."),
);
