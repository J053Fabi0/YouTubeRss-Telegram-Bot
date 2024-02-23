import { z } from "zod";

export type RssFound = z.infer<typeof RssFoundModel>;

const RssFoundModel = z.object({
  channelId: z.string(),
  channelAlias: z.string(),
});

export default RssFoundModel;
