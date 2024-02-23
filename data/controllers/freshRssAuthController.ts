import db from "../database.ts";
import { FreshRSSAuth } from "../models/FreshRSSAuth.ts";

export async function getFreshRSSAuth(userId: string): Promise<null | FreshRSSAuth> {
  const freshRssAuthDocument = await db.freshRssAuth.findByPrimaryIndex("userId", userId);

  if (!freshRssAuthDocument) return null;

  return {
    auth: freshRssAuthDocument.value.auth,
    userId: freshRssAuthDocument.value.userId,
    instanceUrl: freshRssAuthDocument.value.instanceUrl,
  };
}
