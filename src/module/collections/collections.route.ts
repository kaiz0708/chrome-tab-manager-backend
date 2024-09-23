/** @format */

import {
   DataResponse,
   InvalidRequest,
   MessageResponse,
   UnauthorizedResponse,
} from "../../common/Responses";
import { Hono } from "hono";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { Collections } from "../../model/collections.model";
import { User } from "../../model/user.model";
import {
   createCollectionValidation,
   updateCollectionValidation,
} from "./collections.validation";

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
            orderBy: { id: "DESC" },
         }
      );
      return DataResponse(c, collection);
   })
   .post(
      "/",
      requirePermission("CreateCollection"),
      createCollectionValidation,
      async (c) => {
         console.log("runn");
         const em = c.get("em");
         const data = c.req.valid("json");
         const collection = new Collections();
         Object.assign(collection, data);
         await em.persistAndFlush(collection);
         return DataResponse(c, collection);
      }
   )
   .delete("/:id", requirePermission("DeleteCollection"), async (c) => {
      const id = parseInt(c.req.param("id"));
      const em = c.get("em");

      if (id == null) {
         return InvalidRequest(c);
      }
      const collection = await em.findOne(Collections, { id });
      if (collection) {
         await em.remove(collection).flush();
      }
      return DataResponse(c, collection);
   })
   .put(
      "/",
      requirePermission("UpdateCollection"),
      updateCollectionValidation,
      async (c) => {
         const em = c.get("em");
         const data = c.req.valid("json");
         const collection = await em.findOne(Collections, {
            id: data.collection.id,
         });
         if (collection == null) {
            return InvalidRequest(c, "Invalid Request");
         }
         Object.assign(collection, data);
         await em.persistAndFlush(collection);
         return DataResponse(c, collection);
      }
   );