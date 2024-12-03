import { MyContext } from "./interfaces.ts";
import { database, info } from "./bot.ts";
import { acceptKeyboard } from "./keyboards.ts";

export async function reviewProfile(ctx: MyContext) {
  await setState("review");
  await ctx.reply("Вот, как тебя увидят другие пользователи:");
  await ctx.reply(
    `${info.name}, ${info.age}\n` +
      `Список интересов: ${info.interests.toString()}`,
  );
  await ctx.reply("Геопозиция района, где будет удообно встретиться:");
  await ctx.replyWithLocation(info.geo.latitude, info.geo.longitiute);
  await ctx.reply("Все верно?", {
    reply_markup: acceptKeyboard,
  });
}

export async function setState(state: string) {
  info.state = state;
  await database.set(["users", info.id, "state"], state);
}
