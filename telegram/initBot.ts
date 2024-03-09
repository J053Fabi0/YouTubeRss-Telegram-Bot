import { Bot } from "grammy/mod.ts";
import { BOT_TOKEN } from "../env.ts";
import nextFunction from "./nextFunction.ts";
import { sendIdComposer } from "./sendId.ts";
import freshrss from "../freshrss/freshrss.ts";
import messagesHandler from "./messagesHandler.ts";
import { run, sequentialize } from "grammy-runner";

const bot = new Bot(BOT_TOKEN);

export default bot;

// https://grammy.dev/plugins/runner#sequential-processing-where-necessary
bot.use(sequentialize((ctx) => [ctx.chat?.id.toString(), ctx.from?.id.toString()].filter(Boolean) as string[]));

bot.use(nextFunction);

bot.use(freshrss);
bot.use(messagesHandler);
bot.use(sendIdComposer);

bot.catch(({ ctx, error }) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, error);
  ctx.reply("There was an error.");
});

run(bot);
