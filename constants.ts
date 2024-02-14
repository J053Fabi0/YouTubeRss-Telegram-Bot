import joi from "joi";
import { parse } from "std/jsonc/mod.ts";
import Constants from "./types/constants.type.ts";

const constantsSchema = joi.object<Constants>({
  users: joi.array().items(joi.number()).required(),
  cron: joi.string().optional().default("0 0 8 * * *"), // every day at 8 AM
  subscribers: joi.array().items(joi.number()).required(),
  timezone: joi.string().optional().default("America/Monterrey"),
  maxTries: joi.number().optional().default(5),
  timeout: joi.number().optional().default(120),
});

const constantsRaw = parse(await Deno.readTextFile("./constants.jsonc"));

const { error, value: constants } = constantsSchema.validate(constantsRaw);

if (error || !constants) {
  console.error(error);
  Deno.exit(1);
}

export const timeout = constants.timeout * 1000;
export const { users, cron, timezone, subscribers, maxTries } = constants as Constants;

/** Both users and subscribers */
export const allUsers = [...new Set([...users, ...constants.subscribers])];
