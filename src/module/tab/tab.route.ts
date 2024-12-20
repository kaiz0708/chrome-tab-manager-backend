/** @format */

import { DataResponse, InvalidRequest } from "../../common/Responses";
import { Hono } from "hono";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { Collections } from "../../model/collections.model";
import { createTabForCollectionValidation, deleteTabForCollectionValidation, moveTabToCollectionOtherValidation } from "./tab.validation";
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
      return DataResponse(c, { ...newTab, collection: collection.id }, `Item successfully moved to the ${collection.title} collection`);
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
      return DataResponse(c, tab, `Item successfully removed from the ${collection.title} collection`);
   })
   .post("/move-to-collection-other", requirePermission("CreateTab"), moveTabToCollectionOtherValidation, async (c) => {
      const em = c.get("em");
      const data = c.req.valid("json");
      const collection = await em.findOne(
         Collections,
         {
            id: data.move.collectionFrom.id,
         },
         {
            populate: ["tabs"],
         }
      );

      const collectionTo = await em.findOne(
         Collections,
         {
            id: data.move.collectionTo.id,
         },
         {
            populate: ["tabs"],
         }
      );

      if (collection == null || collectionTo == null) {
         return InvalidRequest(c, "InvalidRequest");
      }

      const tab = await em.findOne(Tab, { id: data.move.tab.id });

      if (tab == null) {
         return InvalidRequest(c, "InvalidRequest");
      }

      const tabsFrom = collection.tabs.getItems().sort((a, b) => a.position - b.position);

      collection.tabs.remove(tab);

      tabsFrom.forEach((tabFrom) => {
         if (tabFrom.position > tab.position) {
            tab.position -= 1;
         }
      });

      const newTab = new Tab();
      Object.assign(newTab, data);

      const tabsTo = collectionTo.tabs.getItems().sort((a, b) => a.position - b.position);

      if (data.position !== -1) {
         tabsTo.forEach((tab) => {
            if (tab.position >= data.position) {
               tab.position += 1;
            }
         });
         newTab.position = data.position;
      } else {
         newTab.position = tabsTo.length - 1;
      }

      collectionTo.tabs.add(newTab);

      await em.flush();
      return DataResponse(c, { ...newTab, collection: collectionTo.id }, `Item successfully moved to the ${collectionTo.title} collection`);
   });
