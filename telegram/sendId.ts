import isAxiodError from "../utils/isAxiodError.ts";
import subscribe from "../freshrss/api/subscribe.ts";
import getCategories from "../freshrss/api/categories.ts";
import { Composer, Context, Filter, InlineKeyboard } from "grammy/mod.ts";
import { getFreshRSSAuth } from "../data/controllers/freshRssAuthController.ts";

export const sendIdComposer = new Composer();

export default async function sendId(ctx: Filter<Context, "message:text">, channelId: string) {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const freshRssAuth = await getFreshRSSAuth(ctx.from.id.toString());

  // if the user is not logged in, just show the feed url
  if (!freshRssAuth) return ctx.reply(`<code>${feedUrl}</code>`, { parse_mode: "HTML" });

  const categories = await getCategories(freshRssAuth.instanceUrl, freshRssAuth.auth);

  const keyboard = new InlineKeyboard();
  if (!categories.find((c) => c === "Uncategorized")) keyboard.text("Uncategorized", `subscribe: ${channelId}`);
  for (const category of categories) keyboard.row().text(category, `subscribe:${category} ${channelId}`);

  await ctx.reply(`<code>${feedUrl}</code>\n\nDo you want to subscribe to it? Choose a category.`, {
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

sendIdComposer.callbackQuery(
  /^subscribe:(.+)$/,
  (ctx) =>
    void (async () => {
      const freshRssAuth = await getFreshRSSAuth(ctx.from.id.toString());
      if (!freshRssAuth)
        return ctx.answerCallbackQuery({ text: "You need to log in to FreshRSS first. Use /freshrss" });

      const data = ctx.callbackQuery.data.slice(10).split(" ");
      const category = data.slice(0, -1).join(" ") || undefined;
      const channelId = data[data.length - 1];

      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

      try {
        await subscribe(freshRssAuth.instanceUrl, freshRssAuth.auth, feedUrl, category);

        await ctx.editMessageText(`<code>${feedUrl}</code>\n\nSubscribed!`, { parse_mode: "HTML" });
        await ctx.answerCallbackQuery();
      } catch (e) {
        if (isAxiodError(e)) {
          console.error(e);
          await ctx.editMessageText(
            `<code>${feedUrl}</code>\n\n` +
              `An error ocurred while subscribing. Maybe you are already subscribed or you need to login again using /freshrss.`,
            { parse_mode: "HTML" }
          );
          await ctx.answerCallbackQuery();
        } else {
          console.error(e);
        }
      }
    })().catch(console.error)
);
