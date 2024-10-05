/** @format */

import { getCookie, setCookie } from "hono/cookie";
import { User } from "../../model/user.model";
import { Context } from "hono";
import { decode, sign, verify } from "hono/jwt";
import { Environment } from "../../config/enviroment";
import { UserJWT } from "../../config/enviroment";

export async function setUserJWT(c: Context, user: User) {
   const iat = Math.floor(Date.now() / 1000);
   const payload: UserJWT = {
      id: user.id,
      username: user.username || "",
      email: user.email || "",
      iat,
      exp: iat + 3 * 24 * 60 * 60,
      group: user.group,
   };
   const token = await sign(payload, c.env.SECRET);
   setCookie(c, "token", token);
   return token;
}

export async function getUserJWT(c: Context<Environment>) {
   let token = c.req.header("Authorization") || getCookie(c, "token") || "";

   if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
   }
   try {
      await verify(token, c.env.SECRET);
      const payload = decode(token).payload as UserJWT;
      return payload;
   } catch (err) {
      return null;
   }
}
