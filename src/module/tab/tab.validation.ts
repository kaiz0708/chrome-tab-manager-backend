/** @format */

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const createTabForCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
      collection: z.object({
         id: z.number(),
      }),
      favIconUrl: z.string(),
      url: z.string(),
      position: z.number(),
   })
);

export const deleteTabForCollectionValidation = zValidator(
   "json",
   z.object({
      tab: z.object({
         id: z.number(),
      }),
      collection: z.object({
         id: z.number(),
      }),
      position: z.number(),
   })
);
