import { users } from "../bot.ts";
export const commands = {
  "start": async (ctx: any) => {
    if (ctx.msg.from.id in users) {
    } else {
      await ctx.reply(
        "Привет!👋🏻 \nВижу, ты тут впервые. Я - бот Коффи☕️. С моей помощью ты сможешь пообщаться с людьми, которым интересно то же, что и тебе!",
      );
      await ctx.reply(
        "🤔 А как зовут тебя? \n <b>Учти, что твое имя увидят другие пользователи.</b>",
        { parse_mode: "HTML" },
      );
      const id = ctx.msg.from.id
      ctx.config = {
        currentEvent: "nameSet",
         userInfo: {
            name: "",
            age: 0,
            interests: [],
            geo: "",
            time: ""
        }
      };
    }
  },
};
