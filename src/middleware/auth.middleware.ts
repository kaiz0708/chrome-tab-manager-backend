/** @format */
import { createMiddleware } from "hono/factory";
import { Environment } from "../config/enviroment";
import { getUserJWT } from "../module/auth/auth.helper";
import { OKResponse, UnauthorizedResponse } from "../common/Responses";
import { PermissionNames } from "../common/utils/groupPermissionDefault";

export const authMiddleWare = createMiddleware<Environment>(async (c, next) => {
   const url = c.req.url;

   const { pathname } = new URL(url);

   const urlIngore = ["/auth/login", "/auth/register", "/auth/google/login", "/auth/google/callback", "/auth/forgot-password", "/auth/verify-otp", "/auth/change-password"];

   if (urlIngore.includes(pathname)) {
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

      const checkPermission = userJWT.group.permissions.find((permission) => permission.name === permName);
      if (checkPermission == null) {
         return UnauthorizedResponse(c);
      }
      await next();
   });
};
