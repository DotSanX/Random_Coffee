import { bot } from "../bot.ts";

bot.command(
    "start",
    (ctx) => ctx.reply("Привет!👋🏻 \n Вижу, ты тут впервые. Я - бот Коффи. А как зовут тебя? \n Учти, что твое имя увидят другие пользователи."),
);

bot.callbackQuery("/about", async (ctx) => {
    await ctx.answerCallbackQuery(); // Уведомляем Telegram, что мы обработали запрос
    await ctx.reply("Я бот? Я бот... Я Бот!");
});

bot.on("message", (ctx) => ctx.reply("бебро: " + ctx.message.text + " !",));

