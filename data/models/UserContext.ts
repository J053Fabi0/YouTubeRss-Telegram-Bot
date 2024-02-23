import { z } from "zod";
import { getFreshRssUrl, getFreshRssEmail, getFreshRssPassword } from "../../freshrss/freshrss.ts";

export enum UserContextIds {
  AskingForFreshRssUrl,
  AskingForFreshRssEmail,
  AskingForFreshRssPassword,
}

export const nextFunctions = {
  getFreshRssUrl,
  getFreshRssEmail,
  getFreshRssPassword,
};

type EmptyRecord = Record<string, never>;

type GenericContext<
  ContextId extends UserContextIds,
  data = EmptyRecord,
  nextFunction extends keyof typeof nextFunctions | undefined = undefined
> = {
  data: data;
  contextId: ContextId;
} & (nextFunction extends keyof typeof nextFunctions
  ? { nextFunction: nextFunction }
  : { nextFunction?: undefined });

export type AskingForFreshRssUrl = GenericContext<
  UserContextIds.AskingForFreshRssUrl,
  EmptyRecord,
  "getFreshRssUrl"
>;

export type AskingForFreshRssEmail = GenericContext<
  UserContextIds.AskingForFreshRssEmail,
  { url: string },
  "getFreshRssEmail"
>;

export type AskingForFreshRssPassword = GenericContext<
  UserContextIds.AskingForFreshRssPassword,
  { url: string; email: string },
  "getFreshRssPassword"
>;

export type UserContext = AskingForFreshRssUrl | AskingForFreshRssEmail | AskingForFreshRssPassword;
const UserContextModel = z.object({
  data: z.string(),
  userId: z.string(),
  contextId: z.number(),
  nextFunction: z.string().optional(),
});

export default UserContextModel;
