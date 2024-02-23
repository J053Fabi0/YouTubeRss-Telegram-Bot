const regex = /[\w\-\.]+@([\w-]+\.)+[\w-]{2,}/;

export default function extractEmail(text: string) {
  const match = text.match(regex);
  return match ? match[0] : null;
}
