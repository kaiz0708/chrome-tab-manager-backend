/** @format */

import { createMiddleware } from "hono/factory";
import { Environment } from "./enviroment";
import { orm } from "./database";

export const config = createMiddleware<Environment>(async (c, next) => {
   c.env.SECRET = process.env.SECRET || "secret@!";
   c.set("em", orm.em.fork());
   await next();
});
