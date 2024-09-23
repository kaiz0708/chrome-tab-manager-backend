/** @format */

import { zValidator } from "@hono/zod-validator";
import { password } from "bun";
import { z } from "zod";

export const createCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
      note: z.string(),
      user: z.object({
         id: z.number(),
      }),
   })
);

export const updateCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
      note: z.string(),
      collection: z.object({
         id: z.number(),
      }),
   })
);
