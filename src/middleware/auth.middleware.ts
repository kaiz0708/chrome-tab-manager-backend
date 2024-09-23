/** @format */
import { createMiddleware } from "hono/factory";
import { Environment } from "../config/enviroment";
import { getUserJWT } from "../module/auth/auth.helper";
import { UnauthorizedResponse } from "../common/Responses";
import { Collection } from "@mikro-orm/core";
import { Permission } from "../model/permission.model";
import { PermissionNames } from "../common/utils/groupPermissionDefault";

export const authMiddleWare = createMiddleware<Environment>(async (c, next) => {
   const url = c.req.url;

   if (url.includes("auth/login") || url.includes("auth/register")) {
      return await next();
   }
   const userJWT = await getUserJWT(c);

   if (userJWT == null) {
      return UnauthorizedResponse(c);
   }

   c.set("userJWT", userJWT);
   return await next();
});

export const requirePermission = (permName: PermissionNames) => {
   return createMiddleware<Environment>(async (c, next) => {
      const userJWT = c.get("userJWT");

      const checkPermission = userJWT.group.permissions.find(
         (permission) => permission.name === permName
      );

      console.log(checkPermission);
      if (checkPermission == null) {
         return UnauthorizedResponse(c);
      }
      await next();
   });
};
