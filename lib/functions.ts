import { Context } from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { info, users } from "./bot.ts";
import { acceptKeyboard } from "./keyboards.ts";

export async function getProfile() {
  const userData = (await users.select().eq("tg_id", info.id).single()).data;
  if (userData) {
    info.name = userData.name;
    info.age = userData.age;
    info.interests = userData.interests;
    info.geo = userData.geo;
    info.time = userData.time;
    info.done = userData.done;
    return userData;
  } else {
    return false;
  }
}

export async function reviewProfile(ctx: Context) {
  await getProfile();
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
  await users.update({ state: info.state }).eq("tg_id", info.id);
}
