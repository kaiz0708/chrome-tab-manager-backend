/** @format */

import { DataResponse, InvalidRequest } from "../../common/Responses";
import { Hono } from "hono";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { Collections } from "../../model/collections.model";
import {
   createTabForCollectionValidation,
   updateTabForCollectionValidation,
} from "./tab.validation";
import { Tab } from "../../model/tab.model";

export const tabRoute = new Hono<Environment>()
   .post(
      "/",
      requirePermission("CreateTab"),
      createTabForCollectionValidation,
      async (c) => {
         const em = c.get("em");
         const data = c.req.valid("json");
         const collection = await em.findOne(Collections, {
            id: data.collection.id,
         });
         if (collection == null) {
            return InvalidRequest(c, "InvalidRequest");
         }
         const tab = new Tab();
         Object.assign(tab, data);
         collection.tabs.add(tab);
         await em.persistAndFlush(collection);
         return DataResponse(c, collection);
      }
   )
   .delete("/:id", requirePermission("DeleteTab"), async (c) => {
      const id = parseInt(c.req.param("id"));
      const em = c.get("em");

      if (id == null) {
         return InvalidRequest(c);
      }
      const tab = await em.findOne(Tab, { id });
      if (tab) {
         await em.remove(tab).flush();
      }
      return DataResponse(c, tab);
   })
   .put(
      "/",
      requirePermission("UpdateTab"),
      updateTabForCollectionValidation,
      async (c) => {
         const em = c.get("em");
         const data = c.req.valid("json");
         const tab = await em.findOne(Tab, { id: data.tab.id });
         if (tab == null) {
            return InvalidRequest(c, "Invalid Request");
         }
         Object.assign(tab, data);
         await em.persistAndFlush(tab);
         return DataResponse(c, tab);
      }
   );
