import {
  Bot,
  Context,
  Keyboard,
} from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { menuKeyboard, yesOrNo } from "./keyboards.ts"; // импорт клавиатур
import {
  getProfile,
  getSimularUsers,
  getUser,
  reviewProfile,
  setState,
} from "./functions.ts"; //импорт функций
import { createClient } from "npm:@supabase/supabase-js"; // database
import { UserInfo } from "./interfaces.ts";

// инициализация supabase
const supabaseUrl = "https://jgnfuigiiacuamzivzby.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);
export const users = supabase.from("users");

//объявил бота
export const bot = new Bot<Context>(Deno.env.get("BOT_TOKEN") || "");

// локальная информация о пользователе
export const info: UserInfo = {
  id: 0,
  name: "",
  age: 0,
  interests: [],
  lat: 0,
  long: 0,
  time: "",
  state: "",
  rating: 0,
  done: false,
};

export const similarUsers: number[] = [];

// info будет нужна для сохранения инфо пользователя в бд (или получения) - представляет из себя набор данных о пользователе
bot.command("start", async (ctx) => { // бот получает команду /start
  info.id = Number(ctx.msg.from?.id);
  if (await getProfile()) {
    await ctx.reply(`Привет, ${info.name}!`, { reply_markup: menuKeyboard });
  } else {
    await users.insert({
      tg_id: info.id,
      state: "setName",
    });
    await ctx.reply(
      "Привет!👋🏻 \nВижу, ты тут впервые. Я - бот Коффи☕️. С моей помощью ты сможешь пообщаться с людьми, которым интересно то же, что и тебе!",
    );
    await ctx.reply(
      "🤔 А как зовут тебя? \n <b>Учти, что твое имя увидят другие пользователи.</b>",
      { parse_mode: "HTML" }, // нужно, чтобы использовать теги из html
    );
    setState("setName"); // следующим сообщением боту должно придти имя
  }
});

// обработка подтверждения интересов
bot.callbackQuery("interestsDone", async (ctx) => {
  await ctx.deleteMessage();
  await ctx.reply("Отлично!");
  await reviewProfile(ctx);
});
bot.callbackQuery("interestsNotDone", async (ctx) => {
  await ctx.deleteMessage();
  await ctx.reply("Хорошо, напиши еще увлечений!");
  setState("setInterests");
});

bot.hears(
  ["профиль", "Профиль", "Мой профиль", "Мой профиль 👤"],
  async (ctx) => {
    await reviewProfile(ctx);
  },
);

bot.on("message", async (ctx) => {
  if (info.state) { // при непустом info.state
    switch (info.state) {
      case "searching":
        if (ctx.message.text?.toLowerCase().includes("покажи")) {
          for (const person of similarUsers) {
            const user = await getUser(person);
            ctx.reply(user.name)
          }
        } else {
          ctx.reply("Выбери вариант на клавиатуре Telegram!");
        }
        break;
      case "setName":
        if (
          typeof ctx.msg.text !== "string" ||
          /[0-9_.*^%$#@!]/.test(ctx.msg.text) // регулярное выражение на проверку спец символов
        ) {
          await ctx.reply(
            "Извини, но имя должно быть текстом, не содержащим цифр или спецсимволов!",
          );
          return;
        } else {
          info.name = ctx.msg.text || ""; //сохраняем в переменную
          await ctx.reply("Приятно познакомиться, " + info.name + "!");
          await ctx.reply("Кстати, сколько тебе лет?");
          setState("setAge");
        }
        break;

      case "setAge":
        if (isNaN(Number(ctx.msg.text))) {
          await ctx.reply("Извини, но нужно ввести возраст числом!");
          return;
        }
        info.age = Number(ctx.msg.text);
        await ctx.reply(
          "Отлично! 🤩 Отправь мне местоположение, рядом с которым тебе будет удобно встретиться",
        );
        await ctx.reply(
          "👀 Подсказка: нажми на скрепку🖇️ -> местоположение📍",
        );
        setState("setGeo");
        break;

      case "review":
        switch (ctx.msg.text) {
          case "Да!":
            info.done = true;
            await ctx.reply("Отлично!", { reply_markup: menuKeyboard });
            const { data, error } = await users.update({
              name: info.name,
              age: info.age,
              lat: info.lat,
              long: info.long,
              time: info.time,
              interests: info.interests,
              done: info.done,
            }).eq("tg_id", info.id).single();
            console.log(data, error);
            setState("searching");
            break;

          case "Нет, хочу изменить":
            setState("setName");
            await ctx.reply("Давайте начнем сначала! Как тебя зовут?");
            info.interests = [];
            break;

          default:
            await ctx.reply("Выбери один из вариантов на клавиатуре Telegram!");
            break;
        }
        break;
      case "setGeo":
        if (!ctx.msg.location) {
          await ctx.reply(
            "🤔 Я не понял. Пожалуйста, отправь мне местоположение",
          );
          return;
        }
        info.lat = ctx.msg.location?.latitude;
        info.long = ctx.msg.location?.longitude; // записываем геопозицию в виде: ширина, долгота
        await ctx.reply(
          "😎 А теперь расскажи мне немного о себе. Перечисли через запятую свои хобби и увлечения!",
        );
        setState("setInterests");
        break;

      case "setInterests":
        if (ctx.msg.text) {
          for (const interest of ctx.msg.text?.split(",")) {
            info.interests.push(interest.trim());
          }
        }
        await ctx.reply(
          "🏆 Вот список твоих интересов:",
        );
        await ctx.reply(
          info.interests.toString(),
        );
        await ctx.reply("Это все?", { reply_markup: yesOrNo }); // смотри bot.callbackQuery
        break;

      default:
        break;
    }
  }
});

while (info.state == "searching") {
  setInterval(async () => {
    await getSimularUsers();
    if (similarUsers.length > 0) {
      await bot.api.sendMessage(
        info.id,
        "Нашелся человек, который может с тобой встретиться!",
        { reply_markup: new Keyboard().text("Покажи").resized() },
      );
    }
  }, 10000);
}
