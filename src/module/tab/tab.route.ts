/** @format */

import { InvalidRequest, ResponseToJson } from "../../common/Responses";
import { Hono } from "hono";
import { Environment } from "../../config/enviroment";
import { requirePermission } from "../../middleware/auth.middleware";
import { Collections } from "../../model/collections.model";
import { createTabForCollectionValidation, deleteTabForCollectionValidation, moveTabToCollectionOtherValidation } from "./tab.validation";
import { Tab, TypeTab } from "../../model/tab.model";
import { HttpResponseBuilder, HttpStatusCode, Response } from "@anot/http-response-builder";

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
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
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

      const resOk = HttpResponseBuilder.ok<TypeTab>()
         .setData({ ...newTab, collection: collection.id })
         .setMessage(`Item successfully moved to the ${collection.title} collection`)
         .build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
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
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      const tab = await em.findOne(Tab, { id: data.tab.id });

      if (tab == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      collection.tabs.remove(tab);

      const tabs = collection.tabs.getItems().sort((a, b) => a.position - b.position);

      tabs.forEach((tab) => {
         if (tab.position >= data.position) {
            tab.position -= 1;
         }
      });

      await em.flush();

      const resOk = HttpResponseBuilder.ok<Tab>().setData(tab).setMessage(`Item successfully removed from the ${collection.title} collection`).build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
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
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
      }

      const tab = await em.findOne(Tab, { id: data.move.tab.id });

      if (tab == null) {
         const resBadRequest = HttpResponseBuilder.badRequest().setMessage("Invalid Request").build();
         return ResponseToJson(c, resBadRequest, HttpStatusCode.BAD_REQUEST);
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

      const resOk = HttpResponseBuilder.ok<TypeTab>()
         .setData({ ...newTab, collection: collectionTo.id })
         .setMessage(`Item successfully moved to the ${collectionTo.title} collection`)
         .build();
      return ResponseToJson(c, resOk, HttpStatusCode.OK);
   });
