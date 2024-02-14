import axiod from "axiod";
import bot from "./initBot.ts";
import db from "../data/database.ts";
import isURLValid from "../utils/isURLValid.ts";
import VideoInfo from "../types/videoInfo.type.ts";
import { videoInfoSchema } from "../types/videoInfo.type.ts";
import { getRssFoundByChannelAlias } from "../data/controllers/rssFoundController.ts";

bot.on("message:text", (ctx) =>
  (async () => {
    const url = isURLValid(ctx.message.text);
    if (!url || (url.hostname !== "www.youtube.com" && url.hostname !== "youtube.com"))
      return await ctx.reply("This is not a valid URL. Please send a valid YouTube Channel URL.");

    const { pathname } = url;

    async function sendId(channelId: string) {
      await ctx.reply(`<code>https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}</code>`, {
        parse_mode: "HTML",
      });
    }

    // See if the url is a channel id
    if (pathname.startsWith("/channel/")) await sendId(pathname.slice(9).split("/")[0]);
    // See if the url is a video id
    else if (pathname.startsWith("/@")) {
      const channelAlias = pathname.slice(2).split("/")[0].toLowerCase();
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
    } else await ctx.reply("This is not a valid YouTube URL for a channel.");
  })().catch(console.error)
);
