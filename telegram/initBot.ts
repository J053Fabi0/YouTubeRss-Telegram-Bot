import { Bot } from "grammy/mod.ts";
import { BOT_TOKEN } from "../env.ts";
import nextFunction from "./nextFunction.ts";
import freshrss from "../freshrss/freshrss.ts";
import messagesHandler from "./messagesHandler.ts";

const bot = new Bot(BOT_TOKEN);

export default bot;

bot.start({ onStart: () => console.log("Bot started") });

bot.use(nextFunction);

bot.use(freshrss);
bot.use(messagesHandler);
