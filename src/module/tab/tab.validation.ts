/** @format */

import { zValidator } from "@hono/zod-validator";
import { password } from "bun";
import { z } from "zod";

export const createTabForCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
      description: z.string(),
      collection: z.object({
         id: z.number(),
      }),
      imageURL: z.string(),
      url: z.string(),
   })
);

export const updateTabForCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
      description: z.string(),
      tab: z.object({
         id: z.number(),
      }),
   })
);
