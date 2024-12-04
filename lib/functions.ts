import { Context } from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { info, users } from "./bot.ts";
import { acceptKeyboard } from "./keyboards.ts";

export async function reviewProfile(ctx: Context) {
  await setState("review");
  await ctx.reply("Вот, как тебя увидят другие пользователи:");
  await ctx.reply(
    `${info.name}, ${info.age}\n` +
      `Список интересов: ${info.interests.toString()}`,
  );
  await ctx.reply("Геопозиция района, где будет удообно встретиться:");
//   await ctx.replyWithLocation(info.geo.latitude, info.geo.longitiute);
  await ctx.reply("Все верно?", {
    reply_markup: acceptKeyboard,
  });
}

export async function setState(state: string) {
  info.state = state;
  const {data, error} = await users.update({ state: info.state }).eq("tg_id", info.id);
  console.log(data)
}
