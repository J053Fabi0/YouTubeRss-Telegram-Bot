import { kvdex, collection } from "kvdex";
import RssFound from "./models/RssFound.ts";

const kv = await Deno.openKv();

const db = kvdex(kv, {
  rssFound: collection(RssFound, {
    indices: {
      channelAlias: "primary", // unique
    },
  }),
});

export default db;
