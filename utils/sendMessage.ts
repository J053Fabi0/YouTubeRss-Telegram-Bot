import { users } from "../constants.ts";
import bot from "../telegram/initBot.ts";

const sendMessage = (
  message: string,
  chatID: string | number = users[0],
  options: Parameters<typeof bot.api.sendMessage>[2] = {}
) => bot.api.sendMessage(chatID, message, options);

export default sendMessage;

export const sendHTMLMessage = (
  message: string,
  chatID: string | number = users[0],
  options: Omit<Parameters<typeof bot.api.sendMessage>[2], "parse_mode"> = {}
) => bot.api.sendMessage(chatID, message, { ...options, parse_mode: "HTML" });
