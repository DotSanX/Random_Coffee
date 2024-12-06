import { Bot, Context } from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { changesKeyboard, menuKeyboard, yesOrNo } from "./keyboards.ts"; // импорт клавиатур
import { reviewProfile, setState } from "./functions.ts"; //импорт функций
import { createClient } from "npm:@supabase/supabase-js"; // database
import { UserInfo } from "./interfaces.ts";

// инициализация supabase
const supabaseUrl = "https://ewbnuhgdcuskrkfiwfiv.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);
export const users = supabase.from("users");

//объявил бота
export const bot = new Bot<Context>(Deno.env.get("BOT_TOKEN") || "");

// локальная информация о пользователе
export let info: UserInfo = {
  id: 0,
  name: "",
  age: 0,
  interests: [],
  geo: {
    latitude: 0,
    longtitude: 0,
  },
  time: "",
  state: "",
  rating: 0,
  done: false,
};

// info будет нужна для сохранения инфо пользователя в бд (или получения) - представляет из себя набор данных о пользователе
bot.command("start", async (ctx) => { 
  const tgId = Number(ctx.msg.from?.id);

 
  const existingUser = (await users.select().eq("tg_id", tgId).single()).data;

  if (existingUser) {
   
    const { name, age, interests, geo, time, done } = existingUser;

    info.id = tgId;
    info.name = name;
    info.age = age;
    info.interests = interests;
    info.geo = geo;
    info.time = time;
    info.done = done;

    await ctx.reply(`Привет, ${name}!`, { reply_markup: menuKeyboard });
  } else {
    
    await users.insert({
      tg_id: tgId,
      state: "setName",
    });

    await ctx.reply(
      "Привет!👋🏻 \nВижу, ты тут впервые. Я - бот Коффи☕️. С моей помощью ты сможешь пообщаться с людьми, которым интересно то же, что и тебе!",
    );
    await ctx.reply(
      "🤔 А как зовут тебя? \n<b>Учти, что твое имя увидят другие пользователи.</b>",
      { parse_mode: "HTML" },
    );

    setState("setName"); 
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
            await ctx.reply("Отлично!");
            await users.update({
              name: info.name,
              age: info.age,
              geo: JSON.stringify(info.geo),
              time: info.time,
              interests: info.interests,
              done: info.done,
            }).eq("tg_id", info.id);
            break;

          case "Нет, хочу изменить":
            setState("changeProfile");
            await ctx.reply("Выбери, что хочешь изменить", {
              reply_markup: changesKeyboard,
            });
            break;

          default:
            await ctx.reply("Выбери один из вариантов на клавиатуре Telegram!");
            break;
        }
        break;
      case "changeProfile":
        switch (ctx.msg.text) {
          case "Имя":
            await ctx.reply("Хорошо, введи другое имя");
            break;
          case "Возраст":
            await ctx.reply("Хорошо, введи другой возраст");
            break;
          case "Геопозицию":
            await ctx.reply("Хорошо, отправь другую геопозицию");
            break;
          case "Интересы":
            await ctx.reply("Хорошо, введи другие интересы");
            break;
          case "Удобное время":
            await ctx.reply("Хорошо, введи другое время");
            break;
          case "Хочу заполнить профиль заново":
            await ctx.reply("Хорошо, введи другое имя");
            break;
          default:
            await ctx.reply(
              "Выбери вариант ответа, используя клавиатуру Telegram!",
            );
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
        info.geo.latitude = ctx.msg.location?.latitude;
        info.geo.longitiute = ctx.msg.location?.longitude; // записываем геопозицию в виде: ширина, долгота
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
