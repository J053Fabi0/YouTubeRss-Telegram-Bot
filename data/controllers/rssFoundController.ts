import db from "../database.ts";

/**
 * Given the channelAlias, searches for the rssFound in the database and returns the channel id.
 * @param channelAlias
 * @returns The channel id. */
export async function getRssFoundByChannelAlias(channelAlias: string): Promise<string | null> {
  const {
    result: [rssFound],
  } = await db.rssFound.getMany({ filter: (rrsFound) => rrsFound.value.channelAlias === channelAlias });

  return rssFound ? rssFound.value.channelId : null;
}
