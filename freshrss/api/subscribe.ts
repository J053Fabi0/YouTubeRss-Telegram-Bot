import axiod from "axiod";

export default async function subscribe(
  urlBase: string,
  auth: string,
  feedUrl: string,
  category?: string
): Promise<void> {
  const url = new URL(`${urlBase}/api/greader.php/reader/api/0/subscription/edit`);
  url.searchParams.append("output", "json");
  url.searchParams.append("ac", "subscribe");
  url.searchParams.append("s", `feed/${feedUrl}`);
  if (category) url.searchParams.append("a", `user/-/label/${category}`);

  await axiod.get(url.toString(), { headers: { Authorization: `GoogleLogin auth=${auth}` } });
}
