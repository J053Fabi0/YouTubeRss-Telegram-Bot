import { z } from "zod";

export type RssFound = z.infer<typeof RssFoundSentModel>;

const RssFoundSentModel = z.object({
  channelId: z.string(),
  channelAlias: z.string(),
});

export default RssFoundSentModel;
