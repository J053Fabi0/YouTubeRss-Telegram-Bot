import { escapeHtml } from "escapeHtml";
import sendMessage from "./sendMessage.ts";
import isError from "../types/guards/isError.ts";
import isAxiodError from "../types/guards/isAxiodError.ts";

// deno-lint-ignore no-explicit-any
export default async function handleError(e: any) {
  console.error("#".repeat(40));
  for (const key of Object.getOwnPropertyNames(e)) console.error(key + ":", e[key]);
  console.error(e);

  // These are "Wont fix" issues
  if (isAxiodError(e)) {
    if (e.response.status === 502) return;
    if (e.response.statusText === "Internal Server Error") return;
  } else if (isError(e)) {
    if (e.message.startsWith("error sending request for url")) return;
    if (e.message.includes("Resource temporarily unavailable")) Deno.exit(1); // exit with error so that PM2 restarts the process
  }

  const sMessage = (message: string) =>
    sendMessage(`<code>${escapeHtml(message)}</code>`, undefined, { parse_mode: "HTML" });

  try {
    if ("message" in e) {
      await sMessage(typeof e.message === "object" ? JSON.stringify(e.message) : e.message);
    } else {
      await sMessage(JSON.stringify(e));
    }
  } catch (e) {
    console.error(e);
    await sendMessage("Error al enviar mensaje de Telegram.");
  }
}
