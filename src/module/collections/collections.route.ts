/** @format */

import { InvalidRequest, ResponseToJson } from "../../common/Responses";
import { Hono } from "hono";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { Collections } from "../../model/collections.model";
import { User } from "../../model/user.model";
import { createCollectionValidation, updateCollectionValidation } from "./collections.validation";
import { HttpResponseBuilder, HttpStatusCode } from "@anot/http-response-builder";
export const collectionRoute = new Hono<Environment>()
   .get("/", requirePermission("ReadCollection"), async (c) => {
      const em = c.get("em");
      const userJWT = c.get("userJWT");
      const user = await em.findOne(User, {
         id: userJWT.id,
      });

      if (user == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
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

      const resOk = HttpResponseBuilder.ok<Collections[]>().setData(collection).setMessage("Get list collection success").build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   })
   .post("/", requirePermission("CreateCollection"), createCollectionValidation, async (c) => {
      const em = c.get("em");
      const userJWT = c.get("userJWT");
      const user = await em.findOne(User, {
         id: userJWT.id,
      });

      if (user == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      const data = c.req.valid("json");
      const collection = new Collections();
      Object.assign(collection, data);
      collection.user = user;

      await em.persistAndFlush(collection);

      const resOk = HttpResponseBuilder.ok<Collections>().setData(collection).setMessage(`Successfully created ${collection.title} collection`).build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
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
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      await em.remove(collection).flush();

      const resOk = HttpResponseBuilder.ok<Collections>().setData(collection).setMessage(`Successfully deleted ${collection.title} collection`).build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
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
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }
      Object.assign(collection, data);
      await em.persistAndFlush(collection);

      const resOk = HttpResponseBuilder.ok<Collections>().setData(collection).setMessage("Successfully updated the collection name").build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   });
