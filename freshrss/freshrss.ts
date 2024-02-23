import login from "./api/login.ts";
import db from "../data/database.ts";
import isURLValid from "../utils/isURLValid.ts";
import extractURL from "../utils/exctractURL.ts";
import extractEmail from "../utils/extractEmail.ts";
import { UserContextIds } from "../data/models/UserContext.ts";
import { AskingForFreshRssEmail } from "../data/models/UserContext.ts";
import { Composer, Context, Filter, InlineKeyboard } from "grammy/mod.ts";
import { AskingForFreshRssPassword } from "../data/models/UserContext.ts";
import { setUserContext } from "../data/controllers/userContextController.ts";
import { getFreshRSSAuth } from "../data/controllers/freshRssAuthController.ts";
import { deleteUserContext } from "../data/controllers/userContextController.ts";

const freshrss = new Composer();
const yesNoKeyboard = new InlineKeyboard().text("Yes", "freshrss:yes").text("No", "freshrss:no");
const logoutKeyboard = new InlineKeyboard().text("Login again", "freshrss:yes").text("Logout", "freshrss:logout");

const startMessage =
  "You can sync your <a href='https://www.freshrss.org'>FreshRSS</a> account with this bot to automatically subscribe to the channels you send. Would you like to continue?";
const alreadyLoggedInMessage = "You are already logged in.";

// Receive the command /freshrss
freshrss.command(
  "freshrss",
  (ctx) =>
    void (async () => {
      const isLoggedIn = ctx.from && (await getFreshRSSAuth(ctx.from.id.toString())) !== null;
      if (isLoggedIn) ctx.reply(alreadyLoggedInMessage, { reply_markup: logoutKeyboard });
      else
        ctx.reply(startMessage, {
          parse_mode: "HTML",
          reply_markup: yesNoKeyboard,
          link_preview_options: { is_disabled: true },
        });
    })().catch(console.error)
);

// The user is not interested
freshrss.callbackQuery(
  "freshrss:no",
  (ctx) => void ctx.editMessageText("Okay, you can sync your FreshRSS account later.").catch(console.error)
);

const askForEmailMessage =
  "Please send me the URL of your FreshRSS instance. For example: <code>https://freshrss.example.net</code>";
// The user is interested. Ask for the FreshRSS URL
freshrss.callbackQuery(
  "freshrss:yes",
  (ctx) =>
    void (async () => {
      await setUserContext(ctx.from.id.toString(), {
        data: {},
        nextFunction: "getFreshRssUrl",
        contextId: UserContextIds.AskingForFreshRssUrl,
      });
      const isLoggedIn = ctx.from && (await getFreshRSSAuth(ctx.from.id.toString())) !== null;
      await ctx.editMessageText(isLoggedIn ? alreadyLoggedInMessage : startMessage, {
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      });
      await ctx.reply(askForEmailMessage, { parse_mode: "HTML" });
    })().catch(console.error)
);

// Receive the URL of the FreshRSS instance
export async function getFreshRssUrl(ctx: Filter<Context, "message">) {
  if (!ctx.message.text) return ctx.reply(askForEmailMessage, { parse_mode: "HTML" });
  const url = isURLValid(extractURL(ctx.message.text));
  if (!url) return ctx.reply("This is not a valid URL. Please send a valid FreshRSS URL.");

  await setUserContext(ctx.from.id.toString(), {
    nextFunction: "getFreshRssEmail",
    data: { url: url.toString().replace(/\/$/, "") },
    contextId: UserContextIds.AskingForFreshRssEmail,
  });
  await ctx.reply("Now your email address.");
}

// Receive the email of the FreshRSS account
const askForPasswordMessage = (url: string) =>
  `Now your API password.\n\n` +
  `First allow API access here: ${url}/i/?c=auth.\n` +
  `Then go to ${url}/i/?c=user&a=profile, create a new API key and send it here.`;
export async function getFreshRssEmail(ctx: Filter<Context, "message">, { data }: AskingForFreshRssEmail) {
  if (!ctx.message.text) return ctx.reply("Your email address, please.");
  const email = extractEmail(ctx.message.text);
  if (!email) return ctx.reply("This is not a valid email address. Please send a valid email address.");

  await setUserContext(ctx.from.id.toString(), {
    data: { ...data, email },
    nextFunction: "getFreshRssPassword",
    contextId: UserContextIds.AskingForFreshRssPassword,
  });
  await ctx.reply(askForPasswordMessage(data.url));
}

// Receive the password of the FreshRSS account and attempt to login
export async function getFreshRssPassword(ctx: Filter<Context, "message">, { data }: AskingForFreshRssPassword) {
  if (!ctx.message.text) return ctx.reply(askForPasswordMessage(data.email));

  const auth = await login(data.url, data.email, ctx.message.text);
  if (!auth)
    return ctx.reply("We couldn't login with the provided credentials. Would you like to try again?", {
      reply_markup: yesNoKeyboard,
    });

  await db.freshRssAuth.deleteByPrimaryIndex("userId", ctx.from.id.toString());
  await db.freshRssAuth.add({ auth, instanceUrl: data.url, userId: ctx.from.id.toString() });
  await deleteUserContext(ctx.from.id.toString());

  await ctx.reply(
    "Your FreshRSS account has been successfully linked. " +
      "From now on when you send a YouTube channel URL, you will be asked if you want to subscribe."
  );
}

// Logout
freshrss.callbackQuery(
  "freshrss:logout",
  (ctx) =>
    void (async () => {
      await db.freshRssAuth.deleteByPrimaryIndex("userId", ctx.from.id.toString());
      await ctx.editMessageText("You have been logged out.");
    })().catch(console.error)
);

export default freshrss;
