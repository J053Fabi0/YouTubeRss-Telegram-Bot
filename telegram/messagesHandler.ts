import axiod from "axiod";
import bot from "./initBot.ts";
import db from "../data/database.ts";
import VideoInfo from "../types/videoInfo.type.ts";
import { videoInfoSchema } from "../types/videoInfo.type.ts";
import { getRssFoundByChannelAlias } from "../data/controllers/rssFoundController.ts";

const channelAliasRegex = /^https:\/\/www.youtube.com\/@([a-zA-Z0-9_-]+)/;
const channelIdRegex = /^https:\/\/www\.youtube\.com\/channel\/([a-zA-Z0-9_-]+)/;

bot.hears(channelIdRegex, (ctx) =>
  (async () => {
    if (!ctx.message?.text) return;

    const channelId = ctx.message.text.match(channelIdRegex)?.[1];

    await ctx.reply(`<code>https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}</code>`, {
      parse_mode: "HTML",
    });
  })().catch(console.error)
);

bot.hears(channelAliasRegex, (ctx) =>
  (async () => {
    if (!ctx.message?.text) return;

    async function sendId(channelId: string) {
      await ctx.reply(`<code>https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}</code>`, {
        parse_mode: "HTML",
      });
    }

    // See if the channel alias is already in the database
    const channelAlias = (ctx.message.text.match(channelAliasRegex)?.[1] as string).toLowerCase();
    const channelId = await getRssFoundByChannelAlias(channelAlias);
    if (channelId) return await sendId(channelId);

    try {
      const { data: htmlContent } = await axiod.get<string>(ctx.message.text);

      const jsonData: VideoInfo = JSON.parse(
        htmlContent.slice(htmlContent.indexOf("var ytInitialData = ") + 19).split(";</script>")[0]
      );

      const { error } = videoInfoSchema.validate(jsonData, { allowUnknown: true });
      if (error) {
        console.error(error);
        return ctx.reply("Error processing channel data.");
      }

      const channelId = jsonData.responseContext.serviceTrackingParams[0].params.find(
        (param) => param.key === "browse_id"
      )?.value;
      if (!channelId) return ctx.reply("This channel has no id.");

      await db.rssFound.add({ channelId, channelAlias });
      await sendId(channelId);
    } catch (e) {
      console.error(e);
      await ctx.reply("An error ocurred while processing the video URL.");
    }
  })().catch(console.error)
);
