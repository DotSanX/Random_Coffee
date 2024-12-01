import { Bot, Context, InlineKeyboard } from "https://deno.land/x/grammy@v1.32.0/mod.ts";

// интерфейс и тип для корректной работы и ide
interface UserInfo {
  name: string,
  age: number,
  interests : string[],
  geo: string,
  time: string,
}
type MyContext = Context & {
  config: UserInfo;
};

//объявил бота
export const bot = new Bot<MyContext>(Deno.env.get("BOT_TOKEN") || "");

let state = ""; // эта переменная нужна для обработки состояния - устанавливает ли пользователь имя или, например, ожидает встречи
// Список states на данный момент:
// setName - установка имени
// setAge - установка возраста
// setInterests - установка интересов
// setGeo - установка геопозиции
// setTime - установка времени
// Pending - состояние ожидания 
// Searching - состояние поиска

// info будет нужна для сохранения инфо пользователя в бд (или получения) - представляет из себя набор данных о пользователе
const info: UserInfo = {
  name: "",
  age: 0,
  interests : [],
  geo: "",
  time: ""
};

// будущий middleware !пригодится для бд!
bot.use(
  async (ctx, next) => {
    // ctx.config = {
    // };
    await next();
  },
);

bot.command("start", async (ctx) => { // бот получает команду /start
  await ctx.reply(
    "Привет!👋🏻 \nВижу, ты тут впервые. Я - бот Коффи☕️. С моей помощью ты сможешь пообщаться с людьми, которым интересно то же, что и тебе!",
  );
  await ctx.reply(
    "🤔 А как зовут тебя? \n <b>Учти, что твое имя увидят другие пользователи.</b>",
    { parse_mode: "HTML" }, // нужно, чтобы использовать теги из html
  );
  state = "setName"; // следующим сообщением боту должно придти имя
});

// клавиатура для подтверждения интересов
const yesOrNo = new InlineKeyboard().text("Да✅", "interestsDone").text("Нет❌", "interestsNotDone")

//обработка подтверждения интересов
bot.callbackQuery("interestsDone", async ctx=>{
  await ctx.deleteMessage()
  await ctx.reply("Отлично!")
  state = "pending";
})
bot.callbackQuery("interestsNotDone", async ctx=>{
  await ctx.deleteMessage()
  await ctx.reply("Хорошо, напиши еще увлечений!")
  state = "setInterests";
})

bot.on("message", async (ctx) => {
  if (state) { // при непустом state
    switch (state) {
      case "setName":
        info.name = ctx.msg.text || ""; //сохраняем в переменную
        await ctx.reply("Отличное имя, " + info.name + "!");
        await ctx.reply("Кстати, сколько тебе лет?");
        state = "setAge"; // и меняем состояние
        break;

      case "setAge":
        info.age = Number(ctx.msg.text);
        await ctx.reply(
          "Отлично! 🤩 Отправь мне местоположение, рядом с которым тебе будет удобно встретиться",
        );
        await ctx.reply(
          "👀 Подсказка: нажми на скрепку🖇️ -> местоположение📍",
        );
        state = "setGeo";
        break;

      case "setGeo":
        info.geo =
          `${ctx.msg.location?.latitude}, ${ctx.msg.location?.longitude}`; // записываем геопозицию в виде: ширина, долгота
        await ctx.reply(
          "😎 А теперь расскажи мне немного о себе. Перечисли через запятую свои хобби и увлечения!",
        );
        state = "setInterests";
        break;

      case "setInterests":
        if (ctx.msg.text) {
          for (const interest of ctx.msg.text?.split(",")) {
            info.interests.push(interest.trim());
          }
        }
        await ctx.reply(
          "🏆 Вот список твоих интересов:"
        );
        await ctx.reply(
          info.interests.toString()
        );
        await ctx.reply("Это все?", {reply_markup: yesOrNo});// смотри bot.callbackQuery
        break;
      default:
        break;
    }
  }
});
