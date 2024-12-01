import {Bot} from "https://deno.land/x/grammy@v1.32.0/mod.ts";
export interface User {
  name: string;
  age: number;
  interests: string[];
  geo: string;
  time: Date;
}
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");
bot.use(
  async (ctx, next) => {
    ctx.config = {
      state: "",
      users: {}
    }
    await next()
  }
)

bot.command("start", async (ctx) => {
  if (ctx.msg.from.id in ctx.config.users) {
    await ctx.reply("ты уже тупа юзер");
  } else {
    await ctx.reply(
      "Привет!👋🏻 \nВижу, ты тут впервые. Я - бот Коффи☕️. С моей помощью ты сможешь пообщаться с людьми, которым интересно то же, что и тебе!",
    );
    await ctx.reply(
      "🤔 А как зовут тебя? \n <b>Учти, что твое имя увидят другие пользователи.</b>",
      { parse_mode: "HTML" },
    );
    ctx.config.state = "setName";
  }
});

bot.on("message", async (ctx) => {
  if (ctx.config.state) {
    const state = ctx.config.state;
    switch (state) {
      case "setName":
        ctx.config.state = ctx.msg.text;
        ctx.reply("Отличное имя, " + ctx.config.userInfo.name + "!");
        ctx.reply("Кстати, сколько тебе лет?");
        ctx.config.state = "setAge";
        break;
      case "setAge":
        ctx.config.userInfo.age = Number(ctx.msg.text);
        ctx.reply("Отлично! 🤩 Отправь мне местоположение, рядом с которым тебе будет удобно встретиться");
        ctx.config.state = "setInterests";
        break;

      default:
        break;
    }
  }
});
