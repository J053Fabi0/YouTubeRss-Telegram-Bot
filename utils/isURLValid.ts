export default function isURLValid(url: string): false | URL {
  try {
    return new URL(url);
  } catch {
    return false;
  }
}
