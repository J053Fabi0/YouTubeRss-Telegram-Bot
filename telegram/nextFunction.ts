import { Composer } from "grammy/mod.ts";
import * as freshrss from "../freshrss/freshrss.ts";
import { getUserContext } from "../data/controllers/userContextController.ts";
import { deleteUserContext } from "../data/controllers/userContextController.ts";

const nextFunction = new Composer();

const a = [undefined] as [undefined];

nextFunction.command(
  "cancel",
  (ctx, next) =>
    void (async () => {
      if (ctx.from === undefined) return next();
      await deleteUserContext(ctx.from.id.toString());
      await ctx.reply("Cancelled");
    })().catch(console.error)
);

nextFunction.on(
  "message",
  (ctx, next) =>
    void (async () => {
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
    })().catch(console.error)
);

export default nextFunction;
