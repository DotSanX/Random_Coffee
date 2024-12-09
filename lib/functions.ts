import { Context } from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { info, similarUsers, users } from "./bot.ts";
import { acceptKeyboard } from "./keyboards.ts";

export async function getProfile() {
  const userData = (await users.select().eq("tg_id", info.id).single()).data;
  if (userData) {
    info.name = userData.name;
    info.age = userData.age;
    info.interests = userData.interests;
    // info.geo = userData.geo;
    info.time = userData.time;
    info.done = userData.done;
    return true;
  } else {
    return false;
  }
}

export async function getSimularUsers() {
  const tolerance = 0.05;
  const lat = (await users.select("lat")).data;
  const long = (await users.select("long")).data;
  //вытаскиваем из базы гео всех пользователей
  if (lat && long) {
    for (let i = 0; i < lat.length; i++) {
      if (
        Math.abs(Number(lat[i]) - info.lat) < tolerance &&
        Math.abs(Number(long[i]) - info.long) < tolerance
      ) {
        const userId = Number(
          (await users.select("tg_id").eq("lat", Number(lat[i])).eq(
            "long",
            Number(long[i]),
          ).single()).data,
        );
        similarUsers.push(userId);
      }
    }
  }
}

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

export async function getUser(id: number) {
  const user = (await users.select().eq("tg_id", id).single()).data;
  return user;
}

export async function setState(state: string) {
  info.state = state;
  await users.update({ state: info.state }).eq("tg_id", info.id).single();
}
