/** @format */

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const createCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
   })
);

export const updateCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
      collection: z.object({
         id: z.number(),
      }),
   })
);
