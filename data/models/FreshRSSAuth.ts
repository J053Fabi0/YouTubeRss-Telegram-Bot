import { z } from "zod";

export type FreshRSSAuth = z.infer<typeof FreshRSSAuthModel>;

const FreshRSSAuthModel = z.object({
  auth: z.string(),
  userId: z.string(),
  instanceUrl: z.string(),
});

export default FreshRSSAuthModel;
