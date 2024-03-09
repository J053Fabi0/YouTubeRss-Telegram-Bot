import { Composer } from "grammy/mod.ts";
import * as freshrss from "../freshrss/freshrss.ts";
import { getUserContext } from "../data/controllers/userContextController.ts";
import { deleteUserContext } from "../data/controllers/userContextController.ts";

const nextFunction = new Composer();

// const a = [undefined] as [undefined];

nextFunction.command("cancel", async (ctx, next) => {
  if (ctx.from === undefined) return next();
  await deleteUserContext(ctx.from.id.toString());
  await ctx.reply("Cancelled");
});

nextFunction.on("message", async (ctx, next) => {
  const userContext = await getUserContext(ctx.from.id.toString());
  if (!userContext) return next();

  switch (userContext.nextFunction) {
    case "getFreshRssUrl":
      return await freshrss.getFreshRssUrl(ctx);
    case "getFreshRssEmail":
      return await freshrss.getFreshRssEmail(ctx, userContext);
    case "getFreshRssPassword":
      return await freshrss.getFreshRssPassword(ctx, userContext);
  }

  // This will alert Typescript if a new nextFunction is added
  // if (a.includes(userContext.nextFunction)) 1;

  await deleteUserContext(ctx.from.id.toString());
  return next();
});

export default nextFunction;
