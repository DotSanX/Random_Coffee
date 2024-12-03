import {
  InlineKeyboard,
  Keyboard,
} from "https://deno.land/x/grammy@v1.32.0/mod.ts";

export const acceptKeyboard = new Keyboard().text("Да!").text(
  "Нет, хочу изменить",
)
  .resized(true).oneTime(true);

export const changesKeyboard = new Keyboard().text(
  "Хочу заполнить профиль заново",
)
  .row().text("Имя").text("Возраст").row().text("Интересы").text("Геопозицию")
  .row().text("Удобное время").resized(true).oneTime(true);

export const yesOrNo = new InlineKeyboard().text("Да✅", "interestsDone").text(
  "Нет❌",
  "interestsNotDone",
);

export const menuKeyboard = new Keyboard().text("Мой профиль 👤");
