import axiod from "axiod";
import sendId from "./sendId.ts";
import db from "../data/database.ts";
import { Composer } from "grammy/mod.ts";
import isURLValid from "../utils/isURLValid.ts";
import extractURL from "../utils/exctractURL.ts";
import VideoInfo from "../types/videoInfo.type.ts";
import { videoInfoSchema } from "../types/videoInfo.type.ts";
import { getRssFoundByChannelAlias } from "../data/controllers/rssFoundController.ts";

const messagesHandler = new Composer();

messagesHandler.command("start", (ctx) =>
  ctx.reply(
    "Welcome to the YouTube RSS feed bot!\n\n" +
      "Send me a YouTube channel URL and I will give you the RSS feed link for that channel.\n" +
      "You can send me a playlist or YouTube Music channel too."
  )
);

messagesHandler.on("message:text", async (ctx) => {
  const url = isURLValid(extractURL(ctx.message.text));
  if (!url || !/^((www\.)?youtube\.com|music\.youtube\.com)$/.test(url.hostname))
    return await ctx.reply("This is not a valid URL. Please send a valid YouTube Channel URL.");

  const { pathname } = url;

  // See if the url is a channel id
  if (pathname.startsWith("/channel/")) await sendId(ctx, pathname.slice(9).split("/")[0], "channel");
  // If it's a playlist url
  if (pathname.startsWith("/playlist") && url.searchParams.get("list"))
    await sendId(ctx, url.searchParams.get("list")!, "playlist");
  // See if the url is a video id
  else if (pathname.startsWith("/@")) {
    const channelAlias = pathname.slice(2).split("/")[0].toLowerCase();
    const channelId = await getRssFoundByChannelAlias(channelAlias);
    if (channelId) return await sendId(ctx, channelId, "channel");

    try {
      const { data: htmlContent } = await axiod.get<string>(url.href);

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
      await sendId(ctx, channelId, "channel");
    } catch (e) {
      console.error(e);
      await ctx.reply("An error ocurred while processing the video URL.");
    }
  }
  // If the url is not for a channel
  else await ctx.reply("This is not a valid YouTube URL for a channel.");
});

export default messagesHandler;
