import axiod from "axiod";

interface Data {
  tags: [{ id: "user/-/state/com.google/starred" }, ...{ id: `user/-/label/${string}`; type: "folder" | "tag" }[]];
}

export default async function getCategories(urlBase: string, auth: string): Promise<string[]> {
  const url = new URL(`${urlBase}/api/greader.php/reader/api/0/tag/list`);
  url.searchParams.append("output", "json");

  const {
    data: {
      tags: [_, ...tags],
    },
  } = await axiod.get<Data>(url.toString(), { headers: { Authorization: `GoogleLogin auth=${auth}` } });

  return tags.filter((tag) => tag.type === "folder").map((tag) => tag.id.slice(13));
}
