/** @format */

import { Hono } from "hono";
import { Environment } from "./config/enviroment";
import { rateLimiter } from "./middleware/rateLimiter.middleware";
import { config } from "./config/config.middleware";
import { authMiddleWare } from "./middleware/auth.middleware";
import { authRoute } from "./module/auth/auth.route";
import { InternalErrorResponse, NotFoundResponse } from "./common/Responses";
import { tabRoute } from "./module/tab/tab.route";
import { collectionRoute } from "./module/collections/collections.route";
import { cors } from "hono/cors";
console.log(process.env.CLIENT_URL);

const app = new Hono<Environment>()
   .use("*", rateLimiter)
   .notFound((c) => NotFoundResponse(c, "unknown route"))
   .onError((err, c) => {
      return InternalErrorResponse(c);
   })
   .use(
      cors({
         credentials: true,
         origin: process.env.CLIENT_URL || "*",
      })
   )
   .use("*", config)
   .use("*", authMiddleWare)
   .route("/auth", authRoute)
   .route("/tab", tabRoute)
   .route("/collection", collectionRoute);

export default app;
