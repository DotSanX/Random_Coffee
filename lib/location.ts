import { info } from "./bot.ts";

const apikey = "5ad55a47-50b8-447b-919f-5127f701b216"
const url = "https://geocode-maps.yandex.ru/1.x/?apikey=" + apikey + "&geocode=" + info.geo + "&kind=metro&results=1&format=json"
console.log(info.geo);

