/** @format */

import { zValidator } from "@hono/zod-validator";
import { nullable, z, union } from "zod";

export const createTabForCollectionValidation = zValidator(
   "json",
   z.object({
      title: z.string().nullable().optional(),
      collection: z.object({
         id: z.number().nullable().optional(),
      }),
      favIconUrl: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      position: z.number(),
   })
);

export const moveTabToCollectionOtherValidation = zValidator(
   "json",
   z.object({
      title: z.string(),
      move: z.object({
         collectionFrom: z.object({
            id: z.number(),
         }),
         collectionTo: z.object({
            id: z.number(),
         }),
         tab: z.object({
            id: z.number(),
         }),
      }),
      favIconUrl: z.string().nullable().optional(),
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
