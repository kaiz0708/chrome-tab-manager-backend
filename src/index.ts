/** @format */

import { serve } from "@hono/node-server";
import app from "./app";
import { initDB } from "./config/database";
initDB();
const PORT = parseInt(process.env.PORT || "3000");

console.log("Running server : ", PORT);

serve({
   fetch: app.fetch,
   port: PORT,
});
