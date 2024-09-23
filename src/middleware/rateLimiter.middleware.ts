/** @format */

import { createMiddleware } from "hono/factory";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { TooManyRequest } from "../common/Responses";

const rateLimiterMemory = new RateLimiterMemory({
   points: 100,
   duration: 100,
});

export const rateLimiter = createMiddleware(async (c, next) => {
   const ip = c.req.header("x-forwarded-for");
   if (!ip) {
      return next();
   }
   try {
      await rateLimiterMemory.consume(ip);
   } catch (e) {
      return TooManyRequest(c);
   }
   await next();
});
