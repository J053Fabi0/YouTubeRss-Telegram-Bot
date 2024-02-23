import { kvdex, collection } from "kvdex";
import RssFoundModel from "./models/RssFound.ts";
import UserContextModel from "./models/UserContext.ts";
import FreshRSSAuthModel from "./models/FreshRSSAuth.ts";

const kv = await Deno.openKv();

const db = kvdex(kv, {
  rssFound: collection(RssFoundModel, {
    indices: {
      channelAlias: "primary", // unique
    },
  }),
  freshRssAuth: collection(FreshRSSAuthModel, {
    indices: {
      userId: "primary", // unique
    },
  }),
  userContext: collection(UserContextModel, {
    indices: {
      userId: "primary", // unique
    },
  }),
});

export default db;
