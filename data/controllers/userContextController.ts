import { z } from "zod";
import db from "../database.ts";
import UserContextModel, { UserContext } from "../models/UserContext.ts";

export async function getUserContext(userId: string): Promise<null | UserContext> {
  const {
    result: [userContextDocument],
  } = await db.userContext.getMany({ filter: (userContext) => userContext.value.userId === userId });

  if (!userContextDocument) return null;

  return {
    contextId: userContextDocument.value.contextId,
    data: JSON.parse(userContextDocument.value.data),
    nextFunction: userContextDocument.value.nextFunction as UserContext["nextFunction"],
  };
}

export async function setUserContext(userId: string, userContext: UserContext) {
  const data = {
    userId,
    contextId: userContext.contextId,
    data: JSON.stringify(userContext.data),
  } as z.infer<typeof UserContextModel>;
  if (userContext.nextFunction) data.nextFunction = userContext.nextFunction;

  return await db.userContext.upsertByPrimaryIndex({
    set: data,
    index: ["userId", userId],
    update: { data: data.data, nextFunction: data.nextFunction, contextId: data.contextId },
  });
}

export const deleteUserContext = (userId: string) => db.userContext.deleteByPrimaryIndex("userId", userId);
