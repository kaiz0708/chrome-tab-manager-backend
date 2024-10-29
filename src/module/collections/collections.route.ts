/** @format */

import { DataResponse, InvalidRequest, MessageResponse } from "../../common/Responses";
import { Hono } from "hono";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { Collections } from "../../model/collections.model";
import { User } from "../../model/user.model";
import { createCollectionValidation, updateCollectionValidation } from "./collections.validation";

export const collectionRoute = new Hono<Environment>()
   .get("/", requirePermission("ReadCollection"), async (c) => {
      const em = c.get("em");
      const userJWT = c.get("userJWT");
      const user = await em.findOne(User, {
         id: userJWT.id,
      });
      if (user == null) {
         return InvalidRequest(c, "Invalid Request");
      }
      const collection = await em.find(
         Collections,
         { user },
         {
            populate: ["tabs"],
            orderBy: {
               tabs: {
                  position: "ASC",
               },
            },
         }
      );
      return DataResponse(c, collection, "Get list collection success");
   })
   .post("/", requirePermission("CreateCollection"), createCollectionValidation, async (c) => {
      const em = c.get("em");
      const userJWT = c.get("userJWT");
      const user = await em.findOne(User, {
         id: userJWT.id,
      });
      if (user == null) {
         return InvalidRequest(c, "Invalid Request");
      }
      const data = c.req.valid("json");
      const collection = new Collections();
      Object.assign(collection, data);
      collection.user = user;
      await em.persistAndFlush(collection);
      return DataResponse(c, collection, `Successfully created ${collection.title} collection`);
   })
   .delete("/:id", requirePermission("DeleteCollection"), async (c) => {
      const id = parseInt(c.req.param("id"));
      const em = c.get("em");

      if (id === null) {
         return InvalidRequest(c);
      }
      const collection = await em.findOne(
         Collections,
         { id },
         {
            populate: ["tabs"],
         }
      );

      if (!collection) {
         return InvalidRequest(c, "Invalid Request");
      }

      await em.remove(collection).flush();
      return DataResponse(c, collection, `Successfully deleted ${collection.title} collection`);
   })
   .put("/", requirePermission("UpdateCollection"), updateCollectionValidation, async (c) => {
      const em = c.get("em");
      const data = c.req.valid("json");
      const collection = await em.findOne(
         Collections,
         {
            id: data.collection.id,
         },
         {
            populate: ["tabs"],
            orderBy: {
               tabs: {
                  position: "ASC",
               },
            },
         }
      );
      if (collection == null) {
         return InvalidRequest(c, "Invalid Request");
      }
      Object.assign(collection, data);
      await em.persistAndFlush(collection);
      return DataResponse(c, collection, "Successfully updated the collection name");
   });
