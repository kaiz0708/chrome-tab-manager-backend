/** @format */

import { DataResponse, InvalidRequest } from "../../common/Responses";
import { Hono } from "hono";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { Collections } from "../../model/collections.model";
import { createTabForCollectionValidation, deleteTabForCollectionValidation } from "./tab.validation";
import { Tab } from "../../model/tab.model";

export const tabRoute = new Hono<Environment>()
   .post("/move-collection", requirePermission("CreateTab"), createTabForCollectionValidation, async (c) => {
      const em = c.get("em");
      const data = c.req.valid("json");
      const collection = await em.findOne(
         Collections,
         {
            id: data.collection.id,
         },
         {
            populate: ["tabs"],
         }
      );

      if (collection == null) {
         return InvalidRequest(c, "InvalidRequest");
      }

      const newTab = new Tab();
      Object.assign(newTab, data);
      newTab.collection = collection;

      const tabs = collection.tabs.getItems().sort((a, b) => a.position - b.position);

      if (data.position !== -1) {
         tabs.forEach((tab) => {
            if (tab.position >= data.position) {
               tab.position += 1;
            }
         });
         newTab.position = data.position;
      } else {
         newTab.position = tabs.length - 1;
      }

      collection.tabs.add(newTab);

      await em.flush();
      return DataResponse(c, { ...newTab, collection: collection.id });
   })
   .post("/remove-collection", requirePermission("DeleteTab"), deleteTabForCollectionValidation, async (c) => {
      const em = c.get("em");
      const data = c.req.valid("json");
      const collection = await em.findOne(
         Collections,
         {
            id: data.collection.id,
         },
         {
            populate: ["tabs"],
         }
      );

      if (collection == null) {
         return InvalidRequest(c, "InvalidRequest");
      }

      const tab = await em.findOne(Tab, { id: data.tab.id });

      if (tab == null) {
         return InvalidRequest(c, "InvalidRequest");
      }

      collection.tabs.remove(tab);

      const tabs = collection.tabs.getItems().sort((a, b) => a.position - b.position);

      tabs.forEach((tab) => {
         if (tab.position >= data.position) {
            tab.position -= 1;
         }
      });

      await em.flush();
      return DataResponse(c, tab);
   });
