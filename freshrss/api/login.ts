import axiod from "axiod";

export default async function login(urlBase: string, email: string, password: string): Promise<string | false> {
  const url = new URL(`${urlBase}/api/greader.php/accounts/ClientLogin`);
  url.searchParams.append("Email", email);
  url.searchParams.append("output", "json");
  url.searchParams.append("Passwd", password);

  const { data } = await axiod.get<string>(url.toString()).catch(() => ({ data: null }));
  if (!data) return false;

  for (const line of data.split("\n")) if (line.startsWith("Auth=")) return line.slice(5);

  return false;
}
